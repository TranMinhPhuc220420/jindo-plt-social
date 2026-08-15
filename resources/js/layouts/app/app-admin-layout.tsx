import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppAdminLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AdminSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-hidden">
                <AdminHeader breadcrumbs={breadcrumbs} />
                <div className="min-w-0 flex-1 overflow-auto p-6">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
