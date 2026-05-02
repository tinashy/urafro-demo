export default function Card({ className = '', children }) {
  return `<div class="p-4 sm:p-5 border border-stone-200 rounded-xl shadow-sm bg-white ${className}">${children || ''}</div>`;
}
