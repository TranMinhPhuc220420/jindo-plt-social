import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'motion/react';
import { LegalLinks } from '@/components/legal/legal-links';
import { FadeIn } from '@/components/motion/fade-in';
import { usePrefersReducedMotion } from '@/components/motion/use-prefers-reduced-motion';
import { login, register } from '@/routes';

export default function Welcome() {
    const { auth, name, tagline, subtitle, canRegister } = usePage().props;
    const reduce = usePrefersReducedMotion();
    const { scrollY } = useScroll();
    const layerSlow = useTransform(scrollY, [0, 400], [0, 80]);
    const layerFast = useTransform(scrollY, [0, 400], [0, 140]);
    const brand = String(name ?? 'PLT Học Bá');
    const line = String(tagline ?? 'Học để giỏi - Chia sẻ để cùng tiến bộ');
    const deck = String(
        subtitle ?? 'Nền tảng cộng đồng học tập của PLT Solutions',
    );

    return (
        <>
            <Head title="Welcome" />
            <div className="relative flex min-h-svh flex-col overflow-hidden bg-gradient-to-br from-primary/15 via-background to-muted">
                <motion.div
                    aria-hidden
                    style={reduce ? undefined : { y: layerSlow }}
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.55_0.19_255/0.22),transparent_45%)]"
                />
                <motion.div
                    aria-hidden
                    style={reduce ? undefined : { y: layerFast }}
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,oklch(0.7_0.12_255/0.16),transparent_40%)]"
                />
                <header className="relative z-10 flex items-center justify-between px-6 py-5">
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center"
                    >
                        <img
                            src="/logo.png"
                            alt={brand}
                            decoding="async"
                            className="size-10 object-contain sm:size-11"
                        />
                    </motion.div>
                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href="/feed"
                                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                            >
                                Go to Home
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-muted"
                                >
                                    Log in
                                </Link>
                                {canRegister ? (
                                    <Link
                                        href={register()}
                                        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                                    >
                                        Sign up
                                    </Link>
                                ) : null}
                            </>
                        )}
                    </nav>
                </header>
                <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-20">
                    <FadeIn delay={0.05}>
                        <img
                            src="/logo.png"
                            alt=""
                            decoding="async"
                            className="mb-5 size-16 object-contain sm:size-20"
                        />
                    </FadeIn>
                    <FadeIn delay={0.12} y={18}>
                        <h1 className="max-w-xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                            {brand}
                        </h1>
                    </FadeIn>
                    <FadeIn delay={0.16} y={16}>
                        <p className="mt-2 max-w-xl text-xl font-medium text-primary">
                            {line}
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.2} y={16}>
                        <p className="mt-3 max-w-lg text-base font-medium text-foreground">
                            {deck}
                        </p>
                        <p className="mt-3 max-w-lg text-lg text-muted-foreground">
                            Chỉ thành viên được PLT cấp tài khoản — học viên,
                            sinh viên, thực tập sinh. Không mở đăng ký công
                            khai.
                        </p>
                    </FadeIn>
                    {!auth.user ? (
                        <FadeIn delay={0.28} y={14}>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {canRegister ? (
                                    <motion.div
                                        whileHover={
                                            reduce ? undefined : { scale: 1.03 }
                                        }
                                        whileTap={
                                            reduce ? undefined : { scale: 0.98 }
                                        }
                                    >
                                        <Link
                                            href={register()}
                                            className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
                                        >
                                            Create account
                                        </Link>
                                    </motion.div>
                                ) : null}
                                <motion.div
                                    whileHover={
                                        reduce ? undefined : { scale: 1.03 }
                                    }
                                    whileTap={
                                        reduce ? undefined : { scale: 0.98 }
                                    }
                                >
                                    <Link
                                        href={login()}
                                        className={
                                            canRegister
                                                ? 'inline-block rounded-full border bg-card px-6 py-3 text-sm font-semibold shadow-sm'
                                                : 'inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm'
                                        }
                                    >
                                        Log in
                                    </Link>
                                </motion.div>
                            </div>
                        </FadeIn>
                    ) : null}
                </main>
                <footer className="relative z-10 px-6 pb-8">
                    <LegalLinks className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground" />
                </footer>
            </div>
        </>
    );
}
