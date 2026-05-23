# DESIGN.md — Project Hub Visual System

This document is the single source of truth for the visual design of Project Hub.
All colors, spacing, typography, shadows, and component conventions are defined here.
To retheme the entire app, edit `src/themes.css` only — every value below maps directly to that file.

---

## 1. Active Theme: Synthwave Dark

A deep, cool-toned dark interface with high-contrast neon pink and cyan accents.
Inspired by retro synthwave aesthetics — dark enough for late-night sessions,
vibrant enough to feel alive.

| Property | Value | Reference |
| :--- | :--- | :--- |
| Background base | `rgb(2, 6, 23)` | slate-950 |
| Surface layer | `rgb(15, 23, 42)` | slate-900 |
| Raised elements | `rgb(30, 41, 59)` | slate-800 |
| Overlay / modals | `rgb(51, 65, 85)` | slate-700 |

---

## 2. Design Token System

All tokens live in `src/themes.css` as CSS custom properties on `:root`.
Tailwind consumes them via `tailwind.config.js` using the `rgb(var(...) / <alpha-value>)` syntax,
which enables native Tailwind opacity modifiers (e.g. `bg-surface/80`).

Shadows and glows use `rgba()` directly because they are applied via `style={{}}` props in JSX,
not via Tailwind utility classes.

### How to create a new theme

1. Open `src/themes.css`
2. Copy the blank `:root` template at the bottom of the file
3. Fill in your new RGB and hex values
4. Replace the existing `:root` block with your new one
5. Rebuild — no other files need to change

---

## 3. Color Tokens

### Backgrounds

| Token | CSS Variable | RGB Value | Tailwind Class |
| :--- | :--- | :--- | :--- |
| Base | `--bg-base` | `2 6 23` | `bg-base` |
| Surface | `--bg-surface` | `15 23 42` | `bg-surface` |
| Raised | `--bg-raised` | `30 41 59` | `bg-raised` |
| Overlay | `--bg-overlay` | `51 65 85` | `bg-overlay` |

### Borders

| Token | CSS Variable | RGB Value | Tailwind Class |
| :--- | :--- | :--- | :--- |
| Subtle | `--border-subtle` | `30 41 59` | `border-subtle` |
| Default | `--border-default` | `51 65 85` | `border-default` |
| Strong | `--border-strong` | `71 85 105` | `border-strong` |

### Text

| Token | CSS Variable | RGB Value | Usage |
| :--- | :--- | :--- | :--- |
| Primary | `--text-primary` | `226 232 240` | Headlines, task titles |
| Secondary | `--text-secondary` | `203 213 225` | Body copy, labels |
| Muted | `--text-muted` | `148 163 184` | Supporting text, metadata |
| Faint | `--text-faint` | `100 116 139` | Placeholder text, disabled |
| Inverted | `--text-inverted` | `2 6 23` | Text on light/neon backgrounds |

### Accents

| Token | CSS Variable | RGB Value | Hex | Role |
| :--- | :--- | :--- | :--- | :--- |
| Primary | `--accent-primary` | `236 72 153` | `#ec4899` | pink-500 — primary CTAs, active states |
| Primary Dark | `--accent-primary-dark` | `219 39 119` | `#db2777` | pink-600 — hover state for primary |
| Secondary | `--accent-secondary` | `6 182 212` | `#06b6d4` | cyan-500 — selected tabs, highlights |
| Tertiary | `--accent-tertiary` | `124 58 237` | `#7c3aed` | violet-600 — RICE badge, secondary UI |
| Tertiary Alt | `--accent-tertiary-alt` | `167 139 250` | `#a78bfa` | violet-400 — lighter gradient variant |
| Amber | `--accent-amber` | `217 119 6` | `#d97706` | amber-600 — warnings, MoSCoW "Must" |

### Priority Colors

These map directly to the five task columns in the Kanban workspace.

| Priority | CSS Variable | RGB Value | Hex | Column |
| :--- | :--- | :--- | :--- | :--- |
| High | `--priority-high` | `236 72 153` | `#ec4899` | High (pink-500) |
| Med | `--priority-med` | `168 85 247` | `#a855f7` | Med (purple-500) |
| Low | `--priority-low` | `99 102 241` | `#6366f1` | Low (indigo-500) |
| Later | `--priority-later` | `107 114 128` | `#6b7280` | Later / Icebox (gray-500) |

> Note: "To Sort" is an unstyled neutral queue — it uses the default surface colors.

### Confetti Colors

Used exclusively by `src/lib/colors.js` → `fireConfetti()` on task completion.

| Variable | Hex | Color name |
| :--- | :--- | :--- |
| `--confetti-1` | `#ec4899` | pink |
| `--confetti-2` | `#06b6d4` | cyan |
| `--confetti-3` | `#a855f7` | purple |
| `--confetti-4` | `#f59e0b` | amber |
| `--confetti-5` | `#10b981` | emerald |

---

## 4. Shadow & Glow Tokens

All shadows use `rgba()` values. Applied via Tailwind custom shadow utilities or inline `style={{}}` props.

| Token | CSS Variable | Value | Used On |
| :--- | :--- | :--- | :--- |
| Nav | `--shadow-nav` | `rgba(2, 6, 23, 0.8)` | Bottom navigation bar (upward shadow) |
| Dock Button | `--shadow-dock-btn` | `rgba(236, 72, 153, 0.40)` | Floating action (+) button |
| Selected | `--shadow-selected` | `rgba(6, 182, 212, 0.50)` | Active column tab indicator |
| Toast | `--shadow-toast` | `rgba(236, 72, 153, 0.35)` | Goal completion toast overlay |
| Primary | `--shadow-primary` | `rgba(236, 72, 153, 0.40)` | Primary action buttons |
| Amber | `--shadow-amber` | `rgba(217, 119, 6, 0.30)` | Warning / "Must" priority indicators |
| Tertiary | `--shadow-tertiary` | `rgba(124, 58, 237, 0.30)` | RICE score badges |

### Tailwind Shadow Utilities

Defined in `tailwind.config.js` under `theme.extend.boxShadow`:

