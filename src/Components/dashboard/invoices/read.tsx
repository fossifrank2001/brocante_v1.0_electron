import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/hooks';
import Breadcrumd from '@/Components/Breadcrumd';
import InvoiceAPI from '@/Data/Api/Invoice';
import StreamedDocumentAPI from '@/Data/Api/StreamedDocument';
import Toast from '@/Data/Utilities/Toast';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Tooltip, CircularProgress, Backdrop } from '@mui/material';
import { Routes } from '@/Data/Constants/Routes';
import { IInvoice } from '@/Data/Interfaces/Invoice';

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
        .required('Amount is required')
        .min(0.01, 'Amount must be greater than 0')
        .max(1000000, 'Amount is too high'),
    paymentMethod: Yup.string()
        .required('Payment method is required')
});

const ReadInvoice = () => {
    const { id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState<IInvoice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState<IPaymentResponse | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 5,
        page: 0,
    });

    const fetchRecord = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await InvoiceAPI.show(id);
            setRecord(() => data as IInvoice);
        } catch (error) {
            console.error('Failed to load invoice:', error);
            Toast.error('Failed to load invoice');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    const handlePayment = async (amount: number, paymentMethod: string) => {
        setProcessingPayment(true);
        try {
            const response = await InvoiceAPI.pay(id, {
                amount,
                payment_method: paymentMethod
            });
            
            const paymentResponseData = response.data as IPaymentResponse;
            setPaymentResponse(() => paymentResponseData);
            setShowResponseModal(true);
            setRecord(() => paymentResponseData.current_sell as IInvoice);
            Toast.success('Payment processed successfully');
            setShowPaymentModal(false);
            formik.resetForm();
        } catch (error: any) {
            Toast.error(error?.response?.data?.message || 'Payment failed');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleDownloadDocument = async (type: 'receipt' | 'invoice') => {
        try {
            setIsLoading(true);
            await StreamedDocumentAPI.generate(type, record?.invoice_number);
            Toast.success(`${type} downloaded successfully`);
        } catch (error) {
            console.error(`Failed to download ${type}:`, error);
            Toast.error(`Failed to download ${type}`);
        } finally {
            setIsLoading(false);
        }
    };

    const paymentColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'invoice_number', headerName: 'Invoice Number', width: 200 },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 130,
            renderCell: (params) => UtilMethods.formatNumber(params.value)
        },
        { field: 'payment_method', headerName: 'Payment Method', width: 200 },
        {
            field: 'created_at',
            headerName: 'Date',
            width: 200,
            renderCell: (params) => dayjs(params.value).format('MMM D, YYYY h:mm A'),
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

    if (isLoading) {
        return (
            <Backdrop open={true} style={{ zIndex: 9999, color: '#fff' }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    if (!record) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="container mt-4"
            >
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="ti ti-alert-circle me-2"></i>
                    <div>Invoice not found</div>
                </div>
            </motion.div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'overdue':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="container invoice-detail">
            <Breadcrumd parent="Invoices" url={Routes.INVOICE} />

            <div className="row g-3">
                <div className="col-lg-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card shadow-sm"
                    >
                        <div className="card-header border-0 bg-transparent d-flex justify-content-between align-items-center py-3">
                            <h5 className="mb-0 text-primary">Invoice Details</h5>
                            <div className="d-flex gap-2">
                                {record.status === 'paid' ? (
                                    <Tooltip title="Download receipt for this payment">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleDownloadDocument('receipt')}
                                            disabled={isLoading}
                                        >
                                            <i className="ti ti-download me-1"></i>
                                            Download Receipt
                                        </button>
                                    </Tooltip>
                                ) : (
                                    <>
                                        <Tooltip title="Download invoice document">
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleDownloadDocument('invoice')}
                                                disabled={isLoading}
                                            >
                                                <i className="ti ti-download me-1"></i>
                                                Download Invoice
                                            </button>
                                        </Tooltip>
                                        <Tooltip title="Add a new payment">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => setShowPaymentModal(true)}
                                                disabled={isLoading}
                                            >
                                                <i className="ti ti-cash me-1"></i>
                                                Add Payment
                                            </button>
                                        </Tooltip>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6 className="text-primary mb-3">Invoice Information</h6>
                                    <div className="mb-2 d-flex">
                                        <div className="text-muted" style={{ width: '120px' }}>Invoice Number:</div>
                                        <div className="fw-medium">{record.invoice_number}</div>
                                    </div>
                                    <div className="mb-2 d-flex">
                                        <div className="text-muted" style={{ width: '120px' }}>Sale Code:</div>
                                        <div className="fw-medium">{record.sell_code}</div>
                                    </div>
                                    <div className="mb-2 d-flex">
                                        <div className="text-muted" style={{ width: '120px' }}>Date:</div>
                                        <div className="fw-medium">{dayjs(record.created_at).format('MMM D, YYYY h:mm A')}</div>
                                    </div>
                                    <div className="mb-2 d-flex">
                                        <div className="text-muted" style={{ width: '120px' }}>Due Date:</div>
                                        <div className="fw-medium">{record.date_to_pay ? dayjs(record.date_to_pay).format('MMM D, YYYY') : 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-primary mb-3">Payment Status</h6>
                                    <div className="mb-3">
                                        <span className={`badge bg-${getStatusColor(record.status)} px-3 py-2`}>
                                            {record.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mb-2 d-flex justify-content-between">
                                        <div className="text-muted">Total Amount:</div>
                                        <div className="fw-medium">${UtilMethods.formatNumber(record.total_amount)}</div>
                                    </div>
                                    <div className="mb-2 d-flex justify-content-between">
                                        <div className="text-muted">Amount Paid:</div>
                                        <div className="fw-medium text-success">${UtilMethods.formatNumber(record.amount_paid)}</div>
                                    </div>
                                    <div className="mb-2 d-flex justify-content-between">
                                        <div className="text-muted">Balance:</div>
                                        <div className="fw-medium text-danger">${UtilMethods.formatNumber(record.remaining_balance)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="text-primary mb-0">Payment History</h6>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                                    >
                                        <i className={`ti ti-${showPaymentHistory ? 'eye-off' : 'eye'} me-1`}></i>
                                        {showPaymentHistory ? 'Hide History' : 'Show History'}
                                    </button>
                                </div>

                                {showPaymentHistory && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="table-responsive payment-history"
                                    >
                                        <DataGrid
                                            rows={record.payments || []}
                                            columns={paymentColumns}
                                            paginationModel={paginationModel}
                                            onPaginationModelChange={setPaginationModel}
                                            pageSizeOptions={[5, 10, 15]}
                                            className="bg-white rounded border-0 shadow-sm"
                                            autoHeight
                                            disableRowSelectionOnClick
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="col-lg-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card shadow-sm customer-info"
                    >
                        <div className="card-body">
                            <h6 className="text-primary mb-3">Customer Information</h6>
                            {record.customer ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="mb-2 d-flex">
                                        <div className="text-muted" style={{ width: '80px' }}>Name:</div>
                                        <div className="fw-medium">{`${record.customer.lastname} ${record.customer.firstname}`}</div>
                                    </div>
                                    <div className="mb-2 d-flex">
                                        <div className="text-muted" style={{ width: '80px' }}>Email:</div>
                                        <div className="fw-medium">{record.customer.email || 'N/A'}</div>
                                    </div>
                                    <div className="mb-2 d-flex">
                                        <div className="text-muted" style={{ width: '80px' }}>Phone:</div>
                                        <div className="fw-medium">{record.customer.phone || 'N/A'}</div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="alert alert-info mb-0">
                                    <i className="ti ti-info-circle me-2"></i>
                                    No customer information available
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="modal-content border-0 shadow"
                        >
                            <div className="modal-header border-0">
                                <h5 className="modal-title text-primary">Add Payment</h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setShowPaymentModal(false)}
                                    disabled={processingPayment}
                                ></button>
                            </div>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label text-muted">Amount</label>
                                        <div className="input-group">
                                            <span className="input-group-text">$</span>
                                            <input
                                                type="number"
                                                className={`form-control ${formik.touched.amount && formik.errors.amount ? 'is-invalid' : ''}`}
                                                name="amount"
                                                value={formik.values.amount}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                max={record.remaining_balance}
                                                min={0}
                                                step="0.01"
                                                placeholder="Enter payment amount"
                                            />
                                        </div>
                                        {formik.touched.amount && formik.errors.amount && (
                                            <div className="invalid-feedback d-block">{formik.errors.amount}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted">Payment Method</label>
                                        <select
                                            className={`form-select ${formik.touched.paymentMethod && formik.errors.paymentMethod ? 'is-invalid' : ''}`}
                                            name="paymentMethod"
                                            value={formik.values.paymentMethod}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        >
                                            <option value="">Select payment method</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                        </select>
                                        {formik.touched.paymentMethod && formik.errors.paymentMethod && (
                                            <div className="invalid-feedback d-block">{formik.errors.paymentMethod}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => setShowPaymentModal(false)}
                                        disabled={processingPayment}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processingPayment || !formik.isValid}
                                    >
                                        {processingPayment ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            'Submit Payment'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Payment Response Modal */}
            {showResponseModal && paymentResponse && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="modal-content border-0 shadow"
                        >
                            <div className="modal-header border-0">
                                <h5 className="modal-title text-primary">Payment Summary</h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setShowResponseModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <h6 className="text-primary border-bottom pb-2 mb-3">Payment Details</h6>
                                        <div className="mb-2 d-flex justify-content-between">
                                            <div className="text-muted">Invoice:</div>
                                            <div className="fw-medium">{paymentResponse.payment_details.invoice_number}</div>
                                        </div>
                                        <div className="mb-2 d-flex justify-content-between">
                                            <div className="text-muted">Amount Paid:</div>
                                            <div className="fw-medium text-success">${paymentResponse.payment_details.amount_paid.toFixed(2)}</div>
                                        </div>
                                        <div className="mb-2 d-flex justify-content-between">
                                            <div className="text-muted">Balance:</div>
                                            <div className="fw-medium text-danger">${paymentResponse.payment_details.remaining_balance.toFixed(2)}</div>
                                        </div>
                                        {paymentResponse.payment_details.excess_amount > 0 && (
                                            <div className="mb-2 d-flex justify-content-between">
                                                <div className="text-muted">Excess:</div>
                                                <div className="fw-medium text-warning">${paymentResponse.payment_details.excess_amount.toFixed(2)}</div>
                                            </div>
                                        )}
                                    </div>

                                    {paymentResponse.debt_coverage && (
                                        <div className="col-md-6">
                                            <h6 className="text-primary border-bottom pb-2 mb-3">Debt Coverage</h6>
                                            {paymentResponse.debt_coverage.covered_debts.length > 0 && (
                                                <div className="mb-3">
                                                    <strong className="d-block text-muted mb-2">Covered Debts:</strong>
                                                    {paymentResponse.debt_coverage.covered_debts.map((debt, index) => (
                                                        <div key={index} className="mb-1 d-flex justify-content-between">
                                                            <span>Sale #{debt.sale_id}:</span>
                                                            <span className="text-success">${debt.amount_covered.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {paymentResponse.debt_coverage.remaining_debts.length > 0 && (
                                                <div className="mb-3">
                                                    <strong className="d-block text-muted mb-2">Remaining Debts:</strong>
                                                    {paymentResponse.debt_coverage.remaining_debts.map((debt, index) => (
                                                        <div key={index} className="mb-1 d-flex justify-content-between">
                                                            <span>Sale #{debt.sale_id}:</span>
                                                            <span className="text-danger">${debt.remaining_amount.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {paymentResponse.debt_coverage.amount_to_balance > 0 && (
                                                <div className="mb-2 d-flex justify-content-between">
                                                    <div className="text-muted">To Balance:</div>
                                                    <div className="fw-medium">${paymentResponse.debt_coverage.amount_to_balance.toFixed(2)}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowResponseModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadInvoice;
