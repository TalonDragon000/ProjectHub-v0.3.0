# DEVLOG — Project Hub

This file is the authoritative development history for Project Hub. It documents every significant feature, architectural decision, and design rationale in chronological order. Decisions are recorded with the reasoning behind them, drawing on UX research, cognitive psychology, and product strategy principles.

---
<details>
<summary>Devlog Template</summary>
## v0.X.0 — Template Devlog Update
**Status:** Shipped
### What was built
- **Blank slate first run:**
### Key decisions
**Why remove the seed data rather than hiding it?**
</details>

---

## v0.5.1 — Launch Prep
**Status:** Beta Launch

### What was built
- **X post:** https://x.com/talondragon000/status/2059078608849953021
- **Previous PH Icons:** Used previously created ProjectHub icons for the manifest file. Okay as an initial brand until everything is cleaned up and finalized. 

### Key decisions
**Posting on X**
X/Twitter is a social platform frequented by developers and app builders. Not only are they a key audience, they *should* also provide great beta test feedback as fellow peers. It is also a ProductHunt requirement to post initially to at least one social site for our campaign. 

---

## v0.5.0 — Blank Slate First Run with Opt-In Demo
**Status:** Shipped

### What was built
- **Blank slate first run:** Storage adapter now falls back to empty arrays instead of seeding with the demo project. New users arrive at a clean OnboardingModal with no pre-loaded data.
- **Renamed seed data:** `INITIAL_PROJECTS` / `INITIAL_TASKS` in `constants.js` renamed to `DEMO_PROJECT` / `DEMO_TASKS`. These are now a static template, not a storage default. This makes the intent explicit — they describe a single loadable demo, not a list of "initial" records.
- **`loadDemoProject()` action in AppContext:** Inserts `DEMO_PROJECT` and `DEMO_TASKS` into state only if the demo does not already exist (idempotent). Sets the demo as the active project and closes all modals. Idempotency check (`projects.some(p => p.id === DEMO_PROJECT.id)`) prevents duplicate seeding if the user navigates back to Onboarding after loading the demo once.
- **OnboardingModal first-run variant:** Detects `projects.length === 0` and renders a welcome headline ("Project Hub") and tagline ("Prioritize ruthlessly. Ship what matters.") instead of the generic "New Project" heading. This gives brand context on the first open without adding a dedicated splash screen. The heading reverts to "New Project" on all subsequent opens.
- **"Start Building" button disabled state:** Button is now disabled when the name field is empty, preventing submission of blank projects.
- **Enter key shortcut:** Both name and mission inputs submit the form on Enter.
- **"or explore the Demo Project first" link:** Muted text link rendered below the primary CTA only on first run (`isFirstRun`). Tapping it calls `loadDemoProject()`. Visually subordinate — no border, no background, smaller text — so it reads as an escape hatch, not a fork in the flow.
- **"+ New Project" button in VaultModal:** Fixed-position teal button at the bottom of the Vault overlay. Closes the Vault and opens Onboarding. Provides a permanent project creation entry point from the navigation layer. Scroll content padded to `pb-20` to prevent list items from hiding behind the button.
- **Cancel button condition corrected:** OnboardingModal Cancel now uses `!isFirstRun` (was `projects.length > 0`). These are equivalent but the explicit boolean reads more clearly alongside `isFirstRun`.

### Key decisions

**Why remove the seed data rather than hiding it?**
Seeding storage with demo content on first run means every new user's first action is an escape attempt — figuring out how to replace or remove the demo before doing any real work. Blank slate respects the user's intent: they opened the app to create something, not to clean up sample data. The demo is preserved as an opt-in, not an opt-out, which is a fundamental shift in the relationship between the product and the user's attention.

**Why keep the demo at all?**
The demo provides orientation for users who are unfamiliar with RICE scoring, the column system, or the task card interactions. Rather than a long onboarding tutorial (which users skip) or tooltips (which appear too late), a populated demo project lets users click through a working example and form a mental model before committing to their own data. This is the "guided sample" opt-in pattern used by Notion, Linear, and Figma. The key constraint: it must be genuinely opt-in with no default path into it.

