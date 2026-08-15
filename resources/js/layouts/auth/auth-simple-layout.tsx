import { Link, usePage } from '@inertiajs/react';
import { LegalLinks } from '@/components/legal/legal-links';
import { FadeIn } from '@/components/motion/fade-in';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const brand = String(name ?? 'PLT Học Bá');

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/10 via-background to-muted p-6 md:p-10">
            <FadeIn className="w-full max-w-sm">
                <div className="rounded-xl bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-3">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <img
                                    src="/full-logo.png"
                                    alt={brand}
                                    decoding="async"
                                    className="h-16 w-auto object-contain"
                                />
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-1 text-center">
                                <h1 className="text-xl font-semibold">
                                    {title}
                                </h1>
                                <p className="text-center text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
                <LegalLinks className="mt-4 flex justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground" />
            </FadeIn>
        </div>
    );
}
