import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../features/theme/themeSlice";

export const useTheme = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  const isDark = mode === "dark";
  const isLight = mode === "light";

  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark";
    dispatch(setTheme(newMode));
    localStorage.setItem("theme", newMode);
    document.documentElement.classList.toggle("dark", newMode === "dark");
  };

  const setThemeMode = (newMode) => {
    dispatch(setTheme(newMode));
    localStorage.setItem("theme", newMode);
    document.documentElement.classList.toggle("dark", newMode === "dark");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    if (initialTheme !== mode) {
      dispatch(setTheme(initialTheme));
      document.documentElement.classList.toggle(
        "dark",
        initialTheme === "dark"
      );
    }
  }, [dispatch, mode]);

  return {
    mode,
    isDark,
    isLight,
    toggleTheme,
    setThemeMode,
  };
};
