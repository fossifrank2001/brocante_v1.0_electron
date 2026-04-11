import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Typography,
    Alert,
    IconButton,
    CircularProgress,
    Paper,
    Stack,
    Chip
} from '@mui/material';
import { 
    QrCode2 as QrCode2Icon,
    Close as CloseIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import ProductAPI from '@/Data/Api/Product';
import { IProduct } from '@/Data/Interfaces/Supply';
import { useTranslation } from 'react-i18next';

interface ProductQRCodeProps {
    product: IProduct;
    open: boolean;
    onClose: () => void;
    onQRCodeGenerated?: (qrCodeUrl: string) => void;
}

const ProductQRCode: React.FC<ProductQRCodeProps> = ({ product, open, onClose, onQRCodeGenerated }) => {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (open && product.qrcode_data) {
            try {
                const data = JSON.parse(product.qrcode_data);
                if (data.internal_reference) {
                    setQrCodeUrl(`${import.meta.env.VITE_API_URL}/images/qrcodes/qrcode_${product.internal_reference}.svg`);
                }
            } catch {
                setQrCodeUrl(null);
            }
        }
    }, [open, product]);

    const handleGenerateQRCode = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await ProductAPI.generateQRCode(product.id);
            const generatedUrl = response.data.qr_code_url;
            setQrCodeUrl(generatedUrl);
            
            if (onQRCodeGenerated) {
                onQRCodeGenerated(generatedUrl);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || t('product.qrCodeError'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (qrCodeUrl) {
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            link.download = `qrcode_${product.internal_reference}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { bgcolor: 'var(--bg-surface)', color: 'var(--text-primary)' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QrCode2Icon color="primary" />
                        <Typography variant="h6">{t('product.qrCodeTitle')}</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'var(--text-secondary)' }}>
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

                    {/* Product Info */}
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                        <Typography variant="subtitle2" color="var(--text-secondary)" gutterBottom>
                            {t('product.product')}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            {product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                                label={`SKU: ${product.internal_reference}`} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                            />
                            {product.barcode && (
                                <Chip 
                                    label={`Barcode: ${product.barcode}`} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                />
                            )}
                        </Box>
                    </Paper>

                    {/* QR Code Display */}
                    {qrCodeUrl ? (
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: 'var(--bg-elevated)' }}>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    minHeight: 300,
                                    bgcolor: '#ffffff', // QR code background is usually best in white for scanability
                                    p: 2,
                                    borderRadius: 1
                                }}
                            >
                                <img 
                                    src={qrCodeUrl} 
                                    alt="QR Code"
                                    style={{ maxWidth: '100%', maxHeight: 300 }}
                                    onError={() => {
                                        setError(t('product.qrCodeLoadError'));
                                        setQrCodeUrl(null);
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" color="var(--text-secondary)" sx={{ mt: 2, display: 'block' }}>
                                {t('product.qrCodeScanInfo')}
                            </Typography>
                        </Paper>
                    ) : (
                        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center', bgcolor: 'var(--bg-elevated)' }}>
                            <QrCode2Icon sx={{ fontSize: 80, color: 'var(--text-muted)', mb: 2 }} />
                            <Typography variant="body1" color="var(--text-secondary)" gutterBottom>
                                {t('product.noQrCode')}
                            </Typography>
                            <Typography variant="caption" color="var(--text-secondary)">
                                {t('product.generateQrCodeInfo')}
                            </Typography>
                        </Paper>
                    )}

                    {/* Info Box */}
                    <Alert severity="info" icon={<QrCode2Icon />} sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--text-primary)' }}>
                        {t('product.qrCodeUsageInfo')}
                    </Alert>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: 'var(--text-secondary)' }}>{t('common.close')}</Button>
                {qrCodeUrl && (
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                    >
                        {t('common.download')}
                    </Button>
                )}
                <Button
                    variant="contained"
                    startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    onClick={handleGenerateQRCode}
                    disabled={isGenerating}
                    sx={{ bgcolor: 'var(--accent-primary)', '&:hover': { bgcolor: 'var(--accent-primary)', opacity: 0.9 } }}
                >
                    {qrCodeUrl ? t('common.regenerate') : t('common.generate')} QR Code
                </Button>
            </DialogActions>
        </Dialog>
    );
};


export default ProductQRCode;
