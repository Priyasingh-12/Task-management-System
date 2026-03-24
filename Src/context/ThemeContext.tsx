import React, { createContext, useState } from "react";
import { Appearance } from "react-native";

export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = Appearance.getColorScheme() === "dark";
  const [darkMode, setDarkMode] = useState(systemTheme);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
