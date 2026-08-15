<?php

use App\Support\ConversationId;

test('conversation id is min_max of the two user ids', function () {
    expect(ConversationId::between(12, 4))->toBe('4_12')
        ->and(ConversationId::between(4, 12))->toBe('4_12');
});

test('conversation id parse rejects inverted or self pairs', function () {
    expect(ConversationId::parse('4_12'))->toBe([4, 12])
        ->and(ConversationId::parse('12_4'))->toBeNull()
        ->and(ConversationId::parse('4_4'))->toBeNull()
        ->and(ConversationId::parse('abc'))->toBeNull();
});

test('conversation id otherId returns the peer', function () {
    expect(ConversationId::otherId('4_12', 4))->toBe(12)
        ->and(ConversationId::otherId('4_12', 12))->toBe(4)
        ->and(ConversationId::otherId('4_12', 7))->toBeNull()
        ->and(ConversationId::contains('4_12', 4))->toBeTrue()
        ->and(ConversationId::contains('4_12', 1))->toBeFalse();
});
