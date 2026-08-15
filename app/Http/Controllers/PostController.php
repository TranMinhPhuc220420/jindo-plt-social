<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Jobs\ProcessPostMediaJob;
use App\Models\Comment;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Report;
use App\Models\User;
use App\Services\FeedService;
use App\Services\HashtagService;
use App\Services\MentionService;
use App\Services\PostModerationService;
use App\Support\MediaDisk;
use App\Support\PostPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        private readonly FeedService $feedService,
        private readonly MentionService $mentions,
        private readonly HashtagService $hashtags,
        private readonly PostModerationService $moderation,
    ) {}

    public function show(Request $request, Post $post): Response
    {
        $this->authorize('view', $post);

        $viewer = $request->user();

        $post = $this->feedService->engagementQuery($viewer)
            ->whereKey($post->id)
            ->firstOrFail();

        $comments = Comment::query()
            ->with(['user', 'replies' => fn ($query) => $query->with('user')->oldest()])
            ->where('post_id', $post->id)
            ->whereNull('parent_id')
            ->oldest()
            ->get()
            ->map(fn (Comment $comment) => $this->commentPayload($comment, $viewer));

        return Inertia::render('posts/show', [
            'post' => PostPresenter::toArray($post, $viewer),
            'comments' => $comments,
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $user = $request->user();
        $post = $user->posts()->create([
            'body' => $request->validated('body'),
            ...$this->moderation->attributesForWriter($user),
        ]);

        $this->attachUploadedImages($post, $request->file('images', []));
        $this->mentions->syncFor($post, $user, $post->body);
        $this->hashtags->syncFor($post, $post->body);
        $this->feedService->forgetAuthorCache($user->id);

        $message = $post->isApproved()
            ? __('Post created.')
            : __('Submitted for review.');

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return to_route('feed');
    }

    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $this->moderation->applyWriterStatus($post, $request->user());

        $validated = $request->validated();
        $body = is_string($validated['body'] ?? null) ? $validated['body'] : '';
        $post->body = $body;
        $post->save();

        $this->mentions->syncFor($post, $request->user(), $body);
        $this->hashtags->syncFor($post, $body);

        $updatedMessage = $post->isApproved()
            ? __('Post updated.')
            : __('Submitted for review.');

        if ($post->shared_post_id !== null) {
            Inertia::flash('toast', ['type' => 'success', 'message' => $updatedMessage]);

            return back();
        }

        $removeIds = $request->validated('remove_media_ids', []);

        if ($removeIds !== []) {
            $mediaItems = $post->media()->whereIn('id', $removeIds)->get();

            foreach ($mediaItems as $item) {
                MediaDisk::disk()->delete($item->path);
                $item->delete();
            }
        }

        $existingCount = $post->media()->count();
        $uploads = array_slice($request->file('images', []), 0, max(0, 6 - $existingCount));
        $this->attachUploadedImages($post, $uploads, $existingCount);

        Inertia::flash('toast', ['type' => 'success', 'message' => $updatedMessage]);

        return back();
    }

    public function destroy(Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        foreach ($post->media as $item) {
            MediaDisk::disk()->delete($item->path);
        }

        $post->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Post deleted.')]);

        return back();
    }

    /**
     * @param  array<int, UploadedFile|null>  $files
     */
    private function attachUploadedImages(Post $post, array $files, int $startPosition = 0): void
    {
        $position = $startPosition;

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store('posts', MediaDisk::name());

            $media = $post->media()->create([
                'path' => $path,
                'position' => $position,
                'status' => PostMedia::STATUS_PENDING,
            ]);

            ProcessPostMediaJob::dispatch($media->id);
            $position++;
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function commentPayload(Comment $comment, User $viewer): array
    {
        return [
            'id' => $comment->id,
            'body' => $comment->body,
            'created_at' => $comment->created_at?->toIso8601String(),
            'parent_id' => $comment->parent_id,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'username' => $comment->user->username,
                'avatar' => $comment->user->avatarUrl(),
            ],
            'can_delete' => $viewer->can('delete', $comment),
            'can_report' => $viewer->can('create', [Report::class, $comment]),
            'replies' => $comment->relationLoaded('replies')
                ? $comment->replies->map(fn (Comment $reply) => $this->commentPayload($reply, $viewer))->values()->all()
                : [],
        ];
    }
}
