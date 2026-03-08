import React, { useState, useEffect, useCallback } from 'react';
import {
    Drawer, Box, Typography, IconButton, TextField, Button,
    CircularProgress, Chip, Grid, Autocomplete, Alert, Dialog
} from '@mui/material';
import { Close, Payment, PointOfSale, AccountCircle, AttachMoney, PersonAdd } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { clearCart } from '@/Data/Slices/dashboard/seller/cartSlice';
import { incrementSalesCount, addToTotalSales } from '@/Data/Slices/dashboard/cashSessionSlice';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import SellAPI from '@/Data/Api/Sell';
import CustomerAPI from '@/Data/Api/Customer';
import { IPerson } from '@/Data/Interfaces/Person';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Toast from '@/Data/Utilities/Toast';
import ActivityLogService from '@/Services/ActivityLogService';
import { TPayment, TTransactionType } from '@/Data/Interfaces/Sell';
import PrintDialog from './PrintDialog';
import { ISellWithDetails } from '@/Services/ReceiptTemplate';

interface PosCheckoutDrawerProps {
    open: boolean;
    onClose: () => void;
}

const paymentMethods = ['Cash', 'Orange Money', 'MTN Money'];
const predefinedAmounts = [500, 1000, 2000, 5000, 10000];

const PosCheckoutDrawer: React.FC<PosCheckoutDrawerProps> = ({ open, onClose }) => {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart);
    const { currentSession } = useAppSelector(state => state.cashSession);
    const activityLogService = ActivityLogService.getInstance();
    // Core States
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<TPayment>('Cash');
    const [transactionType, setTransactionType] = useState<TTransactionType>('total');
    // Amounts
    const [amountGiven, setAmountGiven] = useState<string>(''); // Used for 'total' and 'advance'
    // Customer
    const [persons, setPersons] = useState<IPerson[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
    const [loadingPersons, setLoadingPersons] = useState(false);
    const [useCompanyBalance, setUseCompanyBalance] = useState(false);
    // New Customer Dialog
    const [openAddCustomer, setOpenAddCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ firstname: '', lastname: '', phone: '' });
    const [submittingCustomer, setSubmittingCustomer] = useState(false);

    // Printing
    const [printOpen, setPrintOpen] = useState(false);
    const [lastSellData, setLastSellData] = useState<ISellWithDetails | null>(null);

    // Dates
    const today = new Date().toISOString().split('T')[0];
    const [dateToPay, setDateToPay] = useState<string>(today);
    // Derived values
    const companyBalance = selectedPerson?.company_balance || 0;

    const totalDebtAmount = React.useMemo(() => {
        const remaining = selectedPerson?.remaining_balance as any;
        if (!remaining) return 0;
        try {
            const debts = typeof remaining === 'string' ? JSON.parse(remaining) : remaining;
            if (typeof debts === 'object' && debts !== null) {
                return Object.values(debts).reduce((acc: number, val: any) => acc + (parseFloat(val) || 0), 0);
            }
        } catch (e) {
            console.error('Error parsing remaining_balance', e);
        }
        return 0;
    }, [selectedPerson]);

    const companyBalanceToUse = useCompanyBalance ? Math.min(companyBalance, cart.totalPrice) : 0;
    const priceAfterBalance = cart.totalPrice - companyBalanceToUse;
    const actualAmountPaidInt = parseInt(amountGiven || '0', 10);
    const expectedChange = transactionType === 'total' ? Math.max(0, actualAmountPaidInt - priceAfterBalance) : 0;
    const needsCustomer = transactionType === 'advance' || transactionType === 'loan' || useCompanyBalance;
    const remainingBalance = transactionType === 'loan'
        ? priceAfterBalance
        : (transactionType === 'advance' ? Math.max(0, priceAfterBalance - actualAmountPaidInt) : 0);

    // Reset and Load
    useEffect(() => {
        if (open) {
            setPaymentMethod('Cash');
            setTransactionType('total');
            setAmountGiven(cart.totalPrice.toString());
            setSelectedPerson(null);
            setUseCompanyBalance(false);
            setDateToPay(today);
            getCustomers('');
        }
    }, [open, cart.totalPrice]);

    const getCustomers = useCallback(async (query: string) => {
        try {
            setLoadingPersons(true);
            const { data } = await CustomerAPI.get(query, true);
            setPersons(data || []);
        } catch (error) {
            console.error('Error fetching customers', error);
        } finally {
            setLoadingPersons(false);
        }
    }, []);

    // Effect for dynamic total updates
    useEffect(() => {
        if (transactionType === 'total') {
            setAmountGiven(priceAfterBalance.toString());
        } else if (transactionType === 'loan') {
            setAmountGiven('0');
        }
    }, [transactionType, priceAfterBalance]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setAmountGiven(val);
    };

    const handlePay = async () => {
        if (cart.items.length === 0) return;
        if (!currentSession) {
            Toast.error('Veuillez ouvrir une session de caisse.');
            return;
        }

        if (needsCustomer && !selectedPerson) {
            Toast.error('Un client est requis pour ce type de transaction.');
            return;
        }

        if (transactionType === 'advance' && actualAmountPaidInt <= 0) {
            Toast.error('Veuillez entrer un montant d\'avance valide.');
            return;
        }

        if (transactionType === 'total' && actualAmountPaidInt < priceAfterBalance) {
            Toast.error('Le montant reçu est insuffisant pour un règlement total.');
            return;
        }

        try {
            setLoading(true);

            const finalPaidAmount = transactionType === 'loan' ? 0 :
                (transactionType === 'total' ? priceAfterBalance : actualAmountPaidInt);

            const payload = {
                person_id: selectedPerson?.id || null,
                payment: paymentMethod,
                total_amount: cart.totalPrice,
                tax: 0,
                shipping_price: 0,
                transaction_type: transactionType,
                amount_paid: finalPaidAmount,
                remaining_balance: remainingBalance,
                date_to_pay: (transactionType === 'advance' || transactionType === 'loan') ? dateToPay : null,
                items: cart.items.map(item => ({
                    product_id: item.product.id,
                    price: item.product.price,
                    quantity: item.quantity,
                    total_unit: item.subtotal
                })),
                has_authorized: true,
                use_company_balance: useCompanyBalance,
                use_surplus_for_debts: true,
                cash_session_id: currentSession.id,
            };

            const result = await SellAPI.create(payload);

            if (paymentMethod === 'Cash' && finalPaidAmount > 0) {
                dispatch(incrementSalesCount());
                dispatch(addToTotalSales(finalPaidAmount));
            } else if (paymentMethod === 'Cash') {
                // Even for loans, increment sales count if processed through POS
                dispatch(incrementSalesCount());
            }

            activityLogService.logSale(
                result.data?.sell_code?.toString() || 'UNKNOWN',
                selectedPerson || { id: 0, name: 'Client Divers', surname: '' } as any,
                cart.items,
                cart.totalPrice,
                payload as any
            );

            Toast.success('Transaction validée avec succès !');
            dispatch(clearCart());

            // Prepare for printing
            if (result.data && (result.data as any).sell) {
                const sellObj = (result.data as any).sell;
                setLastSellData(sellObj);
                setPrintOpen(true);

                dispatch(setActivePage({
                    page: Pages.SUCCESS_ORDER,
                    param: {
                        type: transactionType,
                        number: sellObj.id, // Use ID for the API call
                        code: sellObj.sell_code // Pass the code for display before data loads
                    }
                }));
            } else {
                dispatch(setActivePage({
                    page: Pages.SUCCESS_ORDER,
                    param: { type: transactionType }
                }));
            }

        } catch (error) {
            console.error(error);
            Toast.error("Erreur lors de l'encaissement.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async () => {
        if (!newCustomer.firstname || !newCustomer.lastname || !newCustomer.phone) {
            Toast.error('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        try {
            setSubmittingCustomer(true);
            const { data }: any = await CustomerAPI.create(newCustomer as any);
            Toast.success('Client créé avec succès !');
            setPersons(prev => [data, ...prev]);
            setSelectedPerson(data);
            setOpenAddCustomer(false);
            setNewCustomer({ firstname: '', lastname: '', phone: '' });
        } catch (error) {
            console.error(error);
            Toast.error('Erreur lors de la création du client.');
        } finally {
            setSubmittingCustomer(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 550, md: 600 },
                    bgcolor: '#f8fafc',
                    boxShadow: '-10px 0 40px rgba(0,0,0,0.1)'
                }
            }}
        >
            {/* Header */}
            <Box sx={{ p: 3, bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
                        <PointOfSale />
                    </Box>
                    Processus d'Encaissement
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                    <Close />
                </IconButton>
            </Box>

            <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>

                {/* 1. Customer Selection */}
                <Box sx={{ mb: 4, p: 3, bgcolor: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <AccountCircle sx={{ color: '#1976d2' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Client (Optionnel)</Typography>
                        </Box>
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<PersonAdd />}
                            onClick={() => setOpenAddCustomer(true)}
                            sx={{ fontWeight: 800, textTransform: 'none', borderRadius: '8px' }}
                        >
                            Nouveau
                        </Button>
                    </Box>
                    <Autocomplete
                        options={persons}
                        loading={loadingPersons}
                        getOptionLabel={(option) => {
                            const b = option?.company_balance || 0;
                            return `${option?.firstname ?? ''} ${option?.lastname ?? ''}${b > 0 ? ` (+${UtilMethods.formatNumber(b)})` : ''}`;
                        }}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start !important', py: 1, px: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{option.firstname} {option.lastname}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>{option.phone}</Typography>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Rechercher un client..."
                                variant="outlined"
                                onChange={(e) => {
                                    getCustomers(e.target.value);
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                                }}
                            />
                        )}
                        value={selectedPerson}
                        onChange={(_, value) => setSelectedPerson(value)}
                    />

                    {selectedPerson && ((totalDebtAmount as any) > 0 || companyBalance > 0) && (
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {(totalDebtAmount as any) > 0 && (
                                <Box sx={{
                                    p: 1.5, bgcolor: '#fef2f2', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    border: '1px solid #fecaca'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#991b1b' }}>
                                        Dette totale impayée
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#b91c1c' }}>
                                        {UtilMethods.formatNumber(totalDebtAmount as any)}
                                    </Typography>
                                </Box>
                            )}

                            {companyBalance > 0 && (
                                <Box sx={{
                                    p: 1.5, bgcolor: '#ecfdf5', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', gap: 1.5,
                                    border: '1px solid #a7f3d0'
                                }}>
                                    <input
                                        type="checkbox"
                                        id="use_bal"
                                        checked={useCompanyBalance}
                                        onChange={(e) => setUseCompanyBalance(e.target.checked)}
                                        style={{ width: 18, height: 18, accentColor: '#10b981' }}
                                    />
                                    <label htmlFor="use_bal" style={{ cursor: 'pointer', flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#065f46' }}>
                                            Utiliser le solde disponible
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 900, color: '#047857' }}>
                                            +{UtilMethods.formatNumber(companyBalance)}
                                        </Typography>
                                    </label>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                <Box sx={{
                    p: 4, mb: 4, borderRadius: '24px', textAlign: 'center',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                    boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
                    color: '#ffffff',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                        Net à Payer
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
                        {UtilMethods.formatNumber(priceAfterBalance)}
                    </Typography>
                    {useCompanyBalance && companyBalanceToUse > 0 && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)', textDecoration: 'line-through' }}>
                            Avant déduction : {UtilMethods.formatNumber(cart.totalPrice)}
                        </Typography>
                    )}
                </Box>

                {/* 2. Transaction Type */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 1.5, textTransform: 'uppercase' }}>
                        Type de Transaction
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        {[
                            { value: 'total', label: 'Total', icon: '✅', color: '#10b981' },
                            { value: 'advance', label: 'Avance', icon: '⏳', color: '#f59e0b' },
                            { value: 'loan', label: 'Crédit', icon: '🤝', color: '#3b82f6' }
                        ].map((t) => (
                            <Button
                                key={t.value}
                                fullWidth
                                onClick={() => setTransactionType(t.value as TTransactionType)}
                                sx={{
                                    borderRadius: '12px', py: 1.5,
                                    bgcolor: transactionType === t.value ? `${t.color}15` : 'transparent',
                                    color: transactionType === t.value ? t.color : '#64748b',
                                    fontWeight: transactionType === t.value ? 800 : 600,
                                    boxShadow: transactionType === t.value ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    display: 'flex', flexDirection: 'column', gap: 0.5
                                }}
                            >
                                <Typography sx={{ fontSize: '1.2rem' }}>{t.icon}</Typography>
                                {t.label}
                            </Button>
                        ))}
                    </Box>
                </Box>

                {/* 3. Amounts & Payment Methods context */}
                {transactionType !== 'loan' && (
                    <Box sx={{ mb: 4, p: 3, bgcolor: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 1.5, textTransform: 'uppercase' }}>
                            Moyen de Paiement
                        </Typography>
                        <Grid container spacing={1.5} sx={{ mb: 3 }}>
                            {paymentMethods.map(method => (
                                <Grid item xs={6} key={method}>
                                    <Box
                                        onClick={() => setPaymentMethod(method as TPayment)}
                                        sx={{
                                            p: 1.5, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: paymentMethod === method ? '#6366f1' : 'rgba(0,0,0,0.05)',
                                            bgcolor: paymentMethod === method ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                            color: paymentMethod === method ? '#4f46e5' : '#64748b',
                                            fontWeight: paymentMethod === method ? 800 : 600,
                                        }}
                                    >
                                        {method}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 1.5, textTransform: 'uppercase' }}>
                            {transactionType === 'total' ? 'Montant Reçu' : 'Montant de l\'Avance'}
                        </Typography>
                        <TextField
                            fullWidth
                            value={amountGiven}
                            onChange={handleAmountChange}
                            placeholder="0"
                            InputProps={{
                                startAdornment: <AttachMoney sx={{ color: '#94a3b8', mr: 1 }} />,
                                endAdornment: <Typography sx={{ fontWeight: 800, color: '#64748b' }}>XAF</Typography>,
                                sx: {
                                    borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 900, fontSize: '1.2rem',
                                }
                            }}
                        />

                        {transactionType === 'total' && paymentMethod === 'Cash' && (
                            <>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                                    <Chip
                                        label="Exact"
                                        onClick={() => setAmountGiven(priceAfterBalance.toString())}
                                        sx={{ borderRadius: '8px', fontWeight: 800, bgcolor: '#e0e7ff', color: '#4f46e5' }}
                                    />
                                    {predefinedAmounts.map(amt => (
                                        <Chip
                                            key={amt}
                                            label={`+${UtilMethods.formatNumber(amt)}`}
                                            onClick={() => setAmountGiven((parseInt(amountGiven || '0') + amt).toString())}
                                            sx={{ borderRadius: '8px', fontWeight: 700, bgcolor: 'white', border: '1px solid rgba(0,0,0,0.1)' }}
                                        />
                                    ))}
                                </Box>

                                <Box sx={{
                                    mt: 3, p: 2, borderRadius: '16px',
                                    bgcolor: expectedChange > 0 ? '#dcfce7' : '#f8fafc',
                                    border: '1px solid',
                                    borderColor: expectedChange > 0 ? '#86efac' : 'rgba(0,0,0,0.05)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <Typography sx={{ fontWeight: 800, color: expectedChange > 0 ? '#166534' : '#64748b' }}>
                                        Monnaie à rendre
                                    </Typography>
                                    <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: expectedChange > 0 ? '#15803d' : '#94a3b8' }}>
                                        {UtilMethods.formatNumber(expectedChange)}
                                    </Typography>
                                </Box>
                            </>
                        )}

                        {transactionType === 'advance' && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#fffbed', borderRadius: '16px', border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ fontWeight: 700, color: '#b45309' }}>Reste à payer (Dette)</Typography>
                                <Typography sx={{ fontWeight: 900, color: '#b45309' }}>{UtilMethods.formatNumber(remainingBalance)}</Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Loan & Advance extras */}
                {(transactionType === 'loan' || transactionType === 'advance') && (
                    <Box sx={{ mb: 4, p: 3, bgcolor: 'white', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
                        {transactionType === 'loan' && (
                            <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
                                La totalité du montant ({UtilMethods.formatNumber(priceAfterBalance)}) sera classée en dette.
                            </Alert>
                        )}
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', mb: 1.5 }}>
                            Date limite de règlement
                        </Typography>
                        <TextField
                            type="date"
                            fullWidth
                            value={dateToPay}
                            onChange={(e) => setDateToPay(e.target.value)}
                            InputProps={{ sx: { borderRadius: '12px' } }}
                        />
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.06)', position: 'sticky', bottom: 0, zIndex: 10 }}>
                <Button
                    fullWidth variant="contained" size="large"
                    disabled={
                        loading ||
                        (needsCustomer && !selectedPerson) ||
                        (transactionType === 'total' && actualAmountPaidInt < priceAfterBalance) ||
                        (transactionType === 'advance' && actualAmountPaidInt <= 0)
                    }
                    onClick={handlePay}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Payment />}
                    sx={{
                        py: 2, borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem',
                        textTransform: 'uppercase', letterSpacing: '1px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)',
                        '&:hover': { boxShadow: '0 15px 25px -5px rgba(16, 185, 129, 0.5)' },
                        '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                    }}
                >
                    {loading ? 'Traitement...' : `Valider (${UtilMethods.formatNumber(priceAfterBalance)})`}
                </Button>
            </Box>

            {/* Dialog Nouveau Client */}
            <Dialog
                open={openAddCustomer}
                onClose={() => setOpenAddCustomer(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
            >
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PersonAdd color="primary" /> Nouveau Client
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Prénom"
                                fullWidth
                                value={newCustomer.firstname}
                                onChange={(e) => setNewCustomer(prev => ({ ...prev, firstname: e.target.value }))}
                                InputProps={{ sx: { borderRadius: '12px' } }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Nom"
                                fullWidth
                                value={newCustomer.lastname}
                                onChange={(e) => setNewCustomer(prev => ({ ...prev, lastname: e.target.value }))}
                                InputProps={{ sx: { borderRadius: '12px' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Téléphone"
                                fullWidth
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                                InputProps={{ sx: { borderRadius: '12px' } }}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setOpenAddCustomer(false)}
                            sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
                        >
                            Annuler
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            disabled={submittingCustomer}
                            onClick={handleAddCustomer}
                            sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
                        >
                            {submittingCustomer ? <CircularProgress size={24} /> : 'Enregistrer'}
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            <PrintDialog
                open={printOpen}
                onClose={() => {
                    setPrintOpen(false);
                    onClose(); // Close drawer after printing or canceling print
                }}
                sellData={lastSellData}
            />
        </Drawer>
    );
};

export default PosCheckoutDrawer;
