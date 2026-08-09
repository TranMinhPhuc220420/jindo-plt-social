import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SocialChromeShell } from '@/components/social/social-chrome-shell';
import type { AppLayoutProps } from '@/types';

type Props = AppLayoutProps & {
    children: ReactNode;
};

/**
 * Full-width messaging shell: top bar + left rail, no Trending right rail.
 * Locked to the viewport so only the thread/list panes scroll — not the document.
 * On the thread page (mobile): hide top bar + dock for an immersive chat.
 */
export default function AppMessagesLayout({ children }: Props) {
    const { component } = usePage();
    const isThread = component === 'messages/show';

    return (
        <SocialChromeShell
            mainMode="pane"
            hideRightRail
            hideMobileNav={isThread}
            immersiveMobile={isThread}
        >
            {children}
        </SocialChromeShell>
    );
}
