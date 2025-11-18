const palette = {
  neutral900: "#FFFFFF",
  neutral800: "#EAF0FF",
  neutral700: "#C8D6F8",
  neutral600: "#A0B6E6",
  neutral500: "#7A93C5",
  neutral400: "#546A96",
  neutral300: "#364568",
  neutral200: "#1E2841",
  neutral100: "#0B1024",

  primary600: "#F2F7FF",
  primary500: "#D5E5FE",
  primary400: "#AFCBFD",
  primary300: "#84ABFA",
  primary200: "#4C82F7",
  primary100: "#1E63F1",

  secondary500: "#E3F2FF",
  secondary400: "#B6DBFF",
  secondary300: "#80BFFF",
  secondary200: "#4AA0F5",
  secondary100: "#1B82E2",

  accent500: "#E4FBFF",
  accent400: "#C4F2FF",
  accent300: "#96E4FF",
  accent200: "#5FD3FF",
  accent100: "#1FBDF5",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(10, 16, 32, 0.2)",
  overlay50: "rgba(10, 16, 32, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const
