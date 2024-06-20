import { Component, ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { Button, Typography } from '@mui/material';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8d7da', color: '#721c24', textAlign: 'center', padding: '20px' }}
                >
                    <Typography variant="h1" component="h1" gutterBottom>
                        Oops! Something went wrong.
                    </Typography>
                    <Typography variant="h6" component="h2" gutterBottom>
                        An unexpected error has occurred. Please try reloading the page.
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={this.handleReload}>
                        Reload Page
                    </Button>
                    {this.state.error && (
                        <Typography variant="body2" component="pre" style={{ textAlign: 'left', marginTop: '20px' }}>
                            {this.state.error.toString()}
                            <br />
                            {this.state.errorInfo?.componentStack}
                        </Typography>
                    )}
                </motion.div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
