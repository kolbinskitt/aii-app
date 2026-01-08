module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        mono: ['Space Grotesk', 'monospace'],
        echo: ['Cormorant Garamond', 'serif'],
        system: ['Space Grotesk', 'monospace'],
      },
      keyframes: {
        'glow-fire': {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.15)' },
        },
      },
      animation: {
        'glow-fire': 'glow-fire 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
