import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from "react";
import { Colors } from "../constants/theme";
import { useColorScheme } from "../hooks/use-color-scheme";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = "@jelajah_aman:theme_mode";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const resolvedTheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((savedMode) => {
        if (
          savedMode === "light" ||
          savedMode === "dark" ||
          savedMode === "system"
        ) {
          setModeState(savedMode);
        }
      })
      .catch(() => {});
  }, []);

  function setMode(nextMode: ThemeMode) {
    setModeState(nextMode);
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch(() => {});
  }

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemePreference must be used within ThemeProvider");
  }
  return {
    ...context,
    colors: Colors[context.resolvedTheme],
  };
}
