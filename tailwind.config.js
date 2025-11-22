/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'hsl(250, 84%, 54%)',
                    light: 'hsl(250, 84%, 64%)',
                    dark: 'hsl(250, 84%, 44%)',
                },
                secondary: {
                    DEFAULT: 'hsl(340, 82%, 52%)',
                    light: 'hsl(340, 82%, 62%)',
                },
                accent: {
                    DEFAULT: 'hsl(180, 77%, 47%)',
                    light: 'hsl(180, 77%, 57%)',
                },
                success: 'hsl(142, 71%, 45%)',
                warning: 'hsl(45, 93%, 47%)',
                error: 'hsl(0, 84%, 60%)',
                bg: {
                    primary: 'hsl(240, 21%, 15%)',
                    secondary: 'hsl(240, 17%, 20%)',
                    tertiary: 'hsl(240, 15%, 25%)',
                    elevated: 'hsl(240, 20%, 18%)',
                },
                text: {
                    primary: 'hsl(0, 0%, 98%)',
                    secondary: 'hsl(0, 0%, 75%)',
                    tertiary: 'hsl(0, 0%, 55%)',
                },
                border: {
                    DEFAULT: 'hsl(240, 15%, 30%)',
                    light: 'hsl(240, 15%, 35%)',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            borderRadius: {
                'sm': '0.375rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
            },
            boxShadow: {
                'sm': '0 2px 8px rgba(0, 0, 0, 0.15)',
                'md': '0 4px 16px rgba(0, 0, 0, 0.2)',
                'lg': '0 8px 32px rgba(0, 0, 0, 0.3)',
                'glow': '0 0 20px rgba(124, 58, 237, 0.3)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, hsl(250, 84%, 54%) 0%, hsl(340, 82%, 52%) 100%)',
                'gradient-accent': 'linear-gradient(135deg, hsl(180, 77%, 47%) 0%, hsl(250, 84%, 54%) 100%)',
                'gradient-mesh': `
          radial-gradient(at 40% 20%, hsla(250, 84%, 54%, 0.15) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsla(340, 82%, 52%, 0.15) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsla(180, 77%, 47%, 0.15) 0px, transparent 50%)
        `,
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.35s ease-out',
                'slide-in': 'slideIn 0.35s ease-out',
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            transitionDuration: {
                'fast': '150ms',
                'base': '250ms',
                'slow': '350ms',
            },
        },
    },
    plugins: [],
}
