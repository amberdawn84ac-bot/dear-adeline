/**
 * Adeline's hand-drawn aesthetic theme for A2UI rendering
 *
 * Uses forest green (#2F4731), cream (#F4E9D9), and brown accents
 * with handwritten fonts (Kalam, Architects Daughter) and rough borders
 */
export const adelineTheme = {
  // Primary colors
  primaryColor: "#2F4731",      // Forest green
  secondaryColor: "#F4E9D9",    // Cream
  accentColor: "#8B4513",       // Brown
  backgroundColor: "#FFF9F0",   // Off-white for cards

  // Typography
  fontFamily: "Kalam, cursive",
  headingFont: "Architects Daughter, cursive",

  // Hand-drawn styling
  borderStyle: "rough" as const,
  borderWidth: 2,
  roughness: 1.5,               // Controls organic feel (0 = perfect, 3 = very rough)

  // Animation
  animationStyle: "sketch-in" as const,
  animationDuration: 800,       // ms

  // Component-specific overrides
  Card: {
    backgroundColor: "#FFF9F0",
    border: "2px solid #2F4731",
    borderRadius: 8,
    transform: "rotate(-1deg)",  // Slight tilt for whimsy
    boxShadow: "4px 4px 8px rgba(0,0,0,0.1)",
    padding: 24
  },

  Button: {
    fontFamily: "Fredoka, sans-serif",
    textTransform: "none" as const,
    borderRadius: 8,
    primary: {
      backgroundColor: "#2F4731",
      color: "#FFF9F0",
      border: "2px solid #2F4731"
    },
    secondary: {
      backgroundColor: "transparent",
      color: "#2F4731",
      border: "2px solid #2F4731"
    }
  },

  Text: {
    body: {
      fontSize: 18,
      lineHeight: 1.6,
      color: "#2F4731"
    },
    h1: {
      fontSize: 36,
      fontFamily: "Architects Daughter, cursive",
      color: "#2F4731",
      marginBottom: 16
    },
    h2: {
      fontSize: 28,
      fontFamily: "Architects Daughter, cursive",
      color: "#2F4731",
      marginBottom: 12
    }
  },

  Image: {
    borderRadius: 4,
    border: "2px solid #2F4731"
  }
};

export type AdelineTheme = typeof adelineTheme;
