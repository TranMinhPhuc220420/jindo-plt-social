import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

const MENTION_PATTERN = /(^|[^A-Za-z0-9_])@([A-Za-z0-9_]{3,30})\b/g;

export function renderMentionedText(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    MENTION_PATTERN.lastIndex = 0;

    while ((match = MENTION_PATTERN.exec(text)) !== null) {
        const full = match[0];
        const prefix = match[1] ?? '';
        const username = match[2] ?? '';
        const start = match.index;

        if (start > lastIndex) {
            nodes.push(text.slice(lastIndex, start));
        }

        if (prefix !== '') {
            nodes.push(prefix);
        }

        nodes.push(
            <Link
                key={`mention-${key++}`}
                href={`/u/${username}`}
                className="font-medium text-primary hover:underline"
            >
                @{username}
            </Link>,
        );

        lastIndex = start + full.length;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes.length > 0 ? nodes : [text];
}
