/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Layout
        base:    'rgb(var(--bg-base) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        raised:  'rgb(var(--bg-raised) / <alpha-value>)',
        overlay: 'rgb(var(--bg-overlay) / <alpha-value>)',

        // Borders
        subtle:  'rgb(var(--border-subtle) / <alpha-value>)',
        default: 'rgb(var(--border-default) / <alpha-value>)',
        strong:  'rgb(var(--border-strong) / <alpha-value>)',

        // Text
        primary:   'rgb(var(--text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        muted:     'rgb(var(--text-muted) / <alpha-value>)',
        faint:     'rgb(var(--text-faint) / <alpha-value>)',
        inverted:  'rgb(var(--text-inverted) / <alpha-value>)',

        // Accents
        'accent-primary':   'rgb(var(--accent-primary) / <alpha-value>)',
        'accent-secondary': 'rgb(var(--accent-secondary) / <alpha-value>)',
        'accent-tertiary':  'rgb(var(--accent-tertiary) / <alpha-value>)',
        'accent-amber':     'rgb(var(--accent-amber) / <alpha-value>)',

        // Priorities
        'priority-high':  'rgb(var(--priority-high) / <alpha-value>)',
        'priority-med':   'rgb(var(--priority-med) / <alpha-value>)',
        'priority-low':   'rgb(var(--priority-low) / <alpha-value>)',
        'priority-later': 'rgb(var(--priority-later) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}