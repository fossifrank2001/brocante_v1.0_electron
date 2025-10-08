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
            <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 3,
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccountBalance sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Gestion du Recouvrement de Dettes
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Optimisez automatiquement le paiement des dettes
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <DialogContent sx={{ p: 3, backgroundColor: '#f5f7fa' }}>
                {!hasDebts ? (
                    <Alert 
                        severity="info" 
                        icon={<Info />}
                        sx={{ borderRadius: 2, mt: 2 }}
                    >
                        <AlertTitle sx={{ fontWeight: 'bold' }}>Aucune dette</AlertTitle>
                        Ce client n'a aucune dette impayée. L'excédent sera automatiquement ajouté à son solde client.
                    </Alert>
                ) : (
                    <Box>
                        {/* Résumé de la Transaction */}
                        <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '2px solid #667eea' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AttachMoney sx={{ color: '#667eea' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Résumé de la Transaction
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, backgroundColor: '#f3f4ff', borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary">Montant de la vente</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                                {UtilMethods.formatNumber(totalAmount)} FCFA
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary">Excédent de paiement</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                +{UtilMethods.formatNumber(excessAmount)} FCFA
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    {hasCompanyBalance && (
                                        <Grid item xs={12} md={4}>
                                            <Paper sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                                                <Typography variant="caption" color="text.secondary">Solde client</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                    {UtilMethods.formatNumber(companyBalance)} FCFA
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Dettes du Client */}
                        <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '2px solid #d32f2f' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Warning sx={{ color: '#d32f2f' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                        Dettes Impayées du Client
                                    </Typography>
                                </Box>
                                <Paper sx={{ p: 2, maxHeight: '200px', overflowY: 'auto', backgroundColor: '#fff', borderRadius: 2 }}>
                                    {Object.entries(remainingBalance).map(([sellCode, amount]: [string, any]) => (
                                        <Box 
                                            key={sellCode} 
                                            sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1.5,
                                                mb: 1,
                                                backgroundColor: '#ffebee',
                                                borderRadius: 2,
                                                border: '1px solid #ffcdd2'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TrendingDown sx={{ fontSize: 20, color: '#d32f2f' }} />
                                                <Typography sx={{ fontWeight: 500 }}>Vente {sellCode}</Typography>
                                            </Box>
                                            <Chip 
                                                label={`${UtilMethods.formatNumber(parseFloat(amount))} FCFA`}
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#d32f2f',
                                                    color: 'white'
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Paper>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    mt: 2,
                                    background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
                                    borderRadius: 2,
                                    color: 'white'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total des dettes</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {UtilMethods.formatNumber(totalDebts)} FCFA
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Options de Recouvrement */}
                        <Card elevation={0} sx={{ mb: 3, borderRadius: 3, backgroundColor: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                                    ⚙️ Options de Recouvrement
                                </Typography>

                                <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e8f5e9', borderRadius: 2, border: '1px solid #a5d6a7' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 600, color: '#2e7d32' }}>
                                                💰 Utiliser l'excédent de paiement
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Excédent : {UtilMethods.formatNumber(excessAmount)} FCFA
                                            </Typography>
                                        </Box>
                                        <Switch
                                            checked={useExcess}
                                            onChange={(e) => setUseExcess(e.target.checked)}
                                            color="success"
                                        />
                                    </Box>
                                </Paper>

                                {hasCompanyBalance && (
                                    <Paper sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
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
                        <Card 
                            elevation={3}
                            sx={{ 
                                borderRadius: 3,
                                background: remainingDebt === 0 
                                    ? 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)'
                                    : 'linear-gradient(135deg, #ed6c02 0%, #f57c00 100%)',
                                color: 'white'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    {remainingDebt === 0 ? <CheckCircle /> : <Warning />}
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Prévisualisation du Recouvrement
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1.5 }}>
                                    {useExcess && excessCoverage > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}>
                                            <Typography variant="body2">✅ Excédent utilisé</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {UtilMethods.formatNumber(excessCoverage)} FCFA
                                            </Typography>
                                        </Box>
                                    )}
                                    {useCompanyBalance && balanceCoverage > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}>
                                            <Typography variant="body2">✅ Solde client utilisé</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {UtilMethods.formatNumber(balanceCoverage)} FCFA
                                            </Typography>
                                        </Box>
                                    )}
                                    <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.3)', my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total couvert</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {UtilMethods.formatNumber(totalCoverage)} FCFA
                                        </Typography>
                                    </Box>
                                    {remainingDebt > 0 ? (
                                        <Alert severity="warning" sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                                            <Typography variant="body2">
                                                ⚠️ Dettes restantes : <strong>{UtilMethods.formatNumber(remainingDebt)} FCFA</strong>
                                            </Typography>
                                        </Alert>
                                    ) : (
                                        <Alert severity="success" sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
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

            <DialogActions sx={{ 
                p: 3,
                backgroundColor: '#f5f7fa',
                gap: 2
            }}>
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
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            background: remainingDebt === 0 
                                ? 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: remainingDebt === 0 
                                    ? 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)'
                                    : 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                            }
                        }}
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
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                    >
                        Continuer
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default DebtRecoveryModal;
