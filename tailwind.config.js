/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './screens/**/*.js', './components/**/*.jsx'],
  theme: {
    extend: {
      fontSize: {
        'fluid-h1': 'clamp(1.75rem, 3vw + 1rem, 2.5rem)',
        'fluid-h2': 'clamp(1.375rem, 2vw + 1rem, 2rem)'
      }
    }
  },
  plugins: []
};
