/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#0B0B0C', // خلفية الشاشة (أسود)
        card: '#18181B', // البطاقات الداكنة
        'card-2': '#222226', // عناصر داخل البطاقات الداكنة
        surface: '#FFFFFF', // البطاقات والأزرار البيضاء
        'surface-2': '#F4F4F5', // مسار شريط التقدم على الأبيض
        ink: '#0B0B0C', // نص على الأبيض والبرتقالي
        muted: '#8E8E93', // نص ثانوي على الأسود
        'muted-ink': '#6B6B73', // نص ثانوي على الأبيض
        line: '#2C2C30', // فواصل على الأسود
        'line-light': '#E4E4E7', // فواصل على الأبيض
        accent: '#FF7A1A', // البرتقالي
        'accent-ink': '#C2410C', // برتقالي للنص الصغير على الأبيض
        status: {
          good: '#22C55E',
          warning: '#FF7A1A',
          critical: '#FF453A',
        },
      },
      borderRadius: {
        hero: '30px',
        card: '24px',
        tile: '18px',
      },
    },
  },
  plugins: [],
};
