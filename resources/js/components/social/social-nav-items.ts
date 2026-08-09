import {
    Bell,
    Bookmark,
    Compass,
    Home,
    MessageCircle,
    Search,
    Shield,
    UserRound,
} from 'lucide-react';
import type { NavItem } from '@/types';

type AuthLike = {
    user?: {
        username?: string | null;
        role?: string;
    } | null;
    unread_messages_count?: number;
    unread_notifications_count?: number;
};

export function buildSocialNavItems(auth: AuthLike): NavItem[] {
    const username = auth.user?.username;
    const unreadMessages = auth.unread_messages_count ?? 0;
    const unreadNotifications = auth.unread_notifications_count ?? 0;

    return [
        {
            title: 'Home',
            href: '/feed',
            icon: Home,
        },
        ...(username
            ? [
                  {
                      title: 'Profile',
                      href: `/u/${username}`,
                      icon: UserRound,
                  } satisfies NavItem,
              ]
            : []),
        {
            title: 'Messages',
            href: '/messages',
            icon: MessageCircle,
            badge: unreadMessages,
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
            badge: unreadNotifications,
        },
        {
            title: 'Explore',
            href: '/explore',
            icon: Compass,
        },
        {
            title: 'Search',
            href: '/search',
            icon: Search,
        },
        {
            title: 'Saved',
            href: '/bookmarks',
            icon: Bookmark,
        },
        ...(auth.user?.role === 'admin'
            ? [
                  {
                      title: 'Admin',
                      href: '/admin',
                      icon: Shield,
                  } satisfies NavItem,
              ]
            : []),
    ];
}

export const mobileBottomNavHrefs = [
    '/feed',
    '/explore',
    '/messages',
    '/notifications',
] as const;
