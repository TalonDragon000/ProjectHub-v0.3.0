/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',

        // Backgrounds
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
        'accent-primary':      'rgb(var(--accent-primary) / <alpha-value>)',
        'accent-primary-dark': 'rgb(var(--accent-primary-dark) / <alpha-value>)',
        'accent-secondary':    'rgb(var(--accent-secondary) / <alpha-value>)',
        'accent-tertiary':     'rgb(var(--accent-tertiary) / <alpha-value>)',
        'accent-tertiary-alt': 'rgb(var(--accent-tertiary-alt) / <alpha-value>)',
        'accent-amber':        'rgb(var(--accent-amber) / <alpha-value>)',

        // Priorities
        'priority-high':  'rgb(var(--priority-high) / <alpha-value>)',
        'priority-med':   'rgb(var(--priority-med) / <alpha-value>)',
        'priority-low':   'rgb(var(--priority-low) / <alpha-value>)',
        'priority-later': 'rgb(var(--priority-later) / <alpha-value>)',

        // Status
        success: 'rgb(var(--status-success) / <alpha-value>)',
        warning: 'rgb(var(--status-warning) / <alpha-value>)',
        error:   'rgb(var(--status-error) / <alpha-value>)',
      },
      boxShadow: {
        'nav':      '0 -10px 40px var(--shadow-nav)',
        'dock-btn': '0 4px 20px var(--shadow-dock-btn)',
        'selected': '0 0 15px var(--shadow-selected)',
        'toast':    '0 0 30px var(--shadow-toast)',
        'primary':  '0 4px 20px var(--shadow-primary)',
        'amber':    '0 4px 16px var(--shadow-amber)',
        'tertiary': '0 4px 20px var(--shadow-tertiary)',
      },
    },
  },
  plugins: [],
}
