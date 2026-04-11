import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    TextField,
    Typography,
    Alert,
    IconButton,
    CircularProgress,
    Paper,
    Stack
} from '@mui/material';
import { 
    QrCodeScanner as QrCodeScannerIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    QrCode as BarcodeIcon
} from '@mui/icons-material';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import ProductAPI from '@/Data/Api/Product';
import { IProduct } from '@/Data/Interfaces/Supply';
import { useTranslation } from 'react-i18next';

interface BarcodeScannerProps {
    open: boolean;
    onClose: () => void;
    onProductFound: (product: IProduct) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ open, onClose, onProductFound }) => {
    const { t } = useTranslation();
    const [manualInput, setManualInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scannerInitialized, setScannerInitialized] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (open && !scannerInitialized) {
            initScanner();
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
                setScannerInitialized(false);
            }
        };
    }, [open]);

    const initScanner = () => {
        try {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    showTorchButtonIfSupported: true,
                },
                false
            );

            scanner.render(onScanSuccess, onScanError);
            scannerRef.current = scanner;
            setScannerInitialized(true);
        } catch (err) {
            console.error('Failed to initialize scanner:', err);
            setError(t('product.scannerInitError'));
        }
    };

    const onScanSuccess = async (decodedText: string) => {
        try {
            const data = JSON.parse(decodedText);
            if (data.type === 'product' && data.internal_reference) {
                await searchProduct(data.internal_reference, 'internal');
            }
        } catch {
            await searchProduct(decodedText, 'auto');
        }
    };

    const onScanError = (errorMessage: string) => {
        if (!errorMessage.includes('NotFoundException')) {
            console.warn('Scan error:', errorMessage);
        }
    };

    const searchProduct = async (reference: string, type: 'internal' | 'barcode' | 'auto' = 'auto') => {
        setIsSearching(true);
        setError(null);

        try {
            const response = await ProductAPI.findByReference(reference, type);
            const product = (response as any).data.data;
            
            if (product) {
                onProductFound(product);
                handleClose();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || t('product.productNotFound'));
        } finally {
            setIsSearching(false);
        }
    };

    const handleManualSearch = () => {
        if (manualInput.trim()) {
            searchProduct(manualInput.trim());
        }
    };

    const handleClose = () => {
        setManualInput('');
        setError(null);
        setIsSearching(false);
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
            setScannerInitialized(false);
        }
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { bgcolor: 'var(--bg-surface)', color: 'var(--text-primary)' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QrCodeScannerIcon sx={{ color: 'var(--accent-primary)' }} />
                        <Typography variant="h6">{t('product.scannerTitle')}</Typography>
                    </Box>
                    <IconButton onClick={handleClose} size="small" sx={{ color: 'var(--text-secondary)' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {/* Scanner QR/Barcode */}
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--text-secondary)' }}>
                            <BarcodeIcon sx={{ color: 'var(--accent-primary)' }} />
                            {t('product.scanCode')}
                        </Typography>
                        <Box id="qr-reader" sx={{ width: '100%', '& video': { borderRadius: '8px' } }} />
                    </Paper>

                    {/* Manual Input */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom color="var(--text-secondary)">
                            {t('product.manualInput')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={t('product.referenceOrBarcode')}
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleManualSearch();
                                    }
                                }}
                                disabled={isSearching}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'var(--bg-elevated)',
                                        color: 'var(--text-primary)',
                                        '& fieldset': { borderColor: 'var(--border-color)' },
                                        '&:hover fieldset': { borderColor: 'var(--accent-primary)' },
                                    },
                                    '& .MuiInputBase-input::placeholder': { color: 'var(--text-muted)' }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleManualSearch}
                                disabled={isSearching || !manualInput.trim()}
                                startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                sx={{ bgcolor: 'var(--accent-primary)', '&:hover': { bgcolor: 'var(--accent-primary)', opacity: 0.9 } }}
                            >
                                {isSearching ? t('common.searching') : t('common.search')}
                            </Button>
                        </Box>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} sx={{ color: 'var(--text-secondary)' }}>{t('common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};


export default BarcodeScanner;
