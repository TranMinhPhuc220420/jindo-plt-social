<?php

use App\Enums\ProfileFieldVisibility;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;

test('authenticated users can view a public profile', function () {
    $user = User::factory()->create(['username' => 'alice']);
    Post::factory()->count(2)->create(['user_id' => $user->id]);
    $viewer = User::factory()->create();

    $this->actingAs($viewer)
        ->get(route('profile.show', 'alice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/show')
            ->where('profile.username', 'alice')
            ->has('posts.data', 2)
            ->has('about')
            ->has('photos_preview')
        );
});

test('profile lists followers and following', function () {
    $user = User::factory()->create(['username' => 'alice']);
    $follower = User::factory()->create(['username' => 'bob']);
    $following = User::factory()->create(['username' => 'carol']);
    $viewer = User::factory()->create();

    $follower->following()->attach($user->id);
    $user->following()->attach($following->id);

    $this->actingAs($viewer)
        ->get(route('profile.followers', 'alice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/followers')
            ->has('users.data', 1)
            ->where('users.data.0.username', 'bob')
        );

    $this->actingAs($viewer)
        ->get(route('profile.following', 'alice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/following')
            ->has('users.data', 1)
            ->where('users.data.0.username', 'carol')
        );
});

test('about privacy hides fields from strangers and shows mutual fields to mutuals', function () {
    $owner = User::factory()->create([
        'username' => 'alice',
        'workplace' => 'PLT Labs',
        'location' => 'Hanoi',
        'birthday' => '1995-05-15',
        'gender' => 'Woman',
        'profile_privacy' => [
            'workplace' => ProfileFieldVisibility::Public->value,
            'location' => ProfileFieldVisibility::Mutual->value,
            'birthday' => ProfileFieldVisibility::OnlyMe->value,
            'gender' => ProfileFieldVisibility::OnlyMe->value,
        ],
    ]);

    $stranger = User::factory()->create();
    $mutual = User::factory()->create();
    $mutual->following()->attach($owner->id);
    $owner->following()->attach($mutual->id);

    $this->actingAs($stranger)
        ->get(route('profile.about', 'alice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/about')
            ->has('about', 1)
            ->where('about.0.key', 'workplace')
            ->where('about.0.value', 'PLT Labs')
        );

    $this->actingAs($mutual)
        ->get(route('profile.about', 'alice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/about')
            ->has('about', 2)
            ->where('about.0.key', 'workplace')
            ->where('about.1.key', 'location')
            ->where('about.1.value', 'Hanoi')
        );

    $this->actingAs($owner)
        ->get(route('profile.about', 'alice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/about')
            ->has('about', 4)
        );
});

test('owner can update about fields and privacy', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'bio' => $user->bio,
            'workplace' => 'Acme Co',
            'education' => 'State U',
            'location' => 'Da Nang',
            'hometown' => 'Hue',
            'website' => 'https://example.com',
            'birthday' => '1990-01-02',
            'gender' => 'Man',
            'relationship_status' => 'Single',
            'profile_privacy' => [
                'workplace' => 'public',
                'education' => 'public',
                'location' => 'mutual',
                'hometown' => 'public',
                'website' => 'public',
                'birthday' => 'only_me',
                'gender' => 'only_me',
                'relationship_status' => 'mutual',
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->workplace)->toBe('Acme Co')
        ->and($user->education)->toBe('State U')
        ->and($user->location)->toBe('Da Nang')
        ->and($user->website)->toBe('https://example.com')
        ->and($user->birthday?->format('Y-m-d'))->toBe('1990-01-02')
        ->and($user->profile_privacy['location'])->toBe('mutual')
        ->and($user->profile_privacy['birthday'])->toBe('only_me');
});

test('photos tab lists ready post media', function () {
    $owner = User::factory()->create(['username' => 'alice']);
    $viewer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);

    PostMedia::query()->create([
        'post_id' => $post->id,
        'path' => 'posts/ready.jpg',
        'position' => 0,
        'status' => PostMedia::STATUS_READY,
    ]);

    PostMedia::query()->create([
        'post_id' => $post->id,
        'path' => 'posts/pending.jpg',
        'position' => 1,
        'status' => PostMedia::STATUS_PENDING,
    ]);

    $this->actingAs($viewer)
        ->get(route('profile.photos', 'alice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/photos')
            ->has('photos.data', 1)
            ->where('photos.data.0.post_id', $post->id)
        );

    $this->actingAs($viewer)
        ->get(route('profile.show', 'alice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('photos_preview', 1)
        );
});
