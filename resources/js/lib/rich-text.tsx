import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

const RICH_PATTERN =
    /(^|[^A-Za-z0-9_])(@([A-Za-z0-9_]{3,30})|#([A-Za-z0-9_]{2,40}))\b/g;

export function renderRichText(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    RICH_PATTERN.lastIndex = 0;

    while ((match = RICH_PATTERN.exec(text)) !== null) {
        const full = match[0];
        const prefix = match[1] ?? '';
        const username = match[3];
        const tag = match[4];
        const start = match.index;

        if (start > lastIndex) {
            nodes.push(text.slice(lastIndex, start));
        }

        if (prefix !== '') {
            nodes.push(prefix);
        }

        if (username) {
            nodes.push(
                <Link
                    key={`mention-${key++}`}
                    href={`/u/${username}`}
                    className="font-medium text-primary hover:underline"
                >
                    @{username}
                </Link>,
            );
        } else if (tag) {
            const slug = tag.toLowerCase();
            nodes.push(
                <Link
                    key={`tag-${key++}`}
                    href={`/t/${slug}`}
                    className="font-medium text-primary hover:underline"
                >
                    #{slug}
                </Link>,
            );
        }

        lastIndex = start + full.length;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes.length > 0 ? nodes : [text];
}
