import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

// ─── Types ───────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const STORAGE_KEY = 'app-theme';

// ─── Context ─────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextType | null>(null);

// ─── Helper: detect OS preference ────────────────────────────────
const getSystemPreference = (): ResolvedTheme => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
    if (mode === 'system') return getSystemPreference();
    return mode;
};

// ─── MUI Theme Factory ──────────────────────────────────────────
const buildMuiTheme = (resolved: ResolvedTheme) => {
    const isDark = resolved === 'dark';

    return createTheme({
        palette: {
            mode: resolved,
            primary: {
                main: isDark ? '#818cf8' : '#4f46e5',
                light: isDark ? '#a5b4fc' : '#6366f1',
                dark: isDark ? '#6366f1' : '#3730a3',
                contrastText: '#ffffff',
            },
            secondary: {
                main: isDark ? '#f472b6' : '#ec4899',
                light: isDark ? '#f9a8d4' : '#f472b6',
                dark: isDark ? '#db2777' : '#be185d',
            },
            error: {
                main: isDark ? '#f87171' : '#ef4444',
            },
            warning: {
                main: isDark ? '#fbbf24' : '#f59e0b',
            },
            success: {
                main: isDark ? '#34d399' : '#10b981',
            },
            info: {
                main: isDark ? '#60a5fa' : '#3b82f6',
            },
            background: {
                default: isDark ? '#0f172a' : '#f8fafc',
                paper: isDark ? '#1e293b' : '#ffffff',
            },
            text: {
                primary: isDark ? '#f1f5f9' : '#1e293b',
                secondary: isDark ? '#94a3b8' : '#64748b',
                disabled: isDark ? '#475569' : '#cbd5e1',
            },
            divider: isDark ? '#334155' : '#e2e8f0',
            action: {
                hover: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                selected: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                disabled: isDark ? 'rgba(255,255,255,0.26)' : 'rgba(0,0,0,0.26)',
                disabledBackground: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            },
        },
        typography: {
            fontFamily: "'Inter', 'Outfit', system-ui, -apple-system, sans-serif",
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            transition: 'background-color 0.3s ease',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none' as const,
                        fontWeight: 600,
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: isDark ? '#334155' : 'rgba(0,0,0,0.87)',
                    },
                },
            },
            MuiSwitch: {
                styleOverrides: {
                    root: {
                        '& .MuiSwitch-track': {
                            transition: 'background-color 0.3s ease',
                        },
                    },
                },
            },
        },
    });
};

// ─── Provider ────────────────────────────────────────────────────
interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        return stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
    });

    const [systemPref, setSystemPref] = useState<ResolvedTheme>(getSystemPreference);

    // Listen to OS preference changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            setSystemPref(e.matches ? 'dark' : 'light');
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const resolvedTheme: ResolvedTheme = mode === 'system' ? systemPref : mode;

    // Apply data-theme on <html>
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        // Also set color-scheme for native elements
        document.documentElement.style.colorScheme = resolvedTheme;
    }, [resolvedTheme]);

    const setMode = useCallback((newMode: ThemeMode) => {
        setModeState(newMode);
        localStorage.setItem(STORAGE_KEY, newMode);
    }, []);

    const toggleTheme = useCallback(() => {
        const order: ThemeMode[] = ['light', 'dark', 'system'];
        const currentIndex = order.indexOf(mode);
        const nextMode = order[(currentIndex + 1) % order.length];
        setMode(nextMode);
    }, [mode, setMode]);

    const muiTheme = useMemo(() => buildMuiTheme(resolvedTheme), [resolvedTheme]);

    const contextValue = useMemo(
        () => ({ mode, resolvedTheme, setMode, toggleTheme }),
        [mode, resolvedTheme, setMode, toggleTheme]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

// ─── Hook ────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextType => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeContextProvider');
    return ctx;
};
