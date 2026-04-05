import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert,
    AlertTitle,
    IconButton,
    Paper,
    Divider,
    Grid,
    Chip,
    Zoom
} from '@mui/material';
import {
    Close,
    AccountBalanceWallet,
    History,
    CheckCircle,
    Receipt,
    Person,
    TrendingDown,
    TrendingUp,
    Info,
    ArrowForward
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import InvoiceAPI, { IUseCustomerBalanceResponse } from '@/Data/Api/Invoice';
import Toast from '@/Data/Utilities/Toast';
import { IPerson } from '@/Data/Interfaces/Person';
import UtilMethods from "Data/Utilities/UtilMethods.ts";
import { useTranslation } from 'react-i18next';

interface UseCustomerBalanceProps {
    customer: IPerson;
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const UseCustomerBalance = ({ customer, open, onClose, onSuccess }: UseCustomerBalanceProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IUseCustomerBalanceResponse | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleUseBalance = async () => {
        setLoading(true);
        try {
            const response = await InvoiceAPI.useCustomerBalance({
                customer_id: customer.id!
            });

            setResult(response.data);
            setShowResult(true);
            Toast.success(response.message);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            Toast.error(error?.response?.data?.message || t('customer.errorUsingBalance'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowResult(false);
        setResult(null);
        onClose();
    };

    const balance = Number(customer.company_balance) || 0;
    const remainingBalance = customer.remaining_balance
        ? (typeof customer.remaining_balance === 'string' ? JSON.parse(customer.remaining_balance) : customer.remaining_balance)
        : {};
    const hasDebts = Object.keys(remainingBalance).length > 0;
    const totalDebts = Object.values(remainingBalance).reduce((sum: number, amount: any) => sum + (parseFloat(amount) || 0), 0) as number;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            TransitionComponent={Zoom}
            PaperProps={{
                sx: {
                    borderRadius: '28px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>
                        {t('customer.balanceManagement')}
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: '#64748b' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <AnimatePresence mode="wait">
                    {!showResult ? (
                        <motion.div
                            key="initial"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Grid container spacing={4}>
                                {/* Client Info Header */}
                                <Grid item xs={12}>
                                    <Paper sx={{
                                        p: 3,
                                        borderRadius: '20px',
                                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                        color: 'white',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 10px 20px rgba(30, 41, 59, 0.1)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Box sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px solid rgba(255,255,255,0.2)'
                                            }}>
                                                <Person sx={{ fontSize: 32 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'white' }}>
                                                    {customer.firstname} {customer.lastname}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                                                    {customer.phone || t('customer.noPhone')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                {t('customer.currentBalance')}
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981' }}>
                                                {UtilMethods.formatNumber(balance ?? 0)}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Debts List */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <History sx={{ fontSize: 18 }} /> {t('customer.debtsList')}
                                    </Typography>

                                    {!hasDebts ? (
                                        <Paper sx={{ p: 4, borderRadius: '20px', textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #e2e8f0' }}>
                                            <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 2, opacity: 0.2 }} />
                                            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>{t('customer.noDebts')}</Typography>
                                        </Paper>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {Object.entries(remainingBalance).map(([sellCode, amount]: [string, any]) => (
                                                <Paper key={sellCode} sx={{
                                                    p: 2,
                                                    borderRadius: '16px',
                                                    bgcolor: '#fff',
                                                    border: '1px solid rgba(0,0,0,0.05)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { transform: 'translateX(5px)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                                                            <Receipt sx={{ fontSize: 20 }} />
                                                        </Box>
                                                        <Typography sx={{ fontWeight: 700, color: '#334155' }}>{t('customer.sale')} {sellCode}</Typography>
                                                    </Box>
                                                    <Typography sx={{ fontWeight: 800, color: '#ef4444' }}>
                                                        {UtilMethods.formatNumber(parseFloat(amount ?? 0))}
                                                    </Typography>
                                                </Paper>
                                            ))}
                                            <Divider sx={{ my: 1 }} />
                                            <Box sx={{
                                                p: 2.5,
                                                borderRadius: '18px',
                                                background: 'rgba(239, 68, 68, 0.05)',
                                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Typography sx={{ fontWeight: 800, color: '#ef4444' }}>{t('customer.totalDebtsTitle')}</Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#ef4444' }}>
                                                    {UtilMethods.formatNumber(totalDebts ?? 0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Grid>

                                {/* Action / Preview Column */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Info sx={{ fontSize: 18 }} /> {t('customer.operationSummary')}
                                    </Typography>

                                    <Paper sx={{
                                        p: 3,
                                        borderRadius: '20px',
                                        bgcolor: '#f8fafc',
                                        border: '1px solid #f1f5f9',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        {balance === 0 ? (
                                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                                <TrendingDown sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                                                <Typography sx={{ color: '#64748b', fontWeight: 600 }}>{t('customer.noBalanceAvailable')}</Typography>
                                            </Box>
                                        ) : !hasDebts ? (
                                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                                <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                                                <Typography sx={{ color: '#64748b', fontWeight: 600 }}>{t('customer.allDebtsPaid')}</Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                                        <TrendingUp sx={{ fontSize: 24 }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                                            {t('customer.amountToDeduct')}
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                                                            {UtilMethods.formatNumber(Math.min(balance ?? 0, totalDebts ?? 0))}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                                        <AccountBalanceWallet sx={{ fontSize: 24 }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                                            {t('customer.balanceAfterOperation')}
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#6366f1' }}>
                                                            {UtilMethods.formatNumber(Math.max(0, (balance ?? 0) - (totalDebts ?? 0)))}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Alert severity={balance >= totalDebts ? "success" : "warning"}
                                                    sx={{ borderRadius: '16px', mt: 1, border: '1px solid rgba(0,0,0,0.05)' }}>
                                                    <AlertTitle sx={{ fontWeight: 800 }}>
                                                        {balance >= totalDebts ? t('customer.fullCoverage') : t('customer.partialCoverage')}
                                                    </AlertTitle>
                                                    {balance >= totalDebts
                                                        ? t('customer.balanceCoversAll')
                                                        : `${t('customer.balanceCoversPartial')} ${UtilMethods.formatNumber((totalDebts ?? 0) - (balance ?? 0))}`
                                                    }
                                                </Alert>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.1)'
                                }}>
                                    <CheckCircle sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                    {t('customer.operationCompleted')}
                                </Typography>
                                <Typography sx={{ color: '#64748b' }}>
                                    {t('customer.balanceAppliedSuccess')}
                                </Typography>
                            </Box>

                            {result && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={5}>
                                        <Paper sx={{
                                            p: 3,
                                            borderRadius: '24px',
                                            background: '#f8fafc',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 800, color: '#1e293b' }}>{t('customer.balanceSummary')}</Typography>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>{t('customer.previousBalance')}</Typography>
                                                    <Typography sx={{ fontWeight: 700 }}>{UtilMethods.formatNumber(result?.customer?.previous_balance ?? 0)}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>{t('customer.deduction')}</Typography>
                                                    <Chip label={`-${UtilMethods.formatNumber(result?.customer?.balance_used ?? 0)}`}
                                                        sx={{ fontWeight: 800, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} />
                                                </Box>
                                                <Divider />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ color: '#1e293b', fontWeight: 800 }}>{t('customer.newBalance')}</Typography>
                                                    <Typography sx={{ fontWeight: 900, color: '#10b981', fontSize: '1.2rem' }}>
                                                        {UtilMethods.formatNumber(result?.customer?.new_balance ?? 0)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} md={7}>
                                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: '#1e293b' }}>{t('customer.treatedDebts')}</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                                            {result.balance_usage.covered_debts.map((debt, index) => (
                                                <Paper key={index} sx={{
                                                    p: 2,
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(16, 185, 129, 0.15)',
                                                    bgcolor: 'rgba(16, 185, 129, 0.02)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <CheckCircle sx={{ fontSize: 18, color: '#10b981' }} />
                                                        <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>{t('customer.invoice')} #{debt.sale_id}</Typography>
                                                    </Box>
                                                    <Typography sx={{ fontWeight: 800, color: '#10b981' }}>
                                                        {UtilMethods.formatNumber(debt?.amount_covered ?? 0)}
                                                    </Typography>
                                                </Paper>
                                            ))}

                                            {result.balance_usage.remaining_debts.map((debt, index) => (
                                                <Paper key={`rem-${index}`} sx={{
                                                    p: 2,
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(245, 158, 11, 0.15)',
                                                    bgcolor: 'rgba(245, 158, 11, 0.02)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Info sx={{ fontSize: 18, color: '#f59e0b' }} />
                                                        <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>{t('customer.invoice')} #{debt.sale_id}</Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>{t('customer.remainingToPay')}</Typography>
                                                        <Typography sx={{ fontWeight: 800, color: '#f59e0b' }}>
                                                            {UtilMethods.formatNumber(debt?.remaining_amount ?? 0)}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Box>
                                    </Grid>
                                </Grid>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>

            <DialogActions sx={{
                p: 3,
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                background: 'rgba(248, 250, 252, 0.5)',
                gap: 2
            }}>
                {!showResult ? (
                    <>
                        <Button
                            onClick={handleClose}
                            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700, color: '#64748b', px: 3 }}
                        >
                            {t('customer.cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUseBalance}
                            disabled={loading || !hasDebts || balance === 0}
                            sx={{
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontWeight: 800,
                                px: 4,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)',
                                '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }
                            }}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                        >
                            {loading ? t('customer.processing') : t('customer.applyBalance')}
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                            borderRadius: '14px',
                            textTransform: 'none',
                            fontWeight: 800,
                            px: 4,
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            boxShadow: '0 8px 16px rgba(15, 23, 42, 0.2)'
                        }}
                    >
                        {t('customer.finish')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default UseCustomerBalance;
