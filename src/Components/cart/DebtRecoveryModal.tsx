import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    AlertTitle,
    Checkbox,
    FormControlLabel,
    Divider,
    CircularProgress,
    Paper,
    Chip,
    Card,
    CardContent,
    Switch,
    Grid
} from '@mui/material';
import {
    AccountBalance,
    AttachMoney,
    Warning,
    CheckCircle,
    TrendingDown,
    Info
} from '@mui/icons-material';
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
    const totalDebts = Object.values(remainingBalance).reduce(
        (sum: number, amount: any) => sum + parseFloat(amount), 
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
                    borderRadius: 3,
                    overflow: 'hidden'
                }
            }}
        >
            <Box sx={{ p: 3, borderBottom: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccountBalance color="action" sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Gestion du recouvrement
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Utilisez l'excédent et le solde client pour réduire les dettes
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <DialogContent sx={{ p: 3, bgcolor: 'background.default' }}>
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
                        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AttachMoney color="action" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Résumé de la Transaction
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary">Montant de la vente</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {UtilMethods.formatNumber(totalAmount)} FCFA
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary">Excédent de paiement</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                +{UtilMethods.formatNumber(excessAmount)} FCFA
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    {hasCompanyBalance && (
                                        <Grid item xs={12} md={4}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                <Typography variant="caption" color="text.secondary">Solde client</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {UtilMethods.formatNumber(companyBalance)} FCFA
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Dettes du Client */}
                        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Warning color="warning" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Dettes Impayées du Client
                                    </Typography>
                                </Box>
                                <Paper variant="outlined" sx={{ p: 2, maxHeight: '200px', overflowY: 'auto', borderRadius: 2 }}>
                                    {Object.entries(remainingBalance).map(([sellCode, amount]: [string, any]) => (
                                        <Box 
                                            key={sellCode} 
                                            sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1,
                                                mb: 1,
                                                borderRadius: 1,
                                                border: (theme) => `1px solid ${theme.palette.divider}`
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TrendingDown color="action" sx={{ fontSize: 20 }} />
                                                <Typography sx={{ fontWeight: 500 }}>Vente {sellCode}</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {UtilMethods.formatNumber(parseFloat(amount))} FCFA
                                            </Typography>
                                        </Box>
                                    ))}
                                </Paper>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mt: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Total des dettes</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {UtilMethods.formatNumber(totalDebts)} FCFA
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Options de Recouvrement */}
                        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    ⚙️ Options de Recouvrement
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 600 }}>
                                                💰 Utiliser l'excédent de paiement
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Excédent : {UtilMethods.formatNumber(excessAmount)} FCFA
                                            </Typography>
                                        </Box>
                                        <Switch
                                            checked={useExcess}
                                            onChange={(e) => setUseExcess(e.target.checked)}
                                            color="primary"
                                        />
                                    </Box>
                                </Paper>

                                {hasCompanyBalance && (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontWeight: 600 }}>
                                                    🏦 Utiliser le solde client
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Solde disponible : {UtilMethods.formatNumber(companyBalance)} FCFA
                                                </Typography>
                                            </Box>
                                            <Switch
                                                checked={useCompanyBalance}
                                                onChange={(e) => setUseCompanyBalance(e.target.checked)}
                                                color="primary"
                                            />
                                        </Box>
                                    </Paper>
                                )}
                            </CardContent>
                        </Card>

                        {/* Prévisualisation */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    {remainingDebt === 0 ? <CheckCircle color="success" /> : <Warning color="warning" />}
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Prévisualisation du Recouvrement
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1.5 }}>
                                    {useExcess && excessCoverage > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                                            <Typography variant="body2">✅ Excédent utilisé</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {UtilMethods.formatNumber(excessCoverage)} FCFA
                                            </Typography>
                                        </Box>
                                    )}
                                    {useCompanyBalance && balanceCoverage > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                                            <Typography variant="body2">✅ Solde client utilisé</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {UtilMethods.formatNumber(balanceCoverage)} FCFA
                                            </Typography>
                                        </Box>
                                    )}
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Total couvert</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {UtilMethods.formatNumber(totalCoverage)} FCFA
                                        </Typography>
                                    </Box>
                                    {remainingDebt > 0 ? (
                                        <Alert severity="warning">
                                            <Typography variant="body2">
                                                ⚠️ Dettes restantes : <strong>{UtilMethods.formatNumber(remainingDebt)} FCFA</strong>
                                            </Typography>
                                        </Alert>
                                    ) : (
                                        <Alert severity="success">
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                🎉 Toutes les dettes seront couvertes !
                                            </Typography>
                                        </Alert>
                                    )}
                                    {!useExcess && !useCompanyBalance && (
                                        <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', opacity: 0.9 }}>
                                            L'excédent sera ajouté au solde client.
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'background.default', gap: 2 }}>
                <Button 
                    onClick={onClose} 
                    disabled={loading}
                    variant="outlined"
                    size="large"
                    sx={{ borderRadius: 2 }}
                >
                    Annuler
                </Button>
                {hasDebts && (
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={loading || (!useExcess && !useCompanyBalance)}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                        size="large"
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {loading ? 'Traitement en cours...' : 'Confirmer le Recouvrement'}
                    </Button>
                )}
                {!hasDebts && (
                    <Button
                        variant="contained"
                        onClick={() => onConfirm(false, true)}
                        disabled={loading}
                        size="large"
                        startIcon={<CheckCircle />}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        Continuer
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default DebtRecoveryModal;
