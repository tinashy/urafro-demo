export default function Container({ className = '', children }) {
  return `<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}">${children || ''}</div>`;
}