**Why is the demo link visually subordinate?**
If the "Explore Demo" option has the same visual weight as "Start Building," users read it as a required choice rather than an escape hatch. Hesitation increases. Many users will stop to wonder which option is "correct." Making it a small, muted text link (zero border, zero background fill, smaller font) signals that it is secondary — the primary action is already obvious. This matches how iOS's "Sign in with Apple" secondary option, or Stripe's "or use test data" link, are styled in onboarding flows.

**Why is `loadDemoProject` idempotent?**
A user could theoretically load the demo, archive it, return to Onboarding from GlobalMenu, and tap the demo link again. Without the idempotency check, a second `DEMO_PROJECT` entry with `id: 1` would be inserted, creating a duplicate. The check `projects.some(p => p.id === DEMO_PROJECT.id)` covers the archived case — the demo's id is still in storage even when archived, so it will not be re-inserted. The user is simply switched back to it (possibly with `archived: true`, which is a future edge case to handle if needed).

**Why put "New Project" in VaultModal as a fixed button rather than a row item?**
A list item at the top of the active projects list (e.g., a "+ Add project" row) blurs the line between navigation and creation. Users scanning the list for an existing project might click it accidentally, or it creates parsing friction ("is this a project or a button?"). A fixed button at the bottom with a distinct color and full-width tap target is unambiguous. It mirrors the FAB (Floating Action Button) pattern from Material Design, which has established user expectations for "create new thing" in a list context.

---

## v0.4.0 — Project Lifecycle Management (Archive, Restore, Pin)
**Status:** Shipped

### What was built
- **Project archive action (`archiveProject`):** Marks a project `archived: true` and strips its `pinned` flag. If the archived project is currently active, the context automatically switches to the first remaining active project. If none remain, Onboarding is triggered. The edit modal closes on archive.
- **Project restore action (`restoreProject`):** Sets `archived: false` on a project without changing any other fields. The project re-enters the active list at its original position.
- **Project pin action (`pinProject`):** Toggles `pinned` boolean on a project. Pinned projects float to the top of the active list via a sort in the `activeProjects` derived value. Pin order within pinned projects is stable (insertion/creation order).
- **`activeProjects` derived value:** Filters `projects` to `!archived`, then sorts pinned before unpinned with a stable secondary order. Exposed in context.
- **`archivedProjects` derived value:** Filters `projects` to `archived: true`. Exposed in context.
- **`pinned: false, archived: false` on new projects:** `createProject()` and `INITIAL_PROJECTS` seed now include both fields as default.
- **Archive button in `ProjectEditModal`:** A two-step confirmation pattern at the bottom of the edit modal under a "Danger Zone" section header. First tap reveals a confirmation panel with description copy and a red "Confirm Archive" button plus a Cancel escape. Second tap (Confirm) calls `archiveProject`. This prevents accidental archival with a single mis-tap.
- **Rebuilt `VaultModal`:** Split into two sections — Active and Archived. Active projects render as `ProjectRow` components with a pin toggle icon button on the right edge. Pinned projects display a left cyan stripe and a `Pin` icon in the title row. Archived projects are hidden behind a collapsible accordion (`ChevronDown/Up`). Archived rows show de-emphasized styling (60% opacity) and a cyan "Restore" button.

### Key decisions

**Why two-step confirmation for archive instead of a separate confirmation modal?**
A modal-within-a-modal pattern (a confirmation dialog stacked on top of the edit modal) creates z-index complexity and a jarring focus shift on mobile. The inline "reveal and confirm" pattern — where the first button tap replaces itself with an expanded confirmation panel — keeps the interaction within the same visual context and uses the same screen real estate. This is the same pattern used by Vercel's project deletion flow and GitHub's repository transfer flow. It adds exactly one extra deliberate tap for safety while avoiding modal nesting.

**Why is archive placement in ProjectEditModal rather than VaultModal?**
Archive is a lifecycle action that modifies a project's state — it is a destructive operation that belongs alongside other project configuration controls (name, mission, specs). The Vault's purpose is navigation and quick-switching, not project administration. Placing destructive lifecycle actions in a navigation drawer would violate the principle of least surprise (Nielsen, 1994) and would be inconsistent with how iOS and Notion handle project/workspace deletion (always in a settings/admin view, never in a navigation view).

**Why pin toggle in VaultModal rather than ProjectEditModal?**
Pin is a display preference, not a project property. The user needs to see the current list order to make an informed pin decision — "I want this one at the top of the list I can see right now." That context only exists in the Vault where the list is visible. Placing pin in the edit modal would require the user to open the modal, make a change, close the modal, return to the Vault, and verify the order — a five-step flow for a one-step preference. The inline pin button in the Vault row collapses this to one tap in context, matching how Notion's starred pages and iOS contacts' favorites work.

