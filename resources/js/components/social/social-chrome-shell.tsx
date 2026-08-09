import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
    CreatePostProvider,
    useCreatePost,
} from '@/components/posts/create-post-provider';
import { MainScrollContainerContext } from '@/components/social/main-scroll-container';
import { SocialLeftRail } from '@/components/social/social-left-rail';
import { SocialMobileNav } from '@/components/social/social-mobile-nav';
import { SocialRightRail } from '@/components/social/social-right-rail';
import { SocialTopBar } from '@/components/social/social-top-bar';
import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    rightRail?: ReactNode;
    hideRightRail?: boolean;
    /** `page` — main scrolls; `pane` — children own scroll (messages). */
    mainMode: 'page' | 'pane';
    mainClassName?: string;
    /** Hide floating mobile dock (e.g. full-screen message thread). */
    hideMobileNav?: boolean;
    /**
     * Message thread immersive mode: hide top bar + flush padding on `<md`,
     * keep desktop chrome. CSS-only so SSR/hydration match.
     */
    immersiveMobile?: boolean;
};

/**
 * Lock document scroll while the social chrome is mounted so only nested
 * regions (main / message panes) can scroll. Restored on unmount for
 * guest/auth pages that still need body scroll.
 */
function useDocumentScrollLock(): void {
    useEffect(() => {
        const html = document.documentElement;
        const { body } = document;
        const prevHtmlOverflow = html.style.overflow;
        const prevBodyOverflow = body.style.overflow;
        const prevHtmlOverscroll = html.style.overscrollBehavior;
        const prevBodyOverscroll = body.style.overscrollBehavior;

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        html.style.overscrollBehavior = 'none';
        body.style.overscrollBehavior = 'none';

        return () => {
            html.style.overflow = prevHtmlOverflow;
            body.style.overflow = prevBodyOverflow;
            html.style.overscrollBehavior = prevHtmlOverscroll;
            body.style.overscrollBehavior = prevBodyOverscroll;
        };
    }, []);
}

function SocialChromeShellInner({
    children,
    rightRail,
    hideRightRail = false,
    mainMode,
    mainClassName,
    hideMobileNav = false,
    immersiveMobile = false,
}: Props) {
    const mainRef = useRef<HTMLElement | null>(null);
    const isPage = mainMode === 'page';
    const { isOpen: createOpen } = useCreatePost();
    const dockHidden = hideMobileNav || createOpen;

    useDocumentScrollLock();

    return (
        <MainScrollContainerContext.Provider value={isPage ? mainRef : null}>
            <div className="fixed inset-0 z-0 flex flex-col overflow-hidden bg-background">
                <div className={cn(immersiveMobile && 'max-md:hidden')}>
                    <SocialTopBar />
                </div>
                <div
                    className={cn(
                        'mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-4',
                        immersiveMobile
                            ? 'px-0 md:px-3 lg:px-4'
                            : 'px-1 sm:px-4',
                        dockHidden
                            ? immersiveMobile
                                ? 'pb-0 md:pb-2 lg:pb-4'
                                : 'pb-2 lg:pb-4'
                            : 'pb-16 lg:pb-4',
                    )}
                >
                    <SocialLeftRail />
                    <main
                        ref={mainRef}
                        {...(isPage ? { 'scroll-region': '' } : {})}
                        className={cn(
                            'min-h-0 min-w-0 flex-1',
                            isPage
                                ? 'overflow-y-auto overscroll-y-contain py-1 lg:py-4'
                                : cn(
                                      'flex flex-col overflow-hidden',
                                      immersiveMobile
                                          ? 'py-0 md:py-3'
                                          : 'py-1 md:py-3',
                                  ),
                            mainClassName,
                        )}
                    >
                        {children}
                    </main>
                    {!hideRightRail ? (
                        <SocialRightRail>{rightRail}</SocialRightRail>
                    ) : null}
                </div>
                {!dockHidden ? <SocialMobileNav /> : null}
            </div>
        </MainScrollContainerContext.Provider>
    );
}

/**
 * Viewport-locked social chrome: top bar + rails fixed in the viewport;
 * only `main` (page mode) or nested panes (pane mode) scroll.
 */
export function SocialChromeShell(props: Props) {
    return (
        <CreatePostProvider>
            <SocialChromeShellInner {...props} />
        </CreatePostProvider>
    );
}
