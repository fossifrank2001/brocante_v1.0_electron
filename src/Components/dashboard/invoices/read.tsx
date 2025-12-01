import { useCallback, useEffect, useState } from 'react';
import {
    Grid,
    Typography,
    CircularProgress,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    Select,
    Alert,
    AlertTitle,
    Collapse,
    FormControl,
    InputLabel,
    FormHelperText,
    Checkbox,
    FormControlLabel,
    Paper,
    Divider,
    Chip
} from '@mui/material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Breadcrumd from '@/Components/Breadcrumd';
import InfoItem from '@/Components/InfoItem';
import { useAppSelector } from '@/hooks';
import Toast from '@/Data/Utilities/Toast';
import UtilMethods from 'Data/Utilities/UtilMethods.ts';
import dayjs from 'dayjs';
import InvoiceAPI from 'Data/Api/Invoice.ts';
import {IInvoice} from "Interfaces";
import StreamedDocumentAPI from "Data/Api/StreamedDocument.ts";
import {DataGrid, GridColDef, GridPaginationModel, NoRowsOverlayPropsOverrides} from "@mui/x-data-grid";
import SellAPI from "Data/Api/Sell.ts";

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
        }>;
        remaining_debts: Array<{
            sale_id: number;
            remaining_amount: number;
        }>;
        amount_to_balance: number;
    };
}

const MIN_PAYMENT = 25; // Aligné avec backend InvoiceController::MIN_PAYMENT_AMOUNT

const paymentValidationSchema = Yup.object().shape({
    amount: Yup.number()
        .required('Le montant est requis')
        .min(0, 'Le montant ne peut pas être négatif')
        .max(1000000, 'Le montant est trop élevé'),
    paymentMethod: Yup.string()
        .required('Le mode de paiement est requis'),
    useCompanyBalance: Yup.boolean()
});

