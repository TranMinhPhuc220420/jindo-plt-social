import type { ReactNode } from 'react';
import { UnreadBadgesProvider } from '@/components/notifications/unread-badges-provider';

/**
 * Persistent outer layout for authenticated social chrome so unread badge
 * state survives feed ↔ messages ↔ profile ↔ settings navigations.
 * Must sit inside the Inertia App (PageContext) — not in `withApp`.
 */
export default function UnreadBadgesLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <UnreadBadgesProvider>{children}</UnreadBadgesProvider>;
}
