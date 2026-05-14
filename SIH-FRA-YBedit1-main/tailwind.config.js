/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Forest Theme Colors
        'forest-dark': '#2F5233',
        'forest-medium': '#5C7A5C',
        'forest-light': '#7A9A7A',
        'forest-accent': '#8B4513',
        'forest-cream': '#F5F5DC',
        'forest-sage': '#9CAF88',
        'forest-moss': '#6B8E6B',
        'forest-earth': '#8B7355',
        'forest-bark': '#654321',
        'forest-leaf': '#4A6741',
        'forest-sky': '#E8F4F8',
        'forest-stone': '#A8A8A8',
        
        // Semantic Colors
        'success': '#4A6741',
        'warning': '#D4A574',
        'error': '#B85450',
        'info': '#5C7A5C',
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #2F5233 0%, #5C7A5C 100%)',
        'earth-gradient': 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)',
        'sky-gradient': 'linear-gradient(135deg, #E8F4F8 0%, #F5F5DC 100%)',
      },
      boxShadow: {
        'forest': '0 4px 6px -1px rgba(47, 82, 51, 0.1), 0 2px 4px -1px rgba(47, 82, 51, 0.06)',
        'forest-lg': '0 10px 15px -3px rgba(47, 82, 51, 0.1), 0 4px 6px -2px rgba(47, 82, 51, 0.05)',
        'forest-xl': '0 20px 25px -5px rgba(47, 82, 51, 0.1), 0 10px 10px -5px rgba(47, 82, 51, 0.04)',
      },
      animation: {
        'forest-spin': 'forest-spin 1s linear infinite',
        'forest-pulse': 'forest-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'forest-bounce': 'forest-bounce 1s infinite',
        'forest-fade-in': 'forest-fade-in 0.5s ease-in-out',
        'forest-slide-in': 'forest-slide-in 0.3s ease-out',
      },
      keyframes: {
        'forest-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'forest-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'forest-bounce': {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        'forest-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'forest-slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
