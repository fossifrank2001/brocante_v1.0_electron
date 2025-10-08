import React, { useState, useEffect, useCallback } from 'react';
import { IPerson } from "Data/Interfaces/Person";
import {
    Autocomplete, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Box, Typography, Chip, Alert, AlertTitle, Divider, Card, CardContent,
    Paper, Button, Grid
} from "@mui/material";
import {
    Refresh, PersonAdd, AccountCircle, CreditCard, CalendarMonth,
    CheckCircle, AttachMoney, AccountBalance, Warning
} from "@mui/icons-material";
import { FormikProps } from "formik";
import { FormValues } from "Components/cart/MultiStepFormCart";
import CustomerAPI from "Data/Api/Customer";
import Toast from "Data/Utilities/Toast";
import { IApiResponseBase } from 'Data/Utilities/axiosInstance';
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
    cart: ICartState | never;
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
    const [newPerson, setNewPerson] = useState<IPerson>({
        id: 0,
        lastname: '',
        firstname: '',
        phone: ''
    });
    const [customerDebts, setCustomerDebts] = useState<Record<string, number>>({});
    const [totalDebts, setTotalDebts] = useState(0);
    const [errors, setErrors] = useState({ phone: '', lastname: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        formik.setFieldValue('summarize.shippingPrice', 0);
    }, []);

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => {
        setOpen(false);
        setNewPerson({ id: 0, lastname: '', firstname: '', phone: '' });
        setErrors({ phone: '', lastname: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPerson({ ...newPerson, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleAddPerson = async () => {
        let valid = true;
        const newErrors = { phone: '', lastname: '' };

        if (!newPerson.lastname) {
            newErrors.lastname = 'Last name is required';
            valid = false;
        }
        if (!newPerson.phone) {
            newErrors.phone = 'Phone number is required';
            valid = false;
        }

        setErrors(newErrors);
        if (!valid) return;

        try {
            setIsLoading(true);
            const { data: createdPerson }: IApiResponseBase = await CustomerAPI.create(newPerson);
            onAddPerson(createdPerson);
            await formik.setFieldValue('person', createdPerson);
            Toast.success('Customer added successfully');
            handleCloseDialog();
        } catch (error) {
            Toast.error('Failed to add customer');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        try {
            setIsRefreshing(true);
            await onRefreshPersons();
        } catch (error) {
            Toast.error("Failed to refresh user data");
        } finally {
            setIsRefreshing(false);
        }
    }, [onRefreshPersons]);

    return (
        <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            <Grid container spacing={3}>
                {/* Informations Client Sélectionné */}
                {selectedPerson && (
                    <Grid item xs={12}>
                        <Card elevation={3} sx={{ borderRadius: 3, border: totalDebts > 0 ? '2px solid #ed6c02' : '2px solid #1976d2' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <AccountCircle sx={{ fontSize: 32, color: totalDebts > 0 ? '#ed6c02' : '#1976d2' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {selectedPerson.firstname} {selectedPerson.lastname}
                                    </Typography>
                                    <Chip label={selectedPerson.phone} size="small" variant="outlined" />
                                </Box>

                                {selectedPerson.company_balance && selectedPerson.company_balance > 0 && (
                                    <Alert severity="success" icon={<AccountBalance />} sx={{ mb: 2, borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2">💰 Solde de l'entreprise envers le client :</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                +{UtilMethods.formatNumber(selectedPerson.company_balance)} FCFA
                                            </Typography>
                                        </Box>
                                    </Alert>
                                )}

                                {totalDebts > 0 && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Alert severity="warning" icon={<Warning />} sx={{ borderRadius: 2 }}>
                                            <AlertTitle sx={{ fontWeight: 'bold' }}>⚠️ Dettes Impayées</AlertTitle>
                                            <Box sx={{ maxHeight: '150px', overflowY: 'auto', mt: 2 }}>
                                                {Object.entries(customerDebts).map(([sellCode, amount]: [string, any]) => (
                                                    <Box
                                                        key={sellCode}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            p: 1,
                                                            mb: 0.5,
                                                            backgroundColor: '#fff3e0',
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <Typography variant="body2">Vente {sellCode}</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                                            {UtilMethods.formatNumber(parseFloat(amount))} FCFA
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, p: 1.5, backgroundColor: '#ffebee', borderRadius: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total des dettes :</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                                    {UtilMethods.formatNumber(totalDebts)} FCFA
                                                </Typography>
                                            </Box>
                                        </Alert>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Montant Total de la Vente */}
                <Grid item xs={12}>
                    <Card elevation={3} sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AttachMoney sx={{ fontSize: 32 }} />
                                    <Typography variant="h6">Montant Total de la Vente</Typography>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                    {UtilMethods.formatNumber(cart.totalPrice)} <span style={{ fontSize: '0.5em' }}>FCFA</span>
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Section Client */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccountCircle /> Sélection du Client
                            </Typography>
                            <Autocomplete
                                options={persons}
                                loading={isRefreshing}
                                disabled={isRefreshing}
                                getOptionLabel={(option) => {
                                    const balance = option.company_balance || 0;
                                    const balanceText = balance > 0 ? ` (+${UtilMethods.formatNumber(balance)} FCFA)` : '';
                                    return `${option.firstname} ${option.lastname}${balanceText}`;
                                }}
                                renderOption={(props, option) => {
                                    const balance = option.company_balance || 0;
                                    const remainingBalance = option.remaining_balance ? JSON.parse(option.remaining_balance) : {};
                                    const hasDebts = Object.keys(remainingBalance).length > 0;
                                    const totalDebt = Object.values(remainingBalance).reduce((sum: number, amount: any) => sum + parseFloat(amount), 0);

                                    return (
                                        <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start !important', py: 1.5 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', alignItems: 'start' }}>
                                                <Box sx={{ fontWeight: 500 }}>
                                                    {option.firstname} {option.lastname}
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {balance > 0 && (
                                                        <Chip
                                                            label={`💰 +${UtilMethods.formatNumber(balance)}`}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                backgroundColor: '#e8f5e9',
                                                                color: '#2e7d32',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    )}
                                                    {hasDebts && (
                                                        <Chip
                                                            label={`⚠️ ${UtilMethods.formatNumber(totalDebt)}`}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                backgroundColor: '#ffebee',
                                                                color: '#d32f2f',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.phone}
                                            </Typography>
                                        </Box>
                                    );
                                }}
                                renderInput={(params) => <TextField {...params} label="Rechercher un client" />}
                                onChange={async (_, value) => {
                                    if (value) {
                                        setSelectedPerson(value);
                                        onPersonChange(value);
                                        await formik.setFieldValue('person', value);

                                        const debts = value.remaining_balance ? JSON.parse(value.remaining_balance) : {};
                                        setCustomerDebts(debts);
                                        const total = Object.values(debts).reduce((sum: number, amount: any) => sum + parseFloat(amount), 0);
                                        setTotalDebts(total);
                                    } else {
                                        setSelectedPerson(null);
                                        setCustomerDebts({});
                                        setTotalDebts(0);
                                    }
                                }}
                                value={formik.values.person}
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<PersonAdd />}
                                    onClick={handleOpenDialog}
                                    fullWidth
                                >
                                    Nouveau Client
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                >
                                    <Refresh className={isRefreshing ? 'spin' : ''} />
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Section Mode de Paiement */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CreditCard /> Mode de Paiement
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {paymentModes.map((mode) => (
                                    <Paper
                                        key={mode}
                                        elevation={payment === mode ? 3 : 0}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            border: payment === mode ? '2px solid #667eea' : '1px solid #ddd',
                                            borderRadius: 2,
                                            backgroundColor: payment === mode ? '#f3f4ff' : 'white',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                backgroundColor: '#f8f9fa',
                                                transform: 'scale(1.02)'
                                            }
                                        }}
                                        onClick={() => {
                                            onHandleSettingPayment(mode);
                                            formik.setFieldValue('payment', mode);
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {payment === mode && <CheckCircle sx={{ color: '#667eea' }} />}
                                            <Typography sx={{ fontWeight: payment === mode ? 'bold' : 'normal' }}>
                                                {mode}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Section Type de Transaction & Montant */}
                <Grid item xs={12}>
                    <Card elevation={2} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Grid container spacing={3}>
                                {/* Type de Transaction */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                        Type de Transaction
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {[
                                            { value: 'total', label: 'Total', color: '#2e7d32' },
                                            { value: 'advance', label: 'Avance', color: '#0288d1' },
                                            { value: 'loan', label: 'Prêt', color: '#ed6c02' }
                                        ].map((type) => (
                                            <Button
                                                key={type.value}
                                                variant={formik.values.transactionType === type.value ? 'contained' : 'outlined'}
                                                onClick={() => {
                                                    formik.setFieldValue('transactionType', type.value);
                                                    formik.setFieldValue('amount_paid', 0);
                                                    formik.setFieldValue('advanceAmount', 0);
                                                }}
                                                fullWidth
                                                sx={{
                                                    borderRadius: 2,
                                                    ...(formik.values.transactionType === type.value && {
                                                        backgroundColor: type.color,
                                                        '&:hover': { backgroundColor: type.color }
                                                    })
                                                }}
                                            >
                                                {type.label}
                                            </Button>
                                        ))}
                                    </Box>
                                </Grid>

                                {/* Montant selon le Type */}
                                <Grid item xs={12} md={6}>
                                    {formik.values.transactionType === 'total' && (
                                        <Box>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                                💵 Montant Reçu
                                            </Typography>
                                            <TextField
                                                type="number"
                                                label="Montant reçu (FCFA)"
                                                value={formik.values.amount_paid || ''}
                                                onChange={(e) => formik.setFieldValue('amount_paid', parseFloat(e.target.value) || 0)}
                                                fullWidth
                                                error={!!formik.errors.amount_paid && formik.touched.amount_paid}
                                                helperText={formik.touched.amount_paid && formik.errors.amount_paid}
                                                sx={{ mb: 2 }}
                                            />
                                            {formik.values.amount_paid > 0 && (
                                                <Alert severity={formik.values.amount_paid >= cart.totalPrice ? "success" : "warning"} sx={{ borderRadius: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2">
                                                            {formik.values.amount_paid >= cart.totalPrice ? '✅ Excédent :' : '⚠️ Dette restante :'}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                            {formik.values.amount_paid >= cart.totalPrice ? '+' : ''}
                                                            {UtilMethods.formatNumber(Math.abs(formik.values.amount_paid - cart.totalPrice))} FCFA
                                                        </Typography>
                                                    </Box>
                                                </Alert>
                                            )}
                                        </Box>
                                    )}

                                    {formik.values.transactionType === 'advance' && (
                                        <Box>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                                💰 Montant de l'Avance
                                            </Typography>
                                            <TextField
                                                type="number"
                                                label="Montant de l'avance (FCFA)"
                                                value={formik.values.advanceAmount || ''}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    formik.setFieldValue('advanceAmount', value);
                                                    formik.setFieldValue('amount_paid', value);
                                                }}
                                                fullWidth
                                                error={!!formik.errors.advanceAmount && formik.touched.advanceAmount}
                                                helperText={formik.touched.advanceAmount && formik.errors.advanceAmount}
                                                sx={{ mb: 2 }}
                                            />
                                            {formik.values.advanceAmount > 0 && (
                                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2">⏳ Reste à payer :</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                            {UtilMethods.formatNumber(cart.totalPrice - formik.values.advanceAmount)} FCFA
                                                        </Typography>
                                                    </Box>
                                                </Alert>
                                            )}
                                        </Box>
                                    )}

                                    {formik.values.transactionType === 'loan' && (
                                        <Alert severity="warning" icon={<Warning />} sx={{ borderRadius: 2 }}>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                Le client ne paie rien maintenant.
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, p: 1.5, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Montant total à payer :</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                                                    {UtilMethods.formatNumber(cart.totalPrice)} FCFA
                                                </Typography>
                                            </Box>
                                        </Alert>
                                    )}
                                </Grid>

                                {/* Date limite pour ADVANCE & LOAN */}
                                {(formik.values.transactionType === 'advance' || formik.values.transactionType === 'loan') && (
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <CalendarMonth sx={{ color: '#667eea' }} />
                                            <TextField
                                                type="date"
                                                label="Date limite de paiement"
                                                value={formik.values.date_to_pay || ''}
                                                onChange={(e) => formik.setFieldValue('date_to_pay', e.target.value)}
                                                fullWidth
                                                error={!!formik.errors.date_to_pay && formik.touched.date_to_pay}
                                                helperText={formik.touched.date_to_pay && formik.errors.date_to_pay}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Box>
                                    </Grid>
                                )}

                                {/* Authorization */}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                                        <input
                                            type="checkbox"
                                            id="has_authorized"
                                            checked={formik.values.has_authorized}
                                            onChange={(e) => formik.setFieldValue('has_authorized', e.target.checked)}
                                        />
                                        <label htmlFor="has_authorized">
                                            <Typography variant="body2">
                                                J'autorise cette transaction et confirme que toutes les informations sont correctes
                                            </Typography>
                                        </label>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog Nouveau Client */}
            <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonAdd />
                        Ajouter un Nouveau Client
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Nom"
                            name="lastname"
                            value={newPerson.lastname}
                            onChange={handleInputChange}
                            error={Boolean(errors.lastname)}
                            helperText={errors.lastname}
                            fullWidth
                        />
                        <TextField
                            label="Prénom"
                            name="firstname"
                            value={newPerson.firstname}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Téléphone"
                            name="phone"
                            value={newPerson.phone}
                            onChange={handleInputChange}
                            error={Boolean(errors.phone)}
                            helperText={errors.phone}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annuler</Button>
                    <Button variant="contained" onClick={handleAddPerson} disabled={isLoading}>
                        {isLoading ? 'Ajout...' : 'Ajouter'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
