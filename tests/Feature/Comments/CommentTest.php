<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Notifications\CommentCreatedNotification;
use Illuminate\Support\Facades\Notification;

test('users can comment on a post and view the post detail page', function () {
    Notification::fake();

    $author = User::factory()->create();
    $commenter = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($commenter)
        ->post(route('comments.store', $post), [
            'body' => 'Nice post!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('comments', [
        'post_id' => $post->id,
        'user_id' => $commenter->id,
        'body' => 'Nice post!',
        'parent_id' => null,
    ]);

    Notification::assertSentTo($author, CommentCreatedNotification::class);

    $this->actingAs($commenter)
        ->get(route('posts.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('posts/show')
            ->has('comments', 1)
            ->where('post.comments_count', 1)
        );
});

test('replies cannot nest deeper than one level', function () {
    $author = User::factory()->create();
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);
    $top = Comment::query()->create([
        'user_id' => $user->id,
        'post_id' => $post->id,
        'body' => 'Top',
    ]);
    $reply = Comment::query()->create([
        'user_id' => $user->id,
        'post_id' => $post->id,
        'parent_id' => $top->id,
        'body' => 'Reply',
    ]);

    $this->actingAs($user)
        ->from(route('posts.show', $post))
        ->post(route('comments.store', $post), [
            'body' => 'Too deep',
            'parent_id' => $reply->id,
        ])
        ->assertSessionHasErrors('parent_id');
});

test('post authors can delete comments on their posts', function () {
    $author = User::factory()->create();
    $commenter = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);
    $comment = Comment::query()->create([
        'user_id' => $commenter->id,
        'post_id' => $post->id,
        'body' => 'Delete me',
    ]);

    $this->actingAs($author)
        ->delete(route('comments.destroy', $comment))
        ->assertRedirect();

    $this->assertSoftDeleted($comment);
});
