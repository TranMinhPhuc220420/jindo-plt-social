<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PostModerationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectPostRequest;
use App\Models\Post;
use App\Models\PostMedia;
use App\Services\AdminAuditLogger;
use App\Services\PostModerationService;
use App\Support\MediaDisk;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        private readonly AdminAuditLogger $audit,
        private readonly PostModerationService $moderation,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $q = trim((string) $request->input('q', ''));
        $status = (string) $request->input('status', PostModerationStatus::Pending->value);

        if (! in_array($status, ['pending', 'approved', 'rejected', 'all'], true)) {
            $status = PostModerationStatus::Pending->value;
        }

        $posts = Post::query()
            ->with(['user', 'media', 'sharedPost' => fn ($query) => $query->withTrashed()->with(['user', 'media'])])
            ->when($status !== 'all', function ($query) use ($status): void {
                $query->where('moderation_status', $status);
            })
            ->when($q !== '', function ($query) use ($q): void {
                $like = '%'.$q.'%';
                $query->where(function ($inner) use ($like): void {
                    $inner->where('body', 'like', $like)
                        ->orWhereHas('user', function ($userQuery) use ($like): void {
                            $userQuery->where('username', 'like', $like)
                                ->orWhere('name', 'like', $like);
                        });
                });
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Post $post) => $this->row($post));

        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
            'filters' => [
                'q' => $q,
                'status' => $status,
            ],
        ]);
    }

    public function approve(Request $request, Post $post): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $this->moderation->approve($post, $request->user());

        $this->audit->log(
            $request->user(),
            'post.approved',
            $post,
            ['body_preview' => Str::limit($post->body, 80)],
            $request,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Post approved.')]);

        return back();
    }

    public function reject(RejectPostRequest $request, Post $post): RedirectResponse
    {
        $reason = $request->validated('reason');

        $this->moderation->reject($post, $request->user(), $reason);

        $this->audit->log(
            $request->user(),
            'post.rejected',
            $post,
            [
                'body_preview' => Str::limit($post->body, 80),
                'reason' => Str::limit($reason, 120),
            ],
            $request,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Post rejected.')]);

        return back();
    }

    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        $post->loadMissing('media');

        foreach ($post->media as $item) {
            MediaDisk::disk()->delete($item->path);
        }

        $this->audit->log(
            $request->user(),
            'post.deleted',
            $post,
            ['body_preview' => Str::limit($post->body, 80)],
            $request,
        );

        $post->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Post deleted.')]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Post $post): array
    {
        $thumbs = $post->media
            ->filter(fn (PostMedia $item): bool => $item->status === PostMedia::STATUS_READY)
            ->take(4)
            ->map(fn (PostMedia $item): array => [
                'id' => $item->id,
                'url' => $item->url(),
            ])
            ->values()
            ->all();

        $shared = null;

        if ($post->shared_post_id !== null) {
            $root = $post->sharedPost;

            if ($root === null || $root->trashed()) {
                $shared = [
                    'unavailable' => true,
                    'body' => '',
                    'user' => null,
                ];
            } else {
                $shared = [
                    'unavailable' => false,
                    'body' => $root->body,
                    'user' => [
                        'name' => $root->user->name,
                        'username' => $root->user->username,
                        'avatar' => $root->user->avatarUrl(),
                    ],
                ];
            }
        }

        return [
            'id' => $post->id,
            'body' => $post->body,
            'moderation_status' => $post->moderation_status->value,
            'moderation_reason' => $post->moderation_reason,
            'created_at' => $post->created_at?->toIso8601String(),
            'updated_at' => $post->updated_at?->toIso8601String(),
            'media' => $thumbs,
            'shared_post' => $shared,
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'username' => $post->user->username,
                'avatar' => $post->user->avatarUrl(),
            ],
        ];
    }
}
