# Changelog

All notable changes to World Break will be documented here.

## [0.0.1.0] - 2026-04-11

### Added
- Opponent deck autocomplete on match input and edit forms — typing in the opponent deck field now suggests recently seen decks filtered by the currently selected game. Suggestions update reactively when you change the game.
- "Saved" confirmation banner on the new match form after saving a friendly match, with a quick link to the match list.
- Friendly match save now returns to the new match form pre-filled (same game, deck, format, play order) so back-to-back matches require minimal re-entry.

### Removed
- Tournament scorecard PNG save-to-Supabase-Storage feature removed (T-031 cleanup). The in-page scorecard display card and OG image route are retained.

### Fixed
- Korean error messages in `actions.ts` — CP949 mojibake replaced with correct UTF-8 strings (T-035).
- Edit match page `OpponentDeckField` now pre-fills with the existing opponent deck name.
- Integration test updated to reflect new post-save redirect destination (`/matches/new` with prefill params).
