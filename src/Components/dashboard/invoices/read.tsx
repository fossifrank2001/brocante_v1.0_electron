import { useCallback, useEffect, useState } from 'react';
import {
    Grid, Typography, CircularProgress, Box, Button, Dialog,
    DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Select, FormControl, InputLabel, Checkbox, FormControlLabel, Paper, Divider,
    Chip, IconButton, Tooltip, Zoom, Fade, Card, CardContent, Stack
} from '@mui/material';
import {
    Receipt, PointOfSale, History,
    Person, Close, AttachMoney, AccountBalanceWallet, CheckCircle,
    ArrowBack, FilePresent
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Breadcrumd from '@/Components/Breadcrumd';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import Toast from '@/Data/Utilities/Toast';
import UtilMethods from 'Data/Utilities/UtilMethods.ts';
import dayjs from 'dayjs';
import InvoiceAPI from 'Data/Api/Invoice.ts';
import { IInvoice } from "Interfaces";
import StreamedDocumentAPI from "Data/Api/StreamedDocument.ts";
import ActivityLogService from '@/Services/ActivityLogService';
import axiosInstance from '@/Data/Utilities/axiosInstance';

interface IPaymentResponse {
    current_sell: IInvoice;
    affected_sells: IInvoice[];
    payment_details: {
        invoice_number: string;
        amount_paid: number;
        excess_amount: number;
        remaining_balance: number;
    };
    debt_coverage: {
        covered_debts: Array<{
            sale_id: number;
            amount_covered: number;
            paid_with?: 'customer_balance' | 'excess_payment';
        }>;
        remaining_debts: Array<{
            sale_id: number;
            remaining_amount: number;
        }>;
        amount_to_balance: number;
    };
}

const MIN_PAYMENT = 25;

const paymentValidationSchema = Yup.object().shape({
    amount: Yup.number()
        .required('Leant est requis')
        .min(0, 'Le montant ne peut pas être négatif')
        .max(1000000, 'Le montant est trop élevé'),
    paymentMethod: Yup.string()
        .required('Le mode de paiement est requis'),
    useCompanyBalance: Yup.boolean()
});

const ReadInvoice = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const dispatch = useAppDispatch();
    const [record, setRecord] = useState<IInvoice | null>(null);
    const [inProgress, setInProgress] = useState(false);
    const [inProgressTwo, setInProgressTwo] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [reloadRecord, setReloadRecord] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState<IPaymentResponse | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [calculatedAmountToPay, setCalculatedAmountToPay] = useState(0);
    const [downloading, setDownloading] = useState<'receipt' | 'invoice' | null>(null);

    const fetchRecord = useCallback(async () => {
        setInProgress(true);
        try {
            const { data } = await InvoiceAPI.show(id);
            setRecord(data);
        } catch (error) {
            console.error(error);
            Toast.error('Échec du chargement des données');
        } finally {
            setInProgress(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord, reloadRecord]);

    const handlePayment = async (amount: number, paymentMethod: string, useCompanyBalance: boolean) => {
        setInProgressTwo(true);
        try {
            if (amount > 0 && amount < MIN_PAYMENT) {
                Toast.error(`Minimum ${MIN_PAYMENT}.`);
                return;
            }

            const response = await InvoiceAPI.pay(id, {
                amount,
                payment_method: paymentMethod,
                use_company_balance: useCompanyBalance
            });

            if (!response?.success) {
                Toast.error(response?.message || 'Le paiement a échoué.');
                return;
            }

            const data: any = response.data;
            setPaymentResponse(data);
            setShowResponseModal(true);
            setRecord(data.current_sell);
            Toast.success('Paiement effectué avec succès');

            const invoiceNumber = data?.current_sell?.invoice_number || String(id);
            const customerId = record?.customer?.id;
            if (customerId) {
                ActivityLogService.getInstance().logInvoicePayment(invoiceNumber, customerId, amount, data?.current_sell?.status || 'paid');
            }

            setOpenModal(false);
            setReloadRecord(prev => !prev);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Échec du paiement.';
            Toast.error(msg);
        } finally {
            setInProgressTwo(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            amount: 0,
            paymentMethod: 'Cash',
            useCompanyBalance: false
        },
        validationSchema: paymentValidationSchema,
        onSubmit: async (values) => {
            await handlePayment(values.amount, values.paymentMethod, values.useCompanyBalance);
        },
    });

    useEffect(() => {
        if (record && formik.values.useCompanyBalance && record.customer?.company_balance) {
            const remainingAfterBalance = Math.max(0, record.remaining_balance - record.customer.company_balance);
            setCalculatedAmountToPay(remainingAfterBalance);
            formik.setFieldValue('amount', remainingAfterBalance, false);
        } else if (record) {
            setCalculatedAmountToPay(record.remaining_balance);
            if (!formik.values.useCompanyBalance) {
                formik.setFieldValue('amount', record.remaining_balance, false);
            }
        }
    }, [record, formik.values.useCompanyBalance]);

    const handleOpenModal = () => {
        formik.setValues({
            amount: record?.remaining_balance || 0,
            paymentMethod: 'Cash',
            useCompanyBalance: false
        });
        setCalculatedAmountToPay(record?.remaining_balance || 0);
        setOpenModal(true);
    };

    const handleCloseModal = () => setOpenModal(false);

    const handleDownloadDocument = async (type: 'receipt' | 'invoice') => {
        if (!record) return;
        
        try {
            setDownloading(type);
            
            if (type === 'receipt') {
                if (record.sell_id) {
                    const response = await axiosInstance.get(`/sells/${record.sell_id}/pdf-receipt`, {
                        responseType: 'blob'
                    });
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                } else {
                    throw new Error('Aucun sell_id trouvé pour cette facture');
                }
            } else {
                await StreamedDocumentAPI.generate('invoice', record.invoice_number);
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            Toast.error('Erreur lors du téléchargement du document');
        } finally {
            setDownloading(null);
        }
    };

    if (inProgress && !record) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    if (!record) return null;

    const client = record?.customer || record?.sell?.person;
    const companyBalance = client?.company_balance || 0;

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent='Invoices' url={currentPage} _child={id} />

                {/* Header Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={() => dispatch(setActivePage({ page: Pages.INVOICE }))}
                            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                        >
                            Retour
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Télécharger Reçu" arrow>
                                <IconButton
                                    onClick={() => handleDownloadDocument('receipt')}
                                    disabled={downloading === 'receipt'}
                                    sx={{ 
                                        borderRadius: '15px',
                                        bgcolor: 'rgba(30, 41, 59, 0.05)',
                                        color: '#64748b',
                                        border: '1px solid rgba(30, 41, 59, 0.1)',
                                        '&:hover': { 
                                            bgcolor: 'rgba(30, 41, 59, 0.1)',
                                            color: '#1e293b'
                                        }
                                    }}
                                >
                                    {downloading === 'receipt' ? <CircularProgress size={20} color="inherit" /> : <Receipt />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger Facture" arrow>
                                <IconButton
                                    onClick={() => handleDownloadDocument('invoice')}
                                    disabled={downloading === 'invoice'}
                                    sx={{ 
                                        borderRadius: '15px',
                                        bgcolor: 'rgba(30, 41, 59, 0.05)',
                                        color: '#64748b',
                                        border: '1px solid rgba(30, 41, 59, 0.1)',
                                        '&:hover': { 
                                            bgcolor: 'rgba(30, 41, 59, 0.1)',
                                            color: '#1e293b'
                                        }
                                    }}
                                >
                                    {downloading === 'invoice' ? <CircularProgress size={20} color="inherit" /> : <FilePresent />}
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        {record.remaining_balance > 0 && (
                            <Button
                                variant="contained"
                                startIcon={<PointOfSale />}
                                onClick={handleOpenModal}
                                sx={{
                                    borderRadius: '15px',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                Enregistrer Paiement
                            </Button>
                        )}
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* Left Column: Info Cards */}
                    <Grid item xs={12} md={7}>
                        <Grid container spacing={3}>
                            {/* Card Info Facture */}
                            <Grid item xs={12}>
                                <Card sx={{
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                                <Receipt />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>Détails de la Facture</Typography>
                                        </Box>
                                        <Grid container spacing={3}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Référence</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>{record.invoice_number}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Code Vente</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#6366f1' }}>{record.sell_code}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Montant Total</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>{UtilMethods.formatNumber(record.total_amount)}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Date Émission</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{dayjs(record.created_at).format('DD MMMM YYYY')}</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Card Info Client */}
                            <Grid item xs={12}>
                                <Card sx={{
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                                                <Person />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>Informations Client</Typography>
                                        </Box>
                                        {client ? (
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Client</Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>
                                                        {`${client.lastname || ""} ${client.firstname || ""}`.trim() || "N/A"}
                                                    </Typography>
                                                    {client.phone && (
                                                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                                                            📞 {client.phone}
                                                        </Typography>
                                                    )}
                                                    {client.address && (
                                                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                                                            📍 {client.address}
                                                        </Typography>
                                                    )}
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Solde Disponible</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                        <AccountBalanceWallet sx={{ fontSize: 18, color: '#10b981' }} />
                                                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981' }}>{UtilMethods.formatNumber(companyBalance)}</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Typography sx={{ color: '#64748b', fontStyle: 'italic' }}>Client Anonyme</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Right Column: Payments Timeline */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                    <History />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>Historique des Paiements</Typography>
                            </Box>
                            <CardContent sx={{ p: 0 }}>
                                <Box sx={{ p: 3, bgcolor: 'rgba(99, 102, 241, 0.03)', mb: 0 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>Total Payé</Typography>
                                        <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 900 }}>{UtilMethods.formatNumber(record.amount_paid)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>Reste à Payer</Typography>
                                        <Typography variant="body2" sx={{ color: record.remaining_balance > 0 ? '#ef4444' : '#64748b', fontWeight: 900 }}>
                                            {UtilMethods.formatNumber(record.remaining_balance)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 3, maxHeight: '400px', overflowY: 'auto' }}>
                                    <AnimatePresence>
                                        {record.payments && record.payments.length > 0 ? (
                                            record.payments.map((payment, idx) => (
                                                <motion.div
                                                    key={payment.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    style={{
                                                        borderLeft: '2px dashed #e2e8f0',
                                                        paddingLeft: '20px',
                                                        paddingBottom: '24px',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        left: '-9px',
                                                        top: '0',
                                                        width: '16px',
                                                        height: '16px',
                                                        borderRadius: '50%',
                                                        bgcolor: '#6366f1',
                                                        border: '3px solid white',
                                                        boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)'
                                                    }} />
                                                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                                                                {dayjs(payment.created_at).format('DD/MM/YY HH:mm')}
                                                            </Typography>
                                                            <Chip
                                                                label={payment.payment_method}
                                                                size="small"
                                                                sx={{ height: '18px', fontSize: '0.6rem', fontWeight: 800, bgcolor: '#f1f5f9' }}
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 950, color: '#10b981', fontSize: '1rem' }}>
                                                            + {UtilMethods.formatNumber(payment.amount)}
                                                        </Typography>
                                                    </Box>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucun paiement enregistré</Typography>
                                            </Box>
                                        )}
                                    </AnimatePresence>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>

            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="xs"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: '32px',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.2)',
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ p: 4, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <AttachMoney />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>Paiement</Typography>
                    </Box>
                    <IconButton onClick={handleCloseModal} sx={{ color: '#94a3b8' }}><Close /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 4, pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {companyBalance > 0 && (
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <FormControlLabel
                                    control={<Checkbox checked={formik.values.useCompanyBalance} onChange={formik.handleChange} name="useCompanyBalance" color="success" />}
                                    label={
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#065f46' }}>
                                            Défalquer du solde ({UtilMethods.formatNumber(companyBalance)})
                                        </Typography>
                                    }
                                />
                            </Paper>
                        )}

                        <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>Reste Total:</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800 }}>{UtilMethods.formatNumber(record.remaining_balance)}</Typography>
                            </Box>
                            {formik.values.useCompanyBalance && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#10b981' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Déduction Solde:</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>-{UtilMethods.formatNumber(Math.min(companyBalance, record.remaining_balance))}</Typography>
                                </Box>
                            )}
                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 800 }}>À Payer:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#6366f1' }}>{UtilMethods.formatNumber(calculatedAmountToPay)}</Typography>
                            </Box>
                        </Paper>

                        <TextField
                            fullWidth
                            label="Montant du versement"
                            name="amount"
                            type="number"
                            value={formik.values.amount}
                            onChange={formik.handleChange}
                            variant="outlined"
                            disabled={formik.values.useCompanyBalance && calculatedAmountToPay === 0}
                            InputProps={{
                                sx: { borderRadius: '16px', bgcolor: 'white', fontWeight: 800 },
                                startAdornment: <AttachMoney sx={{ mr: 1, color: '#94a3b8' }} />
                            }}
                        />

                        <FormControl fullWidth>
                            <InputLabel sx={{ fontWeight: 600 }}>Mode de paiement</InputLabel>
                            <Select
                                name="paymentMethod"
                                value={formik.values.paymentMethod}
                                onChange={formik.handleChange}
                                label="Mode de paiement"
                                sx={{ borderRadius: '16px', bgcolor: 'white', fontWeight: 800 }}
                            >
                                <MenuItem value="Cash">Espèces</MenuItem>
                                <MenuItem value="Orange Money">Orange Money</MenuItem>
                                <MenuItem value="MTN Money">MTN Money</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => formik.handleSubmit()}
                        disabled={inProgressTwo}
                        sx={{
                            py: 2,
                            borderRadius: '18px',
                            fontWeight: 900,
                            fontSize: '1rem',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        {inProgressTwo ? <CircularProgress size={24} color="inherit" /> : 'Confirmer Paiement'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showResponseModal}
                onClose={() => setShowResponseModal(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Fade}
                PaperProps={{
                    sx: { borderRadius: '28px', p: 1 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                    <CheckCircle sx={{ color: '#10b981', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>Succès !</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3, pt: 0 }}>
                    {paymentResponse && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: '20px', bgcolor: '#f8fafc' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ color: '#64748b' }}>Montant Versé :</Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#10b981' }}>{UtilMethods.formatNumber(paymentResponse.payment_details.amount_paid)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: '#64748b' }}>Nouveau Reste :</Typography>
                                    <Typography sx={{ fontWeight: 800 }}>{UtilMethods.formatNumber(paymentResponse.payment_details.remaining_balance)}</Typography>
                                </Box>
                            </Paper>
                            {paymentResponse.debt_coverage.covered_debts.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, px: 1 }}>Dettes couvertes :</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {paymentResponse.debt_coverage.covered_debts.map(debt => (
                                            <Chip
                                                key={debt.sale_id}
                                                label={`Vente #${debt.sale_id}: ${UtilMethods.formatNumber(debt.amount_covered)}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 700, borderColor: '#10b981', color: '#10b981' }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        fullWidth
                        onClick={() => setShowResponseModal(false)}
                        variant="contained"
                        sx={{ borderRadius: '15px', fontWeight: 800, bgcolor: '#1e293b' }}
                    >
                        Terminer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReadInvoice;
