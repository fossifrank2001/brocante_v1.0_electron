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
} from '@mui/material';
import Breadcrumd from '@/Components/Breadcrumd';
import InfoItem from '@/Components/InfoItem';
import SellAPI from 'Data/Api/Sell.ts';
import { useAppSelector } from '@/hooks';
import Toast from '@/Data/Utilities/Toast';
import UtilMethods from 'Data/Utilities/UtilMethods.ts';
import dayjs from 'dayjs';
import InvoiceAPI from 'Data/Api/Invoice.ts';

const ReadSell = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState(null);
    const [inProgress, setInProgress] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openCancelModal, setOpenCancelModal] = useState(false);
    const [reason, setReason] = useState('');
    const [reloadRecord, setReloadRecord] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const fetchRecord = useCallback(async () => {
        setInProgress(true);
        try {
            const { data } = await SellAPI.show(id);
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

    const handleCancel = async () => {
        if (!reason) {
            Toast.error('Please provide a reason for cancellation.');
            return;
        }

        setInProgress(true);
        try {
            const { message } = await SellAPI.cancel(id, { reason });
            Toast.success(message);
            handleCloseCancelModal();
            setReloadRecord(true);
        } catch (error) {
            console.error(error);
        } finally {
            setInProgress(false);
        }
    };

    const handlePayment = async () => {
        if (paymentAmount <= 0) {
            Toast.error('Please enter a valid payment amount.');
            return;
        }

        setInProgress(true);
        try {
            const { message } = await InvoiceAPI.pay(record.invoice.id, { amount: paymentAmount, payment_method: paymentMethod });
            Toast.success(message);
            setReloadRecord(true);
            handleCloseModal();
        } catch (error) {
            console.error(error);
        } finally {
            setInProgress(false);
        }
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setReason('');
        setPaymentAmount(0);
        setPaymentMethod('Cash');
    };

    const handleCloseCancelModal = () => {
        setOpenCancelModal(false);
        setReason('');
    };


    return (
        <div className="container">
            <Breadcrumd parent="Sells" url={currentPage} _child={id} />
            {inProgress ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : record ? (
                <>
                    <div className="d-flex align-items-center gap-3" style={{marginBottom: '16px'}}>
                        {record.status === 'pending' && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => setOpenCancelModal(true)}
                                disabled={inProgress}
                            >
                                {inProgress ? 'Cancelling...' : 'Cancel Sell'}
                            </Button>
                        )}
                        {record.status === SellAPI.PAID ? (
                            <Button className='d-flex align-items-center' variant="contained" color="secondary">
                                <i className='ti ti-download ml-2'></i>
                                <span>Download Receipt</span>
                            </Button>
                        ) : record.status !== SellAPI.CANCELLED ? (
                            <div className="d-flex align-items-center gap-3">
                                <Button className='d-flex align-items-center' variant="outlined" color="primary">
                                    <i className='ti ti-download me-2'></i>
                                    <span>Download Invoice</span>
                                </Button>
                                {record.status === SellAPI.PENDING && <Button
                                    className='d-flex align-items-center'
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenModal}
                                >
                                    <i className='ti ti-receipt me-2'></i>
                                    <span>Pay</span>
                                </Button>}
                            </div>
                        ) : null}
                    </div>

                    <div className='card'>
                        <div className='card-body'>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">Sell Information</Typography>
                                    <InfoItem
                                        label="Sell Code"
                                        value={record.sell_code}
                                        second={{
                                            label: 'Total Amount',
                                            value: UtilMethods.formatNumber(record.total_amount),
                                        }}
                                    />
                                    <InfoItem
                                        label="Remaining balance"
                                        value={UtilMethods.formatNumber(record.remaining_balance)}
                                    />
                                    <InfoItem
                                        label="Transaction Type"
                                        value={record.transaction_type}
                                        second={{
                                            label: "Status",
                                            value: (
                                                <span className={UtilMethods.getStatus(record?.status)}>
                                                    {record?.status}
                                                </span>
                                            ),
                                        }}
                                    />
                                    <InfoItem
                                        label="Created At"
                                        value={record.created_at ? dayjs(record.created_at).format('MMMM D, YYYY h:mm A') : 'N/A'}
                                        second={{
                                            label: `Updated At`,
                                            value: record.updated_at ? dayjs(record.updated_at).format('MMMM D, YYYY h:mm A') : 'N/A',
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
                                    <Typography variant="h6">Customer</Typography>
                                    {record.customer ? (
                                        <>
                                            <InfoItem label="Customer Name"
                                                      value={`${record.customer.lastname} ${record.customer.firstname}`}/>
                                            <InfoItem label="Phone" value={record.customer.phone ?? ''} second={{
                                                label: `Email`,
                                                value: record.customer.email ?? ''
                                            }}/>
                                        </>
                                    ) : (
                                        <Typography>No customer data available</Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </div>
                    </div>

                    <div className='card mt-2'>
                        <div className='card-body'>
                            <Typography variant="h6">Sell Items</Typography>
                            <Grid container spacing={2}>
                                {record.sell_items && record.sell_items.length > 0 ? (
                                    record.sell_items.map((item, index) => (
                                        <Grid item xs={12} md={6} key={index}>
                                            <div>
                                                <InfoItem label={`Item ${index + 1} Product`}
                                                          value={item.product?.name ?? 'N/A'}/>
                                                <InfoItem label={`Item ${index + 1} Quantity`} value={item.quantity}/>
                                                <InfoItem
                                                    label={`Item ${index + 1} Price`}
                                                    value={UtilMethods.formatNumber(item.price)}
                                                />
                                            </div>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Typography>No sell items available</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </div>
                    </div>

                </>
            ) : (
                <Typography variant="h6" color="error">Failed to load sell data</Typography>
            )}

            <Dialog open={openCancelModal} onClose={handleCloseCancelModal}>
                <DialogTitle>Cancel Sell</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleCancel} color="primary" disabled={inProgress}>
                        {inProgress ? 'Cancelling...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Payment</DialogTitle>
                <DialogContent>
                    <div className="mb-3">
                        <strong>Amount</strong>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Amount"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        />
                    </div>
                    <div className="mb-3">
                        <strong>Payment Method</strong>
                        <Select
                            label="Payment Method"
                            fullWidth
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            variant="outlined"
                        >
                            <MenuItem value="Cash">Cash</MenuItem>
                            <MenuItem value="Orange Money">Orange Money</MenuItem>
                            <MenuItem value="MTN Money">MTN Money</MenuItem>
                        </Select>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handlePayment} color="primary" disabled={inProgress}>
                        {inProgress ? 'Processing...' : 'Pay'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ReadSell;
