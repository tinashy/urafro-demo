export default function Section({ className = '', children }) {
  return `<section class="py-12 sm:py-16 lg:py-20 ${className}">${children || ''}</section>`;
}
