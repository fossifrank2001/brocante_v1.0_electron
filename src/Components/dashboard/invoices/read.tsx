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
    FormHelperText
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

const paymentValidationSchema = Yup.object().shape({
    amount: Yup.number()
        .required('Le montant est requis')
        .min(0.01, 'Le montant doit être supérieur à 0')
        .max(1000000, 'Le montant est trop élevé'),
    paymentMethod: Yup.string()
        .required('Le mode de paiement est requis')
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

    const handlePayment = async (amount: number, paymentMethod: string) => {
        setInProgressTwo(true);
        try {
            const response = await InvoiceAPI.pay(id, {
                amount,
                payment_method: paymentMethod
            });
            
            const data: any = response.data;
            setPaymentResponse(data);
            setShowResponseModal(true);
            
            // Update current invoice with the new data
            setRecord(data.current_sell);
            
            // Afficher le message de succès
            Toast.success(response.message);
            
            // Close payment modal and reset payment amount
            setOpenModal(false);
            
            // Refresh the component
            setReloadRecord(prev => !prev);
        } catch (error: any) {
            Toast.error(error?.response?.data?.message || 'Erreur lors du paiement');
        } finally {
            setInProgressTwo(false);
        }
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
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
            paymentMethod: ''
        },
        validationSchema: paymentValidationSchema,
        onSubmit: async (values) => {
            await handlePayment(values.amount, values.paymentMethod);
        },
    });

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
                    >
                        <i className='ti ti-receipt me-2'></i>
                        <span>Pay</span>
                    </Button>
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

            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Paiement</DialogTitle>
                <DialogContent>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="amount"
                            name="amount"
                            label="Montant"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formik.values.amount}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.amount && Boolean(formik.errors.amount)}
                            helperText={formik.touched.amount && formik.errors.amount}
                            InputProps={{
                                inputProps: { 
                                    step: "0.01",
                                    min: "0"
                                }
                            }}
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
                        disabled={!formik.isValid || !formik.dirty || inProgressTwo}
                        onClick={() => formik.handleSubmit()}
                    >
                        {inProgressTwo ? 'Traitement...' : 'Payer'}
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
                                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                    Dettes Couvertes:
                                                </Typography>
                                                {paymentResponse.debt_coverage.covered_debts.map((debt, index) => (
                                                    <Box key={index} className="info-item">
                                                        <Typography className="label">Vente {debt.sale_id}:</Typography>
                                                        <Typography className="value">
                                                            {debt.amount_covered.toFixed(2)} €
                                                        </Typography>
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
