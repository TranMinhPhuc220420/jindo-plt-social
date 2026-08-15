<?php

use App\Models\User;
use App\Services\ConversationService;
use App\Services\Firebase\ConversationMemberSync;
use App\Support\ConversationId;
use Mockery;

afterEach(function () {
    Mockery::close();
});

test('ensureBetween syncs member map with a string conversation id', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    $a->following()->attach($b->id);
    $b->following()->attach($a->id);

    $cid = ConversationId::between((int) $a->id, (int) $b->id);

    $memberSync = Mockery::mock(ConversationMemberSync::class);
    $memberSync->shouldReceive('syncPair')
        ->once()
        ->with($cid, $a->id, $b->id);
    $this->instance(ConversationMemberSync::class, $memberSync);

    expect(app(ConversationService::class)->ensureBetween($a, $b))->toBe($cid);
});
