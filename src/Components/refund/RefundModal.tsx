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
import { useTranslation } from 'react-i18next';

interface RefundModalProps {
    open: boolean;
    onClose: () => void;
    sell: ISell | null;
    onRefundCreated?: () => void;
}

const RefundModal = ({ open, onClose, sell, onRefundCreated }: RefundModalProps) => {
    const { t } = useTranslation();
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
            setError(t('refund.invalidAmount'));
            return;
        }

        if (refundAmount > refundableAmount) {
            setError(t('refund.amountExceeds', { amount: UtilMethods.formatNumber(refundableAmount) }));
            return;
        }

        if (!reason || reason.trim().length < 5) {
            setError(t('refund.reasonRequired'));
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

            Toast.success(t('refund.refundSuccess'), 3000, 'top-right');

            if (onRefundCreated) {
                onRefundCreated();
            }

            handleClose();
        } catch (err: any) {
            setError(err.message || t('refund.refundError'));
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
                            {t('refund.refundModal')}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {t('refund.sale')}: {sell.sell_code}
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
                            my: 3,
                        }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 1 }}>
                                {t('refund.saleInfo')}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">{t('refund.totalAmount')}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {UtilMethods.formatNumber(sell.total_amount)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">{t('refund.refundableAmount')}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                                    {UtilMethods.formatNumber(refundableAmount)}
                                </Typography>
                            </Box>
                        </Box>

                        <FormControl component="fieldset" sx={{ mb: 3 }}>
                            <FormLabel component="legend" sx={{ fontWeight: 700, color: '#334155' }}>
                                {t('refund.refundType')}
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
                                <FormControlLabel value="full" control={<Radio />} label={t('refund.full')} />
                                <FormControlLabel value="partial" control={<Radio />} label={t('refund.partial')} />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            fullWidth
                            label={t('refund.amountToRefund')}
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
                                {t('sale.paymentMethod')}
                            </FormLabel>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                            >
                                <FormControlLabel value="Cash" control={<Radio />} label={t('refund.cash')} />
                                <FormControlLabel value="Orange Money" control={<Radio />} label={t('refund.orangeMoney')} />
                                <FormControlLabel value="MTN Money" control={<Radio />} label={t('refund.mtnMoney')} />
                            </RadioGroup>
                        </FormControl>

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                                {t('refund.reason')}
                            </Typography>
                            <textarea
                                placeholder={t('refund.reasonPlaceholder')}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    backgroundColor: '#f8fafc',
                                    fontFamily: 'inherit',
                                    fontSize: '0.9375rem',
                                    resize: 'vertical',
                                    minHeight: '100px',
                                    outline: 'none',
                                    fontWeight: 500,
                                    transition: 'border-color 0.2s, box-shadow 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#f59e0b';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={handleClose}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                >
                    {t('common.cancel')}
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
                    {t('refund.confirmRefund')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RefundModal;
