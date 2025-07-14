import React, { createContext, useContext, useState, useCallback } from "react";

export type MermaidTheme = "default" | "dark" | "forest" | "neutral" | "base";

interface MermaidThemeContextType {
  theme: MermaidTheme;
  setTheme: (theme: MermaidTheme) => void;
  availableThemes: Array<{
    id: MermaidTheme;
    name: string;
    description: string;
    preview: string;
  }>;
}

const MermaidThemeContext = createContext<MermaidThemeContextType | undefined>(undefined);

export function useMermaidTheme() {
  const context = useContext(MermaidThemeContext);
  if (context === undefined) {
    throw new Error("useMermaidTheme must be used within a MermaidThemeProvider");
  }
  return context;
}

interface MermaidThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: MermaidTheme;
}

export function MermaidThemeProvider({
  children,
  defaultTheme = "base",
}: MermaidThemeProviderProps) {
  const [theme, setThemeState] = useState<MermaidTheme>(defaultTheme);

  const setTheme = useCallback((newTheme: MermaidTheme) => {
    setThemeState(newTheme);
    // Store theme preference in localStorage
    localStorage.setItem("mermaid-theme", newTheme);
  }, []);

  // Initialize theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("mermaid-theme") as MermaidTheme;
    if (savedTheme && ["default", "dark", "forest", "neutral", "base"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  const availableThemes = [
    {
      id: "base" as MermaidTheme,
      name: "Base",
      description: "Clean, modern theme with blue accents",
      preview: "#3B82F6",
    },
    {
      id: "default" as MermaidTheme,
      name: "Default",
      description: "Classic Mermaid theme",
      preview: "#FF6B6B",
    },
    {
      id: "dark" as MermaidTheme,
      name: "Dark",
      description: "Dark theme for low-light environments",
      preview: "#2D3748",
    },
    {
      id: "forest" as MermaidTheme,
      name: "Forest",
      description: "Nature-inspired green theme",
      preview: "#48BB78",
    },
    {
      id: "neutral" as MermaidTheme,
      name: "Neutral",
      description: "Minimal grayscale theme",
      preview: "#718096",
    },
  ];

  const value = {
    theme,
    setTheme,
    availableThemes,
  };

  return (
    <MermaidThemeContext.Provider value={value}>
      {children}
    </MermaidThemeContext.Provider>
  );
}

// Theme selector component
interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = "" }: ThemeSelectorProps) {
  const { theme, setTheme, availableThemes } = useMermaidTheme();

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Diagram Theme
      </label>
      <div className="grid grid-cols-1 gap-2">
        {availableThemes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`
              flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200
              ${
                theme === themeOption.id
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: themeOption.preview }}
            />
            <div className="flex-1 text-left">
              <div className="font-medium">{themeOption.name}</div>
              <div className="text-xs opacity-75">{themeOption.description}</div>
            </div>
            {theme === themeOption.id && (
              <div className="text-blue-500">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Quick theme switcher for toolbar
interface QuickThemeSwitcherProps {
  className?: string;
}

export function QuickThemeSwitcher({ className = "" }: QuickThemeSwitcherProps) {
  const { theme, setTheme, availableThemes } = useMermaidTheme();

  return (
    <div className={`relative ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as MermaidTheme)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {availableThemes.map((themeOption) => (
          <option key={themeOption.id} value={themeOption.id}>
            {themeOption.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
