export default function Button({ label, variant = 'primary', className = '', attrs = '' }) {
  const base = 'inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
    secondary: 'bg-white text-stone-900 border border-stone-300 hover:bg-stone-50 focus:ring-stone-300'
  };
  return `<button class="${base} ${variants[variant] || variants.primary} ${className}" ${attrs}>${label}</button>`;
}
