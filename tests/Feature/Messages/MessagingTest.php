<?php

use App\Events\UserTyping;
use App\Models\User;
use App\Services\ConversationService;
use App\Support\ConversationId;
use App\Support\MediaDisk;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

test('non mutual users cannot start a conversation', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);

    $this->actingAs($a)
        ->from(route('messages.index'))
        ->post(route('messages.ensure'), [
            'username' => $b->username,
        ])
        ->assertRedirect(route('messages.index'))
        ->assertSessionHasErrors('username');
});

test('mutual followers can ensure a conversation and open the thread shell', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $cid = ConversationId::between((int) $a->id, (int) $b->id);

    $this->actingAs($a)
        ->post(route('messages.ensure'), [
            'username' => $b->username,
        ])
        ->assertRedirect(route('messages.show', $cid));

    $this->actingAs($a)
        ->postJson(route('messages.ensure'), [
            'username' => $b->username,
        ])
        ->assertOk()
        ->assertJsonPath('id', $cid)
        ->assertJsonPath('other_user.id', $b->id)
        ->assertJsonPath('other_user.username', $b->username);

    $this->actingAs($a)
        ->get(route('messages.show', $cid))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('messages/show')
            ->where('conversation.id', $cid)
            ->where('conversation.other_user.id', $b->id)
            ->has('messages', 0)
            ->has('conversations', 0));
});

test('json ensure is rejected for non-mutual followers', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    $a->following()->attach($b->id);

    $this->actingAs($a)
        ->postJson(route('messages.ensure'), [
            'username' => $b->username,
        ])
        ->assertUnprocessable();
});

test('message photo upload returns an image url without a messages table', function () {
    Storage::fake(MediaDisk::name());

    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('messages.media'), [
            'image' => UploadedFile::fake()->image('chat.jpg'),
        ])
        ->assertCreated()
        ->assertJsonStructure(['image_url']);

    expect(Schema::hasTable('messages'))->toBeFalse();
});

test('non participants cannot view a conversation', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    $c = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $cid = app(ConversationService::class)->ensureBetween($a, $b);

    $this->actingAs($c)
        ->get(route('messages.show', $cid))
        ->assertForbidden();
});

test('messages index is an inertia shell without a server redirect', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    app(ConversationService::class)->ensureBetween($a, $b);

    $this->actingAs($a)
        ->get(route('messages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('messages/index')
            ->has('conversations', 0));
});

test('messages index can force inbox list', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('messages.index', ['inbox' => 1]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('messages/index')
            ->has('conversations', 0));
});

test('shared unread messages count is client-owned and always zero from inertia', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('feed'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('auth.unread_messages_count', 0));
});

test('typing broadcasts for participants', function () {
    Event::fake([UserTyping::class]);

    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $cid = app(ConversationService::class)->ensureBetween($a, $b);

    $this->actingAs($a)
        ->post(route('messages.typing', $cid))
        ->assertNoContent();

    Event::assertDispatched(UserTyping::class);

    $this->actingAs($a)
        ->get(route('messages.show', $cid))
        ->assertOk();
});

test('legacy message persist routes are gone', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/messages/1/messages', ['body' => 'nope'])
        ->assertNotFound();

    $this->actingAs($user)
        ->post('/messages/1/read')
        ->assertNotFound();
});
