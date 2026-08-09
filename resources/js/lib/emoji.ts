/**
 * Insert text at the current caret (or append) in a textarea / input.
 */
export function insertTextAtCursor(
    element: HTMLTextAreaElement | HTMLInputElement,
    text: string,
): { value: string; selectionStart: number } {
    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? start;
    const value =
        element.value.slice(0, start) + text + element.value.slice(end);
    const selectionStart = start + text.length;

    return { value, selectionStart };
}

function segmentGraphemes(text: string): string[] {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
        const segmenter = new Intl.Segmenter(undefined, {
            granularity: 'grapheme',
        });

        return [...segmenter.segment(text)].map((part) => part.segment);
    }

    return [...text];
}

/** Number of user-perceived characters (emoji-safe). */
export function graphemeCount(text: string): number {
    return segmentGraphemes(text.trim()).length;
}

const HAS_LETTER_OR_DIGIT = /\p{L}|\p{N}/u;
/** Rough emoji / symbol mark presence (ZWJ sequences, regional indicators, etc.). */
const HAS_EMOJIISH = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F1E6}-\u{1F1FF}]/u;

/**
 * True when trimmed text is 1–3 emoji graphemes with no letters/digits —
 * suitable for large “sticker” display.
 */
export function isEmojiOnly(text: string | null | undefined): boolean {
    if (!text) {
        return false;
    }

    const trimmed = text.trim();

    if (!trimmed || HAS_LETTER_OR_DIGIT.test(trimmed)) {
        return false;
    }

    const graphemes = segmentGraphemes(trimmed);

    if (graphemes.length < 1 || graphemes.length > 3) {
        return false;
    }

    return HAS_EMOJIISH.test(trimmed);
}
