import { Head, Link, usePage } from '@inertiajs/react';
import { LegalLinks } from '@/components/legal/legal-links';
import { login } from '@/routes';

type PageLink = {
    slug: string;
    title: string;
    href: string;
};

type Props = {
    slug: string;
    title: string;
    html: string;
    pages: PageLink[];
};

export default function LegalShow({ slug, title, html, pages }: Props) {
    const { auth, name } = usePage().props;
    const brand = String(name ?? 'PLT Học Bá');

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-svh flex-col bg-gradient-to-br from-primary/10 via-background to-muted">
                <header className="flex items-center justify-between px-6 py-5">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt={brand}
                            decoding="async"
                            className="size-10 object-contain"
                        />
                        <span className="text-sm font-semibold">{brand}</span>
                    </Link>
                    {auth.user ? (
                        <Link
                            href="/feed"
                            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                        >
                            Go to Home
                        </Link>
                    ) : (
                        <Link
                            href={login()}
                            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                        >
                            Log in
                        </Link>
                    )}
                </header>

                <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-16">
                    <nav
                        className="mb-6 flex flex-wrap gap-2"
                        aria-label="Legal"
                    >
                        {pages.map((item) => (
                            <Link
                                key={item.slug}
                                href={item.href}
                                className={
                                    item.slug === slug
                                        ? 'rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground'
                                        : 'rounded-full bg-card px-3 py-1 text-sm font-medium hover:bg-muted'
                                }
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    <article
                        className="rounded-xl bg-card p-6 shadow-xs [&_a]:text-primary [&_a]:underline [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:my-1 [&_p]:my-3 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />

                    <div className="mt-8">
                        <LegalLinks />
                    </div>
                </main>
            </div>
        </>
    );
}
