import { createSlice } from "@reduxjs/toolkit";

const storedTheme = localStorage.getItem("theme") || "light";
const injectScrollbarTheme = () => {
  if (document.getElementById("scrollbar-theme-style")) return; // prevent duplicates

  const style = document.createElement("style");
  style.id = "scrollbar-theme-style";
  style.innerHTML = `
    /* Dark theme scrollbar */
    .dark ::-webkit-scrollbar {
      width: 8px;
    }
    .dark ::-webkit-scrollbar-track {
      background: #1e293b;
    }
    .dark ::-webkit-scrollbar-thumb {
      background-color: #475569;
      border-radius: 10px;
    }
    .dark ::-webkit-scrollbar-thumb:hover {
      background-color: #64748b;
    }

    /* Firefox (dark mode only) */
    .dark {
      scrollbar-width: thin;
      scrollbar-color: #475569 #1e293b;
    }
  `;
  document.head.appendChild(style);
};

// ✅ Apply theme class and scrollbar styles when initialized
if (storedTheme === "dark") {
  document.documentElement.classList.add("dark");
  injectScrollbarTheme();
} else {
  document.documentElement.classList.remove("dark");
}
const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: storedTheme,
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("theme", state.mode);
      // console.log("Toggling theme to:", state.mode);
      if (state.mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      injectScrollbarTheme();
      // console.log("Document classes:", document.documentElement.className);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("theme", state.mode);
      // console.log("Setting theme to:", state.mode);
      if (state.mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      injectScrollbarTheme();
      // console.log("Document classes:", document.documentElement.className);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
