# DESIGN.md — Project Hub Visual System

This document is the single source of truth for the visual design of Project Hub. All colors, spacing, typography, shadows, and component conventions are defined here. To retheme the entire app, edit `src/themes.css` only — every value below maps directly to that file.

A legacy dark theme document is preserved at `docs/DESIGN-Synth.md` for reference.

---

## 1. Active Theme: Clarity Blue (Light)

A clean, highly accessible light theme. Derived from a bright cyan to deep navy gradient, carefully desaturated and darkened to ensure WCAG AA (4.5:1) or AAA (7:1) compliance. Backgrounds deliberately use a soft off-white (`slate-50`) instead of pure white to reduce glare, serving as a primary neurodivergent accommodation. No pure saturated hues are used for text.

| Property | Value | Reference |
| :--- | :--- | :--- |
| Background base | `rgb(248, 250, 252)` | slate-50 |
| Surface layer | `rgb(241, 245, 249)` | slate-100 |
| Raised elements | `rgb(226, 232, 240)` | slate-200 |
| Overlay / modals | `rgb(203, 213, 225)` | slate-300 |

---

## 2. Design Token System

All tokens live in `src/themes.css` as CSS custom properties on `:root`. Tailwind consumes them via `tailwind.config.js` using the `rgb(var(...) / <alpha-value>)` syntax, which enables native Tailwind opacity modifiers (e.g. `bg-surface/80`).

Shadows use `rgba()` directly because they are applied via `style={{}}` props in JSX, not via Tailwind utility classes.

### How to create a new theme

1. Open `src/themes.css`
2. Copy the blank `:root` template at the bottom of the file
3. Fill in your new RGB and hex values
4. Replace the existing `:root` block with your new one
5. Rebuild — no other files need to change

---

## 3. Color Tokens

### Backgrounds

| Token | CSS Variable | RGB Value | Tailwind Class | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Base | `--bg-base` | `248 250 252` | `bg-base` | slate-50 — off-white, reduces glare |
| Surface | `--bg-surface` | `241 245 249` | `bg-surface` | slate-100 — card backgrounds |
| Raised | `--bg-raised` | `226 232 240` | `bg-raised` | slate-200 — raised elements, tag chips |
| Overlay | `--bg-overlay` | `203 213 225` | `bg-overlay` | slate-300 — modals, disabled states |

### Borders

| Token | CSS Variable | RGB Value | Tailwind Class |
| :--- | :--- | :--- | :--- |
| Base | `--border-base` | `248 250 252` | `border-base` |
| Subtle | `--border-subtle` | `226 232 240` | `border-subtle` |
| Default | `--border-default` | `203 213 225` | `border-default` |
| Strong | `--border-strong` | `148 163 184` | `border-strong` |

### Text

| Token | CSS Variable | RGB Value | Usage |
| :--- | :--- | :--- | :--- |
| Primary | `--text-primary` | `15 23 42` | Headlines, task titles (slate-900, AAA) |
| Secondary | `--text-secondary` | `30 41 59` | Body copy, labels (slate-800, AAA) |
| Muted | `--text-muted` | `71 85 105` | Supporting text, metadata (slate-600, AAA) |
| Faint | `--text-faint` | `100 116 139` | Placeholder text, disabled (slate-500, AA) |
| Inverted | `--text-inverted` | `248 250 252` | Text on dark/colored buttons (slate-50) |

### Accents

| Token | CSS Variable | RGB Value | Hex | Role |
| :--- | :--- | :--- | :--- | :--- |
| Primary | `--accent-primary` | `30 64 175` | `#1e40af` | blue-800 — primary CTAs, active states |
| Primary Dark | `--accent-primary-dark` | `30 58 138` | `#1e3a8a` | blue-900 — hover state for primary |
| Secondary | `--accent-secondary` | `8 145 178` | `#0891b2` | cyan-600 — selected tabs, highlights |
| Tertiary | `--accent-tertiary` | `14 116 144` | `#0e7490` | cyan-700 — project settings, section headers |
| Tertiary Alt | `--accent-tertiary-alt` | `6 182 212` | `#06b6d4` | cyan-500 — gradient accent |
| Amber | `--accent-amber` | `180 83 9` | `#b45309` | amber-700 — warnings, MoSCoW "Must" |

### Priority Colors

These map directly to the five task columns in the Kanban workspace.

