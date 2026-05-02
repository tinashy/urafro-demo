export default function Input({ className = '', attrs = '' }) {
  return `<input class="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${className}" ${attrs}/>`;
}
