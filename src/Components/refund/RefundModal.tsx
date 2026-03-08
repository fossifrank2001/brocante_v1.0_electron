import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, Alert, CircularProgress,
    InputAdornment, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel
} from '@mui/material';
import { AttachMoney, CurrencyExchange } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { addToTotalRefunds } from '@/Data/Slices/dashboard/cashSessionSlice';
import RefundAPI from '@/Data/Api/Refund';
import { ISell } from '@/Data/Interfaces/Sell';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Toast from '@/Data/Utilities/Toast';

interface RefundModalProps {
    open: boolean;
    onClose: () => void;
    sell: ISell | null;
    onRefundCreated?: () => void;
}

const RefundModal = ({ open, onClose, sell, onRefundCreated }: RefundModalProps) => {
    const dispatch = useAppDispatch();
    const { currentSession } = useAppSelector((state) => state.cashSession);
    
    const [amount, setAmount] = useState<string>('');
    const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Orange Money' | 'MTN Money' | 'Card'>('Cash');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refundableAmount, setRefundableAmount] = useState<number>(0);

    useEffect(() => {
        if (open && sell) {
            setLoading(true);
            RefundAPI.bySell(sell.id)
                .then((res) => {
                    setRefundableAmount(res.data.refundable_amount);
                    setAmount(res.data.refundable_amount.toString());
                    setRefundType(res.data.refundable_amount === sell.total_amount ? 'full' : 'partial');
                })
                .catch(() => {
                    setRefundableAmount(sell.total_amount);
                    setAmount(sell.total_amount.toString());
                })
                .finally(() => setLoading(false));
        }
    }, [open, sell]);

    const handleSubmit = async () => {
        if (!sell) return;
        
        const refundAmount = parseFloat(amount);
        if (isNaN(refundAmount) || refundAmount <= 0) {
            setError('Montant invalide');
            return;
        }

        if (refundAmount > refundableAmount) {
            setError(`Le montant ne peut pas dépasser ${UtilMethods.formatNumber(refundableAmount)}`);
            return;
        }

        if (!reason || reason.trim().length < 5) {
            setError('Veuillez fournir une raison (minimum 5 caractères)');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await RefundAPI.create({
                sell_id: sell.id,
                amount: refundAmount,
                refund_type: refundType,
                payment_method: paymentMethod,
                reason: reason.trim(),
                cash_session_id: currentSession?.id || null,
            });

            // Update cash session totals if Cash payment
            if (paymentMethod === 'Cash' && currentSession) {
                dispatch(addToTotalRefunds(refundAmount));
            }

            Toast.success('Remboursement enregistré avec succès', 3000, 'top-right');
            
            if (onRefundCreated) {
                onRefundCreated();
            }

            handleClose();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création du remboursement');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setRefundType('full');
        setPaymentMethod('Cash');
        setReason('');
        setError(null);
        setRefundableAmount(0);
        onClose();
    };

    if (!sell) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: '24px', overflow: 'hidden' }
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    p: 3,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: '16px',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                    }}>
                        <CurrencyExchange sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                            Remboursement
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Vente: {sell.sell_code}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                        {error}
                    </Alert>
                )}

                {loading && !error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{
                            p: 3,
                            borderRadius: '16px',
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            mb: 3,
                        }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 1 }}>
                                Informations de la vente
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Montant total</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {UtilMethods.formatNumber(sell.total_amount)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Montant remboursable</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                                    {UtilMethods.formatNumber(refundableAmount)}
                                </Typography>
                            </Box>
                        </Box>

                        <FormControl component="fieldset" sx={{ mb: 3 }}>
                            <FormLabel component="legend" sx={{ fontWeight: 700, color: '#334155' }}>
                                Type de remboursement
                            </FormLabel>
                            <RadioGroup
                                row
                                value={refundType}
                                onChange={(e) => {
                                    const type = e.target.value as 'full' | 'partial';
                                    setRefundType(type);
                                    if (type === 'full') {
                                        setAmount(refundableAmount.toString());
                                    }
                                }}
                            >
                                <FormControlLabel value="full" control={<Radio />} label="Complet" />
                                <FormControlLabel value="partial" control={<Radio />} label="Partiel" />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Montant à rembourser"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={refundType === 'full'}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AttachMoney />
                                    </InputAdornment>
                                ),
                                endAdornment: <InputAdornment position="end">XAF</InputAdornment>,
                                sx: { borderRadius: '12px', fontWeight: 700 }
                            }}
                            sx={{ mb: 3 }}
                        />

                        <FormControl component="fieldset" sx={{ mb: 3 }}>
                            <FormLabel component="legend" sx={{ fontWeight: 700, color: '#334155' }}>
                                Méthode de paiement
                            </FormLabel>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                            >
                                <FormControlLabel value="Cash" control={<Radio />} label="Espèces (Cash)" />
                                <FormControlLabel value="Orange Money" control={<Radio />} label="Orange Money" />
                                <FormControlLabel value="MTN Money" control={<Radio />} label="MTN Money" />
                                <FormControlLabel value="Card" control={<Radio />} label="Carte bancaire" />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Raison du remboursement"
                            multiline
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Produit défectueux, client insatisfait, erreur de commande..."
                            InputProps={{
                                sx: { borderRadius: '12px' }
                            }}
                            required
                        />
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={handleClose}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                >
                    Annuler
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !reason || parseFloat(amount) <= 0}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CurrencyExchange />}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 800,
                        px: 4,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        }
                    }}
                >
                    Confirmer le remboursement
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RefundModal;
