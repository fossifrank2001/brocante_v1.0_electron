import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import 'Styles/index.less';
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import store from 'Data/Objects/store';
import ErrorBoundary from "@/ErrorBoundary";
import Loading from "Components/utils/Loading";

import 'Styles/index.less';
import App from "Components/App.tsx";

// const App = lazy(() => import('./Components/App'));

const Root: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) return <Loading />;

    return (
        <ErrorBoundary>
            <Provider store={store}>
                {/*<Suspense fallback={<Loading />}>*/}
                    <App />
                {/*</Suspense>*/}
                <ToastContainer />
            </Provider>
        </ErrorBoundary>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message);
});