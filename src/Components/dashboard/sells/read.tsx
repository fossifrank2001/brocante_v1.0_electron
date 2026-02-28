import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import './timeline.css';
import Breadcrumd from '@/Components/Breadcrumd';
import SellAPI from '@/Data/Api/Sell';
import Toast from '@/Data/Utilities/Toast';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import dayjs from 'dayjs';
import '@/Styles/sells.scss';
import StreamedDocumentAPI, { RecordType } from "Data/Api/StreamedDocument.ts";
import { IInvoice } from "Interfaces";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl,
    InputLabel, Alert, Paper,
    Divider, Typography, CircularProgress,
    Box, Button, Checkbox, FormControlLabel,
    Grid, Chip, IconButton, Tooltip, Zoom, Fade,
    CardContent,
    Card
} from '@mui/material';
import {
    Receipt, Person, History, AccountBalanceWallet,
    ArrowBack, Info, ShoppingCart, Warning,
    Download, Close, CreditCard, PointOfSale,
    Event, TrendingUp, AttachMoney, Wallet
} from '@mui/icons-material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import InvoiceAPI from 'Data/Api/Invoice.ts';

interface ISell {
    id: number;
    sell_code: string;
    customer: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        company_balance?: number;
    } | null;
    sell_items: Array<{
        id: number;
        product: {
            name: string;
        };
        quantity: number;
        price: number;
        total: number;
    }>;
    total_amount: number;
    invoice: IInvoice;
    paid_amount: number;
    remaining_balance: number;
    status: string;
    created_at: string;
}

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
        .required('Le montant est requis')
        .min(0, 'Le montant ne peut pas être négatif'),
    paymentMethod: Yup.string()
        .required('Le mode de paiement est requis'),
    useCompanyBalance: Yup.boolean()
});

