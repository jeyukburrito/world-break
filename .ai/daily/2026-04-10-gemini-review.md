Author: Gemini (Reviewer)

# T-034, T-035, T-036 Review Report (2026-04-10)

## Overview
Reviewed the implementation of T-034 (Desktop UI improvements), T-035 (Korean string recovery), and T-036 (Image export & middleware fixes) provided by Codex.

## Review Findings

### T-034: Desktop Title/Profile UI Improvement
- **Status:** PASS
- **Details:**
    - `AppShell` now includes a `md:flex` header row showing the page title and profile actions.
    - `TopAppBar` correctly remains mobile-only (`md:hidden`) and its unused `title` prop has been removed.
    - Verified that the layout structure is sound and adheres to the responsive design goals.

### T-035: Korean Error String Recovery
- **Status:** PASS
- **Details:**
    - Confirmed all corrupted strings in `app/matches/actions.ts` are restored to readable Korean.
    - Verified the `deriveScore` comment is also restored.
    - No changes to business logic were detected, fulfilling the "text recovery only" requirement.

### T-036: Image Export & Middleware Fixes
- **Status:** PASS
- **Details:**
    - **Middleware:** `/api/og/daily-summary` is now correctly included in `SUPABASE_ONLY_PATHS`, preventing guest access.
    - **Scorecard Action:** `saveTournamentScorecard` in `app/matches/tournaments/[id]/result/actions.ts` now properly handles missing `SUPABASE_SERVICE_ROLE_KEY` and missing Storage buckets with explicit error messages.
    - **Security:** Tightened the authentication check for scorecard saving, ensuring only logged-in users can trigger storage uploads.

## Conclusion
The implementation of all three tasks is solid and follows the project standards. T-034, T-035, and T-036 are officially marked as **done**.

## Next Steps
- Final verification of deployment environment settings (Supabase Service Role Key & Storage Bucket).
