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

interface ProductQRCodeProps {
    product: IProduct;
    open: boolean;
    onClose: () => void;
    onQRCodeGenerated?: (qrCodeUrl: string) => void;
}

const ProductQRCode: React.FC<ProductQRCodeProps> = ({ product, open, onClose, onQRCodeGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (open && product.qrcode_data) {
            // Si le produit a déjà un QR code, essayer de construire l'URL
            // Supposons que qrcode_data contient le chemin relatif ou les données
            try {
                const data = JSON.parse(product.qrcode_data);
                if (data.internal_reference) {
                    // QR code existe probablement
                    setQrCodeUrl(`${import.meta.env.VITE_API_URL}/images/qrcodes/qrcode_${product.internal_reference}.svg`);
                }
            } catch {
                // qrcode_data n'est pas JSON, peut-être juste un chemin
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
            setError(err.response?.data?.message || 'Erreur lors de la génération du QR code.');
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
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QrCode2Icon color="primary" />
                        <Typography variant="h6">QR Code du Produit</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
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
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Produit
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
                            />
                            {product.barcode && (
                                <Chip 
                                    label={`Barcode: ${product.barcode}`} 
                                    size="small" 
                                    variant="outlined" 
                                />
                            )}
                        </Box>
                    </Paper>

                    {/* QR Code Display */}
                    {qrCodeUrl ? (
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    minHeight: 300,
                                    bgcolor: 'white'
                                }}
                            >
                                <img 
                                    src={qrCodeUrl} 
                                    alt="QR Code"
                                    style={{ maxWidth: '100%', maxHeight: 300 }}
                                    onError={() => {
                                        setError('Impossible de charger le QR code. Veuillez le générer.');
                                        setQrCodeUrl(null);
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                Scannez ce code pour identifier rapidement le produit
                            </Typography>
                        </Paper>
                    ) : (
                        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                            <QrCode2Icon sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Aucun QR code généré pour ce produit
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Cliquez sur "Générer QR Code" pour créer un code unique
                            </Typography>
                        </Paper>
                    )}

                    {/* Info Box */}
                    <Alert severity="info" icon={<QrCode2Icon />}>
                        Le QR code contient la référence interne du produit et permet une identification rapide via scanner.
                    </Alert>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose}>Fermer</Button>
                {qrCodeUrl && (
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                    >
                        Télécharger
                    </Button>
                )}
                <Button
                    variant="contained"
                    startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    onClick={handleGenerateQRCode}
                    disabled={isGenerating}
                >
                    {qrCodeUrl ? 'Régénérer' : 'Générer'} QR Code
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductQRCode;