const ReadSell = () => {
    const dispatch = useAppDispatch();
    const { id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState<ISell | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [processingCancel, setProcessingCancel] = useState(false);
    const [inProgressTwo, setInProgressTwo] = useState(false);
    const [paymentFeedback, setPaymentFeedback] = useState({ message: '', type: '', show: false });
    const [paymentResponse, setPaymentResponse] = useState<IPaymentResponse | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [calculatedAmountToPay, setCalculatedAmountToPay] = useState(0);

    const fetchRecord = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await SellAPI.show(id);
            setRecord(data as never);
        } catch (error) {
            console.error('Failed to load sale details:', error);
            Toast.error('Failed to load sale details');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

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
        // Always default to Cash if empty
        if (!formik.values.paymentMethod) {
            formik.setFieldValue('paymentMethod', 'Cash', false);
        }
    }, [record, formik.values.useCompanyBalance]);

    const handlePayment = async (amount: number, paymentMethod: string, useCompanyBalance: boolean) => {
        if (!record) return;
        setInProgressTwo(true);
        try {
            if (amount > 0 && amount < MIN_PAYMENT) {
                setPaymentFeedback({
                    message: `Le montant minimum de paiement est de ${MIN_PAYMENT}.`,
                    type: 'error',
                    show: true
                });
                return;
            }

            const response = await InvoiceAPI.pay(record.invoice.id, {
                amount,
                payment_method: paymentMethod,
                use_company_balance: useCompanyBalance
            });

            if (!response?.success) {
                const msg = response?.message || 'Le paiement a échoué.';
                setPaymentFeedback({ message: msg, type: 'error', show: true });
                return;
            }

            setPaymentResponse(response.data as any);
            setShowResponseModal(true);
            setShowPaymentModal(false);
            Toast.success('Paiement effectué avec succès');
            fetchRecord();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Le paiement a échoué. Veuillez vérifier le montant (minimum 25).';
            setPaymentFeedback({ message: msg, type: 'error', show: true });
            Toast.error(msg);
        } finally {
            setInProgressTwo(false);
        }
    };

    const handleOpenPaymentModal = () => {
        if (!record) return;
        formik.resetForm({
            values: {
                amount: record.remaining_balance,
                paymentMethod: 'Cash',
                useCompanyBalance: false
            }
        });
        setCalculatedAmountToPay(record.remaining_balance);
        setPaymentFeedback({ message: '', type: '', show: false });
        setShowPaymentModal(true);
    };

    const handleCancel = async () => {
        if (!record || !cancelReason.trim()) return;

        setProcessingCancel(true);
        try {
            await SellAPI.cancel(record.id, { reason: cancelReason });
            Toast.success('Sale cancelled successfully');
            setShowCancelModal(false);
            fetchRecord();
        } catch (error) {
            console.error('Failed to cancel sale:', error);
            Toast.error('Failed to cancel sale');
        } finally {
            setProcessingCancel(false);
        }
    };

    const downloadInvoice = async () => {
        if (!record) return;

        try {
            const type: RecordType = record.status === 'paid' ? 'receipt' : 'invoice';
            await StreamedDocumentAPI.generate(type, record.id, 'download');
        } catch (error) {
            console.error('Failed to download invoice:', error);
            Toast.error('Failed to download invoice');
        }
    };

    if (isLoading) {
        return (
            <div className="container">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="container">
                <div className="alert alert-danger" role="alert">
                    <i className="ti ti-alert-circle me-2"></i>
                    Sale not found
                </div>
            </div>
        );
    }

    const companyBalance = record.customer?.company_balance || 0;

    return (
        <div className="container py-4">
            <Breadcrumd parent="Ventes" url={Pages.SELL} />
            <div className="row g-4">
                <div className="col-lg-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                p: 3,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)',
                                borderBottom: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: '12px',
                                        background: 'rgba(79, 70, 229, 0.1)',
                                        color: '#4f46e5'
                                    }}>
                                        <ShoppingCart />
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                        Détails de la Vente
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Tooltip title="Retour">
                                        <IconButton
                                            onClick={() => dispatch(setActivePage({ page: Pages.SELL }))}
                                            sx={{ borderRadius: '12px', bgcolor: '#f1f5f9' }}
                                        >
                                            <ArrowBack />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        variant="contained"
                                        startIcon={<Download />}
                                        onClick={downloadInvoice}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                            boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)'
                                        }}
                                    >
                                        Facture
                                    </Button>
                                </Box>
                            </Box>

                            <CardContent sx={{ p: 4 }}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Person sx={{ color: '#64748b' }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>Informations Client</Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>NOM COMPLET</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                    {record.customer ? `${record.customer.lastname} ${record.customer.firstname}` : 'Client Anonyme'}
                                                </Typography>
                                            </Box>

                                            {record.customer && (
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>EMAIL</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {record.customer.email || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>TÉLÉPHONE</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                {record.customer.phone || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            )}

                                            {companyBalance > 0 && (
                                                <Paper elevation={0} sx={{
                                                    p: 2,
                                                    borderRadius: '16px',
                                                    bgcolor: 'rgba(16, 185, 129, 0.05)',
                                                    border: '1px solid rgba(16, 185, 129, 0.1)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <AccountBalanceWallet sx={{ color: '#10b981' }} />
                                                        <Typography sx={{ fontWeight: 700, color: '#065f46' }}>Solde disponible</Typography>
                                                    </Box>
                                                    <Typography sx={{ fontWeight: 900, color: '#10b981' }}>
                                                        {UtilMethods.formatNumber(companyBalance)}
                                                    </Typography>
                                                </Paper>
                                            )}
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Receipt sx={{ color: '#64748b' }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>Détails Transaction</Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: '16px', bgcolor: '#f8fafc' }}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>RÉFÉRENCE</Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>#{record.sell_code}</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>STATUT</Typography>
                                                    <Chip
                                                        label={record.status.toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 800,
                                                            fontSize: '0.7rem',
                                                            bgcolor: record.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' :
                                                                record.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: record.status === 'paid' ? '#10b981' :
                                                                record.status === 'pending' ? '#f59e0b' : '#ef4444',
                                                            border: 'none'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Event sx={{ color: '#64748b' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>DATE DE VENTE</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {dayjs(record.created_at).format('DD MMMM YYYY à HH:mm')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#334155', mt: 5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ShoppingCart sx={{ fontSize: '20px' }} /> Articles
                                </Typography>

                                <Box sx={{
                                    border: '1px solid #f1f5f9',
                                    borderRadius: '16px',
                                    overflow: 'hidden'
                                }}>
                                    <table className="table border-0 mb-0">
                                        <thead style={{ backgroundColor: '#f8fafc' }}>
                                            <tr>
                                                <th className="border-0 px-4 py-3" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PRODUIT</th>
                                                <th className="border-0 px-4 py-3 text-center" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>QTÉ</th>
                                                <th className="border-0 px-4 py-3 text-end" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>P.U</th>
                                                <th className="border-0 px-4 py-3 text-end" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {record.sell_items.map((item) => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td className="px-4 py-3">
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{item.product.name}</Typography>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Chip label={`x${item.quantity}`} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>{UtilMethods.formatNumber(item.price)}</Typography>
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>{UtilMethods.formatNumber(item.price * item.quantity)}</Typography>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <Box sx={{ p: 4, bgcolor: '#f8fafc', borderTop: '2px solid #ffffff' }}>
                                        <Grid container spacing={2} justifyContent="flex-end">
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Sous-total</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{UtilMethods.formatNumber(record.total_amount)}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>Montant payé</Typography>
                                                        <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700 }}>{UtilMethods.formatNumber(record.paid_amount)}</Typography>
                                                    </Box>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Reste</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 900, color: record.remaining_balance > 0 ? '#ef4444' : '#10b981' }}>
                                                            {UtilMethods.formatNumber(record.remaining_balance)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>

                                {record.status !== 'cancelled' && (
                                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Close />}
                                            onClick={() => setShowCancelModal(true)}
                                            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700, px: 3 }}
                                        >
                                            Annuler la Vente
                                        </Button>
                                        {record.remaining_balance > 0 && (
                                            <Button
                                                variant="contained"
                                                startIcon={<AttachMoney />}
                                                onClick={handleOpenPaymentModal}
                                                sx={{
                                                    borderRadius: '14px',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    px: 4,
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                                                    '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }
                                                }}
                                            >
                                                Ajouter un Paiement
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="col-lg-4">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                            height: '100%'
                        }}>
                            <Box sx={{
                                p: 3,
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}>
                                <History sx={{ color: '#4f46e5' }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                    Historique Paiements
                                </Typography>
                            </Box>

                            <CardContent sx={{ p: 3 }}>
                                <div className="timeline-container">
                                    {record.invoice?.payments?.length > 0 ? (
                                        record.invoice.payments.map((payment, idx) => (
                                            <motion.div
                                                key={payment.id}
                                                className="timeline-item"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                            >
                                                <div className="timeline-dot" style={{ background: '#4f46e5' }}>
                                                    <PointOfSale sx={{ fontSize: '14px', color: 'white' }} />
                                                </div>
                                                <div className="timeline-content" style={{
                                                    background: '#f8fafc',
                                                    borderRadius: '16px',
                                                    padding: '16px',
                                                    border: '1px solid #f1f5f9'
                                                }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                                            Paiement #{payment.invoice_number}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                            {dayjs(payment.created_at).format('DD/MM/YY')}
                                                        </Typography>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <Chip
                                                            label={payment.payment_method}
                                                            size="small"
                                                            sx={{
                                                                height: '20px',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                bgcolor: '#ffffff',
                                                                border: '1px solid #e2e8f0'
                                                            }}
                                                        />
                                                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981', fontSize: '1rem' }}>
                                                            {UtilMethods.formatNumber(payment.amount)}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                                            <Info sx={{ fontSize: '40px', mb: 2, opacity: 0.3 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Aucun paiement enregistré</Typography>
                                        </Box>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Add Payment Modal (Glassmorphism) */}
            <Dialog
                open={showPaymentModal}
                onClose={() => !inProgressTwo && setShowPaymentModal(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: '28px',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }
                }}
            >
                <DialogTitle sx={{
                    p: 4,
                    pb: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: 'white'
                        }}>
                            <AttachMoney />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>
                            Ajouter un Paiement
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setShowPaymentModal(false)} disabled={inProgressTwo}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    <Box sx={{ pt: 1 }}>
                        {paymentFeedback.show && (
                            <Fade in={paymentFeedback.show}>
                                <Alert
                                    severity={paymentFeedback.type === 'success' ? 'success' : 'error'}
                                    variant="filled"
                                    sx={{ mb: 3, borderRadius: '16px', fontWeight: 600 }}
                                >
                                    {paymentFeedback.message}
                                </Alert>
                            </Fade>
                        )}

                        {companyBalance > 0 && (
                            <Paper elevation={0} sx={{
                                p: 3,
                                mb: 3,
                                bgcolor: 'rgba(79, 70, 229, 0.08)',
                                borderRadius: '20px',
                                border: '1px solid rgba(79, 70, 229, 0.1)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <AccountBalanceWallet sx={{ fontSize: '30px', color: '#4f46e5' }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Solde Client
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                            {UtilMethods.formatNumber(companyBalance)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formik.values.useCompanyBalance}
                                            onChange={formik.handleChange}
                                            name="useCompanyBalance"
                                            color="primary"
                                            sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontWeight: 700, color: '#334155' }}>
                                            Déduire du solde disponible
                                        </Typography>
                                    }
                                />
                            </Paper>
                        )}

                        <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Reste à payer:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 800 }}>{UtilMethods.formatNumber(record.remaining_balance)}</Typography>
                            </Box>
                            {formik.values.useCompanyBalance && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, color: '#10b981' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Déduction solde:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>-{UtilMethods.formatNumber(Math.min(companyBalance, record.remaining_balance))}</Typography>
                                </Box>
                            )}
                            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>À verser:</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#4f46e5' }}>
                                    {UtilMethods.formatNumber(calculatedAmountToPay)}
                                </Typography>
                            </Box>
                        </Paper>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Montant à encaisser"
                                    name="amount"
                                    type="number"
                                    value={formik.values.amount}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                                    helperText={formik.touched.amount && formik.errors.amount}
                                    variant="outlined"
                                    disabled={formik.values.useCompanyBalance && calculatedAmountToPay === 0}
                                    InputProps={{
                                        startAdornment: <AttachMoney sx={{ mr: 1, color: '#64748b' }} />,
                                        sx: { borderRadius: '16px', bgcolor: 'white', fontWeight: 700 }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ fontWeight: 600 }}>Mode de paiement</InputLabel>
                                    <Select
                                        name="paymentMethod"
                                        value={formik.values.paymentMethod}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        label="Mode de paiement"
                                        disabled={formik.values.useCompanyBalance && calculatedAmountToPay === 0}
                                        sx={{ borderRadius: '16px', bgcolor: 'white', fontWeight: 700 }}
                                    >
                                        <MenuItem value="Cash" sx={{ fontWeight: 600 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <PointOfSale sx={{ fontSize: '20px' }} /> Espèces
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Orange Money" sx={{ fontWeight: 600 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <CreditCard sx={{ fontSize: '20px' }} /> Orange Money
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="MTN Money" sx={{ fontWeight: 600 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <CreditCard sx={{ fontSize: '20px' }} /> MTN Money
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Card" sx={{ fontWeight: 600 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <CreditCard sx={{ fontSize: '20px' }} /> Carte Bancaire
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => formik.handleSubmit()}
                        disabled={inProgressTwo || !formik.isValid}
                        sx={{
                            py: 2,
                            borderRadius: '18px',
                            fontWeight: 800,
                            fontSize: '1rem',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                            }
                        }}
                    >
                        {inProgressTwo ? <CircularProgress size={24} color="inherit" /> : 'Confirmer l\'Encaissement'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Response Summary Modal (Premium Glass) */}
            <Dialog
                open={showResponseModal}
                onClose={() => setShowResponseModal(false)}
                maxWidth="md"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: '28px',
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                    }
                }}
            >
                <DialogTitle sx={{
                    p: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderBottom: '1px solid #f1f5f9'
                }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Receipt />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>Récapitulatif de Transaction</Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    {paymentResponse && (
                        <Box sx={{ py: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 2, textTransform: 'uppercase' }}>
                                        Détails du Versement
                                    </Typography>
                                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>N° Facture:</Typography>
                                            <Typography sx={{ fontWeight: 800 }}>#{paymentResponse.payment_details.invoice_number}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Montant versé:</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981' }}>
                                                {UtilMethods.formatNumber(paymentResponse.payment_details.amount_paid)}
                                            </Typography>
                                        </Box>
                                        {paymentResponse.payment_details.excess_amount > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'white', borderRadius: '12px', border: '1px dashed #f59e0b' }}>
                                                <Typography sx={{ color: '#f59e0b', fontWeight: 700 }}>Excédent généré:</Typography>
                                                <Typography sx={{ color: '#f59e0b', fontWeight: 900 }}>
                                                    {UtilMethods.formatNumber(paymentResponse.payment_details.excess_amount)}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 2, textTransform: 'uppercase' }}>
                                        État du Dossier
                                    </Typography>
                                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Statut Vente:</Typography>
                                            <Chip
                                                label={paymentResponse.current_sell.status.toUpperCase()}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    bgcolor: paymentResponse.current_sell.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: paymentResponse.current_sell.status === 'paid' ? '#10b981' : '#f59e0b'
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Solde Restant:</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#ef4444' }}>
                                                {UtilMethods.formatNumber(paymentResponse.payment_details.remaining_balance)}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {paymentResponse.debt_coverage.covered_debts.length > 0 && (
                                <Box sx={{ mt: 5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp sx={{ fontSize: '18px' }} /> Dettes Couvertes Automatiquement
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {paymentResponse.debt_coverage.covered_debts.map((debt, idx) => (
                                            <Grid item xs={12} key={idx}>
                                                <Paper elevation={0} sx={{
                                                    p: 2,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderRadius: '16px',
                                                    border: '1px solid #e2e8f0',
                                                    '&:hover': { bgcolor: '#f8fafc' }
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#f1f5f9' }}>
                                                            <Receipt sx={{ fontSize: '18px', color: '#64748b' }} />
                                                        </Box>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>Vente #{debt.sale_id}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                                Payé via {debt.paid_with === 'customer_balance' ? 'Solde Client' : 'Excédent'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography sx={{ fontWeight: 900, color: '#10b981' }}>
                                                        +{UtilMethods.formatNumber(debt.amount_covered)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setShowResponseModal(false)}
                        sx={{
                            py: 2,
                            borderRadius: '18px',
                            fontWeight: 800,
                            textTransform: 'none',
                            background: '#1e293b',
                            boxShadow: '0 10px 20px -5px rgba(30, 41, 59, 0.4)'
                        }}
                    >
                        Terminer et Fermer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancel Sale Modal (Premium Glass) */}
            <Dialog
                open={showCancelModal}
                onClose={() => !processingCancel && setShowCancelModal(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: '28px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                    }
                }}
            >
                <DialogTitle sx={{ p: 4, pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <Warning />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>Annuler la Vente</Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    <Typography variant="body1" sx={{ color: '#64748b', mb: 3, fontWeight: 500 }}>
                        Cette action est irréversible. Veuillez indiquer le motif de l'annulation.
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Ex: Le client a changé d'avis, erreur de saisie..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                                bgcolor: 'white',
                                fontWeight: 600
                            }
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 4, pt: 0, gap: 2 }}>
                    <Button
                        onClick={() => setShowCancelModal(false)}
                        disabled={processingCancel}
                        sx={{ borderRadius: '14px', fontWeight: 700, textTransform: 'none', px: 3 }}
                    >
                        Abandonner
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancel}
                        disabled={processingCancel || !cancelReason.trim()}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: '16px',
                            fontWeight: 800,
                            textTransform: 'none',
                            bgcolor: '#ef4444',
                            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
                            '&:hover': { bgcolor: '#dc2626' }
                        }}
                    >
                        {processingCancel ? <CircularProgress size={24} color="inherit" /> : 'Confirmer l\'Annulation'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ReadSell;
