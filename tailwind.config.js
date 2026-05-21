/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-base':    'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-raised':  'var(--bg-raised)',
        'bg-overlay': 'var(--bg-overlay)',

        // Borders
        'border-subtle':  'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong':  'var(--border-strong)',

        // Text
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted':     'var(--text-muted)',
        'text-faint':     'var(--text-faint)',
        'text-inverted':  'var(--text-inverted)',

        // Accent Primary
        'accent-primary':       'var(--accent-primary)',
        'accent-primary-dark':  'var(--accent-primary-dark)',
        'accent-primary-text':  'var(--accent-primary-text)',
        'accent-primary-dim':   'var(--accent-primary-bg-dim)',

        // Accent Secondary
        'accent-secondary':      'var(--accent-secondary)',
        'accent-secondary-text': 'var(--accent-secondary-text)',

        // Accent Tertiary
        'accent-tertiary':      'var(--accent-tertiary)',
        'accent-tertiary-alt':  'var(--accent-tertiary-alt)',
        'accent-tertiary-text': 'var(--accent-tertiary-text)',
        'accent-tertiary-dim':  'var(--accent-tertiary-bg-dim)',

        // Accent Amber
        'accent-amber':      'var(--accent-amber)',
        'accent-amber-text': 'var(--accent-amber-text)',
        'accent-amber-dim':  'var(--accent-amber-bg-dim)',

        // Priority
        'priority-high':        'var(--priority-high-bg)',
        'priority-high-text':   'var(--priority-high-text)',
        'priority-med':         'var(--priority-med-bg)',
        'priority-med-text':    'var(--priority-med-text)',
        'priority-med-dim':     'var(--priority-med-bg-dim)',
        'priority-low':         'var(--priority-low-bg)',
        'priority-low-text':    'var(--priority-low-text)',
        'priority-later':       'var(--priority-later-bg)',
        'priority-later-text':  'var(--priority-later-text)',
      },
      borderColor: {
        'accent-primary':   'var(--accent-primary-border)',
        'accent-secondary': 'var(--accent-secondary-border)',
        'accent-tertiary':  'var(--accent-tertiary-border)',
        'accent-amber':     'var(--accent-amber-border)',
        'accent-amber-dim': 'var(--accent-amber-border-dim)',
        'priority-high':    'var(--priority-high-border)',
        'priority-med':     'var(--priority-med-border)',
        'priority-low':     'var(--priority-low-border)',
        'priority-later':   'var(--priority-later-border)',
        'subtle':           'var(--border-subtle)',
        'default':          'var(--border-default)',
        'strong':           'var(--border-strong)',
      },
    },
  },
  plugins: [],
}
