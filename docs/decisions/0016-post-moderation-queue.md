# ADR 0016: Posts go live only after admin approval

- Status: Accepted
- Date: 2026-08-15

## Context

The community is invite-only. Public posts should not appear on the feed until an administrator has reviewed them. Authors still need to see their own submissions (and a reject reason) so they can edit and resubmit.

## Decision

1. New member posts and share-to-feed rows start as `pending`. They are not in public feed, explore, search, tags, or other profiles until `approved`.
2. Admin **Approve** publishes. Admin **Reject** hides the post and stores a required reason the author can see. **Delete** remains a hard removal.
3. Member edit of an approved or rejected post returns it to `pending` and clears the reject reason (resubmit). Admin create/edit is **auto-approved**.
4. Existing rows are backfilled `approved` so the live feed is not emptied. Pest factories default to `approved`; HTTP create still sets pending for members.
5. Mention and share-to-feed notifications fire when the post becomes approved, not at submit time.

## Consequences

- Pros: No unreviewed content on public surfaces; authors get a clear queue and reject reason; existing tests keep working via factory default.
- Cons: Latency between compose and going live; caption edits re-enter the queue.
- Follow-ups: Optional bulk approve; notify-on-re-approve de-dupe for share captions.

## Alternatives considered

- Hide pending from the author until approved — worse UX; authors could not confirm submit or fix rejects.
- Auto-publish then take down — public window before review; rejected.
