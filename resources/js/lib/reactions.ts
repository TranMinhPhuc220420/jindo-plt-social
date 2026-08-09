export const REACTION_TYPES = [
    'like',
    'love',
    'haha',
    'sad',
    'celebrate',
    'support',
    'insightful',
] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

export type ReactionCounts = Record<ReactionType, number>;

export const REACTION_META: Record<
    ReactionType,
    { label: string; color: string; activeClass: string }
> = {
    like: {
        label: 'Like',
        color: '#2078F4',
        activeClass: 'text-[#2078F4]',
    },
    love: {
        label: 'Love',
        color: '#F33E58',
        activeClass: 'text-[#F33E58]',
    },
    haha: {
        label: 'Haha',
        color: '#F7B125',
        activeClass: 'text-[#D4920A]',
    },
    sad: {
        label: 'Sad',
        color: '#F7B125',
        activeClass: 'text-[#C98A0E]',
    },
    celebrate: {
        label: 'Celebrate',
        color: '#F5A623',
        activeClass: 'text-[#E08E0B]',
    },
    support: {
        label: 'Support',
        color: '#7B66FF',
        activeClass: 'text-[#7B66FF]',
    },
    insightful: {
        label: 'Insightful',
        color: '#E6A800',
        activeClass: 'text-[#C99700]',
    },
};

export function emptyReactionCounts(): ReactionCounts {
    return {
        like: 0,
        love: 0,
        haha: 0,
        sad: 0,
        celebrate: 0,
        support: 0,
        insightful: 0,
    };
}

export function isReactionType(
    value: string | null | undefined,
): value is ReactionType {
    return (
        value != null &&
        (REACTION_TYPES as readonly string[]).includes(value)
    );
}

/** Top reaction types by count (desc), capped — Facebook-style stack. */
export function topReactions(
    counts: ReactionCounts,
    limit = 3,
): ReactionType[] {
    return REACTION_TYPES.map((type) => ({
        type,
        count: counts[type] ?? 0,
    }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))
        .slice(0, limit)
        .map((entry) => entry.type);
}
