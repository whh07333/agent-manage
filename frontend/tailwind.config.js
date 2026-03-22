/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'tw-', // 添加前缀避免与Ant Design冲突
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px', // 额外的小屏幕断点
        'sm': '640px', // 手机
        'md': '768px', // 平板
        'lg': '1024px', // 小桌面
        'xl': '1280px', // 桌面
        '2xl': '1536px', // 大桌面
      },
      spacing: {
        '4.5': '1.125rem', // 18px，补充8px栅格系统
        '7.5': '1.875rem', // 30px
      },
      colors: {
        // 可以从设计系统导入，这里先定义基本颜色
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          500: '#1890ff', // Ant Design主色
          600: '#096dd9',
        },
        success: {
          500: '#52c41a',
        },
        warning: {
          500: '#faad14',
        },
        error: {
          500: '#ff4d4f',
        },
      },
      borderRadius: {
        'lg': '8px', // 设计系统标准圆角
      },
    },
  },
  corePlugins: {
    // 禁用一些可能与Ant Design冲突的样式
    preflight: false, // 禁用预检样式以避免与Ant Design冲突
  },
  plugins: [],
}