import {
  createTheme,
  ThemeOptions,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { red } from "@mui/material/colors";

declare module "@mui/material/styles" {
  interface Palette {
    blurple: Palette["primary"];
  }

  interface PaletteOptions {
    blurple: PaletteOptions["primary"];
  }
}

const themeOptions: ThemeOptions = {
  typography: {
    h1: {
      fontSize: "3rem",
    },
    h2: {
      fontSize: "2.5rem",
    },
    h3: {
      fontSize: "2rem",
    },
    h4: {
      fontSize: "1.75rem",
    },
    h5: {
      fontSize: "1.5rem",
    },
    h6: {
      fontSize: "1.25rem",
    },
    subtitle1: {
      fontSize: "0.9rem",
    },
    subtitle2: {
      fontSize: "0.8rem",
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#1F1D2B",
    },
    secondary: {
      main: "#252836",
    },
    text: {
      primary: "#FFFFFF",
    },
    blurple: {
      main: "#525298",
    },
    background: {
      paper: "#1F1D2B",
    },
    error: {
      main: red.A400,
    },
  },
};

// A custom theme for this app
const theme = createTheme(themeOptions);

export const ThemeProvider = (props: { children?: React.ReactNode }) => {
  return <MuiThemeProvider {...props} theme={theme} />;
};
