import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { PageTransition } from '@/components/motion/page-transition';
import { SocialChromeShell } from '@/components/social/social-chrome-shell';
import { shouldShowTrendingRail } from '@/lib/trending-rail';
import type { AppLayoutProps } from '@/types';

type Props = AppLayoutProps & {
    rightRail?: ReactNode;
    /** Force-hide even on pages that normally show Trending. */
    hideRightRail?: boolean;
};

export default function AppSocialLayout({
    children,
    rightRail,
    hideRightRail = false,
}: Props) {
    const { component } = usePage();
    const showTrending =
        !hideRightRail && shouldShowTrendingRail(component);

    return (
        <SocialChromeShell
            mainMode="page"
            rightRail={rightRail}
            hideRightRail={!showTrending}
        >
            <div className="mx-auto w-full max-w-[680px]">
                <PageTransition>{children}</PageTransition>
            </div>
        </SocialChromeShell>
    );
}
