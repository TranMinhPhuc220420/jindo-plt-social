import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    LayoutDashboard,
    Shield,
    Users,
    FileText,
    Flag,
    CircleAlert,
    ExternalLink,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const consoleItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Posts',
        href: '/admin/posts',
        icon: FileText,
    },
    {
        title: 'Reports',
        href: '/admin/reports',
        icon: Flag,
    },
    {
        title: 'Failed jobs',
        href: '/admin/failed-jobs',
        icon: CircleAlert,
    },
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <p className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                    <Shield className="size-3.5" />
                    Admin console
                </p>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                    Manage
                </SidebarGroupLabel>
                <NavMain items={consoleItems} />
                <SidebarSeparator />
                <SidebarGroup className="px-2 py-0">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Horizon">
                                <a
                                    href="/horizon"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink />
                                    <span>Horizon</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Back to app">
                                <Link href="/feed" prefetch>
                                    <ArrowLeft />
                                    <span>Back to app</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
