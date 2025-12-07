// Utility functions for theme management

export function generateTableColors(baseColors: {
  background: string
  surface: string
  text: string
  accent: string
  primary: string
}) {
  // Check if theme is dark (background is dark)
  const isDark = parseInt(baseColors.background.slice(1, 3), 16) < 128

  if (isDark) {
    // Dark theme table colors
    return {
      tableHeader: lighten(baseColors.surface, 10),
      tableRow: darken(baseColors.background, 5),
      tableRowHover: lighten(baseColors.surface, 5),
      tableRowSelected: adjustOpacity(baseColors.accent, 0.3),
      border: lighten(baseColors.background, 20),
    }
  } else {
    // Light theme table colors
    return {
      tableHeader: darken(baseColors.surface, 5),
      tableRow: lighten(baseColors.background, 2),
      tableRowHover: darken(baseColors.surface, 3),
      tableRowSelected: adjustOpacity(baseColors.accent, 0.2),
      border: darken(baseColors.background, 10),
    }
  }
}

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}

function darken(hex: string, percent: number): string {
  return lighten(hex, -percent)
}

function adjustOpacity(hex: string, opacity: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const R = (num >> 16) & 0xff
  const G = (num >> 8) & 0xff
  const B = num & 0xff
  return `rgba(${R}, ${G}, ${B}, ${opacity})`
}
