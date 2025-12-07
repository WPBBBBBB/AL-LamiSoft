export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    accent: string
    tableHeader?: string
    tableRow?: string
    tableRowHover?: string
    tableRowSelected?: string
    border?: string
  }
}

export const themes: Theme[] = [
  {
    id: "dark-mode",
    name: "الوضع الليلي",
    colors: {
      primary: "#BB86FC",
      secondary: "#03DAC6",
      background: "#121212",
      surface: "#1E1E1E",
      text: "#E1E1E1",
      accent: "#03DAC6",
      tableHeader: "#2C2C2C",
      tableRow: "#1E1E1E",
      tableRowHover: "#2C2C2C",
      tableRowSelected: "#3700B3",
      border: "#383838",
    },
  },
  {
    id: "snow-white",
    name: "أبيض ثلجي",
    colors: {
      primary: "#4A4A4A",
      secondary: "#6D6D6D",
      background: "#FFFFFF",
      surface: "#F2F2F2",
      text: "#1A1A1A",
      accent: "#3B82F6",
      tableHeader: "#E8E8E8",
      tableRow: "#FFFFFF",
      tableRowHover: "#F5F5F5",
      tableRowSelected: "#E3F2FD",
      border: "#E0E0E0",
    },
  },
  {
    id: "midnight-black",
    name: "أسود منتصف الليل",
    colors: {
      primary: "#0D0D0D",
      secondary: "#1A1A1A",
      background: "#000000",
      surface: "#121212",
      text: "#EDEDED",
      accent: "#8B5CF6",
      tableHeader: "#1A1A1A",
      tableRow: "#0A0A0A",
      tableRowHover: "#1F1F1F",
      tableRowSelected: "#2C1F4F",
      border: "#2A2A2A",
    },
  },
  {
    id: "ocean-blue",
    name: "أزرق المحيط",
    colors: {
      primary: "#0F4C75",
      secondary: "#3282B8",
      background: "#BBE1FA",
      surface: "#E1F5FF",
      text: "#0B1C2C",
      accent: "#1B98E0",
      tableHeader: "#D4EDFD",
      tableRow: "#EAF6FE",
      tableRowHover: "#D9F0FE",
      tableRowSelected: "#C2E5FF",
      border: "#9DD0F5",
    },
  },
  {
    id: "forest-green",
    name: "أخضر الغابة",
    colors: {
      primary: "#1B5E20",
      secondary: "#4CAF50",
      background: "#E8F5E9",
      surface: "#F1FFF1",
      text: "#0E2A0E",
      accent: "#00C853",
    },
  },
  {
    id: "sunset-orange",
    name: "برتقالي الغروب",
    colors: {
      primary: "#D84315",
      secondary: "#FF7043",
      background: "#FFF3E0",
      surface: "#FFE0CC",
      text: "#33170C",
      accent: "#FF5722",
    },
  },
  {
    id: "royal-purple",
    name: "بنفسجي ملكي",
    colors: {
      primary: "#4A148C",
      secondary: "#7B1FA2",
      background: "#F3E5F5",
      surface: "#F8E6FF",
      text: "#2B0E45",
      accent: "#CE93D8",
    },
  },
  {
    id: "coffee-brown",
    name: "بني القهوة",
    colors: {
      primary: "#3E2723",
      secondary: "#6D4C41",
      background: "#EFEBE9",
      surface: "#F7F3F1",
      text: "#231815",
      accent: "#8D6E63",
    },
  },
  {
    id: "silver-gray",
    name: "رمادي فضي",
    colors: {
      primary: "#424242",
      secondary: "#616161",
      background: "#F5F5F5",
      surface: "#EAEAEA",
      text: "#1C1C1C",
      accent: "#9E9E9E",
    },
  },
  {
    id: "neon-cyberpunk",
    name: "نيون سايبربنك",
    colors: {
      primary: "#0AFFEF",
      secondary: "#A200FF",
      background: "#060013",
      surface: "#0C0022",
      text: "#E8E8E8",
      accent: "#FF00AA",
    },
  },
  {
    id: "gold-luxury",
    name: "ذهبي فاخر",
    colors: {
      primary: "#8B6A00",
      secondary: "#B58F00",
      background: "#FFF7D6",
      surface: "#FFF1BD",
      text: "#3D3200",
      accent: "#FFD700",
    },
  },
  {
    id: "sky-pastel",
    name: "سماوي باستيل",
    colors: {
      primary: "#82B1FF",
      secondary: "#B3E5FC",
      background: "#E3F2FD",
      surface: "#F0F8FF",
      text: "#09223A",
      accent: "#64B5F6",
    },
  },
  {
    id: "emerald-mint",
    name: "زمردي نعناعي",
    colors: {
      primary: "#1DE9B6",
      secondary: "#A7FFEB",
      background: "#E0FFF9",
      surface: "#F2FFFD",
      text: "#003327",
      accent: "#00BFA5",
    },
  },
  {
    id: "rose-pink",
    name: "وردي الورد",
    colors: {
      primary: "#C2185B",
      secondary: "#F48FB1",
      background: "#FCE4EC",
      surface: "#F8DFE9",
      text: "#3F0C1E",
      accent: "#FF80AB",
    },
  },
  {
    id: "steel-blue",
    name: "أزرق فولاذي",
    colors: {
      primary: "#1E3A5F",
      secondary: "#3F5A89",
      background: "#E8EEF7",
      surface: "#F1F5FC",
      text: "#0E1C33",
      accent: "#4C7ECF",
    },
  },
  {
    id: "desert-sand",
    name: "رملي الصحراء",
    colors: {
      primary: "#A97458",
      secondary: "#C8AB8F",
      background: "#FAF3E8",
      surface: "#F7E8D8",
      text: "#4C392D",
      accent: "#E3C7A6",
    },
  },
  {
    id: "toxic-lime",
    name: "ليموني سام",
    colors: {
      primary: "#76FF03",
      secondary: "#B2FF59",
      background: "#F0FFE5",
      surface: "#F7FFE7",
      text: "#1A2600",
      accent: "#C6FF00",
    },
  },
  {
    id: "sapphire-deep",
    name: "ياقوتي عميق",
    colors: {
      primary: "#001F54",
      secondary: "#034078",
      background: "#E8F3FF",
      surface: "#F0F7FF",
      text: "#001226",
      accent: "#1282A2",
    },
  },
  {
    id: "lava-red",
    name: "أحمر الحمم",
    colors: {
      primary: "#B71C1C",
      secondary: "#D32F2F",
      background: "#FFEBEE",
      surface: "#FFE3E3",
      text: "#3A0C0C",
      accent: "#FF5252",
    },
  },
  {
    id: "chocolate-dark",
    name: "شوكولاتة داكنة",
    colors: {
      primary: "#2B1A12",
      secondary: "#4E342E",
      background: "#EFEBE9",
      surface: "#F7F3F2",
      text: "#241913",
      accent: "#795548",
    },
  },
  {
    id: "ice-blue-dark",
    name: "أزرق جليدي داكن",
    colors: {
      primary: "#90CAF9",
      secondary: "#64B5F6",
      background: "#0D47A1",
      surface: "#102B52",
      text: "#E3F2FD",
      accent: "#42A5F5",
    },
  },
  {
    id: "neon-yellow-dark",
    name: "أصفر نيون داكن",
    colors: {
      primary: "#FFEA00",
      secondary: "#FFF176",
      background: "#0A0A0A",
      surface: "#1A1A1A",
      text: "#FFFFFF",
      accent: "#FDD835",
    },
  },
  {
    id: "classic-material",
    name: "كلاسيكي حديث",
    colors: {
      primary: "#6200EE",
      secondary: "#3700B3",
      background: "#F6F6F6",
      surface: "#FFFFFF",
      text: "#212121",
      accent: "#03DAC6",
    },
  },
  {
    id: "emerald-light",
    name: "زمردي فاتح",
    colors: {
      primary: "#10A37F",
      secondary: "#1A7F64",
      background: "#FFFFFF",
      surface: "#F7F7F8",
      text: "#2D333A",
      accent: "#19C37D",
    },
  },
  {
    id: "emerald-dark",
    name: "زمردي داكن",
    colors: {
      primary: "#10A37F",
      secondary: "#19C37D",
      background: "#212121",
      surface: "#2F2F2F",
      text: "#ECECEC",
      accent: "#10A37F",
    },
  },
  {
    id: "sapphire-light",
    name: "ياقوتي فاتح",
    colors: {
      primary: "#4285F4",
      secondary: "#1967D2",
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#202124",
      accent: "#5E97F6",
    },
  },
  {
    id: "sapphire-dark",
    name: "ياقوتي داكن",
    colors: {
      primary: "#8AB4F8",
      secondary: "#4285F4",
      background: "#1F1F1F",
      surface: "#292929",
      text: "#E8EAED",
      accent: "#8AB4F8",
    },
  },
  {
    id: "amber-light",
    name: "كهرماني فاتح",
    colors: {
      primary: "#D97706",
      secondary: "#B45309",
      background: "#FFFFFF",
      surface: "#FEF3E2",
      text: "#1F1F1F",
      accent: "#F59E0B",
    },
  },
  {
    id: "amber-dark",
    name: "كهرماني داكن",
    colors: {
      primary: "#FBBF24",
      secondary: "#F59E0B",
      background: "#1C1917",
      surface: "#292524",
      text: "#F5F5F4",
      accent: "#FBBF24",
    },
  },
]

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  
  // Helper to generate table colors if not provided
  const isDark = parseInt(theme.colors.background.slice(1, 3), 16) < 128
  
  const tableHeader = theme.colors.tableHeader || (isDark 
    ? lightenColor(theme.colors.surface, 15) 
    : darkenColor(theme.colors.surface, 8))
    
  const tableRow = theme.colors.tableRow || theme.colors.background
  
  const tableRowHover = theme.colors.tableRowHover || (isDark
    ? lightenColor(theme.colors.surface, 10)
    : darkenColor(theme.colors.surface, 5))
    
  const tableRowSelected = theme.colors.tableRowSelected || (isDark
    ? addOpacity(theme.colors.accent, 0.25)
    : addOpacity(theme.colors.accent, 0.15))
    
  const border = theme.colors.border || (isDark
    ? lightenColor(theme.colors.background, 25)
    : darkenColor(theme.colors.background, 12))
  
  // Apply all theme colors to CSS variables
  root.style.setProperty("--theme-primary", theme.colors.primary)
  root.style.setProperty("--theme-secondary", theme.colors.secondary)
  root.style.setProperty("--theme-background", theme.colors.background)
  root.style.setProperty("--theme-surface", theme.colors.surface)
  root.style.setProperty("--theme-text", theme.colors.text)
  root.style.setProperty("--theme-accent", theme.colors.accent)
  root.style.setProperty("--theme-table-header", tableHeader)
  root.style.setProperty("--theme-table-row", tableRow)
  root.style.setProperty("--theme-table-row-hover", tableRowHover)
  root.style.setProperty("--theme-table-row-selected", tableRowSelected)
  root.style.setProperty("--theme-border", border)
  
  // Apply to document body for immediate effect
  document.body.style.backgroundColor = theme.colors.background
  document.body.style.color = theme.colors.text
}

// Helper functions
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, "0")
}

function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent)
}

function addOpacity(hex: string, opacity: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const R = (num >> 16) & 0xff
  const G = (num >> 8) & 0xff
  const B = num & 0xff
  return `rgba(${R}, ${G}, ${B}, ${opacity})`
}

export function getThemeById(id: string): Theme | undefined {
  return themes.find((theme) => theme.id === id)
}
