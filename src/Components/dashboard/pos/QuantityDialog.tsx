import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box
} from '@mui/material';
import { IProduct } from '@/Data/Interfaces/Supply';
import UtilMethods from '@/Data/Utilities/UtilMethods';

interface Props {
    open: boolean;
    product: IProduct | null;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
}

const QuantityDialog: React.FC<Props> = ({ open, product, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState<string>('');

    const handleConfirm = () => {
        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) return;
        
        if (product && qty > product.stock_quantity) {
            alert(`Stock insuffisant. Disponible: ${product.stock_quantity} ${product.unit?.abbreviation || ''}`);
            return;
        }

        onConfirm(qty);
        setQuantity('');
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && quantity) {
            handleConfirm();
        }
    };

    if (!product) return null;

    const unitPrice = product.price_per_unit ?? product.price ?? 0;
    const unitLabel = product.unit?.abbreviation || 'pce';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {product.name}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                        Prix unitaire: <strong>{UtilMethods.formatNumber(unitPrice)}</strong> / {unitLabel}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Stock disponible: <strong>{product.stock_quantity} {unitLabel}</strong>
                    </Typography>
                </Box>
                <TextField
                    autoFocus
                    fullWidth
                    type="number"
                    label={`Quantité (${unitLabel})`}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onKeyPress={handleKeyPress}
                    inputProps={{
                        step: product.unit?.allows_decimal ? 0.1 : 1,
                        min: product.unit?.allows_decimal ? 0.001 : 1,
                    }}
                    sx={{ mt: 1 }}
                />
                {quantity && !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0 && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            Total: {UtilMethods.formatNumber((parseFloat(quantity) || 0) * unitPrice)}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ color: '#64748b' }}>Annuler</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0}
                    sx={{
                        bgcolor: '#6366f1',
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#4f46e5' }
                    }}
                >
                    Ajouter
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuantityDialog;
