import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

interface AppContextType {
    togglePageLoading: (val?: boolean) => void;
    pageLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppContextProviderProps {
    children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
    const [pageLoading, setPageLoading] = useState(false);

    const togglePageLoading = useCallback((val = false) => {
        console.log('CONTEXT CALL ||| ' + val);
        setPageLoading(val);
    }, []);

    const contextValue = useMemo(
        () => ({
            togglePageLoading,
            pageLoading,
        }),
        [togglePageLoading, pageLoading]
    );

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
    
};

// Create a custom hook to use the context
// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};
