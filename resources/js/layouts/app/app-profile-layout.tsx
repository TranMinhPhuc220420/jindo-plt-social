import type { ReactNode } from 'react';
import { PageTransition } from '@/components/motion/page-transition';
import { SocialChromeShell } from '@/components/social/social-chrome-shell';
import type { AppLayoutProps } from '@/types';

type Props = AppLayoutProps & {
    children: ReactNode;
};

/**
 * Wider profile shell (~940px): top bar + left rail, no Trending right rail.
 */
export default function AppProfileLayout({ children }: Props) {
    return (
        <SocialChromeShell mainMode="page" hideRightRail>
            <div className="mx-auto w-full max-w-[940px]">
                <PageTransition>{children}</PageTransition>
            </div>
        </SocialChromeShell>
    );
}
