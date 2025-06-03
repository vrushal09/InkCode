// CodeMirror themes configuration
import { oneDark } from "@codemirror/theme-one-dark";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { materialDark, materialLight } from "@uiw/codemirror-theme-material";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { nord } from "@uiw/codemirror-theme-nord";
import { solarizedLight, solarizedDark } from "@uiw/codemirror-theme-solarized";

export const AVAILABLE_THEMES = [
    {
        id: 'oneDark',
        name: 'One Dark',
        category: 'Dark',
        theme: oneDark,
        description: 'Popular dark theme from Atom editor'
    },
    {
        id: 'vscodeDark',
        name: 'VS Code Dark',
        category: 'Dark',
        theme: vscodeDark,
        description: 'Visual Studio Code dark theme'
    },
    {
        id: 'vscodeLight',
        name: 'VS Code Light',
        category: 'Light',
        theme: vscodeLight,
        description: 'Visual Studio Code light theme'
    },
    {
        id: 'githubDark',
        name: 'GitHub Dark',
        category: 'Dark',
        theme: githubDark,
        description: 'GitHub dark theme'
    },
    {
        id: 'githubLight',
        name: 'GitHub Light',
        category: 'Light',
        theme: githubLight,
        description: 'GitHub light theme'
    },
    {
        id: 'materialDark',
        name: 'Material Dark',
        category: 'Dark',
        theme: materialDark,
        description: 'Material Design dark theme'
    },
    {
        id: 'materialLight',
        name: 'Material Light',
        category: 'Light',
        theme: materialLight,
        description: 'Material Design light theme'
    },
    {
        id: 'monokai',
        name: 'Monokai',
        category: 'Dark',
        theme: monokai,
        description: 'Classic Monokai color scheme'
    },
    {
        id: 'dracula',
        name: 'Dracula',
        category: 'Dark',
        theme: dracula,
        description: 'Popular Dracula theme'
    },
    {
        id: 'nord',
        name: 'Nord',
        category: 'Dark',
        theme: nord,
        description: 'Arctic, north-bluish clean theme'
    },
    {
        id: 'solarizedLight',
        name: 'Solarized Light',
        category: 'Light',
        theme: solarizedLight,
        description: 'Solarized light color scheme'
    },
    {
        id: 'solarizedDark',
        name: 'Solarized Dark',
        category: 'Dark',
        theme: solarizedDark,
        description: 'Solarized dark color scheme'
    }
];

// Helper function to get theme by ID
export const getThemeById = (themeId) => {
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    return theme ? theme.theme : oneDark; // Default to oneDark if not found
};

// Helper function to get theme info by ID
export const getThemeInfo = (themeId) => {
    return AVAILABLE_THEMES.find(t => t.id === themeId) || AVAILABLE_THEMES[0];
};

// Group themes by category
export const getThemesByCategory = () => {
    return AVAILABLE_THEMES.reduce((acc, theme) => {
        if (!acc[theme.category]) {
            acc[theme.category] = [];
        }
        acc[theme.category].push(theme);
        return acc;
    }, {});
};

// Default theme
export const DEFAULT_THEME = 'oneDark';
