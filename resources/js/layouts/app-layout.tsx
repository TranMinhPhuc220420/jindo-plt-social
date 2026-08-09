import AppLayoutTemplate from '@/layouts/app/app-social-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    // breadcrumbs intentionally unused — social chrome hides admin trails (Phase 8)
    void breadcrumbs;

    return <AppLayoutTemplate>{children}</AppLayoutTemplate>;
}
