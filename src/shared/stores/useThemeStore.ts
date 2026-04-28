import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeState = {
  /**
   * User preference. When set to "system", UI should use resolvedTheme.
   */
  theme: ThemePreference;
  /**
   * Derived value from OS preference (prefers-color-scheme).
   * This store does not attach listeners; call syncResolvedThemeFromSystem() when needed.
   */
  resolvedTheme: ResolvedTheme;
};

type ThemeActions = {
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
  syncResolvedThemeFromSystem: () => void;
};

type ThemeStore = ThemeState & ThemeActions;

const defaultTheme: ThemePreference = "light";

const resolveSystemTheme = (): ResolvedTheme => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: defaultTheme,
  resolvedTheme: "light",

  setTheme: (theme: ThemePreference): void => {
    const resolvedTheme = theme === "system" ? resolveSystemTheme() : theme;
    set({ theme, resolvedTheme });
  },
  toggleTheme: (): void => {
    set((state) => {
      const nextTheme: ResolvedTheme =
        state.theme === "system"
          ? state.resolvedTheme === "dark"
            ? "light"
            : "dark"
          : state.theme === "light"
            ? "dark"
            : "light";

      // Toggling always results in an explicit user preference (not "system").
      return { theme: nextTheme, resolvedTheme: nextTheme };
    });
  },
  resetTheme: (): void => {
    set({ theme: defaultTheme, resolvedTheme: "light" });
  },
  syncResolvedThemeFromSystem: (): void => {
    set({ resolvedTheme: resolveSystemTheme() });
  },
}));