**Why a stable secondary sort order within pinned items?**
Allowing pin to also imply a specific order within pinned projects would require a drag-to-reorder mechanic, adding significant implementation complexity (drag-and-drop touch events, visual reorder feedback) for minimal value. Pinning is a binary "important / not important" signal, not a ranked ordering. Users with enough pinned projects to care about their relative order can use the project name to infer order. The stable insertion-order sort ensures behavior is predictable and consistent across sessions.

**Why hide the Archived section entirely when `archivedProjects.length === 0`?**
Empty-state accordion rows add visual noise without providing any value. An "Archived (0)" row with nothing behind it would make users wonder if something is broken, or invite them to tap it unnecessarily. Hiding the section entirely follows the progressive disclosure principle (Nielsen, 1998) — show complexity only when it is relevant.

---

## v0.1.0 — Foundation
**Status:** Shipped

### What was built
- React 18 + Vite 7 project scaffold with Tailwind CSS.
- Design token system via CSS custom properties in `src/themes.css` consumed by `tailwind.config.js` using `rgb(var(...) / <alpha-value>)` syntax.
- Initial **Synthwave Dark** theme (now archived at `docs/DESIGN-Synth.md`).
- `AppContext.jsx` as the single source of truth for all application state and actions.
- `storage/` adapter pattern: `localStorageAdapter` as the live default with a Supabase adapter stub for future opt-in cloud sync.
- Core data model: `projects[]` and `tasks[]` with RICE fields, MoSCoW, column assignment, completion state, and tags.
- `calculateScore()` and `predictColumn()` pure functions in `src/lib/rice.js`.
- `HomeDashboard` view: progress ring (SVG `strokeDasharray`), GO Roadmap (Now/Next timeline), and Devlog (completed tasks log).
- `TasksWorkspace` view: single-column focus with swipe gesture navigation (touch events), 15px gradient peek mechanic on both edges, and dot-pagination indicator.
- `PriorityWizard` modal: full RICE + MoSCoW scoring interface with live tier prediction gauge, Fibonacci dot-picker for each metric, inline `?` info popovers, and MoSCoW pill selector.
- `TaskCard` component: priority color stripe, RICE score badge, MoSCoW badge, complete button.
- `BottomNav`: three-button dock (Home, Tasks, floating +) with `GlobalMenu` action overlay.
- `QuickNoteModal`: rapid brain-dump textarea that routes to "To Sort" column.
- `VaultModal`: project switcher drawer.
- `OnboardingModal`: new project creation screen shown when no projects exist.
- `GoalToast`: slide-up confetti + celebration overlay on task completion.
- PWA manifest + service worker for home-screen installability.
- Netlify deployment configuration via `netlify.toml` and `public/_redirects`.

### Key decisions

**Why RICE + MoSCoW hybrid?**
The RICE framework (Reach × Impact × Confidence / Effort) was originally formalized by Intercom (Lachapelle, 2016) as a remedy for gut-feel roadmap decisions. Research in decision science consistently shows that replacing subjective ranking with even a simple formula reduces anchoring bias and status quo bias (Tversky & Kahneman, 1974). MoSCoW (Clegg & Barker, 1994) is layered on top as an override mechanism: it prevents the formula from de-prioritizing existential blockers ("Must") or from accidentally surfacing items that have already been deprioritized strategically ("Won't"). The hybrid allows the formula to govern the middle ground while preserving human judgment at the extremes.

**Why Fibonacci scale instead of 1–10 linear?**
The Fibonacci progression (1, 2, 3, 5, 8) mirrors planning poker conventions from Agile methodology (Grenning, 2002). The non-linear gaps force estimators to acknowledge inherent uncertainty: as task complexity grows, so does estimation error, and the jumps in Fibonacci reflect this. Using a 1–10 linear scale creates false precision — the difference between a "6" and a "7" is meaningless in practice, but it triggers prolonged debate (Highsmith, 2009). Fibonacci collapses that debate into clear categorical choices.

