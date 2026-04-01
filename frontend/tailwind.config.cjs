module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      fontSize: {
        xs:    ['11.5px', { lineHeight: '1.5' }],
        sm:    ['13px',   { lineHeight: '1.55' }],
        base:  ['14.5px', { lineHeight: '1.6' }],
        lg:    ['16px',   { lineHeight: '1.55' }],
        xl:    ['18px',   { lineHeight: '1.5' }],
        '2xl': ['22px',   { lineHeight: '1.4' }],
        '3xl': ['28px',   { lineHeight: '1.3' }],
        '4xl': ['34px',   { lineHeight: '1.2' }],
      },

      colors: {
        primary:        '#3965FF',
        'primary-hover':'#2A50E0',
        'primary-dim':  '#EBF0FF',

        surface:    '#F8FAFF',
        accent:     '#F0F4FF',
        background: '#F4F7FE',
        border:     '#E8EDF5',

        'text-muted': '#8F9BBA',
        'text-main':  '#1B2559',

        success: '#05CD99',
        warning: '#FFCE20',
        danger:  '#EE5D50',

        'success-dim': '#D5F5EE',
        'warning-dim': '#FFF8D9',
        'danger-dim':  '#FDECEA',

        'card-blue':       '#EBF0FF',
        'card-blue-dark':  '#3965FF',
        'card-green':      '#D5F5EE',
        'card-green-dark': '#05CD99',
        'card-amber':      '#FFF8D9',
        'card-amber-dark': '#FFCE20',
        'card-red':        '#FDECEA',
        'card-red-dark':   '#EE5D50',
      },

      borderRadius: {
        DEFAULT: '16px',
        sm:  '8px',
        md:  '12px',
        lg:  '16px',
        xl:  '20px',
        '2xl': '24px',
      },

      boxShadow: {
        card:     '0 2px 10px rgba(112,144,176,0.08)',
        'card-md':'0 4px 20px rgba(112,144,176,0.12)',
        'card-lg':'0 8px 30px rgba(112,144,176,0.16)',
        dropdown: '0 14px 30px rgba(112,144,176,0.20)',
      },

      spacing: {
        4.5: '1.125rem',
        5.5: '1.375rem',
        13:  '3.25rem',
        15:  '3.75rem',
      },
    },
  },
  plugins: [],
}
