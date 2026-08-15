import { Link } from '@inertiajs/react';

const LINKS = [
    { href: '/guidelines', label: 'Nội quy' },
    { href: '/privacy', label: 'Bảo vệ dữ liệu' },
    { href: '/copyright', label: 'Bản quyền' },
] as const;

export function LegalLinks({ className }: { className?: string }) {
    return (
        <nav
            className={
                className ??
                'flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground'
            }
            aria-label="Community policies"
        >
            {LINKS.map((item, index) => (
                <span
                    key={item.href}
                    className="inline-flex items-center gap-3"
                >
                    {index > 0 ? (
                        <span aria-hidden className="text-border">
                            ·
                        </span>
                    ) : null}
                    <Link
                        href={item.href}
                        className="hover:text-foreground hover:underline"
                    >
                        {item.label}
                    </Link>
                </span>
            ))}
        </nav>
    );
}
