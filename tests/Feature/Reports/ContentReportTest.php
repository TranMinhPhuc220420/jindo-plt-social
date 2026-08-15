<?php

use App\Enums\PostModerationStatus;
use App\Enums\ReportReason;
use App\Enums\ReportStatus;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;

test('members can report another members approved post', function () {
    $author = User::factory()->create();
    $reporter = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($reporter)
        ->post(route('reports.store'), [
            'reportable_type' => 'post',
            'reportable_id' => $post->id,
            'reason' => ReportReason::Copyright->value,
            'details' => 'Scanned textbook',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('reports', [
        'reporter_id' => $reporter->id,
        'reportable_type' => Post::class,
        'reportable_id' => $post->id,
        'reason' => ReportReason::Copyright->value,
        'status' => ReportStatus::Open->value,
    ]);
});

test('members can report a comment', function () {
    $author = User::factory()->create();
    $commenter = User::factory()->create();
    $reporter = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);
    $comment = Comment::query()->create([
        'user_id' => $commenter->id,
        'post_id' => $post->id,
        'body' => 'Spam link',
    ]);

    $this->actingAs($reporter)
        ->post(route('reports.store'), [
            'reportable_type' => 'comment',
            'reportable_id' => $comment->id,
            'reason' => ReportReason::Fraud->value,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('reports', [
        'reporter_id' => $reporter->id,
        'reportable_type' => Comment::class,
        'reportable_id' => $comment->id,
    ]);
});

test('members cannot report their own post', function () {
    $author = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $this->actingAs($author)
        ->post(route('reports.store'), [
            'reportable_type' => 'post',
            'reportable_id' => $post->id,
            'reason' => ReportReason::Other->value,
        ])
        ->assertForbidden();
});

test('duplicate reports are rejected', function () {
    $author = User::factory()->create();
    $reporter = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    $payload = [
        'reportable_type' => 'post',
        'reportable_id' => $post->id,
        'reason' => ReportReason::Harassment->value,
    ];

    $this->actingAs($reporter)->post(route('reports.store'), $payload)->assertRedirect();

    $this->actingAs($reporter)
        ->from(route('posts.show', $post))
        ->post(route('reports.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasErrors('reportable_id');
});

test('guests cannot report', function () {
    $post = Post::factory()->create();

    $this->post(route('reports.store'), [
        'reportable_type' => 'post',
        'reportable_id' => $post->id,
        'reason' => ReportReason::Other->value,
    ])->assertRedirect(route('login'));
});

test('pending posts cannot be reported', function () {
    $author = User::factory()->create();
    $reporter = User::factory()->create();
    $post = Post::factory()->pending()->create(['user_id' => $author->id]);

    $this->actingAs($reporter)
        ->post(route('reports.store'), [
            'reportable_type' => 'post',
            'reportable_id' => $post->id,
            'reason' => ReportReason::Other->value,
        ])
        ->assertForbidden();
});

test('admins can dismiss a report', function () {
    $admin = User::factory()->admin()->create();
    $reporter = User::factory()->create();
    $post = Post::factory()->create();

    $report = Report::query()->create([
        'reporter_id' => $reporter->id,
        'reportable_type' => Post::class,
        'reportable_id' => $post->id,
        'reason' => ReportReason::Other,
        'status' => ReportStatus::Open,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.reports.dismiss', $report))
        ->assertRedirect();

    expect($report->fresh()->status)->toBe(ReportStatus::Dismissed)
        ->and($post->fresh()->moderation_status)->toBe(PostModerationStatus::Approved);
});

test('admins can resolve a post report by rejecting the post', function () {
    $admin = User::factory()->admin()->create();
    $reporter = User::factory()->create();
    $post = Post::factory()->create();

    $report = Report::query()->create([
        'reporter_id' => $reporter->id,
        'reportable_type' => Post::class,
        'reportable_id' => $post->id,
        'reason' => ReportReason::Copyright,
        'status' => ReportStatus::Open,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.reports.resolve', $report))
        ->assertRedirect();

    expect($report->fresh()->status)->toBe(ReportStatus::Reviewed)
        ->and($post->fresh()->moderation_status)->toBe(PostModerationStatus::Rejected);
});

test('admins can resolve a comment report by deleting the comment', function () {
    $admin = User::factory()->admin()->create();
    $reporter = User::factory()->create();
    $post = Post::factory()->create();
    $comment = Comment::query()->create([
        'user_id' => User::factory()->create()->id,
        'post_id' => $post->id,
        'body' => 'Remove me',
    ]);

    $report = Report::query()->create([
        'reporter_id' => $reporter->id,
        'reportable_type' => Comment::class,
        'reportable_id' => $comment->id,
        'reason' => ReportReason::Illegal,
        'status' => ReportStatus::Open,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.reports.resolve', $report))
        ->assertRedirect();

    expect($report->fresh()->status)->toBe(ReportStatus::Reviewed);
    $this->assertSoftDeleted($comment);
});

test('non admins cannot view the reports queue', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.reports.index'))
        ->assertForbidden();
});
