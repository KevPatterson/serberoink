/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ink-black': '#0A0A0A',
        'parchment': '#F0EAD6',
        'blood-red': '#8B0000',
        'faded-gold': '#C8A96E',
        'muted-parchment': 'rgba(240,234,214,0.55)',
      },
      fontFamily: {
        'serif-display': ['Fraunces', 'Georgia', 'serif'],
        'mono-body': ['DM Mono', 'Courier Prime', 'monospace'],
      },
      letterSpacing: {
        'widest-custom': '0.3em',
        'ultra': '0.5em',
      },
    },
  },
  plugins: [],
};