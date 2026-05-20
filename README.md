# Project Hub [v0.2.0]
A mobile-first prioritization and organization web app

ProjectHub eliminates feature-bloat anxiety and "gut-feeling" roadmap changes by substituting traditional, impulsive drag-and-drop Kanban interactions with an **Intentional Prioritization Wizard** backed by the **RICE Scoring Framework** and **MoSCoW Filters**.

---

## Core Philosophy & Features

* **Single-Column Focus Workspace:** Unlike sprawling Kanban boards that induce cognitive overload, the Tasks workspace displays only **one priority column at a time** (High, Med, Low, Later, To Sort). A subtle **15px gradient "Peek" mechanic** on the screen edge signals additional columns waiting to be discovered via intuitive touch swipe gestures.
* **The Gatekeeper (Priority Wizard):** To prevent impulsive prioritization shifts, tasks can only be re-sorted or introduced into the roadmap by passing through an objective valuation modal. The Wizard weights metrics using a non-linear **Fibonacci Scale (1, 2, 3, 5, 8)** to eliminate decision fatigue and false precision.
* **The Vault (Project File System):** A background management system that allows solo makers to capture, store, and switch between multiple project ideas. To enforce radical focus, **only one project can be active at a time** — switching projects reloads the entire dashboard state.
* **The Devlog (Recent Wins):** Checking off a task triggers an instantaneous center-screen **confetti burst** to celebrate incremental momentum. Completed tasks glide automatically out of the active workspace into a reverse-chronological "Recent Wins" historical log on the Home dashboard.
* **Ghost Entry & Brain Dumps:** Instantly offload raw mental clutter without interrupting your current focus. Use the global centralized **Action Dock (+)** to drop a "Quick Note" or use the dashed **"Ghost Card" entry** inside the "To Sort" column to queue unprioritized items for later review.
* **Strategy Specs Panel (Coming Soon):** Interactive strategic configuration for project-specific target audiences (WHO / WHAT / WHY) is visible on the Home dashboard and reserved for a future release.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | React 18.3.1 | Component-based UI library for building the single-page application. |
| **Build Tool** | Vite 5.3.1 | Fast local dev server and optimized production bundler. |
| **Styling** | Tailwind CSS 3.4.4 | Utility-first CSS framework for the Soft-Dark Synthwave theme. |
| **Icons** | lucide-react 0.400.0 | Lightweight SVG icon library for all UI glyphs. |
| **Confetti** | canvas-confetti (CDN) | Browser-native confetti burst on task completion. |
| **Database** | Supabase (PostgreSQL) | Configured and ready; full persistence integration is in progress. |
| **Hosting** | Netlify | Static site deployment with SPA redirect rules via `netlify.toml`. |
| **PWA** | Web App Manifest + Service Worker | Installable on mobile home screens with offline asset caching. |

---

## Prioritization Architecture & Logic

The core placement engine acts as an objective validator for your roadmap, calculating real-time tier predictions inside the wizard using a dual-framework hybrid approach:

### 1. The RICE Formula

```
Score = (Reach x Impact x Confidence) / Effort
```

* **Reach:** How many users does this affect?
* **Impact:** How much does this move the structural needle? *(1 = Minimal, 8 = Massive)*
* **Confidence:** How sure are you of these estimates?
* **Effort:** How much work is required? *(Higher effort lowers the score)*

*Note: All selections utilize the Fibonacci progression `(1, 2, 3, 5, 8)`. This forces clear contrast between items, preventing analysis paralysis between arbitrary adjacent linear scales (e.g., a 6 vs. a 7).*

### 2. The MoSCoW Override & Tie-Breaker Filters
* **Must:** Overrides any calculated RICE score and routes the item **always to High Priority**.
* **Won't:** Overrides any calculated RICE score and routes the item **always to Later (The Icebox)**.
* **Should / Could:** Used as a contextual label when RICE scores determine the column destination.

### Metric Thresholds

| MoSCoW / Calculated Score | Predicted Column Destination |
| :--- | :--- |
| `Must` | **High** (Enforced Always) |
| `Won't` | **Later** (Enforced Always) |
| Score >= 25 | **High** |
| Score 10 - 24 | **Med** |
| Score < 10 | **Low** |

---

## Data Model (In-Memory)

All data is currently managed in React component state. Supabase integration is in progress. The current in-memory shape is:

### Projects
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Auto-incremented integer or `Date.now()` timestamp |
| `name` | `string` | Project display name |
| `mission` | `string` | One-sentence orientation/purpose statement |

### Tasks
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Auto-incremented integer or `Date.now()` timestamp |
| `projectId` | `number` | References parent project `id` |
| `title` | `string` | Outcome-based goal/task title |
| `reach` | `number` | Fibonacci parameter (1 / 2 / 3 / 5 / 8) |
| `impact` | `number` | Fibonacci parameter (1 / 2 / 3 / 5 / 8) |
| `confidence` | `number` | Fibonacci parameter (1 / 2 / 3 / 5 / 8) |
| `effort` | `number` | Fibonacci parameter (1 / 2 / 3 / 5 / 8) |
| `moscow` | `string` | `Must` / `Should` / `Could` / `Won't` |
| `column` | `string` | `High` / `Med` / `Low` / `Later` / `To Sort` |
| `completed` | `boolean` | State toggle flag, default `false` |
| `tags` | `string[]` | Strategy tag array (e.g., Marketing, Core Feature) |

---

## Local Development Setup

### Prerequisites
* Node.js 18+ (LTS recommended)
* NPM or Yarn

### Steps

1. **Clone and Install Dependencies:**
    ```bash
    git clone https://github.com/TalonDragon000/ProjectHub-v0.2.0.git
    cd ProjectHub-v0.2.0
    npm install
    ```

2. **Environment Setup:**
    Create a `.env` file at the project root:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key
    ```

3. **Start the Dev Server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser. The app is optimized for a mobile viewport — use browser DevTools device emulation for the best experience.

4. **Build for Production:**
    ```bash
    npm run build
    ```
    Output is placed in `dist/`. Deploy the `dist/` folder to any static host (Netlify is pre-configured via `netlify.toml`).

---

## Upcoming Roadmap

* [ ] **Supabase Persistence:** Wire up full create/read/update for projects and tasks against the live PostgreSQL database.
* [ ] **Device-Scoped Identity:** Zero-friction anonymous device identity using `localStorage` UUID seeding, with Supabase RLS policies scoped per device.
* [ ] **Strategy Specs Panel:** Interactive configuration for project-specific target audiences (WHO / WHAT / WHY) inside the Home dashboard.
* [ ] **Cross-Device Account Sync:** Opt-in authentication layer to transform anonymous device tokens into unified multi-device profiles.
* [ ] **Project Velocity Analytics:** Visual telemetry tracing cycle execution speeds and milestone completion distributions over time.
* [ ] **Stale-Task Browser Notifications:** Browser push notifications targeting high-priority goals lingering in an unexecuted column.
