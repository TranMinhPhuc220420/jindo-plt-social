import type { ReactNode } from 'react';
import AppAdminLayout from '@/layouts/app/app-admin-layout';
import type { BreadcrumbItem } from '@/types';

export default function AdminLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}) {
    return (
        <AppAdminLayout breadcrumbs={breadcrumbs}>{children}</AppAdminLayout>
    );
}