| Priority | CSS Variable | RGB Value | Hex | Column |
| :--- | :--- | :--- | :--- | :--- |
| High | `--priority-high` | `185 28 28` | `#b91c1c` | High (red-700) |
| Med | `--priority-med` | `30 64 175` | `#1e40af` | Med (blue-800) |
| Low | `--priority-low` | `8 145 178` | `#0891b2` | Low (cyan-600) |
| Later | `--priority-later` | `100 116 139` | `#64748b` | Later / Icebox (slate-500) |

> Note: "To Sort" is an unstyled neutral queue — it uses default surface colors.

### Confetti Colors

Used exclusively by `src/lib/colors.js` → `fireConfetti()` on task completion.

| Variable | Hex | Color name |
| :--- | :--- | :--- |
| `--confetti-1` | `#1e40af` | blue-800 |
| `--confetti-2` | `#0891b2` | cyan-600 |
| `--confetti-3` | `#059669` | emerald-600 |
| `--confetti-4` | `#d97706` | amber-500 |
| `--confetti-5` | `#dc2626` | red-600 |

---

## 4. Shadow Tokens

This light theme uses soft drop shadows rather than neon glows. All shadows use `rgba()` values and are applied via Tailwind custom shadow utilities or inline `style={{}}` props.

| Token | CSS Variable | Value | Used On |
| :--- | :--- | :--- | :--- |
| Nav | `--shadow-nav` | `rgba(15, 23, 42, 0.10)` | Bottom navigation bar |
| Dock Button | `--shadow-dock-btn` | `rgba(30, 64, 175, 0.25)` | Floating action (+) button |
| Selected | `--shadow-selected` | `rgba(8, 145, 178, 0.30)` | Active column tab indicator |
| Toast | `--shadow-toast` | `rgba(30, 64, 175, 0.20)` | Goal completion toast overlay |
| Primary | `--shadow-primary` | `rgba(30, 64, 175, 0.25)` | Primary action buttons |
| Amber | `--shadow-amber` | `rgba(180, 83, 9, 0.20)` | Warning / "Must" priority indicators |
| Tertiary | `--shadow-tertiary` | `rgba(14, 116, 144, 0.20)` | RICE score badges |

---

## 5. Typography

No custom font is loaded. The app uses the system font stack via Tailwind's default `font-sans`.

| Context | Class | Size |
| :--- | :--- | :--- |
| Page heading / wizard title | `text-2xl font-black` | 24px |
| Section heading | `text-xl font-bold` | 20px |
| Section label | `text-sm font-semibold` | 14px |
| Body / task title | `text-sm font-bold` | 14px |
| Description / supporting copy | `text-xs` | 12px |
| Metadata / badge / tag | `text-[10px]` or `text-[9px]` | 10–9px |
| Base minimum on interactive labels | — | ≥14px |

Font weight is capped at three values across the entire UI: `font-bold` (700), `font-black` (900), and `font-semibold` (600) for de-emphasized actions.

---

## 6. Spacing & Layout

- **Max width:** `max-w-md mx-auto` (448px) — constrains to a single mobile column on all viewports. No responsive multi-column breakpoints are used; the app is always treated as a phone screen.
- **Safe area padding:** `.pb-safe` in `src/index.css` applies `padding-bottom: env(safe-area-inset-bottom)` for iPhone notch/home bar clearance.
- **Bottom nav height:** Fixed dock at 64px. Content areas use `pb-24` to ensure scrollable content is never hidden behind the dock.
- **Column peek mechanic:** The Tasks workspace uses a 15px gradient bleed (`from-raised/80 to-transparent`) on both screen edges to signal swipeable adjacent columns.
- **8px spacing grid:** All padding and gap values are multiples of 4 or 8 (`p-4`, `gap-2`, `space-y-6`, etc.).

---

## 7. Component Visual Conventions

### Task Card

The card uses a flex-row layout with three distinct zones:

- **Priority stripe:** Left-edge 4px column (`w-1`) using the task's `column` priority color token via `getGaugeColor()`.
- **Content zone:** Flexible-width area containing title, optional description (2-line clamp), tag chips, and RICE/MoSCoW badges.
- **Complete column:** Right-edge 56px (`w-14`) bordered strip with `CircleCheck` icon — only shown outside the "To Sort" column.
- **Options menu:** `...` button fades in on hover (`opacity-0 group-hover:opacity-100`) to reduce visual noise at rest. Dropdown renders outside `overflow-hidden` to avoid clipping.

