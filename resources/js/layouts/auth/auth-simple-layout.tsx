import { Link } from '@inertiajs/react';
import { FadeIn } from '@/components/motion/fade-in';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
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
                                    alt="PLT Social"
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
            </FadeIn>
        </div>
    );
}
