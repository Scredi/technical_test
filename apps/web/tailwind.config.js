/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('@repo/ui/tailwind')],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
}
