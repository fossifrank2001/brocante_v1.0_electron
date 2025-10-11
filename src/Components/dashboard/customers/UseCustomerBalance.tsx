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
} from '@mui/material';
import InvoiceAPI, { IUseCustomerBalanceResponse } from '@/Data/Api/Invoice';
import Toast from '@/Data/Utilities/Toast';
import { IPerson } from '@/Data/Interfaces/Person';
import UtilMethods from "Data/Utilities/UtilMethods.ts";

interface UseCustomerBalanceProps {
    customer: IPerson;
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const UseCustomerBalance = ({ customer, open, onClose, onSuccess }: UseCustomerBalanceProps) => {
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
            Toast.error(error?.response?.data?.message || 'Erreur lors de l\'utilisation du solde');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowResult(false);
        setResult(null);
        onClose();
    };

    const remainingBalance = customer.remaining_balance 
        ? JSON.parse(customer.remaining_balance) 
        : {};
    const hasDebts = Object.keys(remainingBalance).length > 0;
    const totalDebts = Object.values(remainingBalance).reduce((sum: number, amount: any) => sum + parseFloat(amount), 0);

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ 
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5'
            }}>
                <Typography variant="h6">
                    Utiliser le Solde Client
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {!showResult ? (
                    <Box>
                        {/* Informations Client */}
                        <Box sx={{ 
                            mb: 3, 
                            p: 2, 
                            backgroundColor: '#f0f7ff',
                            borderRadius: 1,
                            border: '1px solid #bbdefb'
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Client: {customer.firstname} {customer.lastname}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                Téléphone: {customer.phone}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                Solde disponible: {customer.company_balance?.toFixed(2) || '0.00'}
                            </Typography>
                        </Box>

                        {/* Vérifications */}
                        {customer.company_balance === 0 || !customer.company_balance ? (
                            <Alert severity="warning">
                                <AlertTitle>Aucun solde disponible</AlertTitle>
                                Le client n'a pas de solde disponible pour régler ses dettes.
                            </Alert>
                        ) : !hasDebts ? (
                            <Alert severity="info">
                                <AlertTitle>Aucune dette</AlertTitle>
                                Le client n'a aucune dette impayée.
                            </Alert>
                        ) : (
                            <>
                                {/* Résumé des Dettes */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Dettes à régler:
                                    </Typography>
                                    {Object.entries(remainingBalance).map(([sellCode, amount]: [string, any]) => (
                                        <Box 
                                            key={sellCode} 
                                            sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                p: 1,
                                                backgroundColor: '#fff3e0',
                                                borderRadius: 1,
                                                mb: 1
                                            }}
                                        >
                                            <Typography>Vente {sellCode}</Typography>
                                            <Typography sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                                                {parseFloat(amount).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    ))}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        backgroundColor: '#ffebee',
                                        borderRadius: 1,
                                        mt: 2
                                    }}>
                                        <Typography sx={{ fontWeight: 'bold' }}>Total des dettes:</Typography>
                                        <Typography sx={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.1rem' }}>
                                            {UtilMethods.formatNumber(totalDebts.toFixed(2))}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Prévisualisation */}
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <AlertTitle>Prévisualisation</AlertTitle>
                                    {customer.company_balance >= totalDebts ? (
                                        <>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                ✅ Le solde client couvre toutes les dettes
                                            </Typography>
                                            <Typography variant="body2">
                                                Solde restant après paiement: {UtilMethods.formatNumber((customer.company_balance - totalDebts).toFixed(2))}
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                ⚠️ Le solde client couvre partiellement les dettes
                                            </Typography>
                                            <Typography variant="body2">
                                                Montant qui sera utilisé: {UtilMethods.formatNumber(customer.company_balance.toFixed(2))}
                                            </Typography>
                                            <Typography variant="body2">
                                                Dettes restantes après: {UtilMethods.formatNumber((totalDebts - customer.company_balance).toFixed(2))}
                                            </Typography>
                                        </>
                                    )}
                                </Alert>
                            </>
                        )}
                    </Box>
                ) : (
                    // Affichage des résultats
                    <Box>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            <AlertTitle>Opération réussie !</AlertTitle>
                            Le solde client a été utilisé pour régler les dettes
                        </Alert>

                        {result && (
                            <Box sx={{ 
                                display: 'grid',
                                gap: 2
                            }}>
                                {/* Résumé Client */}
                                <Box sx={{ 
                                    p: 2, 
                                    backgroundColor: '#f0f7ff',
                                    borderRadius: 1,
                                    border: '1px solid #bbdefb'
                                }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Résumé Client
                                    </Typography>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography>Solde précédent:</Typography>
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {UtilMethods.formatNumber(result.customer.previous_balance.toFixed(2))}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography>Montant utilisé:</Typography>
                                            <Typography sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                                -{UtilMethods.formatNumber(result.customer.balance_used.toFixed(2))}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #bbdefb' }}>
                                            <Typography sx={{ fontWeight: 'bold' }}>Nouveau solde:</Typography>
                                            <Typography sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1.1rem' }}>
                                                {UtilMethods.formatNumber(result.customer.new_balance.toFixed(2))}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Dettes Couvertes */}
                                {result.balance_usage.covered_debts.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Dettes Payées ({result.balance_usage.covered_debts.length})
                                        </Typography>
                                        {result.balance_usage.covered_debts.map((debt, index) => (
                                            <Box 
                                                key={index} 
                                                sx={{ 
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    backgroundColor: '#e8f5e9',
                                                    borderRadius: 1,
                                                    border: '1px solid #81c784',
                                                    mb: 1
                                                }}
                                            >
                                                <Box>
                                                    <Typography sx={{ fontWeight: 500 }}>
                                                        Vente {debt.sale_id}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                                        Payé avec solde client
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                    {UtilMethods.formatNumber(debt.amount_covered.toFixed(2))}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                {/* Dettes Restantes */}
                                {result.balance_usage.remaining_debts.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Dettes Restantes ({result.balance_usage.remaining_debts.length})
                                        </Typography>
                                        {result.balance_usage.remaining_debts.map((debt, index) => (
                                            <Box 
                                                key={index} 
                                                sx={{ 
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    p: 1.5,
                                                    backgroundColor: '#fff3e0',
                                                    borderRadius: 1,
                                                    border: '1px solid #ffb74d',
                                                    mb: 1
                                                }}
                                            >
                                                <Typography>Vente {debt.sale_id}</Typography>
                                                <Typography sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                                                    {UtilMethods.formatNumber(debt.remaining_amount.toFixed(2))}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ 
                borderTop: '1px solid #e0e0e0',
                p: 2
            }}>
                {!showResult ? (
                    <>
                        <Button onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUseBalance}
                            disabled={loading || !hasDebts || !customer.company_balance || customer.company_balance === 0}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            {loading ? 'Traitement...' : 'Utiliser le Solde'}
                        </Button>
                    </>
                ) : (
                    <Button 
                        variant="contained" 
                        onClick={handleClose}
                    >
                        Fermer
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default UseCustomerBalance;
