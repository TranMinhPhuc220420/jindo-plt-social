<?php

namespace App\Broadcasting;

use App\Services\Firebase\FirebaseRealtimePublisher;
use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Broadcasting\Channel;
use Illuminate\Notifications\Events\BroadcastNotificationCreated;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Publishes Laravel broadcast events to Firebase Realtime Database paths.
 *
 * @see docs/architecture/realtime-inventory.md
 */
class FirebaseBroadcaster extends Broadcaster
{
    public function __construct(private FirebaseRealtimePublisher $publisher) {}

    /**
     * {@inheritdoc}
     */
    public function auth($request)
    {
        // Firebase uses custom tokens + Security Rules; Echo /broadcasting/auth is unused.
        throw new AccessDeniedHttpException;
    }

    /**
     * {@inheritdoc}
     */
    public function validAuthenticationResponse($request, $result)
    {
        return ['auth' => null];
    }

    /**
     * {@inheritdoc}
     *
     * @param  array<int, Channel|string>  $channels
     * @param  array<string, mixed>  $payload
     */
    public function broadcast(array $channels, $event, array $payload = [])
    {
        if (! $this->publisher->enabled()) {
            return;
        }

        $payload = $this->enrichPayload($payload);
        $eventName = (string) $event;

        foreach ($this->formatChannels($channels) as $channel) {
            $this->publishToChannel((string) $channel, $eventName, $payload);
        }
    }

    /**
     * Map a private channel + event name to an RTDB write.
     *
     * @param  array<string, mixed>  $payload
     */
    public function publishToChannel(string $channel, string $event, array $payload): void
    {
        $name = Str::startsWith($channel, 'private-')
            ? Str::after($channel, 'private-')
            : $channel;

        if (preg_match('/^conversation\.(\d+)$/', $name, $matches) === 1) {
            $this->publishConversationEvent((int) $matches[1], $event, $payload);

            return;
        }

        if (preg_match('/^App\.Models\.User\.(\d+)$/', $name, $matches) === 1) {
            $this->publishUserEvent((int) $matches[1], $event, $payload);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function publishConversationEvent(int $conversationId, string $event, array $payload): void
    {
        if ($event === 'message.sent') {
            $this->publisher->set(
                "realtime/conversations/{$conversationId}/events/message",
                $payload,
            );

            return;
        }

        if ($event === 'user.typing') {
            $userId = data_get($payload, 'user.id');

            if ($userId === null) {
                return;
            }

            $this->publisher->set(
                "realtime/conversations/{$conversationId}/typing/{$userId}",
                [
                    'name' => data_get($payload, 'user.name', ''),
                    'username' => data_get($payload, 'user.username'),
                    'at' => (int) floor(microtime(true) * 1000),
                ],
            );
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function publishUserEvent(int $userId, string $event, array $payload): void
    {
        if ($event === 'unread.badges') {
            $this->publisher->update(
                "realtime/users/{$userId}/badges",
                $payload,
            );

            return;
        }

        if ($this->isNotificationEvent($event)) {
            $this->publisher->set(
                "realtime/users/{$userId}/events/notification",
                $payload,
            );
        }
    }

    private function isNotificationEvent(string $event): bool
    {
        return $event === BroadcastNotificationCreated::class
            || str_ends_with($event, 'BroadcastNotificationCreated')
            || $event === 'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated';
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function enrichPayload(array $payload): array
    {
        if (! array_key_exists('origin_user_id', $payload)) {
            $userId = Auth::id();

            if ($userId !== null) {
                $payload['origin_user_id'] = (int) $userId;
            }
        }

        return $payload;
    }
}
