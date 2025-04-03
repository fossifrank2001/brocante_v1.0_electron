import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import Breadcrumd from '@/Components/Breadcrumd';
import SellAPI from '@/Data/Api/Sell';
import Toast from '@/Data/Utilities/Toast';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import dayjs from 'dayjs';
import '@/Styles/sells.scss';
import StreamedDocumentAPI, {RecordType} from "Data/Api/StreamedDocument.ts";

interface ISell {
    id: number;
    sell_code: string;
    customer: {
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
    };
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
    paid_amount: number;
    remaining_balance: number;
    status: string;
    created_at: string;
}

const ReadSell = () => {
    const dispatch = useAppDispatch();
    const { id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState<ISell | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [processingCancel, setProcessingCancel] = useState(false);

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
            const type: RecordType = record.status === 'paid'? 'receipt': 'invoice';
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

    return (
        <div className="container">
            <Breadcrumd parent="Sales" url={Pages.SELL} />

            <div className="row g-3">
                <div className="col-lg-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Sale Details</h5>
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => dispatch(setActivePage({ page: Pages.SELL }))}
                                >
                                    <i className="ti ti-arrow-left me-1"></i>
                                    Back
                                </button>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={downloadInvoice}
                                >
                                    <i className="ti ti-file-invoice me-1"></i>
                                    Download Invoice
                                </button>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6 className="mb-3">Customer Information</h6>
                                    <div className="mb-2">
                                        <strong>Name:</strong> {`${record.customer.lastname} ${record.customer.firstname}`}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Email:</strong> {record.customer.email}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Phone:</strong> {record.customer.phone}
                                    </div>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <h6 className="mb-3">Sale Information</h6>
                                    <div className="mb-2">
                                        <strong>Sale ID:</strong> #{record.sell_code}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Date:</strong> {dayjs(record.created_at).format('MMM D, YYYY h:mm A')}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Status:</strong> 
                                        <span className={`badge ms-2 bg-${record.status === 'paid' ? 'success' : 
                                            record.status === 'pending' ? 'warning' : 'danger'}`}>
                                            {record.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive mb-4">
                                <table className="table table-bordered table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Item</th>
                                            <th className="text-center">Quantity</th>
                                            <th className="text-end">Price</th>
                                            <th className="text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {record.sell_items.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.product.name}</td>
                                                <td className="text-center">{item.quantity}</td>
                                                <td className="text-end">${UtilMethods.formatNumber(item.price)}</td>
                                                <td className="text-end">${UtilMethods.formatNumber(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="table-light">
                                        <tr>
                                            <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                                            <td className="text-end"><strong>${UtilMethods.formatNumber(record.total_amount)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="text-end"><strong>Paid:</strong></td>
                                            <td className="text-end text-success">${UtilMethods.formatNumber(record.paid_amount)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="text-end"><strong>Balance:</strong></td>
                                            <td className="text-end text-danger">${UtilMethods.formatNumber(record.remaining_balance)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {record.status !== 'cancelled' && (
                                <div className="d-flex justify-content-end gap-2">
                                    {record.remaining_balance > 0 && (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => setShowPaymentModal(true)}
                                        >
                                            <i className="ti ti-cash me-1"></i>
                                            Add Payment
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => setShowCancelModal(true)}
                                    >
                                        <i className="ti ti-x me-1"></i>
                                        Cancel Sale
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                <div className="col-lg-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                    >
                        <div className="card-body">
                            <h6 className="mb-4">Payment Timeline</h6>
                            <div className="timeline-container">
                                {/* Add payment timeline here */}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Cancel Sale</h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={processingCancel}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Reason for Cancellation</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Please provide a reason for cancelling this sale"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={processingCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleCancel}
                                    disabled={processingCancel || !cancelReason.trim()}
                                >
                                    {processingCancel ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ti ti-x me-1"></i>
                                            Cancel Sale
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Backdrop */}
            {(showPaymentModal || showCancelModal) && (
                <div className="modal-backdrop fade show"></div>
            )}
        </div>
    );
};

export default ReadSell;
