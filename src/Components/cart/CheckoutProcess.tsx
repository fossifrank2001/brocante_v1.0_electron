import React, { useState, useCallback, useEffect } from 'react';
import { motion } from "framer-motion";
import { IPerson } from "Data/Interfaces/Person";
import {
    Autocomplete, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Box, Typography, Chip, Alert, Divider, Card, CardContent,
    Button, Grid, IconButton, Tooltip, Zoom, CircularProgress
} from "@mui/material";
import {
    Refresh, PersonAdd, AccountCircle, CreditCard, Warning, AttachMoney, Phone, Close, Save
} from "@mui/icons-material";
import { FormikProps } from "formik";
import { FormValues } from "Components/cart/MultiStepFormCart";
import CustomerAPI from "Data/Api/Customer";
import Toast from "Data/Utilities/Toast";
import UtilMethods from "Data/Utilities/UtilMethods";
import { ICartState } from "Data/Slices/dashboard/seller/cartSlice.ts";

interface CheckoutProcessProps {
    persons: IPerson[];
    paymentModes: string[];
    payment: string;
    onHandleSettingPayment: (payment: string) => void;
    onPersonChange: (person: IPerson) => void;
    onHandleSearchCustomer: (qPerson: string) => void;
    onAddPerson: (person: IPerson) => void;
    formik: FormikProps<FormValues>;
    cart: ICartState;
    onRefreshPersons: () => void;
}

