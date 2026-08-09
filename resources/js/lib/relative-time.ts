/** Relative time labels used across feed, messages, and notifications. */
export function relativeTime(iso: string | null | undefined): string {
    if (!iso) {
        return '';
    }

    const then = new Date(iso).getTime();
    const diffSec = Math.round((Date.now() - then) / 1000);

    if (diffSec < 60) {
        return 'Just now';
    }

    if (diffSec < 3600) {
        return `${Math.floor(diffSec / 60)}m`;
    }

    if (diffSec < 86400) {
        return `${Math.floor(diffSec / 3600)}h`;
    }

    if (diffSec < 604800) {
        return `${Math.floor(diffSec / 86400)}d`;
    }

    return new Date(iso).toLocaleDateString();
}
