import { Component, ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { Button, Typography, Box, Paper, Container, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { setActivePage } from 'Data/Slices/NavigationSlice';
import store from '@/Data/Objects/store';

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
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });

        const state = store.getState();
        const currentPage = state.navigaton.currentPage;
        const currentId = state.navigaton.id;
        const currentParam = state.navigaton.param;

        store.dispatch(setActivePage({ 
            page: currentPage,
            id: currentId,
            param: currentParam
        }));
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        style={{ width: '100%' }}
                    >
                        <Paper 
                            elevation={3}
                            sx={{
                                p: 4,
                                borderRadius: 2,
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                border: '1px solid rgba(0,0,0,0.1)'
                            }}
                        >
                            <Stack spacing={3} alignItems="center">
                                <ErrorOutlineIcon 
                                    sx={{ 
                                        fontSize: 80,
                                        color: 'error.main',
                                        animation: 'pulse 2s infinite',
                                        '@keyframes pulse': {
                                            '0%': { opacity: 1 },
                                            '50%': { opacity: 0.6 },
                                            '100%': { opacity: 1 },
                                        }
                                    }} 
                                />
                                
                                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" textAlign="center">
                                    Oops! Une erreur est survenue
                                </Typography>

                                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 600 }}>
                                    Nous nous excusons pour ce désagrément. L'application a rencontré une erreur inattendue.
                                </Typography>

                                {this.state.error && (
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: 2, 
                                            width: '100%',
                                            bgcolor: 'error.light',
                                            color: 'error.contrastText',
                                            borderRadius: 1,
                                            '& pre': { 
                                                margin: 0,
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word'
                                            }
                                        }}
                                    >
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                            Détails de l'erreur:
                                        </Typography>
                                        <pre>{this.state.error.toString()}</pre>
                                        {this.state.errorInfo && (
                                            <>
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                        Stack trace:
                                                    </Typography>
                                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                                </Box>
                                            </>
                                        )}
                                    </Paper>
                                )}

                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={this.handleReload}
                                    startIcon={<RefreshIcon />}
                                    sx={{ 
                                        mt: 2,
                                        px: 4,
                                        py: 1,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    Recharger la page
                                </Button>
                            </Stack>
                        </Paper>
                    </motion.div>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
