/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"], // clean modern font
        mono: ["Fira Code", "monospace"], // optional for code sections
      },

      fontSize: {
        "display-lg": ["48px", "56px"],   // large headings
        "display-md": ["36px", "44px"],   // medium headings
        "heading-xl": ["30px", "38px"],   // main headings
        "heading-lg": ["24px", "32px"],   // secondary headings
        "heading-md": ["20px", "28px"],   // small headings
        "body-lg": ["18px", "28px"],      // large body
        "body-md": ["16px", "24px"],      // normal body
        "body-sm": ["14px", "20px"],      // small text
        "caption": ["12px", "16px"],      // captions or labels
      },

      letterSpacing: {
        tighter: "-0.5px",  // headings look tight
        tight: "-0.25px",
        normal: "0px",
        wide: "0.25px",     // body text slightly spaced
        wider: "0.5px",     // captions
        widest: "1px",      // UI labels, tags
      },

      lineHeight: {
        snug: "1.25",       // tight headings
        normal: "1.5",      // normal body
        relaxed: "1.75",    // paragraphs
        loose: "2",         // large display
      },
          },
  },
};