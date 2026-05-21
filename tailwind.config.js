/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Added tsx support
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds & Core Board Layout
        'base':    'var(--bg-base)',
        'surface': 'var(--bg-surface)',
        'raised':  'var(--bg-raised)',
        'overlay': 'var(--bg-overlay)',

        // Unified Borders (Accessible via border-* and bg-*)
        'subtle':  'var(--border-subtle)',
        'default': 'var(--border-default)',
        'strong':  'var(--border-strong)',

        // Text Tokens
        'primary':   'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'muted':     'var(--text-muted)',
        'faint':     'var(--text-faint)',
        'inverted':  'var(--text-inverted)',

        // Accent Primary (Pink)
        'accent-primary':       'var(--accent-primary)',
        'accent-primary-dark':  'var(--accent-primary-dark)',
        'accent-primary-text':  'var(--accent-primary-text)',
        'accent-primary-dim':   'var(--accent-primary-bg-dim)',
        'accent-primary-border':'var(--accent-primary-border)',

        // Accent Secondary (Cyan)
        'accent-secondary':      'var(--accent-secondary)',
        'accent-secondary-text': 'var(--accent-secondary-text)',
        'accent-secondary-dim':  'var(--accent-secondary-bg-dim)', // Added missing token
        'accent-secondary-border':'var(--accent-secondary-border)',

        // Accent Tertiary (Violet)
        'accent-tertiary':      'var(--accent-tertiary)',
        'accent-tertiary-alt':  'var(--accent-tertiary-alt)',
        'accent-tertiary-text': 'var(--accent-tertiary-text)',
        'accent-tertiary-dim':  'var(--accent-tertiary-bg-dim)',
        'accent-tertiary-border':'var(--accent-tertiary-border)',

        // Accent Amber (Warnings/To-Sort Actions)
        'accent-amber':            'var(--accent-amber)',
        'accent-amber-text':       'var(--accent-amber-text)',
        'accent-amber-dim':        'var(--accent-amber-bg-dim)',
        'accent-amber-border':     'var(--accent-amber-border)',
        'accent-amber-border-dim': 'var(--accent-amber-border-dim)',

        // Priority Matrix (Cleanly unifies bg-priority-*, text-priority-*, border-priority-*)
        'priority-high':        'var(--priority-high-bg)',
        'priority-high-text':   'var(--priority-high-text)',
        'priority-high-border': 'var(--priority-high-border)',
        'priority-high-dim':    'var(--priority-high-bg-dim)', // Added asymmetric token

        'priority-med':         'var(--priority-med-bg)',
        'priority-med-text':    'var(--priority-med-text)',
        'priority-med-border':  'var(--priority-med-border)',
        'priority-med-dim':     'var(--priority-med-bg-dim)',

        'priority-low':         'var(--priority-low-bg)',
        'priority-low-text':    'var(--priority-low-text)',
        'priority-low-border':  'var(--priority-low-border)',
        'priority-low-dim':     'var(--priority-low-bg-dim)', // Added asymmetric token

        'priority-later':       'var(--priority-later-bg)',
        'priority-later-text':  'var(--priority-later-text)',
        'priority-later-border':'var(--priority-later-border)',
        'priority-later-dim':   'var(--priority-later-bg-dim)', // Added asymmetric token
      },
    },
  },
  plugins: [],
}