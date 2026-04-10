/**
 * Tailwind CSS 配置
 * 定义 KUAIZAI_OS 的设计系统
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#ffe2ab',
        'on-primary': '#402d00',
        'primary-container': '#ffbf00',
        'on-primary-container': '#6d5000',
        'secondary': '#ffb693',
        'on-secondary': '#562000',
        'secondary-container': '#ea6b1e',
        'tertiary': '#ffdfc9',
        'on-tertiary': '#4d2600',
        'error': '#ffb4ab',
        'on-error': '#690005',
        'background': '#131314',
        'on-background': '#e5e2e3',
        'surface': '#131314',
        'on-surface': '#e5e2e3',
        'surface-variant': '#353436',
        'on-surface-variant': '#d4c5ab',
        'surface-container-low': '#1b1b1c',
        'surface-container': '#1f1f20',
        'surface-container-high': '#2a2a2b',
        'outline': '#9c8f78',
        'outline-variant': '#504532',
      },
      fontFamily: {
        'headline': ['Space Grotesk', 'sans-serif'],
        'body': ['Plus Jakarta Sans', 'sans-serif'],
        'label': ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
      },
    },
  },
  plugins: [],
}
