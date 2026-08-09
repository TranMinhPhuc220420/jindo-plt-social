<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\AdminAuditLogger;
use App\Support\MediaDisk;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(private readonly AdminAuditLogger $audit) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $posts = Post::query()
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn (Post $post) => [
                'id' => $post->id,
                'body' => Str::limit($post->body, 120),
                'created_at' => $post->created_at?->toIso8601String(),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'username' => $post->user->username,
                ],
            ]);

        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
        ]);
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
}