**Why single-column focus instead of a standard Kanban board?**
Cognitive load theory (Sweller, 1988; 1994) demonstrates that working memory is severely limited — typically 5–9 items (Miller, 1956). Multi-column Kanban boards expose all tasks simultaneously, overwhelming the user with choices that cannot all be acted upon. The single-column design reduces the visible task list to only those in the active priority tier. The peek mechanic (15px gradient bleed) satisfies discoverability without forcing everything into view simultaneously. This approach aligns with the "focus funnel" model described in Getting Things Done (Allen, 2001).

**Why `localStorage` with an adapter pattern?**
Local-first data persistence eliminates the account barrier that prevents early adoption. Many productivity apps fail at onboarding because they require sign-up before a single task can be saved (Nir Eyal, "Hooked", 2014). The adapter pattern (`storage/index.js` exporting one adapter) means switching to Supabase cloud sync is a one-line change when auth is introduced. No migration needed.

**Why confetti on task completion?**
Operant conditioning research (Skinner, 1938) and gamification studies (Deterding et al., 2011) establish that variable-ratio reinforcement schedules produce the strongest behavioral responses, but even fixed-ratio reinforcement (confetti on every completion) significantly increases repeat behavior. The visual reward creates a micro-dopamine loop that encourages continued use. The GoalToast overlay pairs the visual (confetti) with a verbal affirmation for multi-modal reinforcement.

---

## v0.2.0 — Interaction Overhaul
**Status:** Shipped

### What was built
- **Replaced long-press with hover menu (`...` button):** The `onTouchStart`/`onTouchEnd` long-press timer was removed. A `MoreHorizontal` icon button now fades in on hover (`opacity-0 group-hover:opacity-100`), opening a compact dropdown with View, Prioritize, and Delete options.
- **Persistent Complete strip:** A full-height right-edge column (`w-14`, `border-l`) on every task card replaced the small complete button, making task completion a primary action rather than a secondary hover-state affordance.
- **Task View Modal (`TaskViewModal.jsx`):** New full-screen detail overlay. Clicking any task card now opens this modal first, showing all task metadata including RICE breakdown, MoSCoW badge, strategy specs, and a tappable RICE card that opens the Priority Wizard. An Edit button routes inline to `TaskEditModal`.
- **Task Edit Modal (`TaskEditModal.jsx`):** Separate from the Priority Wizard. Handles title, description, tags, and task-level strategy specs (WHO/WHAT/WHY). Keeps text editing and scoring concerns separate in two distinct modals.
- **Description field on tasks:** Added `description` field to the task data model and to the Priority Wizard form. Displayed on task cards (2-line clamp) and in the Task View Modal.
- **Task-level Strategy Specs:** WHO/WHAT/WHY fields added to tasks. Displayed in `TaskViewModal` as a 3-column grid. Empty specs show dashed tappable placeholders.
- **Auto-sort by RICE score:** `sortByRice()` helper applied to `activeTasks` derived state in `AppContext`. Tasks within each column automatically rank by descending RICE score on every render. Eliminates the need for manual drag-and-drop reordering within a column.
- **`deleteTask()` action:** Added to context and exposed to the card menu and Task View Modal.
- **`updateTask()` action:** Added to context for `TaskEditModal` saves. Keeps `viewingTask` reference fresh after a save so the Task View Modal reflects changes immediately without reopening.
- **`saveWizard()` sync fix:** After a wizard save on an existing task, `viewingTask` is updated in-place so the Task View Modal stays accurate.

### Key decisions

**Why separate TaskViewModal from TaskEditModal?**
The Single Responsibility Principle applied at the UX level. Reading a task and editing a task are fundamentally different cognitive modes. Mixing them in one screen creates accidental edits (fat-finger problems on mobile) and cognitive context-switching. Separating them mirrors the pattern used in native iOS (Detail View → Edit View) and aligns with Nielsen's "Error Prevention" heuristic (Nielsen, 1994). The view state is read-only by default — the user must consciously choose to enter edit mode.

