/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFDF5',
        ink: '#000000',
        'hot-red': '#FF6B6B',
        'vivid-yellow': '#FFD93D',
        'soft-violet': '#C4B5FD',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'hard-sm': '4px 4px 0 #000000',
        hard: '6px 6px 0 #000000',
        'hard-md': '8px 8px 0 #000000',
        'hard-lg': '12px 12px 0 #000000',
      },
      borderWidth: {
        3: '3px',
        4: '4px',
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
};
