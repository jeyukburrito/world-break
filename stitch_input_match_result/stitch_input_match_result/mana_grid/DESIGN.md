# Design System Document

## 1. Creative North Star: The Tactical Editorial
This design system moves beyond the generic "utility app" aesthetic to embrace a **Tactical Editorial** philosophy. TCG (Trading Card Game) players thrive on data, strategy, and precision. This system reflects that through a high-end, data-dense interface that feels like a premium digital journal.

By utilizing intentional asymmetry, sophisticated tonal layering, and an aggressive typography scale, we transform a simple tracker into a signature experience. We replace rigid, boxed-in layouts with breathing room and "floating" architectural elements, ensuring the PWA feels like a native, high-performance tool.

---

## 2. Color & Surface Architecture
Our palette uses deep purples and technical blues to establish authority, balanced by a neutral gray scale that provides a clean, editorial canvas.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To separate content, designers must use background color shifts or vertical spacing. 
- Use `surface-container-low` for a background section sitting on a `surface` base.
- Use `surface-container-lowest` for cards to create a natural, soft lift.

### Surface Hierarchy (Tonal Layering)
| Level | Token | Usage |
| :--- | :--- | :--- |
| **Base** | `surface` | The primary app canvas background. |
| **Section** | `surface-container-low` | Grouping related modules (e.g., a dashboard segment). |
| **Card** | `surface-container-lowest` | Individual interactive elements or data points. |
| **Overlay** | `surface-bright` | High-priority modals or floating navigation. |

### Glass & Gradient Rule
To achieve a premium "Signature" look, main CTAs and floating headers should utilize:
- **Glassmorphism:** `surface` color at 70% opacity + `backdrop-blur: 20px`.
- **Signature Gradients:** Transition from `primary` (#513fc6) to `primary-container` (#6a5ae0) at a 135° angle for hero buttons and active states.

---

## 3. Typography: The High-Contrast Scale
We use **Inter** as our typographic workhorse. The key to the "Editorial" look is the intentional contrast between massive display headers and tight, technical labels.

*   **Display (Strategic Stats):** `display-md` (2.75rem) / Bold. Used for win rates and match totals.
*   **Headline (Context):** `headline-sm` (1.5rem) / Semi-Bold. Used for page titles like "Match History."
*   **Title (Object):** `title-md` (1.125rem) / Medium. Used for Deck Names and Card Titles.
*   **Body (Data):** `body-md` (0.875rem) / Regular. General match details.
*   **Label (Technical):** `label-sm` (0.6875rem) / Bold / All-caps. Used for metadata like "BO1" or "TURN 1."

---

## 4. Elevation & Depth
Depth is a functional tool, not a decoration. We avoid heavy, "dirty" shadows in favor of ambient light.

*   **The Layering Principle:** Place `surface-container-lowest` cards on top of `surface-container-low` backgrounds. This creates "optical elevation" without shadows.
*   **Ambient Shadows:** For floating elements (Bottom Nav, Modals), use:
    *   `box-shadow: 0 12px 32px -4px rgba(25, 28, 30, 0.08);`
    *   The shadow must be tinted with the `on-surface` color to feel integrated.
*   **The Ghost Border:** If a boundary is needed for accessibility, use `outline-variant` (#c8c4d6) at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components

### Large Touchable Buttons
Designed for rapid entry during physical play.
- **Primary:** Gradient (`primary` to `primary-container`), `xl` (1.5rem) rounded corners. Height: 56px.
- **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
- **States:** On press, apply a 10% `on-primary` white overlay.

### Data Visualization Cards
TCG Match Tracker requires dense but readable cards.
- **Rule:** Forbid divider lines. Use `spacing-4` (1rem) of vertical white space to separate list items within a card.
- **Asymmetry:** Align win/loss markers to the far right, while deck names and game types stack with left-aligned editorial hierarchy.

### Bottom Navigation Bar (PWA Signature)
- **Style:** Floating "island" or edge-to-edge glassmorphism.
- **Active State:** A `primary` tinted background pill behind the icon, rather than just a color change.
- **Height:** 80px (including safe area) to ensure comfortable thumb reach.

### Form Inputs
- **Style:** "Soft Box" style. `surface-container-high` background, `md` (0.75rem) corner radius.
- **Interaction:** The label should never disappear; it shifts to `label-sm` above the input value on focus.
- **Error:** Use a `ghost border` of the `error` token (#ba1a1a) at 20% opacity.

---

## 6. Do’s and Don'ts

### Do
*   **Do** use `spacing-8` (2rem) and `spacing-10` (2.5rem) between major sections to let the UI breathe.
*   **Do** use `primary-fixed-dim` for "Win" indicators and `error` for "Loss" to maintain high-contrast legibility.
*   **Do** use `xl` (1.5rem) corner radius for large container cards and `md` (0.75rem) for nested elements.

### Don't
*   **Don't** use 1px solid black or gray borders. They "trap" the data and feel dated.
*   **Don't** use pure black shadows. They muddy the refined purple/blue color palette.
*   **Don't** use standard "Select" dropdowns. Create custom full-screen selection sheets for a premium mobile feel.
*   **Don't** crowd the edges. Maintain a minimum of `spacing-4` (1rem) horizontal padding across the entire app.