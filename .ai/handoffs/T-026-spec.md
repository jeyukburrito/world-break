Author: Codex (Implementer)

# T-026 Spec

## Background

`T-026` exists in `TASKS.md`, but no spec file was present.
The board note defines the scope as server-side prefill based on previous matches:

- game-specific last deck prefill
- previous match based game / deck / format defaults

This working spec keeps the change minimal and limited to the new-match form.

## Goal

Reduce repeated typing on `/matches/new` by pre-filling the last-used game, deck, and match format from the user's recent match history.

## Scope

### 1. Server-side recent preference lookup

- Add a server helper that reads the user's latest match history.
- Return:
  - the latest overall match preference
  - a per-game preference map containing the latest deck and match format for each game

### 2. `/matches/new` initial defaults

- When `/matches/new` is opened without continuation params:
  - default `gameName` to the latest overall match's game
  - default `myDeckName` to that game's latest deck
  - default `matchFormat` to that game's latest format
- When `gameName` is already present in the URL:
  - keep the explicit `gameName`
  - if `deckName` / `matchFormat` are missing, fill them from that game's latest history when available

### 3. Game change behavior inside the form

- When the user changes the game in the new-match form:
  - automatically replace `myDeckName` with the latest known deck for that selected game
  - automatically replace `matchFormat` with the latest known format for that selected game
- If the selected game has no previous history:
  - deck input becomes blank
  - match format falls back to the current default behavior (`BO1`)

## Out of Scope

- No edit-page prefill changes
- No tournament continuation behavior changes
- No new API routes
- No deck selector redesign
- No event category / play-order auto-prefill

## Files Expected

- `app/matches/new/page.tsx`
- `lib/matches.ts`
- `components/game-name-field.tsx`
- `components/game-deck-fields.tsx`
- `components/match-result-input.tsx`
- optional small glue component if needed for client coordination

## Done Definition

- [ ] `/matches/new` uses previous match history to prefill game/deck/format
- [ ] selecting a different game updates deck + format to that game's latest known values
- [ ] explicit continuation params still win over automatic defaults
- [ ] no changes to edit flow or tournament continuation flow
- [ ] `npm.cmd run lint` passes
- [ ] validation results are recorded in result and daily log
