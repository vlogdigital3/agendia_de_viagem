import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6366f1", // Indigo-500 equivalent, vibrant purple/blue
                "primary-hover": "#4f46e5",
                "background-light": "#f3f4f6", // Gray-100
                "background-dark": "#0f111a", // Deep dark blue/black
                "surface-light": "#ffffff",
                "surface-dark": "#181b26", // Slightly lighter dark background
                "surface-darker": "#11131c",
                "accent-blue": "#3b82f6",
                "accent-green": "#10b981",
                "accent-purple": "#8b5cf6",
                "accent-orange": "#f97316",
                "accent-red": "#ef4444",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
        },
    },
    plugins: [],
};
export default config;
