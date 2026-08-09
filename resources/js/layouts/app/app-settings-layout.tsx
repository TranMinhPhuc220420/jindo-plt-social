import type { ReactNode } from 'react';
import { SocialChromeShell } from '@/components/social/social-chrome-shell';
import type { AppLayoutProps } from '@/types';

type Props = AppLayoutProps & {
    children: ReactNode;
};

/**
 * Settings shell: hide Trending, wider main column for nav + form.
 */
export default function AppSettingsLayout({ children }: Props) {
    return (
        <SocialChromeShell mainMode="page" hideRightRail>
            <div className="mx-auto w-full max-w-4xl">{children}</div>
        </SocialChromeShell>
    );
}
