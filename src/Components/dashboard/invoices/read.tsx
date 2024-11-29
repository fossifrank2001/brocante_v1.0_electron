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
import { useAppSelector } from '@/hooks';
import Toast from '@/Data/Utilities/Toast';
import UtilMethods from 'Data/Utilities/UtilMethods.ts';
import dayjs from 'dayjs';
import InvoiceAPI from 'Data/Api/Invoice.ts';
import {IInvoice} from "Interfaces";
import StreamedDocumentAPI from "Data/Api/StreamedDocument.ts";
import {DataGrid, GridColDef, GridPaginationModel} from "@mui/x-data-grid";
import SellAPI from "Data/Api/Sell.ts";

const ReadInvoice = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState<IInvoice | null>(null);
    const [inProgress, setInProgress] = useState(false);
    const [inProgressTwo, setInProgressTwo] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [reloadRecord, setReloadRecord] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [showPayments, setShowPayments] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 5,
        page: 0,
    });

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

    const handlePayment = async () => {
        if (paymentAmount <= 0) {
            Toast.error('Please enter a valid payment amount.');
            return;
        }

        setInProgress(true);
        try {
            const { message } = await InvoiceAPI.pay(id, { amount: paymentAmount, payment_method: paymentMethod });
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
        setPaymentAmount(0);
        setPaymentMethod('Cash');
    };

    const handleDownloadDocument = async (_type: 'receipt' | 'invoice') => {
        try {
            setInProgressTwo(true)
            await StreamedDocumentAPI.generate(_type, record.invoice_number)
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

    return (
        <div className="container">
            <Breadcrumd parent="Invoices" url={currentPage} _child={id} />
            {inProgress ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : record ? (
                <>
                    <div className="d-flex align-items-center gap-3" style={{marginBottom: '16px'}}>
                        <div className="d-flex align-items-center gap-3">
                            {record.status === SellAPI.PAID ? (
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

                    <div className='card'>
                        <div className='card-body'>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">Invoice Information</Typography>
                                    <InfoItem
                                        label="Sell Code"
                                        value={record.sell_code}
                                        second={{
                                            label: 'Invoice Number',
                                            value: record.invoice_number,
                                        }}
                                    />
                                    <InfoItem
                                        label="Remaining Balance"
                                        value={UtilMethods.formatNumber(record.remaining_balance)}
                                        second={{
                                            label: 'Total Amount',
                                            value: UtilMethods.formatNumber(record.total_amount),
                                        }}
                                    />
                                    <InfoItem
                                        label="Amount Paid"
                                        value={UtilMethods.formatNumber(record.amount_paid)}
                                        second={{
                                            label: "Date To Pay",
                                            value: record.date_to_pay ? dayjs(record.date_to_pay).format('YYYY-MM-DD H:mm:s') : 'N/A',
                                        }}
                                    />
                                    <InfoItem
                                        label="Created At"
                                        value={record.created_at ? dayjs(record.created_at).format('YYYY-MM-DD H:mm:s') : 'N/A'}
                                        second={{
                                            label: `Updated At`,
                                            value: record.updated_at ? dayjs(record.updated_at).format('YYYY-MM-DD H:mm:s') : 'N/A',
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
                                                rows={record.payments || []}
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
                </>
            ) : (
                <Typography variant="h6" color="error">Failed to load sell data</Typography>
            )}

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

export default ReadInvoice;
