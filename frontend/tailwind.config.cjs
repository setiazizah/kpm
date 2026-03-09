module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#196ECD',
        'primary-hover': '#1560B3',
        surface: '#F7F9FB',
        accent: '#CDE9F6',
        background: '#FFFFFF',
        border: '#E2EAF0',
        'text-muted': '#6B7A8F',
        'text-main': '#111827',
        success: '#059669',
        warning: '#D97706',
        danger: '#DC2626',
        /* Solid card backgrounds untuk stat cards */
        'card-blue': '#EBF4FF',
        'card-blue-dark': '#1E40AF',
        'card-green': '#ECFDF5',
        'card-green-dark': '#065F46',
        'card-amber': '#FFFBEB',
        'card-amber-dark': '#92400E',
        'card-red': '#FEF2F2',
        'card-red-dark': '#991B1B',
        /* Dim / tint */
        'success-dim': '#D1FAE5',
        'warning-dim': '#FEF3C7',
        'danger-dim': '#FEE2E2',
        'primary-dim': '#DBEAFE'
      },
      fontFamily: {
        sans: ['Samsung Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06)',
        dropdown: '0 4px 16px rgba(0,0,0,0.10)'
      }
    }
  },
  plugins: []
}
