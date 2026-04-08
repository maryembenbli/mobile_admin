export const colors = {
  navy: "#10214A",
  navySoft: "#1B326C",
  cobalt: "#295DFF",
  cobaltSoft: "#EAF0FF",
  violet: "#6D28D9",
  violetSoft: "#F3E8FF",
  orange: "#FF7A1A",
  orangeSoft: "#FFF4EA",
  teal: "#0EA5A4",
  tealSoft: "#ECFEFF",
  green: "#16A34A",
  greenSoft: "#ECFDF3",
  red: "#DC2626",
  redSoft: "#FEF2F2",
  amber: "#D97706",
  amberSoft: "#FFF7ED",
  bg: "#F4F7FB",
  bgMuted: "#EDF2FA",
  white: "#FFFFFF",
  text: "#0F172A",
  textSoft: "#334155",
  grayText: "#64748B",
  border: "#DCE4F2",
  borderStrong: "#C4D0E5",
  overlay: "rgba(15,23,42,0.48)",
  shadow: "#10214A",
  blue: "#295DFF",
  blue2: "#10214A",
  card: "#FFFFFF",
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};

export const novikaTheme = {
  colors,
  radii,
  spacing,
  shadows,
};

