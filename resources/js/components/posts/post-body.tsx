import { useState } from 'react';
import { isEmojiOnly } from '@/lib/emoji';
import { PostMarkdown } from '@/lib/post-markdown';
import { cn } from '@/lib/utils';

const PREVIEW_CHARS = 280;
const PREVIEW_LINES = 4;

type Props = {
    body: string;
    /** When false, always show the full body (e.g. post detail). */
    clamp?: boolean;
};

function shouldOfferExpand(text: string): boolean {
    return (
        text.split('\n').length > PREVIEW_LINES || text.length > PREVIEW_CHARS
    );
}

export function PostBody({ body, clamp = true }: Props) {
    const [expanded, setExpanded] = useState(false);
    const sticker = isEmojiOnly(body);

    if (sticker) {
        return (
            <p className="mt-1.5 text-center text-[3.5rem] leading-none break-words">
                {body.trim()}
            </p>
        );
    }

    const offerExpand = clamp && shouldOfferExpand(body);
    const collapsed = offerExpand && !expanded;

    return (
        <div className="mt-1.5 min-w-0 max-w-full">
            <div
                className={cn(
                    'min-w-0 max-w-full overflow-hidden break-words text-[15px] leading-snug',
                    collapsed && 'line-clamp-4',
                )}
            >
                <PostMarkdown
                    body={body}
                    className={cn(
                        'post-markdown min-w-0 max-w-full [&_*]:max-w-full',
                        '[&_p]:my-0 [&_p+p]:mt-2',
                        '[&_ul]:my-1 [&_ol]:my-1',
                        '[&_pre]:my-2',
                        '[&_blockquote]:my-2',
                    )}
                />
            </div>
            {offerExpand ? (
                <button
                    type="button"
                    className="mt-0.5 font-semibold text-muted-foreground hover:underline"
                    onClick={() => setExpanded((value) => !value)}
                >
                    {expanded ? 'See less' : 'See more'}
                </button>
            ) : null}
        </div>
    );
}
