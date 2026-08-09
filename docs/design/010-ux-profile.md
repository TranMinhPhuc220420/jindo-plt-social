# Design: Profile (Phase 11)

- Phase: 11
- Status: Implemented
- Related: SRS §17, PROGRESS 11.A–11.E

## Goal

Facebook-like profile header and follow lists.

## UX / pages

### Profile show

- Cover full width of center column; avatar overlapping bottom-left
- Name, @username, bio
- Actions: Edit profile (own) | Follow + Message (other, Message if mutual or existing conversation rules allow — link to messages start)
- Counts: posts (optional), followers, following — clickable

### Followers / following

- Row: avatar, name, @username, bio snippet, Follow button
- EmptyState + pagination links/buttons
- Wire FollowButton on list rows (currently missing)

## Do / Don’t

- Don’t invent Photos/About tabs with new backend.
- Do keep posts list using PostCard from Phase 9.
