# ADR 0011: Safe post markdown

- Status: Accepted
- Date: 2026-08-09

## Context

Posts previously rendered as plain text with `@` / `#` linkify. Product wants Markdown formatting without XSS, layout breakage (huge headings, images, tables), or bypassing the existing media upload path.

SRS §7.1 requires an allowlist sanitize path if markdown/HTML is added.

## Decision

1. Store **raw markdown** in `posts.body` (no schema change); max length stays 2000.
2. **Social subset only:** bold/italic/strike, lists, blockquote, inline/fenced code, `http`/`https` links. No headings, tables, markdown images, or raw HTML.
3. **Server reject** disallowed constructs via `App\Rules\SafePostMarkdown` on create/update (not silent strip).
4. **Client render** with `react-markdown` + `rehype-sanitize` allowlist; keep `@` / `#` linkify; CSS constraints + `line-clamp` for feed cards.
5. Comments/messages stay plain text for now.

## Consequences

- Invalid markdown returns validation errors the author must fix.
- Defense in depth: even if validation misses a case, sanitize drops unknown tags.
- Composer shows a short Markdown capability hint.

## Alternatives considered

- Full GFM (headings/tables/images) — rejected for layout and media-policy reasons.
- Server-side HTML storage — rejected; keep source editable as markdown.
- Silent strip of bad syntax — rejected; prefer explicit reject so authors know what failed.