### Task View Modal

Full-screen slide-up overlay (z-50). Entry point for reading all task details before acting.

- Top priority stripe uses `getGaugeColor()` for column-colored 4px bar.
- MoSCoW badge uses color-coded background/border pair per classification.
- Task-level Strategy Specs grid (WHO/WHAT/WHY) shows filled cards when data exists; dashed tappable placeholders when empty.
- Tappable RICE score card opens the Priority Wizard to re-score.
- Edit button routes to `TaskEditModal` inline (no separate navigation).

### Task Edit Modal

Full-screen slide-up overlay. Used for editing title, description, tags, and task-level strategy specs.

- Title: `text-2xl font-black` underline input with `focus:border-accent-primary`.
- Description: `textarea` with `resize-none`, matching underline style.
- Strategy Specs: Three `bg-surface` cards with `focus-within:border-accent-primary` border highlight.

### Priority Wizard Modal

Full-screen slide-up overlay for RICE scoring and MoSCoW classification.

- Predicted column badge updates live as scores change, color-coded to priority tokens.
- MoSCoW selector: pill toggle group, `Must` uses amber accent, `Won't` uses muted gray.
- RICE sliders use Fibonacci dot-picker pattern with inline `?` info popovers per metric.
- Description textarea added below title field for optional annotation.

### Project Edit Modal

Full-screen slide-up overlay for project-level settings (introduced in v0.3.0).

- Accent color: `accent-tertiary` (cyan-700) to distinguish from task-level modals.
- Three sections: project name (large underline input), mission (textarea), strategy specs (WHO/WHAT/WHY textarea cards).
- Same `focus-within:border-accent-primary` highlight pattern as Task Edit.

### Home Dashboard

- **Mission card:** Progress ring (SVG circle, `strokeDasharray`) + mission text. Tappable to open Project Edit.
- **Strategy Specs:** 3-column grid. Filled cards show project-level WHO/WHAT/WHY values. Empty cards show dashed placeholders with `+` icon. All cells tap to open Project Edit.
- **GO Roadmap:** Vertical timeline with left border color-coded to priority. Shows "Now" (High) and "Next" (Med/Low) task titles.
- **Devlog:** Reverse-chronological list of completed tasks. Strikethrough + muted styling. "Done" badge uses `priority-med` accent.

### Bottom Navigation

- Three-button dock: Home, Tasks, floating (+) action button.
- Floating action button: `bg-accent-primary`, `shadow-dock-btn`, larger than nav icons.
- Active tab: `text-accent-secondary` with subtle scale transform.
- GlobalMenu overlay renders centered in the app shell at `z-10`.

### Modals (General)

- Slide-up entry: `animate-in slide-in-from-bottom-full`.
- Backdrop: `bg-base/95 backdrop-blur-xl` for frosted-glass readability.
- All modals render inside the `max-w-md` app shell (`absolute inset-0`) so they behave like native mobile sheets.

---

## 8. Animation Conventions

- **Confetti burst:** Triggered on task completion via `canvas-confetti` (CDN loaded in `index.html`). Uses the five confetti color tokens. Center-screen origin.
- **Goal Toast:** Slide-up overlay (`GoalToast.jsx`) with auto-dismiss at 2200ms.
- **Transitions:** `transition-all duration-150` on interactive elements. Modals use `duration-100` on dropdown menus.
- **Modal entry:** `animate-in slide-in-from-bottom-full` — keep under 300ms.
- **Hover micro-interactions:** `.group / group-hover:opacity-100` pattern used on task card `...` button to reveal contextual actions without visual noise at rest.
- **Reduced motion:** Transition classes should use `motion-safe:` prefix where applicable. `prefers-reduced-motion: reduce` should be respected.

---

## 9. File Map

| File | Role |
| :--- | :--- |
| `src/themes.css` | All CSS custom property tokens — edit here to retheme |
| `src/synth-themes.css` | Legacy dark theme tokens (inactive, reference only) |
| `tailwind.config.js` | Maps tokens to Tailwind utility classes |
| `src/index.css` | Tailwind directives, global resets, `.pb-safe` |
| `src/lib/colors.js` | `getGaugeColor()` and `fireConfetti()` runtime helpers |
| `docs/DESIGN-Synth.md` | Archived Synthwave Dark theme specification |
