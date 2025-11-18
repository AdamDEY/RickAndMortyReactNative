const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F8FF",
  neutral300: "#E0EAFF",
  neutral400: "#C0D0F5",
  neutral500: "#94A8D6",
  neutral600: "#5E6F97",
  neutral700: "#3A4767",
  neutral800: "#1F2740",
  neutral900: "#0F1428",

  primary100: "#F2F7FF",
  primary200: "#D5E5FE",
  primary300: "#AFCBFD",
  primary400: "#84ABFA",
  primary500: "#4C82F7",
  primary600: "#1E63F1",

  secondary100: "#E3F2FF",
  secondary200: "#B6DBFF",
  secondary300: "#80BFFF",
  secondary400: "#4AA0F5",
  secondary500: "#1B82E2",

  accent100: "#E4FBFF",
  accent200: "#C4F2FF",
  accent300: "#96E4FF",
  accent400: "#5FD3FF",
  accent500: "#1FBDF5",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(15, 20, 40, 0.2)",
  overlay50: "rgba(15, 20, 40, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const