export default function CheckoutProcess({
    persons,
    paymentModes,
    onHandleSettingPayment,
    onPersonChange,
    payment,
    onAddPerson,
    formik,
    cart,
    onRefreshPersons
}: CheckoutProcessProps) {
    const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
    const [open, setOpen] = useState(false);
    const [newPerson, setNewPerson] = useState<IPerson>({ id: 0, lastname: '', firstname: '', phone: '' });
    const [customerDebts, setCustomerDebts] = useState<Record<string, number>>({});
    const [totalDebts, setTotalDebts] = useState(0);
    const [formErrors, setFormErrors] = useState({ phone: '', lastname: '', firstname: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [useCompanyBalance, setUseCompanyBalance] = useState(false);

    const companyBalance = selectedPerson?.company_balance || 0;
    const companyBalanceToUse = useCompanyBalance ? Math.min(companyBalance, cart.totalPrice) : 0;
    const priceAfterBalance = cart.totalPrice - companyBalanceToUse;

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => {
        setOpen(false);
        setNewPerson({ id: 0, lastname: '', firstname: '', phone: '' });
        setFormErrors({ phone: '', lastname: '', firstname: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPerson(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAddPerson = async () => {
        const newErrors = { phone: '', lastname: '', firstname: '' };
        let valid = true;
        if (!newPerson.lastname) { newErrors.lastname = 'Nom requis'; valid = false; }
        if (!newPerson.firstname) { newErrors.firstname = 'Prénom requis'; valid = false; }
        if (!newPerson.phone) { newErrors.phone = 'Téléphone requis'; valid = false; }
        setFormErrors(newErrors);
        if (!valid) return;
        try {
            setIsLoading(true);
            const { data: createdPerson }: any = await CustomerAPI.create(newPerson);
            onAddPerson(createdPerson);
            await formik.setFieldValue('person', createdPerson);
            Toast.success('Client ajouté avec succès');
            handleCloseDialog();
        } catch {
            Toast.error('Échec de l\'ajout du client');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        try {
            setIsRefreshing(true);
            await onRefreshPersons();
        } catch {
            Toast.error("Échec du rechargement");
        } finally {
            setIsRefreshing(false);
        }
    }, [onRefreshPersons]);

    // Auto-prefill amount_paid when transactionType is 'total'
    useEffect(() => {
        if (formik.values.transactionType === 'total') {
            formik.setFieldValue('amount_paid', priceAfterBalance);
        }
    }, [formik.values.transactionType, priceAfterBalance]);

    const needsDateToPay = formik.values.transactionType === 'advance' || formik.values.transactionType === 'loan';

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>

                {/* Total Summary Card */}
                <Grid item xs={12}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: '24px',
                                border: '1px solid rgba(79, 70, 229, 0.1)',
                                bgcolor: 'rgba(79, 70, 229, 0.03)',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <Box sx={{
                                position: 'absolute', top: -20, right: -20,
                                width: 120, height: 120,
                                borderRadius: '50%', bgcolor: 'rgba(79, 70, 229, 0.05)'
                            }} />

                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            p: 1.5, borderRadius: '16px',
                                            bgcolor: 'white', color: '#4f46e5',
                                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)'
                                        }}>
                                            <AttachMoney />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {useCompanyBalance && companyBalanceToUse > 0 ? 'Montant Final' : 'Total à payer'}
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                                {UtilMethods.formatNumber(useCompanyBalance ? (priceAfterBalance ?? 0) : (cart?.totalPrice ?? 0))}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {useCompanyBalance && companyBalanceToUse > 0 && (
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1rem', display: 'block' }}>
                                                {UtilMethods.formatNumber(cart?.totalPrice ?? 0)}
                                            </Typography>
                                            <Chip
                                                label={`Solde utilisé: -${UtilMethods.formatNumber(companyBalanceToUse ?? 0)}`}
                                                size="small"
                                                sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, borderRadius: '8px', mt: 1 }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                {/* Client Selection Card */}
                <Grid item xs={12}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{
                                            p: 1, borderRadius: '12px',
                                            bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2'
                                        }}>
                                            <AccountCircle fontSize="small" />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>Sélection du Client</Typography>
                                        {formik.values.transactionType === 'total' && (
                                            <Chip
                                                label="Optionnel"
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                                                    color: '#059669',
                                                    fontWeight: 700,
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<PersonAdd />}
                                            onClick={handleOpenDialog}
                                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Nouveau
                                        </Button>
                                        <Tooltip title="Actualiser la liste">
                                            <IconButton
                                                size="small"
                                                onClick={handleRefresh}
                                                disabled={isRefreshing}
                                                sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px' }}
                                            >
                                                <Refresh sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                                <Autocomplete
                                    options={persons}
                                    loading={isRefreshing}
                                    disabled={isRefreshing}
                                    fullWidth
                                    getOptionLabel={(option) => {
                                        const b = option?.company_balance || 0;
                                        return `${option?.firstname ?? ''} ${option?.lastname ?? ''}${b > 0 ? ` (+${UtilMethods.formatNumber(b)})` : ''}`;
                                    }}
                                    renderOption={(props, option) => {
                                        const balance = option?.company_balance || 0;
                                        const debts: Record<string, string> = option?.remaining_balance ? JSON.parse(option.remaining_balance) : {};
                                        const totalDebt = Object.values(debts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
                                        return (
                                            <Box component="li" {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start !important', py: 1.5, px: 2 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {option.firstname} {option.lastname}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>{option.phone}</Typography>
                                                    {balance > 0 && (
                                                        <Chip
                                                            label={`Balance: +${UtilMethods.formatNumber(balance)}`}
                                                            size="small"
                                                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, borderRadius: '6px' }}
                                                        />
                                                    )}
                                                    {totalDebt > 0 && (
                                                        <Chip
                                                            label={`Dette: ${UtilMethods.formatNumber(totalDebt)}`}
                                                            size="small"
                                                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, borderRadius: '6px' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Rechercher ou sélectionner un client"
                                            sx={{
                                                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                                            }}
                                        />
                                    )}
                                    onChange={async (_, value) => {
                                        if (value) {
                                            setSelectedPerson(value);
                                            onPersonChange(value);
                                            await formik.setFieldValue('person', value);
                                            const debts: Record<string, string> = value.remaining_balance ? JSON.parse(value.remaining_balance) : {};
                                            const debtsNum = Object.fromEntries(Object.entries(debts).map(([k, v]) => [k, parseFloat(v)]));
                                            setCustomerDebts(debtsNum);
                                            setTotalDebts(Object.values(debtsNum).reduce((s, v) => s + v, 0));
                                        } else {
                                            setSelectedPerson(null);
                                            setCustomerDebts({});
                                            setTotalDebts(0);
                                        }
                                    }}
                                    value={formik.values.person}
                                />

                                {/* Alert: client requis pour advance/loan */}
                                {!selectedPerson && formik.values.transactionType !== 'total' && (
                                    <Alert
                                        severity="warning"
                                        sx={{
                                            mt: 2,
                                            borderRadius: '12px',
                                            bgcolor: 'rgba(245, 158, 11, 0.08)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e' }}>
                                            Le client est obligatoire pour les transactions de type <strong>{formik.values.transactionType === 'advance' ? 'Acompte' : 'Crédit'}</strong>.
                                        </Typography>
                                    </Alert>
                                )}

                                {/* Company Balance Usage */}
                                {selectedPerson && companyBalance > 0 && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <Box sx={{
                                            mt: 3, p: 2,
                                            bgcolor: 'rgba(16, 185, 129, 0.04)',
                                            borderRadius: '16px',
                                            border: '1px dashed rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AttachMoney sx={{ color: '#10b981', fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#065f46' }}>Portefeuille Client (Solde Entreprise)</Typography>
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                                                    {UtilMethods.formatNumber(companyBalance ?? 0)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
                                                <input
                                                    type="checkbox"
                                                    id="use_balance"
                                                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#10b981' }}
                                                    checked={useCompanyBalance}
                                                    onChange={(e) => {
                                                        setUseCompanyBalance(e.target.checked);
                                                        formik.setFieldValue('use_company_balance', e.target.checked);
                                                    }}
                                                />
                                                <label htmlFor="use_balance" style={{ cursor: 'pointer' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>Utiliser ce solde pour régler cet achat</Typography>
                                                </label>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                )}

                                {/* Debt Warning */}
                                {totalDebts > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Alert
                                            severity="warning"
                                            icon={<Warning sx={{ color: '#991b1b' }} />}
                                            sx={{
                                                mt: 3,
                                                borderRadius: '16px',
                                                bgcolor: 'rgba(239, 68, 68, 0.05)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                '& .MuiAlert-message': { width: '100%' }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b' }}>Dettes impayées détectées</Typography>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b' }}>{UtilMethods.formatNumber(totalDebts ?? 0)}</Typography>
                                            </Box>
                                            <Box sx={{ pl: 0.5 }}>
                                                {Object.entries(customerDebts).map(([code, amt]) => (
                                                    <Box key={code} sx={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 500 }}>Vente ref. {code}</Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{UtilMethods.formatNumber(Number(amt) || 0)}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Alert>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                {/* Payment Mode Selection Card */}
                <Grid item xs={12}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Box sx={{
                                        p: 1, borderRadius: '12px',
                                        bgcolor: 'rgba(123, 31, 162, 0.1)', color: '#7b1fa2'
                                    }}>
                                        <CreditCard fontSize="small" />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>Mode de paiement</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {paymentModes.map((mode) => (
                                        <Chip
                                            key={mode}
                                            label={mode}
                                            onClick={() => {
                                                onHandleSettingPayment(mode);
                                                formik.setFieldValue('payment', mode);
                                            }}
                                            variant={payment === mode ? 'filled' : 'outlined'}
                                            sx={{
                                                px: 1,
                                                py: 2.5,
                                                fontWeight: 700,
                                                borderRadius: '12px',
                                                transition: 'all 0.2s',
                                                borderWidth: '2px',
                                                borderColor: payment === mode ? '#7b1fa2' : 'rgba(0,0,0,0.1)',
                                                bgcolor: payment === mode ? '#7b1fa2' : 'transparent',
                                                color: payment === mode ? 'white' : 'text.primary',
                                                '&:hover': {
                                                    borderColor: '#7b1fa2',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                {/* Transaction Details Card */}
                <Grid item xs={12}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            overflow: 'visible'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Box sx={{
                                        p: 1, borderRadius: '12px',
                                        bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#0ea5e9'
                                    }}>
                                        <AttachMoney fontSize="small" />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>Détails de la Transaction</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1.5, mb: 4, p: 0.5, bgcolor: '#f8fafc', borderRadius: '16px' }}>
                                    {[
                                        { value: 'total', label: 'Paiement Total', icon: '✅' },
                                        { value: 'advance', label: 'Acompte / Avance', icon: '⏳' },
                                        { value: 'loan', label: 'Crédit / Prêt', icon: '🤝' }
                                    ].map((t) => (
                                        <Button
                                            key={t.value}
                                            variant={formik.values.transactionType === t.value ? 'contained' : 'text'}
                                            onClick={() => {
                                                formik.setFieldValue('transactionType', t.value);
                                                formik.setFieldValue('amount_paid', 0);
                                                formik.setFieldValue('advanceAmount', 0);
                                            }}
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                flexGrow: 1,
                                                py: 1.5,
                                                fontWeight: 700,
                                                bgcolor: formik.values.transactionType === t.value ? 'white' : 'transparent',
                                                color: formik.values.transactionType === t.value ? '#0f172a' : '#64748b',
                                                boxShadow: formik.values.transactionType === t.value ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                                                '&:hover': {
                                                    bgcolor: formik.values.transactionType === t.value ? 'white' : 'rgba(0,0,0,0.04)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="caption" sx={{ fontSize: '1.2rem' }}>{t.icon}</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.label}</Typography>
                                            </Box>
                                        </Button>
                                    ))}
                                </Box>

                                <Grid container spacing={3}>
                                    {formik.values.transactionType === 'total' && (
                                        <Grid item xs={12}>
                                            <TextField
                                                type="number"
                                                label="Montant réglé (Paiement Total)"
                                                variant="outlined"
                                                fullWidth
                                                value={formik.values.amount_paid || ''}
                                                onChange={(e) => formik.setFieldValue('amount_paid', parseFloat(e.target.value) || 0)}
                                                error={!!formik.errors.amount_paid && formik.touched.amount_paid}
                                                helperText={formik.touched.amount_paid && formik.errors.amount_paid}
                                                InputProps={{
                                                    sx: {
                                                        borderRadius: '16px',
                                                        bgcolor: 'rgba(248, 250, 252, 0.8)',
                                                        fontWeight: 800,
                                                        fontSize: '1.1rem',
                                                        color: '#1e293b',
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(79, 70, 229, 0.2)',
                                                            borderWidth: '2px'
                                                        }
                                                    },
                                                    startAdornment: <AttachMoney sx={{ color: '#4f46e5', mr: 1, fontSize: 24 }} />,
                                                    readOnly: true
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block', px: 1, fontWeight: 500 }}>
                                                Le montant est automatiquement calculé pour un paiement complet.
                                            </Typography>
                                            {formik.values.amount_paid > 0 && (
                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                                    <Box sx={{
                                                        mt: 2, p: 2,
                                                        bgcolor: 'rgba(16, 185, 129, 0.05)',
                                                        borderRadius: '16px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ p: 0.5, borderRadius: '6px', bgcolor: '#dcfce7', color: '#166534' }}>
                                                                <Save sx={{ fontSize: 16 }} />
                                                            </Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#065f46' }}>
                                                                Transaction validée (Montant Exact)
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 900, color: '#059669', fontSize: '1rem' }}>
                                                            {UtilMethods.formatNumber(formik?.values?.amount_paid ?? 0)}
                                                        </Typography>
                                                    </Box>
                                                </motion.div>
                                            )}
                                        </Grid>
                                    )}

                                    {formik.values.transactionType === 'advance' && (
                                        <Grid item xs={12}>
                                            <TextField
                                                type="number"
                                                label="Montant de l'avance"
                                                variant="outlined"
                                                fullWidth
                                                value={formik.values.advanceAmount || ''}
                                                onChange={(e) => {
                                                    const v = parseFloat(e.target.value) || 0;
                                                    formik.setFieldValue('advanceAmount', v);
                                                    formik.setFieldValue('amount_paid', v);
                                                }}
                                                error={!!formik.errors.advanceAmount && formik.touched.advanceAmount}
                                                helperText={formik.touched.advanceAmount && formik.errors.advanceAmount}
                                                InputProps={{
                                                    sx: { borderRadius: '12px' },
                                                    startAdornment: <AttachMoney sx={{ color: '#94a3b8', mr: 1 }} />
                                                }}
                                            />
                                            {formik.values.advanceAmount > 0 && (
                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(14, 165, 233, 0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0369a1' }}>Reste à payer (Dette)</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0284c7' }}>
                                                            {UtilMethods.formatNumber((priceAfterBalance ?? 0) - (formik?.values?.advanceAmount ?? 0))}
                                                        </Typography>
                                                    </Box>
                                                </motion.div>
                                            )}
                                        </Grid>
                                    )}

                                    {formik.values.transactionType === 'loan' && (
                                        <Grid item xs={12}>
                                            <Alert severity="info" sx={{ borderRadius: '16px', bgcolor: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                                <Typography variant="body2" sx={{ color: '#0369a1' }}>
                                                    La totalité du montant (<strong>{UtilMethods.formatNumber(priceAfterBalance ?? 0)}</strong>) sera enregistrée comme une dette à recouvrer.
                                                </Typography>
                                            </Alert>
                                        </Grid>
                                    )}

                                    {needsDateToPay && (
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                                            <TextField
                                                type="date"
                                                label="Date limite de règlement"
                                                variant="outlined"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={formik.values.date_to_pay || ''}
                                                onChange={(e) => formik.setFieldValue('date_to_pay', e.target.value)}
                                                error={!!formik.errors.date_to_pay && formik.touched.date_to_pay}
                                                helperText={formik.touched.date_to_pay && (formik.errors.date_to_pay as string)}
                                                InputProps={{
                                                    sx: { borderRadius: '12px' }
                                                }}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                {/* Confirm Checkbox */}
                <Grid item xs={12}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Box sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: formik.values.has_authorized ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                            border: `1px solid ${formik.values.has_authorized ? 'rgba(79, 70, 229, 0.2)' : 'rgba(0,0,0,0.05)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.3s'
                        }}>
                            <input
                                type="checkbox"
                                id="has_authorized"
                                style={{ width: 22, height: 22, cursor: 'pointer', accentColor: '#4f46e5' }}
                                checked={formik.values.has_authorized}
                                onChange={(e) => formik.setFieldValue('has_authorized', e.target.checked)}
                            />
                            <label htmlFor="has_authorized" style={{ cursor: 'pointer', flexGrow: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: formik.values.has_authorized ? '#1e293b' : '#64748b' }}>
                                    Je certifie l'exactitude des informations et j'autorise la validation de cette vente.
                                </Typography>
                            </label>
                        </Box>
                    </motion.div>
                </Grid>

            </Grid>

            {/* Dialog Nouveau Client Ultra-Premium */}
            <Dialog
                open={open}
                onClose={handleCloseDialog}
                maxWidth="xs"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: '32px',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.25)',
                        overflow: 'visible'
                    }
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    right: -12,
                    top: -12,
                    zIndex: 1
                }}>
                    <IconButton
                        onClick={handleCloseDialog}
                        sx={{
                            bgcolor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </Box>

                <DialogTitle sx={{ p: 4, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 24px -6px rgba(99, 102, 241, 0.4)',
                            flexShrink: 0
                        }}>
                            <PersonAdd sx={{ fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                                Nouveau Client
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                Créez un profil client premium
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 4, pt: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Nom de famille"
                                    name="lastname"
                                    placeholder="Dupont"
                                    value={newPerson.lastname}
                                    onChange={handleInputChange}
                                    error={Boolean(formErrors.lastname)}
                                    helperText={formErrors.lastname}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        sx: { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 600 },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Prénom"
                                    name="firstname"
                                    placeholder="Jean"
                                    value={newPerson.firstname}
                                    onChange={handleInputChange}
                                    error={Boolean(formErrors.firstname)}
                                    helperText={formErrors.firstname}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        sx: { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 600 },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Numéro de Téléphone"
                                    name="phone"
                                    placeholder="+221 ..."
                                    value={newPerson.phone}
                                    onChange={handleInputChange}
                                    error={Boolean(formErrors.phone)}
                                    helperText={formErrors.phone}
                                    fullWidth
                                    InputProps={{
                                        sx: { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 700 },
                                        startAdornment: <Phone sx={{ color: '#6366f1', mr: 1.5, fontSize: 20 }} />
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{
                            mt: 1,
                            p: 2,
                            borderRadius: '20px',
                            bgcolor: 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'white' }}>
                                <Warning sx={{ fontSize: 18, color: '#f59e0b' }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#4338ca', fontWeight: 700, lineHeight: 1.4 }}>
                                Assurez-vous que les informations sont correctes pour un suivi optimal.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 4, pt: 2, gap: 1.5 }}>
                    <Button
                        fullWidth
                        onClick={handleCloseDialog}
                        sx={{
                            py: 1.5,
                            borderRadius: '16px',
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                        }}
                    >
                        Plus tard
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleAddPerson}
                        disabled={isLoading}
                        sx={{
                            py: 1.5,
                            borderRadius: '16px',
                            fontWeight: 800,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
