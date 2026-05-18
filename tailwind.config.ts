import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'squat-green': '#95FD00',
        'squat-dark': '#131313',
        'squat-dark-alt': '#1C1B1B',
        'squat-card': '#2A2A2A',
        'squat-card-dark': '#0E0E0E',
        'squat-muted': '#BFCBAE',
        'squat-ink': '#0E2000',
        'squat-testimonial': '#353534',
        /* App semantic tokens — driven by CSS variables */
        'app-bg':           'rgb(var(--app-bg) / <alpha-value>)',
        'app-bg-page':      'rgb(var(--app-bg-page) / <alpha-value>)',
        'app-card':         'rgb(var(--app-card) / <alpha-value>)',
        'app-card-deep':    'rgb(var(--app-card-deep) / <alpha-value>)',
        'app-surface':      'rgb(var(--app-surface) / <alpha-value>)',
        'app-elevated':     'rgb(var(--app-elevated) / <alpha-value>)',
        'app-text':         'rgb(var(--app-text) / <alpha-value>)',
        'app-muted':        'rgb(var(--app-muted) / <alpha-value>)',
        'app-subtle':       'rgb(var(--app-subtle) / <alpha-value>)',
        'app-faint':        'rgb(var(--app-faint) / <alpha-value>)',
        'app-border':       'rgb(var(--app-border) / <alpha-value>)',
        'app-hover':        'rgb(var(--app-hover) / <alpha-value>)',
        'app-input':        'rgb(var(--app-input) / <alpha-value>)',
        'app-input-border': 'rgb(var(--app-input-border) / <alpha-value>)',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
