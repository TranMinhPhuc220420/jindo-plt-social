import { Link, usePage } from '@inertiajs/react';
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
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { useUnreadBadges } from '@/components/notifications/unread-badges-provider';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const username = auth.user?.username;
    const { messages: unreadMessages } = useUnreadBadges();

    const mainNavItems: NavItem[] = [
        {
            title: 'Home',
            href: '/feed',
            icon: Home,
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

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/feed" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
