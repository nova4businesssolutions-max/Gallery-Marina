/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-bright": "#ffffff",
        "on-primary-container": "#908D8D",
        "tertiary-fixed-dim": "#908D8D",
        "outline-variant": "#FAE6E4",
        "tertiary-fixed": "#FAE6E4",
        "on-secondary-container": "#5A5959",
        "on-error": "#ffffff",
        "on-primary": "#ffffff",
        "primary-container": "#050404",
        "primary-fixed-dim": "#908D8D",
        "on-tertiary-fixed": "#050404",
        "on-tertiary-fixed-variant": "#5A5959",
        "on-secondary-fixed": "#050404",
        "surface-container-high": "#FAE6E4",
        "surface-container": "#FAE6E4",
        "secondary": "#5A5959",
        "tertiary-container": "#050404",
        "surface-variant": "#FAE6E4",
        "on-secondary-fixed-variant": "#5A5959",
        "surface-dim": "#908D8D",
        "surface-tint": "#908D8D",
        "primary-fixed": "#FAE6E4",
        "error-container": "#FAE6E4",
        "secondary-fixed": "#FAE6E4",
        "secondary-fixed-dim": "#908D8D",
        "on-primary-fixed": "#050404",
        "inverse-primary": "#908D8D",
        "on-surface": "#050404",
        "tertiary": "#050404",
        "on-error-container": "#050404",
        "inverse-on-surface": "#FFFFFF",
        "on-background": "#050404",
        "surface": "#FFFFFF",
        "secondary-container": "#FAE6E4",
        "surface-container-highest": "#908D8D",
        "surface-container-low": "#ffffff",
        "on-primary-fixed-variant": "#5A5959",
        "outline": "#908D8D",
        "on-tertiary": "#ffffff",
        "background": "#FFFFFF",
        "inverse-surface": "#050404",
        "surface-container-lowest": "#ffffff",
        "on-surface-variant": "#5A5959",
        "on-secondary": "#ffffff",
        "primary": "#050404",
        "on-tertiary-container": "#908D8D",
        "error": "#C0504D"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "24px",
        "margin-desktop": "80px",
        "section-gap": "120px",
        "container-max": "1440px",
        "margin-mobile": "20px"
      },
      fontFamily: {
        "body-lg": ["Cairo", "sans-serif"],
        "body-md": ["Cairo", "sans-serif"],
        "headline-lg": ["Cairo", "sans-serif"],
        "headline-lg-mobile": ["Cairo", "sans-serif"],
        "display-lg": ["Cairo", "sans-serif"],
        "headline-md": ["Cairo", "sans-serif"],
        "label-md": ["Cairo", "sans-serif"]
      },
      fontSize: {
        "body-lg": [
          "18px",
          {
            "lineHeight": "1.6",
            "fontWeight": "400"
          }
        ],
        "body-md": [
          "16px",
          {
            "lineHeight": "1.6",
            "fontWeight": "400"
          }
        ],
        "headline-lg": [
          "48px",
          {
            "lineHeight": "1.2",
            "fontWeight": "600"
          }
        ],
        "headline-lg-mobile": [
          "32px",
          {
            "lineHeight": "1.2",
            "fontWeight": "600"
          }
        ],
        "display-lg": [
          "64px",
          {
            "lineHeight": "1.1",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "headline-md": [
          "32px",
          {
            "lineHeight": "1.3",
            "fontWeight": "500"
          }
        ],
        "label-md": [
          "14px",
          {
            "lineHeight": "1.4",
            "letterSpacing": "0.05em",
            "fontWeight": "600"
          }
        ]
      }
    },
  },
  plugins: [],
}
