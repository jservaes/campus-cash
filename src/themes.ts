
export const themes = {
  blush: {
    name: "Blush",
    primary: "#D77CA4",
    background: "#FFF3F7",
    surface: "#FFFFFF",
    text: "#622A47",
  },
  coastal: {
    name: "Coastal",
    primary: "#4B88BB",
    background: "#EEF6FC",
    surface: "#FFFFFF",
    text: "#254C70",
  },
  sage: {
    name: "Sage",
    primary: "#729981",
    background: "#F0F6EF",
    surface: "#FFFFFF",
    text: "#315640",
  },
  lavender: {
    name: "Lavender",
    primary: "#967DCC",
    background: "#F5F0FF",
    surface: "#FFFFFF",
    text: "#4B3673",
  },
  midnight: {
    name: "Midnight",
    primary: "#8EB5ED",
    background: "#171D2A",
    surface: "#252D3B",
    text: "#E8EDF7",
  },
} as const;

export type ThemeName = keyof typeof themes;