const ReadInvoice = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState<IInvoice | null>(null);
    const [inProgress, setInProgress] = useState(false);
    const [inProgressTwo, setInProgressTwo] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [reloadRecord, setReloadRecord] = useState(false);
    const [showPayments, setShowPayments] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 5,
        page: 0,
    });
    const [paymentFeedback, setPaymentFeedback] = useState({ message: '', type: '', show: false });
    const [paymentResponse, setPaymentResponse] = useState<IPaymentResponse | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [calculatedAmountToPay, setCalculatedAmountToPay] = useState(0);
    const [isApplyingBalance, setIsApplyingBalance] = useState(false);

    const fetchRecord = useCallback(async () => {
        setInProgress(true);
        try {
            const { data } = await InvoiceAPI.show(id);
            setRecord(data);
        } catch (error) {
            console.error(error);
            Toast.error('Failed to load data');
        } finally {
            setInProgress(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord, reloadRecord]);

    // Le calcul du montant à payer est déplacé après l'initialisation de formik pour éviter l'erreur de référence.

    const handleApplyCompanyBalance = async () => {
        if (!record?.customer?.id) {
            Toast.error('Client introuvable');
            return;
        }

        setIsApplyingBalance(true);
        try {
            const response = await InvoiceAPI.useCustomerBalance({
                customer_id: record.customer.id
            });
            
            Toast.success('Solde client appliqué avec succès');
            setReloadRecord(prev => !prev);
            
            if (response.data.balance_usage) {
                const balanceUsage = response.data.balance_usage;
                let message = `Solde utilisé: ${balanceUsage.balance_used.toFixed(2)} €\n`;
                message += `Solde restant: ${balanceUsage.remaining_balance.toFixed(2)} €\n\n`;
                
                if (balanceUsage.covered_debts.length > 0) {
                    message += 'Dettes couvertes:\n';
                    balanceUsage.covered_debts.forEach(debt => {
                        message += `  - Vente ${debt.sale_id}: ${debt.amount_covered.toFixed(2)} €\n`;
                    });
                }
                
                setPaymentFeedback({ message, type: 'success', show: true });
            }
        } catch (error: any) {
            Toast.error(error?.response?.data?.message || 'Erreur lors de l\'application du solde');
        } finally {
            setIsApplyingBalance(false);
        }
    };

    const handlePayment = async (amount: number, paymentMethod: string, useCompanyBalance: boolean) => {
        setInProgressTwo(true);
        try {
            // Validation côté client si montant > 0
            if (amount > 0 && amount < MIN_PAYMENT) {
                setPaymentFeedback({
                    message: `Le montant minimum de paiement est de ${MIN_PAYMENT}.`,
                    type: 'error',
                    show: true
                });
                return;
            }
            
            if (!paymentMethod && amount > 0) {
                setPaymentFeedback({
                    message: 'Veuillez choisir un mode de paiement.',
                    type: 'error',
                    show: true
                });
                return;
            }

            const response = await InvoiceAPI.pay(id, {
                amount,
                payment_method: paymentMethod,
                use_company_balance: useCompanyBalance
            });
            
            // Vérifier le succès
            if (!response?.success) {
                const msg = response?.message || 'Le paiement a échoué.';
                setPaymentFeedback({ message: msg, type: 'error', show: true });
                return;
            }

            const data: any = response.data;
            setPaymentResponse(data);
            setShowResponseModal(true);
            setRecord(data.current_sell);
            
            Toast.success(response.message || 'Paiement effectué avec succès');
            
            setOpenModal(false);
            setReloadRecord(prev => !prev);
        } catch (error: any) {
            // Construire un message d'erreur plus utile si le backend renvoie message vide
            const resp = error?.response?.data;
            let msg = resp?.message as string | undefined;
            if (!msg || msg.trim() === '') {
                // Essayer d'extraire les erreurs de validation Laravel
                const validation = resp?.data;
                if (validation && typeof validation === 'object') {
                    const parts: string[] = [];
                    Object.entries(validation).forEach(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            parts.push(`${field}: ${messages.join(', ')}`);
                        } else if (typeof messages === 'string') {
                            parts.push(`${field}: ${messages}`);
                        }
                    });
                    msg = parts.join('\n');
                }
            }
            if (!msg || msg.trim() === '') {
                msg = 'Le paiement a échoué. Veuillez vérifier le montant (minimum 25) et le mode de paiement.';
            }
            setPaymentFeedback({ message: msg, type: 'error', show: true });
            Toast.error(msg);
        } finally {
            setInProgressTwo(false);
        }
    };

    const handleOpenModal = () => {
        formik.resetForm({
            values: {
                amount: record?.remaining_balance || 0,
                paymentMethod: '',
                useCompanyBalance: false
            }
        });
        setCalculatedAmountToPay(record?.remaining_balance || 0);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        formik.resetForm();
    };

    const handleCloseResponseModal = () => {
        setShowResponseModal(false);
        setPaymentResponse(null);
    };

    const handleDownloadDocument = async (_type: 'receipt' | 'invoice') => {
        try {
            setInProgressTwo(true)
            await StreamedDocumentAPI.generate(_type, record?.invoice_number)
        }catch (e) {
            console.error("Error while generate receipt PDF ::: ", e);
        }finally {
            setInProgressTwo(false)
        }
    }

    const toggleShowPayments = () => {
        setShowPayments((prev) => !prev);
    };

    const paymentColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'invoice_number', headerName: 'Invoice Number', width: 200 },
        {
            field: 'amount',
            headerName: 'Montant',
            width: 130,
            renderCell: (params) => UtilMethods.formatNumber(params.value)
        },
        { field: 'payment_method', headerName: 'Payment Method', width: 200 },
        {
            field: 'created_at',
            headerName: 'Created At',
            width: 250,
            renderCell: (params) => dayjs(params.value).format('MMMM D, YYYY h:mm A'),
        },
    ];

    const formik = useFormik({
        initialValues: {
            amount: 0,
            paymentMethod: '',
            useCompanyBalance: false
        },
        validationSchema: paymentValidationSchema,
        onSubmit: async (values) => {
            await handlePayment(values.amount, values.paymentMethod, values.useCompanyBalance);
        },
    });

    // Calculer le montant à payer selon l'utilisation du company_balance
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record, formik.values.useCompanyBalance]);

    const companyBalance = record?.customer?.company_balance || 0;
    const hasCompanyBalance = companyBalance > 0;
    const remainingBalance = record?.remaining_balance || 0;

    return (
        <div className="container">
            
            <div className=''>
                <Breadcrumd parent='Invoices' url={currentPage} _child={id} />
                
            <div className="d-flex align-items-center gap-3" style={{marginBottom: '16px'}}>
                <div className="d-flex align-items-center gap-3">
                    {record?.status === SellAPI.PAID ? (
                        <Button
                            className='d-flex align-items-center'
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDownloadDocument('receipt')}
                        >
                            <i className='ti ti-download ml-2'></i>
                            <span>Download Receipt</span>
                        </Button>
                    ) : <Button
                        disabled={inProgressTwo}
                        className='d-flex align-items-center'
                        variant="outlined" color="primary"
                        onClick={() => handleDownloadDocument('invoice')}
                    >
                        <i className='ti ti-download me-2'></i>
                        <span>Download Invoice</span>
                    </Button>}
                    <Button
                        className='d-flex align-items-center'
                        variant="contained"
                        color="primary"
                        onClick={handleOpenModal}
                        disabled={remainingBalance <= 0}
                    >
                        <i className='ti ti-receipt me-2'></i>
                        <span>Payer</span>
                    </Button>
                    {hasCompanyBalance && remainingBalance > 0 && (
                        <Button
                            className='d-flex align-items-center'
                            variant="outlined"
                            color="success"
                            onClick={handleApplyCompanyBalance}
                            disabled={isApplyingBalance}
                        >
                            {isApplyingBalance ? (
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                            ) : (
                                <i className='ti ti-wallet me-2'></i>
                            )}
                            <span>Utiliser Solde Client ({UtilMethods.formatNumber(companyBalance)})</span>
                        </Button>
                    )}
                </div>
            </div>
                <Collapse in={paymentFeedback.show}>
                    <Alert 
                        severity={paymentFeedback.type === 'success' ? 'success' : 'error'}
                        sx={{ 
                            mb: 2,
                            whiteSpace: 'pre-line',
                            '& .MuiAlert-message': {
                                width: '100%'
                            }
                        }}
                        onClose={() => setPaymentFeedback(prev => ({ ...prev, show: false }))}
                    >
                        <AlertTitle>{paymentFeedback.type === 'success' ? 'Succès' : 'Erreur'}</AlertTitle>
                        {paymentFeedback.message}
                    </Alert>
                </Collapse>

                <div className='card'>
                    <div className='card-body'>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6">Invoice Information</Typography>
                                <InfoItem
                                    label="Sell Code"
                                    value={record?.sell_code}
                                    second={{
                                        label: 'Invoice Number',
                                        value: record?.invoice_number,
                                    }}
                                />
                                <InfoItem
                                    label="Remaining Balance"
                                    value={UtilMethods.formatNumber(record?.remaining_balance)}
                                    second={{
                                        label: 'Total Amount',
                                        value: UtilMethods.formatNumber(record?.total_amount),
                                    }}
                                />
                                <InfoItem
                                    label="Amount Paid"
                                    value={UtilMethods.formatNumber(record?.amount_paid)}
                                    second={{
                                        label: "Date To Pay",
                                        value: record?.date_to_pay ? dayjs(record.date_to_pay).format('YYYY-MM-DD H:mm:s') : 'N/A',
                                    }}
                                />
                                <InfoItem
                                    label="Created At"
                                    value={record?.created_at ? dayjs(record.created_at).format('YYYY-MM-DD H:mm:s') : 'N/A'}
                                    second={{
                                        label: `Updated At`,
                                        value: record?.updated_at ? dayjs(record.updated_at).format('YYYY-MM-DD H:mm:s') : 'N/A',
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </div>
                </div>

                {/* Section Client et Solde */}
                {record?.customer && (
                    <div className='card mt-2'>
                        <div className='card-body'>
                            <Typography variant="h6" gutterBottom>Informations Client</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <InfoItem
                                    label="Client"
                                    value={`${record.customer.first_name} ${record.customer.last_name}`}
                                    second={{
                                        label: 'ID Client',
                                        value: `#${record.customer.id}`,
                                    }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200 }}>
                                        Solde Client (Crédit):
                                    </Typography>
                                    <Chip 
                                        label={UtilMethods.formatNumber(companyBalance)}
                                        color={companyBalance > 0 ? 'success' : 'default'}
                                        icon={<i className='ti ti-wallet'></i>}
                                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                                    />
                                    {companyBalance > 0 && (
                                        <Alert severity="info" sx={{ py: 0, flex: 1 }}>
                                            Ce montant peut être utilisé pour réduire la facture actuelle
                                        </Alert>
                                    )}
                                </Box>
                            </Box>
                        </div>
                    </div>
                )}

                <div className='card mt-2'>
                    <div className='card-body'>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6">Payments</Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={toggleShowPayments}
                                >
                                    {showPayments ? 'Close list of payments' : 'See list of payments'}
                                </Button>

                                {showPayments && (
                                    <Box sx={{height: 400, width: '100%', marginTop: 2}}>
                                        <DataGrid
                                            rows={record?.payments || []}
                                            columns={paymentColumns}
                                            paginationModel={paginationModel}
                                            onPaginationModelChange={setPaginationModel}
                                            pageSizeOptions={[5, 10, 15]}
                                            pagination
                                        />

                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </div>

            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ti ti-receipt'></i>
                        <span>Paiement de la Facture</span>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={formik.handleSubmit}>
                        {/* Affichage du solde client disponible */}
                        {hasCompanyBalance && (
                            <Paper 
                                elevation={2} 
                                sx={{ 
                                    p: 2, 
                                    mb: 3, 
                                    bgcolor: '#f0f7ff',
                                    border: '1px solid #2196f3'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <i className='ti ti-wallet' style={{ fontSize: '24px', color: '#2196f3' }}></i>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                            Solde Client Disponible
                                        </Typography>
                                        <Typography variant="h6" color="primary">
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
                                        />
                                    }
                                    label="Utiliser le solde client pour réduire le montant à payer"
                                />
                                
                                {formik.values.useCompanyBalance && (
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                        Le solde client sera appliqué automatiquement avant le paiement
                                    </Alert>
                                )}
                            </Paper>
                        )}

                        {/* Résumé du calcul */}
                        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Calcul du Montant à Payer
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Solde restant:</Typography>
                                <Typography fontWeight="bold">{UtilMethods.formatNumber(remainingBalance)}</Typography>
                            </Box>
                            {formik.values.useCompanyBalance && companyBalance > 0 && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                                        <Typography>- Solde client utilisé:</Typography>
                                        <Typography fontWeight="bold">
                                            - {UtilMethods.formatNumber(Math.min(companyBalance, remainingBalance))}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                </>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="h6" color="primary">Montant à payer:</Typography>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {UtilMethods.formatNumber(calculatedAmountToPay)}
                                </Typography>
                            </Box>
                        </Paper>

                        <TextField
                            autoFocus
                            margin="dense"
                            id="amount"
                            name="amount"
                            label="Montant du paiement"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formik.values.amount}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.amount && Boolean(formik.errors.amount)}
                            helperText={
                                formik.touched.amount && formik.errors.amount 
                                    ? formik.errors.amount 
                                    : calculatedAmountToPay === 0 
                                        ? 'La facture sera entièrement payée avec le solde client'
                                        : 'Vous pouvez payer plus pour couvrir d\'autres dettes'
                            }
                            InputProps={{
                                inputProps: { 
                                    step: "0.01",
                                    min: "0"
                                }
                            }}
                            disabled={formik.values.useCompanyBalance && calculatedAmountToPay === 0}
                        />
                        <FormControl 
                            fullWidth 
                            margin="dense"
                            error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                        >
                            <InputLabel>Mode de paiement</InputLabel>
                            <Select
                                id="paymentMethod"
                                name="paymentMethod"
                                value={formik.values.paymentMethod}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={formik.values.useCompanyBalance && calculatedAmountToPay === 0}
                            >
                                <MenuItem value="Cash">Cash</MenuItem>
                                <MenuItem value="Orange Money">Orange Money</MenuItem>
                                <MenuItem value="MTN Money">MTN Money</MenuItem>
                            </Select>
                            {formik.touched.paymentMethod && formik.errors.paymentMethod && (
                                <FormHelperText>{formik.errors.paymentMethod}</FormHelperText>
                            )}
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Annuler</Button>
                    <Button 
                        type="submit"
                        variant="contained" 
                        color="primary"
                        disabled={
                            inProgressTwo || 
                            (!formik.values.useCompanyBalance && (!formik.isValid || !formik.dirty)) ||
                            (formik.values.useCompanyBalance && calculatedAmountToPay > 0 && !formik.values.paymentMethod)
                        }
                        onClick={() => formik.handleSubmit()}
                    >
                        {inProgressTwo ? 'Traitement...' : 'Confirmer le Paiement'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal pour afficher la réponse de l'API */}
            <Dialog 
                open={showResponseModal} 
                onClose={handleCloseResponseModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        maxHeight: '80vh'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                    p: 2
                }}>
                    <Typography variant="h6" component="div">
                        Résumé du Paiement
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {paymentResponse && (
                        <Box sx={{ 
                            display: 'grid',
                            gap: 3,
                            '& .section-title': {
                                color: '#1976d2',
                                fontWeight: 'bold',
                                borderBottom: '2px solid #1976d2',
                                pb: 1,
                                mb: 2
                            },
                            '& .info-item': {
                                display: 'flex',
                                gap: 1,
                                mb: 1,
                                '& .label': {
                                    color: '#666',
                                    minWidth: '150px'
                                },
                                '& .value': {
                                    fontWeight: 500
                                }
                            }
                        }}>
                            {/* Détails du paiement */}
                            <Box>
                                <Typography className="section-title" variant="h6">
                                    Détails du Paiement
                                </Typography>
                                <Box sx={{ pl: 2 }}>
                                    <Box className="info-item">
                                        <Typography className="label">Numéro de facture:</Typography>
                                        <Typography className="value">
                                            {paymentResponse.payment_details?.invoice_number}
                                        </Typography>
                                    </Box>
                                    <Box className="info-item">
                                        <Typography className="label">Montant payé:</Typography>
                                        <Typography className="value">
                                            {paymentResponse.payment_details?.amount_paid.toFixed(2)} €
                                        </Typography>
                                    </Box>
                                    <Box className="info-item">
                                        <Typography className="label">Solde restant:</Typography>
                                        <Typography className="value">
                                            {paymentResponse.payment_details?.remaining_balance.toFixed(2)} €
                                        </Typography>
                                    </Box>
                                    {paymentResponse.payment_details?.excess_amount > 0 && (
                                        <Box className="info-item">
                                            <Typography className="label">Excédent:</Typography>
                                            <Typography className="value">
                                                {paymentResponse.payment_details.excess_amount.toFixed(2)} €
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            {/* Facture mise à jour */}
                            <Box>
                                <Typography className="section-title" variant="h6">
                                    Facture Mise à Jour
                                </Typography>
                                <Box sx={{ pl: 2 }}>
                                    <Box className="info-item">
                                        <Typography className="label">Code de vente:</Typography>
                                        <Typography className="value">
                                            {paymentResponse.current_sell?.sell_code}
                                        </Typography>
                                    </Box>
                                    <Box className="info-item">
                                        <Typography className="label">Montant total:</Typography>
                                        <Typography className="value">
                                            {paymentResponse.current_sell?.total_amount.toFixed(2)} €
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Couverture des dettes */}
                            {paymentResponse.debt_coverage && (
                                paymentResponse.debt_coverage.covered_debts?.length > 0 ||
                                paymentResponse.debt_coverage.remaining_debts?.length > 0 ||
                                paymentResponse.debt_coverage.amount_to_balance > 0
                            ) && (
                                <Box>
                                    <Typography className="section-title" variant="h6">
                                        Couverture des Dettes
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        {paymentResponse.debt_coverage.covered_debts?.length > 0 && (
                                            <>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                    Dettes Couvertes:
                                                </Typography>
                                                {paymentResponse.debt_coverage.covered_debts.map((debt, index) => (
                                                    <Box key={index} sx={{ 
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mb: 1,
                                                        p: 1,
                                                        backgroundColor: '#f0f7ff',
                                                        borderRadius: 1,
                                                        border: '1px solid #bbdefb'
                                                    }}>
                                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                            <Typography sx={{ fontWeight: 500 }}>
                                                                Vente {debt.sale_id}:
                                                            </Typography>
                                                            <Typography sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                                                {UtilMethods.formatNumber(debt.amount_covered.toFixed(2))}
                                                            </Typography>
                                                        </Box>
                                                        {debt.paid_with && (
                                                            <Typography sx={{ 
                                                                fontSize: '0.875rem',
                                                                color: debt.paid_with === 'customer_balance' ? '#2e7d32' : '#ed6c02',
                                                                backgroundColor: debt.paid_with === 'customer_balance' ? '#e8f5e9' : '#fff3e0',
                                                                px: 1.5,
                                                                py: 0.5,
                                                                borderRadius: 1,
                                                                fontWeight: 500
                                                            }}>
                                                                {debt.paid_with === 'customer_balance' ? '💰 Solde Client' : '💵 Excédent Paiement'}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ))}
                                            </>
                                        )}

                                        {paymentResponse.debt_coverage.remaining_debts?.length > 0 && (
                                            <>
                                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                                                    Dettes Restantes:
                                                </Typography>
                                                {paymentResponse.debt_coverage.remaining_debts.map((debt, index) => (
                                                    <Box key={index} className="info-item">
                                                        <Typography className="label">Vente {debt.sale_id}:</Typography>
                                                        <Typography className="value">
                                                            {debt.remaining_amount.toFixed(2)} €
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </>
                                        )}

                                        {paymentResponse.debt_coverage.amount_to_balance > 0 && (
                                            <Box className="info-item" sx={{ mt: 2 }}>
                                                <Typography className="label">Montant ajouté au solde:</Typography>
                                                <Typography className="value">
                                                    {paymentResponse.debt_coverage.amount_to_balance.toFixed(2)} €
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ 
                    borderTop: '1px solid #e0e0e0',
                    p: 2
                }}>
                    <Button 
                        onClick={handleCloseResponseModal}
                        variant="contained"
                    >
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ReadInvoice;
