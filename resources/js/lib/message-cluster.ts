import type { ChatMessage } from '@/types';

/** Same sender + within this window → one visual cluster */
export const MESSAGE_CLUSTER_MS = 2 * 60 * 1000;

export type MessageClusterMeta = {
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
    /** Time / username / Seen — only on last bubble of a cluster */
    showMeta: boolean;
    showDaySeparator: boolean;
    dayLabel: string | null;
};

function messageTime(message: ChatMessage): number {
    return message.created_at ? new Date(message.created_at).getTime() : 0;
}

function sameDay(a: number, b: number): boolean {
    if (!a || !b) {
        return true;
    }

    const da = new Date(a);
    const db = new Date(b);

    return (
        da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate()
    );
}

export function formatMessageDayLabel(iso: string | null): string | null {
    if (!iso) {
        return null;
    }

    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (sameDay(date.getTime(), today.getTime())) {
        return 'Today';
    }

    if (sameDay(date.getTime(), yesterday.getTime())) {
        return 'Yesterday';
    }

    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

function belongsTogether(a: ChatMessage, b: ChatMessage): boolean {
    if (a.user.id !== b.user.id || a.is_mine !== b.is_mine) {
        return false;
    }

    const ta = messageTime(a);
    const tb = messageTime(b);

    if (!ta || !tb) {
        return a.user.id === b.user.id;
    }

    return Math.abs(tb - ta) <= MESSAGE_CLUSTER_MS;
}

export function getMessageClusterMeta(
    messages: ChatMessage[],
    index: number,
): MessageClusterMeta {
    const message = messages[index];
    const prev = index > 0 ? messages[index - 1] : null;
    const next = index < messages.length - 1 ? messages[index + 1] : null;

    const withPrev = prev !== null && belongsTogether(prev, message);
    const withNext = next !== null && belongsTogether(message, next);

    const isFirstInGroup = !withPrev;
    const isLastInGroup = !withNext;

    const prevTime = prev ? messageTime(prev) : 0;
    const currTime = messageTime(message);
    const showDaySeparator =
        isFirstInGroup && (!prev || !sameDay(prevTime, currTime));

    return {
        isFirstInGroup,
        isLastInGroup,
        showMeta: isLastInGroup,
        showDaySeparator,
        dayLabel: showDaySeparator
            ? formatMessageDayLabel(message.created_at)
            : null,
    };
}

/** Tail-corner softens toward the next bubble in the same cluster */
export function clusterBubbleRadius(
    isMine: boolean,
    isFirstInGroup: boolean,
    isLastInGroup: boolean,
): string {
    if (isFirstInGroup && isLastInGroup) {
        return 'rounded-2xl';
    }

    if (isMine) {
        if (isFirstInGroup) {
            return 'rounded-2xl rounded-br-md';
        }

        if (isLastInGroup) {
            return 'rounded-2xl rounded-tr-md';
        }

        return 'rounded-2xl rounded-r-md';
    }

    if (isFirstInGroup) {
        return 'rounded-2xl rounded-bl-md';
    }

    if (isLastInGroup) {
        return 'rounded-2xl rounded-tl-md';
    }

    return 'rounded-2xl rounded-l-md';
}
