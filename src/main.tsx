import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './Components/App.tsx';
import 'Styles/index.less';
import { Provider } from "react-redux";
import store from 'Data/Objects/store.ts';
import { ToastContainer } from "react-toastify";
import Loading from "Components/utils/Loading.tsx";
import ErrorBoundary from "@/ErrorBoundary.tsx";

const Root: React.FC = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        // Cleanup the timer to avoid memory leaks
        return () => clearTimeout(timer);
    }, []);

    return loading ? (
        <Loading />
    ) : (
        <ErrorBoundary>
            <Provider store={store}>
                <App />
                <ToastContainer />
            </Provider>
        </ErrorBoundary>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

// Use contextBridge (Assuming Electron context)
window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message);
});
