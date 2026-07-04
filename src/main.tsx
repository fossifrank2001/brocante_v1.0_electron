import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import 'Styles/index.less';
import '@fontsource/comfortaa/300.css';
import '@fontsource/comfortaa/400.css';
import '@fontsource/comfortaa/500.css';
import '@fontsource/comfortaa/600.css';
import '@fontsource/comfortaa/700.css';
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import store from 'Data/Objects/store';
import ErrorBoundary from "@/ErrorBoundary";
import Loading from "Components/utils/Loading";
import { initApiUrl } from 'Data/Utilities/constants';
import './i18n/config';
import { ThemeContextProvider } from '@/contexts/ThemeContext';
import { AppContextProvider } from '@/contexts/appContext';

import 'Styles/index.less';
import App from "Components/App.tsx";

// eslint-disable-next-line react-refresh/only-export-components
const Root: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Clear old API_BASE_URL from localStorage to prevent brocante.local issues
        localStorage.removeItem('API_BASE_URL');
        
        // Initialize API URL from Electron main process before rendering
        initApiUrl().finally(() => {
            const timer = setTimeout(() => setIsLoading(false), 500);
            return () => clearTimeout(timer);
        });
    }, []);

    if (isLoading) return (
        <ThemeContextProvider>
            <Loading />
        </ThemeContextProvider>
    );

    return (
        <ErrorBoundary>
            <Provider store={store}>
                <ThemeContextProvider>
                    <AppContextProvider>
                        <App />
                        <ToastContainer />
                    </AppContextProvider>
                </ThemeContextProvider>
            </Provider>
        </ErrorBoundary>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message);
});