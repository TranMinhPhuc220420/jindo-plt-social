<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\UnreadBadgeBroadcaster;
use Illuminate\Notifications\Events\NotificationSent;

class BroadcastUnreadBadgesOnNotification
{
    public function __construct(private UnreadBadgeBroadcaster $badges) {}

    public function handle(NotificationSent $event): void
    {
        if ($event->channel !== 'database') {
            return;
        }

        $notifiable = $event->notifiable;

        if (! $notifiable instanceof User) {
            return;
        }

        $this->badges->publish($notifiable);
    }
}
