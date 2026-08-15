import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export type AdminPaginator = {
    next_page_url?: string | null;
    prev_page_url?: string | null;
};

export function AdminPagination({ paginator }: { paginator: AdminPaginator }) {
    const prevUrl = paginator.prev_page_url;
    const nextUrl = paginator.next_page_url;

    if (!prevUrl && !nextUrl) {
        return null;
    }

    return (
        <nav
            className="flex items-center justify-end gap-2"
            aria-label="Pagination"
        >
            {prevUrl ? (
                <Button asChild variant="outline" size="sm">
                    <Link href={prevUrl} preserveScroll>
                        Previous
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    Previous
                </Button>
            )}
            {nextUrl ? (
                <Button asChild variant="outline" size="sm">
                    <Link href={nextUrl} preserveScroll>
                        Next
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    Next
                </Button>
            )}
        </nav>
    );
}
