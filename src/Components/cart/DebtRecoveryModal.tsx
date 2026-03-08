import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    AlertTitle,
    Divider,
    CircularProgress,
    Card,
    CardContent,
    Switch,
    Grid,
    Chip
} from '@mui/material';
import {
    AccountBalance,
    Warning,
    CheckCircle,
    TrendingDown,
    Info,
    AttachMoney
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { IPerson } from '@/Data/Interfaces/Person';
import UtilMethods from '@/Data/Utilities/UtilMethods';

interface DebtRecoveryModalProps {
    open: boolean;
    onClose: () => void;
    customer: IPerson;
    excessAmount: number;
    totalAmount: number;
    onConfirm: (useCompanyBalance: boolean, useExcess: boolean) => void;
    loading?: boolean;
}

const DebtRecoveryModal = ({
    open,
    onClose,
    customer,
    excessAmount,
    totalAmount,
    onConfirm,
    loading = false
}: DebtRecoveryModalProps) => {
    const [useCompanyBalance, setUseCompanyBalance] = useState(true);
    const [useExcess, setUseExcess] = useState(true);

    const remainingBalance = customer.remaining_balance
        ? JSON.parse(customer.remaining_balance)
        : {};
    const hasDebts = Object.keys(remainingBalance).length > 0;
    const totalDebts: number = Object.values<any>(remainingBalance).reduce(
        (sum: number, amount: any) => sum + parseFloat(amount as string),
        0
    );

    const companyBalance = customer.company_balance || 0;
    const hasCompanyBalance = companyBalance > 0;

    // Calculer ce qui peut être couvert
    const excessCoverage = Math.min(excessAmount, totalDebts);
    const balanceCoverage = hasCompanyBalance && useCompanyBalance
        ? Math.min(companyBalance, totalDebts - excessCoverage)
        : 0;
    const totalCoverage = excessCoverage + balanceCoverage;
    const remainingDebt = Math.max(0, totalDebts - totalCoverage);

    const handleConfirm = () => {
        onConfirm(useCompanyBalance, useExcess);
    };

    return (
        <Dialog
            open={open}
            onClose={!loading ? onClose : undefined}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2,
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
            }}>
                <AccountBalance sx={{ fontSize: 28, color: '#1a237e' }} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                        Gestion du recouvrement
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Utilisez l'excédent et le solde client pour réduire les dettes
                    </Typography>
                </Box>
            </Box>

            <DialogContent sx={{ p: 2, pt: 1 }}>
                {!hasDebts ? (
                    <Alert
                        severity="info"
                        icon={<Info />}
                        sx={{ borderRadius: 2, mt: 2 }}
                    >
                        <AlertTitle sx={{ fontWeight: 600 }}>Aucune dette</AlertTitle>
                        Ce client n'a aucune dette impayée. L'excédent sera automatiquement ajouté à son solde client.
                    </Alert>
                ) : (
                    <Box>
                        {/* Résumé de la Transaction */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Card elevation={0} sx={{ mb: 3, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        💰 Synthèse Financière
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={hasCompanyBalance ? 4 : 6}>
                                            <Box sx={{ bgcolor: 'white', p: 2, borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8' }}>Vente Actuelle</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155' }}>
                                                    {UtilMethods.formatNumber(totalAmount ?? 0)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={hasCompanyBalance ? 4 : 6}>
                                            <Box sx={{ bgcolor: 'white', p: 2, borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>Excédent Reçu</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                                                    +{UtilMethods.formatNumber(excessAmount ?? 0)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        {hasCompanyBalance && (
                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ bgcolor: 'white', p: 2, borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#3b82f6' }}>Solde Disponible</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#3b82f6' }}>
                                                        {UtilMethods.formatNumber(companyBalance ?? 0)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Dettes du Client */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card elevation={0} sx={{ mb: 3, borderRadius: '20px', border: '1px solid #fee2e2', bgcolor: 'rgba(239, 68, 68, 0.02)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                                <Warning fontSize="small" />
                                            </Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Dettes Impayées
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${Object.keys(remainingBalance).length} créance(s)`}
                                            size="small"
                                            sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, borderRadius: '8px' }}
                                        />
                                    </Box>

                                    <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#f1f5f9', borderRadius: '4px' } }}>
                                        {Object.entries(remainingBalance).map(([sellCode, amount]: [string, any]) => (
                                            <Box
                                                key={sellCode}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 2,
                                                    mb: 1.5,
                                                    borderRadius: '12px',
                                                    bgcolor: 'white',
                                                    border: '1px solid #f1f5f9',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <TrendingDown sx={{ fontSize: 18, color: '#94a3b8' }} />
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>Réf. {sellCode}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#64748b' }}>Vente à crédit</Typography>
                                                    </Box>
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#ef4444' }}>
                                                    {UtilMethods.formatNumber(parseFloat(amount ?? 0))}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px dashed #f1f5f9' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Total de la dette cumulée</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#ef4444' }}>
                                            {UtilMethods.formatNumber(totalDebts ?? 0)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Options de Recouvrement */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card elevation={0} sx={{ mb: 3, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        ⚙️ Stratégie de règlement
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {excessAmount > 0 && (
                                            <Box sx={{
                                                p: 2, borderRadius: '16px', bgcolor: useExcess ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                                                border: `1px solid ${useExcess ? 'rgba(16, 185, 129, 0.2)' : '#f1f5f9'}`,
                                                transition: 'all 0.3s'
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                                            <AttachMoney fontSize="small" />
                                                        </Box>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700, color: useExcess ? '#065f46' : '#64748b' }}>Excédent actuel</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 600, color: useExcess ? '#059669' : '#94a3b8' }}>
                                                                Recouvrer {UtilMethods.formatNumber(excessAmount ?? 0)} depuis le reçu
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Switch
                                                        checked={useExcess}
                                                        onChange={(e) => setUseExcess(e.target.checked)}
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981' }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        )}

                                        {hasCompanyBalance && (
                                            <Box sx={{
                                                p: 2, borderRadius: '16px', bgcolor: useCompanyBalance ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                                                border: `1px solid ${useCompanyBalance ? 'rgba(59, 130, 246, 0.2)' : '#f1f5f9'}`,
                                                transition: 'all 0.3s'
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                                            <AccountBalance fontSize="small" />
                                                        </Box>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700, color: useCompanyBalance ? '#1e40af' : '#64748b' }}>Utiliser le Solde</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 600, color: useCompanyBalance ? '#1d4ed8' : '#94a3b8' }}>
                                                                Recouvrer {UtilMethods.formatNumber(companyBalance ?? 0)} depuis le compte client
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Switch
                                                        checked={useCompanyBalance}
                                                        onChange={(e) => setUseCompanyBalance(e.target.checked)}
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#3b82f6' },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3b82f6' }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Prévisualisation */}
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                            <Card elevation={0} sx={{
                                borderRadius: '24px',
                                border: '1px solid',
                                borderColor: remainingDebt === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                bgcolor: remainingDebt === 0 ? 'rgba(16, 185, 129, 0.02)' : 'rgba(245, 158, 11, 0.02)'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        {remainingDebt === 0 ?
                                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#dcfce7', color: '#166534' }}><CheckCircle /></Box> :
                                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#fef3c7', color: '#92400e' }}><Warning /></Box>
                                        }
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: remainingDebt === 0 ? '#065f46' : '#92400e' }}>
                                            {remainingDebt === 0 ? 'Recouvrement Complet' : 'Dettes Résiduelles'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <Box sx={{ display: 'grid', gap: 2 }}>
                                            {useExcess && excessCoverage > 0 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Règlement par l'excédent</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>
                                                        -{UtilMethods.formatNumber(excessCoverage ?? 0)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {useCompanyBalance && balanceCoverage > 0 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>Règlement par le solde</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#3b82f6' }}>
                                                        -{UtilMethods.formatNumber(balanceCoverage ?? 0)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Divider sx={{ borderStyle: 'dashed' }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Total Recouvré</Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                                    {UtilMethods.formatNumber(totalCoverage ?? 0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <AnimatePresence mode="wait">
                                        {remainingDebt > 0 ? (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} key="debt">
                                                <Alert severity="warning" sx={{ mt: 3, borderRadius: '16px', fontWeight: 600 }}>
                                                    Dette restante après opération : {UtilMethods.formatNumber(remainingDebt ?? 0)}
                                                </Alert>
                                            </motion.div>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} key="success">
                                                <Alert severity="success" sx={{ mt: 3, borderRadius: '16px', fontWeight: 600 }}>
                                                    Félicitations ! Toutes les dettes sont apurées.
                                                </Alert>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{
                p: 3,
                bgcolor: '#f8fafc',
                borderTop: '1px solid rgba(0,0,0,0.05)',
                gap: 2
            }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="text"
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        color: '#64748b',
                        px: 3
                    }}
                >
                    Annuler
                </Button>
                {hasDebts ? (
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={loading || (!useExcess && !useCompanyBalance)}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                        sx={{
                            borderRadius: '14px',
                            textTransform: 'none',
                            fontWeight: 800,
                            px: 4,
                            py: 1.2,
                            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
                            bgcolor: '#4f46e5',
                            '&:hover': { bgcolor: '#4338ca' }
                        }}
                    >
                        {loading ? 'Traitement en cours...' : 'Confirmer le Recouvrement'}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={() => onConfirm(false, true)}
                        disabled={loading}
                        startIcon={<CheckCircle />}
                        sx={{
                            borderRadius: '14px',
                            textTransform: 'none',
                            fontWeight: 800,
                            px: 4,
                            py: 1.2,
                            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                            bgcolor: '#10b981',
                            '&:hover': { bgcolor: '#059669' }
                        }}
                    >
                        Valider & Continuer
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default DebtRecoveryModal;