**Why hover-reveal `...` menu instead of always-visible action buttons?**
Task cards are the most frequently scanned element in the app. Always-visible action buttons add visual noise that increases perceived complexity without adding proportional value (Hick's Law: more choices = slower decisions, Hick, 1952). The hover-reveal pattern used by Linear, Notion, and GitHub Issues keeps the default state clean while making actions immediately available on demand. On mobile (touch), the `...` button remains accessible; on desktop it reveals naturally during a hover that already signals intent.

**Why a persistent Complete strip instead of a button inside the menu?**
Completing a task is the highest-frequency action after viewing it. Burying it inside a dropdown menu adds an unnecessary interaction step for the most important workflow in the app. Fitts's Law (Fitts, 1954) states that the time to reach a target is a function of distance and target size — a full-height right-edge strip is a very large, easily hittable target on a mobile touchscreen. Separating it from the destructive Delete action (inside the menu) also reduces accidental completions.

**Why auto-sort by RICE score?**
Research in information foraging (Pirolli & Card, 1999) shows users make faster, more accurate decisions when high-value items are positioned at the top of a list. Manual reordering via drag-and-drop is an anti-pattern for priority-based tools: it reintroduces subjective ordering that RICE scoring was designed to eliminate. Auto-sort enforces the system's objective output and removes the temptation to shuffle tasks based on mood.

**Why a description field?**
The task title alone is often insufficient context when reviewing a backlog item days later. Cognitive psychology research on prospective memory (Einstein & McDaniel, 1990) shows that brief written context at the time of creation dramatically improves recall accuracy during later review. The description field (optional, textarea in both Wizard and Edit modal) provides this annotation layer without making it mandatory.

---

## v0.3.0 — Project-Level Strategy Layer
**Status:** Shipped

### What was built
- **`ProjectEditModal.jsx`:** New slide-up overlay for editing project name, mission statement, and three project-level strategy spec fields (WHO / WHAT / WHY). Accent color is `accent-tertiary` (cyan-700) to visually distinguish it from task-level modals (which use blue/cyan primary accents).
- **Live Strategy Specs on HomeDashboard:** The "Strategy Specs" section was converted from a static "Coming Soon" placeholder to a live 3-column grid. Filled spec cards display the project's WHO/WHAT/WHY values. Empty cells show dashed tappable placeholders with a `+` icon. All cells tap to open `ProjectEditModal`.
- **Tappable Mission card:** The progress ring + mission section on the dashboard is now tappable (`cursor-pointer`, hover border) and opens `ProjectEditModal`. A pencil icon fades in on hover.
- **Settings icon in AppHeader:** A `Settings` icon button added to the right side of the header provides persistent access to `ProjectEditModal` from any tab.
- **`updateProject()` action:** Added to `AppContext`. Replaces the matching project in the array and persists to storage. Exposed in context value.
- **`specs` field on projects:** Added to the project data model as `{ who: string, what: string, why: string }`. Default value applied in `createProject()`. Demo project in `INITIAL_PROJECTS` seeded with example values.
- **Two-scope spec separation:** Project-level specs (WHO/WHAT/WHY on the dashboard) describe the strategic vision for the entire project. Task-level specs (WHO/WHAT/WHY in `TaskEditModal`/`TaskViewModal`) describe the context for a specific task. Keeping these scopes separate prevents conflation of product strategy with individual work item context.

### Key decisions

**Why project-level specs are separate from task-level specs?**
Strategic positioning frameworks like Geoffrey Moore's "Crossing the Chasm" (1991) and the Jobs-to-be-Done framework (Christensen, 2016) emphasize that product strategy operates at a level of abstraction above individual feature delivery. Project-level WHO/WHAT/WHY answers "why does this entire project exist and for whom?" Task-level WHO/WHAT/WHY answers "who is affected by this specific change, what are we building, and what problem does it solve?" Merging them would force users to restate project-wide context on every task, or conversely, would prevent task-specific contextual annotation. Keeping them separate gives each scope the precision it needs.

**Why make the mission card tappable rather than adding a separate Edit button?**
Progressive disclosure (Nielsen, 1998) recommends revealing secondary actions contextually rather than always displaying them. The mission card is a read-only summary at rest. Making the entire card tappable follows the "affordance" principle (Gibson, 1979; Norman, 2013) — the card's appearance as a panel already implies it can be interacted with, and the hover state (border change + pencil icon reveal) confirms the affordance without adding visual clutter. A separate always-visible "Edit" button would compete with the primary content.

**Why a Settings gear icon in the header rather than only the dashboard?**
The Tasks workspace tab is where users spend the majority of their active session time. Requiring navigation back to the Home tab to access project settings creates an interruption to the flow state users are likely in while processing tasks. The persistent header icon provides a context-free escape hatch consistent with mobile app conventions (iOS Settings pattern). It does not dominate the header — it is sized at `w-8 h-8` with muted default color, becoming active only when needed.

**Why `accent-tertiary` (cyan-700) for the project edit modal?**
Color is the most immediate visual differentiator between modal types. Using the same accent for both task modals and the project modal would reduce the user's ability to quickly orient themselves ("am I editing a task or the project?"). The cyan-700 tertiary accent was already reserved for project-level UI in the header (`Folder` icon) and dashboard section labels, making it the natural semantic color for the project edit context. This follows the "consistency and standards" heuristic (Nielsen, 1994).

---

## Architecture Notes

### State Management Philosophy
All application state lives in `AppContext.jsx` via React Context + `useState`. No external state library (Redux, Zustand, Jotai) is used. This is a deliberate decision for v0.x: the app has a small, predictable state shape, and the overhead of an external library would exceed its benefit at this stage. The adapter pattern on storage means the state management layer is decoupled from persistence — the context only calls `storage.saveX()`, it does not know or care whether that writes to localStorage or Supabase.

### `viewingTask` Synchronization
`viewingTask` is stored as a reference in context state. After any save action that modifies the task currently being viewed (`updateTask`, `saveWizard`), the context explicitly updates `viewingTask` in-place. This prevents the Task View Modal from showing stale data without requiring the user to close and reopen it. The pattern was chosen over a derived approach (computing `viewingTask` from `tasks.find()` on every render) because derived computation would require `viewingTask` to hold only an ID, which would require refactoring the open/close API.

### Modal Layering Strategy
All modals render as `absolute inset-0` inside the `max-w-md` app shell, not in a portal. This is intentional: since the app is a fixed mobile-viewport shell, portals provide no practical benefit (there is no overflow or z-index conflict to escape). Using `absolute` positioning keeps modals visually contained within the app frame on larger desktop screens, preserving the mobile-app aesthetic.

### Auto-Sort Implementation
`sortByRice()` is a pure function applied to the `activeTasks` derived array inside the `AppContext` value computation. It does not modify the stored `tasks` array — the sort is computed on read. This means the stored order is stable (insertion order), and the display order reflects the current RICE scores. If scores are updated, the next render automatically re-sorts without any additional action.

---

## References

- Allen, D. (2001). *Getting Things Done*. Viking.
- Christensen, C. (2016). *Competing Against Luck*. Harper Business.
- Clegg, D., & Barker, R. (1994). *Case Method Fast-Track: A RAD Approach*. Addison-Wesley.
- Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness. *MindTrek '11*.
- Einstein, G. O., & McDaniel, M. A. (1990). Normal aging and prospective memory. *Journal of Experimental Psychology: Learning, Memory, and Cognition*, 16(4), 717.
- Eyal, N. (2014). *Hooked: How to Build Habit-Forming Products*. Portfolio.
- Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. *Journal of Experimental Psychology*, 47(6), 381.
- Gibson, J. J. (1979). *The Ecological Approach to Visual Perception*. Houghton Mifflin.
- Grenning, J. (2002). Planning poker or how to avoid analysis paralysis while release planning. *Hawthorn Woods*.
- Hick, W. E. (1952). On the rate of gain of information. *Quarterly Journal of Experimental Psychology*, 4(1), 11–26.
- Highsmith, J. (2009). *Agile Project Management*. Addison-Wesley.
- Lachapelle, S. (2016). RICE: Simple prioritization for product managers. Intercom Blog.
- Miller, G. A. (1956). The magical number seven, plus or minus two. *Psychological Review*, 63(2), 81.
- Moore, G. A. (1991). *Crossing the Chasm*. Harper Business.
- Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
- Nielsen, J. (1998). Progressive disclosure. Nielsen Norman Group.
- Norman, D. A. (2013). *The Design of Everyday Things* (Revised ed.). Basic Books.
- Pirolli, P., & Card, S. (1999). Information foraging. *Psychological Review*, 106(4), 643.
- Skinner, B. F. (1938). *The Behavior of Organisms*. Appleton-Century-Crofts.
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science*, 12(2), 257–285.
- Sweller, J. (1994). Cognitive load theory, learning difficulty, and instructional design. *Learning and Instruction*, 4(4), 295–312.
- Tversky, A., & Kahneman, D. (1974). Judgment under uncertainty: Heuristics and biases. *Science*, 185(4157), 1124–1131.
