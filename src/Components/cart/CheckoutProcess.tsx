import React, {SetStateAction, useCallback, useEffect, useState} from 'react';
import { Autocomplete, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { FormikProps } from 'formik';
import { FormValues } from './MultiStepFormCart';
import { ICartState } from 'Data/Slices/dashboard/seller/cartSlice';
import { IPerson } from 'Data/Interfaces/Person';
import CustomerAPI from 'Data/Api/Customer';
import Toast from 'Data/Utilities/Toast';
import UtilMethods from 'Data/Utilities/UtilMethods';
import { IApiResponseBase } from '@/Data/Utilities/axiosInstance';
import SuccessSellPage from "@/pages/Home/SuccessSellPage.tsx";
import {useAppDispatch} from "@/hooks";
import {saveCheckoutState} from "Data/Slices/dashboard/seller/checkoutSlice.ts";

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

export default function Component({
    persons,
    paymentModes,
    onHandleSettingPayment,
    onPersonChange,
    onAddPerson,
    formik,
    cart,
    onRefreshPersons
}: CheckoutProcessProps) {
    const [, setSelectedPerson] = useState<IPerson | null>(null);
    const [open, setOpen] = useState(false);
    const [newPerson, setNewPerson] = useState<IPerson>({
        id: 0,
        lastname: '',
        firstname: '',
        phone: ''
    });
    const [errors, setErrors] = useState({
        phone: '',
        lastname: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [, setIsRefreshing] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();


    useEffect(() => {
        if (paymentModes?.includes("Cash") && !formik.values.payment) {
            formik.setFieldValue('payment', "Cash");
            onHandleSettingPayment("Cash");
        }
    }, [paymentModes]);

    useEffect(() => {
        const valid  = formik.values.person &&
                     formik.values.payment && 
                     formik.values.transactionType &&
                     (formik.values.transactionType !== 'advance' || formik.values.advanceAmount > 0) &&
                     (formik.values.transactionType !== 'loan' || formik.values.date_to_pay);
        
        setIsFormValid(valid as SetStateAction<boolean>);
    }, [formik.values]);

    const handleOpenDialog = useCallback(() => {
        setOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setOpen(false);
        setNewPerson({
            id: 0,
            lastname: '',
            firstname: '',
            phone: ''
        });
        setErrors({
            phone: '',
            lastname: ''
        });
    }, []);

    const handleAddPerson = useCallback(async () => {
        try {
            if (!newPerson.phone || !newPerson.lastname) {
                setErrors({
                    phone: !newPerson.phone ? 'Phone number is required' : '',
                    lastname: !newPerson.lastname ? 'Last name is required' : ''
                });
                return;
            }

            setIsLoading(true);
            const { data }: IApiResponseBase<IPerson> = await CustomerAPI.create(newPerson);
            onAddPerson(data);
            Toast.success('Customer added successfully');
            handleCloseDialog();
            setNewPerson({ id: 0, lastname: '', firstname: '', phone: '' });
            setSelectedPerson(null);
        } catch (error) {
            console.error(error);
            Toast.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [newPerson, onAddPerson]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'phone') {
            if (!/^6[0-9]{8}$/.test(value.trim())) {
                error = 'Invalid phone number (must start with 6 and be 9 digits)';
            }
        } else if (name === 'lastname') {
            if (value.trim().length < 3) {
                error = 'Last name must be at least 3 characters';
            }
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        setNewPerson(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);
    useCallback(async () => {
        setIsRefreshing(true);
        try {
            await onRefreshPersons();
            Toast.success('Customer list refreshed');
        } catch (error) {
            Toast.error("Failed to refresh customer list");
        } finally {
            setIsRefreshing(false);
        }
    }, [onRefreshPersons]);
    const handlePaymentChange = (mode: string) => {
        formik.setFieldValue('payment', mode);
        onHandleSettingPayment(mode);
    };

    const handleTransactionTypeChange = (type: string) => {
        formik.setFieldValue('transactionType', type);
        if (type === 'total') {
            formik.setFieldValue('advanceAmount', 0);
            formik.setFieldValue('date_to_pay', null);
        }
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await formik.submitForm();
            if (!formik.isSubmitting && !formik.errors) {
                dispatch(saveCheckoutState({
                    step: 0,
                    formData: formik.values
                }))
                setShowSuccess(true);
            }
        } catch (err) {
            setError(err.message || 'An error occurred during the transaction');
            Toast.error(err.message || 'An error occurred during the transaction');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {showSuccess ? (
                <SuccessSellPage />
            ) : (
                <>
                    {error && (
                        <div className="alert alert-danger mb-4">
                            <div className="d-flex align-items-center">
                                <i className="ti ti-alert-circle me-2"></i>
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">
                                    <i className="ti ti-user me-2 text-primary"></i>
                                    Select Customer
                                </h5>
                                <div className="d-flex gap-2">
                                    <button 
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleOpenDialog();
                                        }}
                                    >
                                        <i className="ti ti-plus me-1"></i>
                                        Add New
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm ms-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onRefreshPersons();
                                        }}
                                    >
                                        <i className="ti ti-refresh"></i>
                                    </button>
                                </div>
                            </div>

                            <Autocomplete
                                options={persons}
                                getOptionLabel={(option) => `${option.lastname} ${option.firstname || ''} (${option.phone})`}
                                onChange={(_, value) => {
                                    formik.setFieldValue('person', value);
                                    onPersonChange(value);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search customer"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        error={formik.touched.person && !formik.values.person}
                                        helperText={formik.touched.person && !formik.values.person ? 'Customer is required' : ''}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title mb-4">
                                <i className="ti ti-wallet me-2 text-primary"></i>
                                Payment Details
                            </h5>
                            
                            <div className="alert alert-info mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="ti ti-receipt text-info me-2 fs-4"></i>
                                    <h6 className="mb-0">Order Summary</h6>
                                </div>
                                <div className="ms-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Subtotal:</span>
                                        <strong>{UtilMethods.formatNumber(cart.totalPrice)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Shipping:</span>
                                        <strong>{UtilMethods.formatNumber(formik.values.summarize?.shippingPrice || 0)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                        <span className="fw-bold">Total:</span>
                                        <strong className="text-primary fs-5">
                                            {UtilMethods.formatNumber(cart.totalPrice + (formik.values.summarize?.shippingPrice || 0))}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="mb-3">
                                    <i className="ti ti-credit-card me-2"></i>
                                    Payment Method
                                </h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {paymentModes.map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            className={`btn ${formik.values.payment === mode ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => handlePaymentChange(mode)}
                                        >
                                            <i className={`ti ti-${mode === 'Cash' ? 'cash' : 'phone'} me-2`}></i>
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                                {formik.touched.payment && !formik.values.payment && (
                                    <div className="text-danger mt-2 small">Payment method is required</div>
                                )}
                            </div>

                            <div className="mb-4">
                                <h6 className="mb-3">
                                    <i className="ti ti-truck-delivery me-2"></i>
                                    Delivery Option
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className={`card ${formik.values.summarize.shippingPrice === 0 ? 'border-primary' : 'border'} h-100`}>
                                            <div className="card-body">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        className="form-check-input"
                                                        name="deliveryOption"
                                                        id="free_delivery"
                                                        checked={formik.values.summarize.shippingPrice === 0}
                                                        onChange={() => formik.setFieldValue('summarize.shippingPrice', 0)}
                                                    />
                                                    <label className="form-check-label" htmlFor="free_delivery">
                                                        <strong>Free Delivery</strong>
                                                        <p className="text-muted mb-0">Standard delivery (0 FCFA)</p>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className={`card ${formik.values.summarize.shippingPrice === 500 ? 'border-primary' : 'border'} h-100`}>
                                            <div className="card-body">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        className="form-check-input"
                                                        name="deliveryOption"
                                                        id="fast_delivery"
                                                        checked={formik.values.summarize.shippingPrice === 500}
                                                        onChange={() => formik.setFieldValue('summarize.shippingPrice', 500)}
                                                    />
                                                    <label className="form-check-label" htmlFor="fast_delivery">
                                                        <strong>Express Delivery</strong>
                                                        <p className="text-muted mb-0">Fast delivery (500 FCFA)</p>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <h6 className="mb-3">
                                    <i className="ti ti-cash me-2"></i>
                                    Transaction Type
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div
                                            className={`card cursor-pointer ${formik.values.transactionType === 'total' ? 'border-primary bg-light' : 'border'} h-100`}
                                            role="button"
                                            onClick={() => handleTransactionTypeChange('total')}
                                        >
                                            <div className="card-body">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        className="form-check-input"
                                                        name="transactionType"
                                                        checked={formik.values.transactionType === 'total'}
                                                        onChange={() => handleTransactionTypeChange('total')}
                                                    />
                                                    <label className="form-check-label">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <i className="ti ti-cash-banknote text-primary me-2"></i>
                                                            <strong>Total Payment</strong>
                                                        </div>
                                                        <p className="text-muted small mb-0">Pay the full amount now</p>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div
                                            className={`card cursor-pointer ${formik.values.transactionType === 'advance' ? 'border-primary bg-light' : 'border'} h-100`}
                                            role="button"
                                            onClick={() => handleTransactionTypeChange('advance')}
                                        >
                                            <div className="card-body">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        className="form-check-input"
                                                        name="transactionType"
                                                        checked={formik.values.transactionType === 'advance'}
                                                        onChange={() => handleTransactionTypeChange('advance')}
                                                    />
                                                    <label className="form-check-label">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <i className="ti ti-coin text-warning me-2"></i>
                                                            <strong>Partial Payment</strong>
                                                        </div>
                                                        <p className="text-muted small mb-0">Pay a portion now</p>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div
                                            className={`card cursor-pointer ${formik.values.transactionType === 'loan' ? 'border-primary bg-light' : 'border'} h-100`}
                                            role="button"
                                            onClick={() => handleTransactionTypeChange('loan')}
                                        >
                                            <div className="card-body">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        className="form-check-input"
                                                        name="transactionType"
                                                        checked={formik.values.transactionType === 'loan'}
                                                        onChange={() => handleTransactionTypeChange('loan')}
                                                    />
                                                    <label className="form-check-label">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <i className="ti ti-calendar-time text-danger me-2"></i>
                                                            <strong>Loan</strong>
                                                        </div>
                                                        <p className="text-muted small mb-0">Pay later</p>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {formik.touched.transactionType && !formik.values.transactionType && (
                                    <div className="text-danger small mt-2">
                                        Please select a transaction type
                                    </div>
                                )}

                                {formik.values.transactionType === 'advance' && (
                                    <div className="mt-3">
                                        <TextField
                                            label="Advance Amount"
                                            type="number"
                                            value={formik.values.advanceAmount}
                                            onChange={(e) => formik.setFieldValue('advanceAmount', Number(e.target.value))}
                                            error={formik.touched.advanceAmount && !formik.values.advanceAmount}
                                            helperText={formik.touched.advanceAmount && !formik.values.advanceAmount ? 'Please enter advance amount' : ''}
                                            fullWidth
                                            InputProps={{
                                                startAdornment: <i className="ti ti-coin me-2 text-warning"></i>
                                            }}
                                        />
                                    </div>
                                )}

                                {(formik.values.transactionType === 'loan' || formik.values.transactionType === 'advance') && (
                                    <div className="mt-3">
                                        <TextField
                                            label="Payment Due Date"
                                            type="date"
                                            value={formik.values.date_to_pay}
                                            onChange={(e) => formik.setFieldValue('date_to_pay', e.target.value)}
                                            error={formik.touched.date_to_pay && !formik.values.date_to_pay}
                                            helperText={formik.touched.date_to_pay && !formik.values.date_to_pay ? 'Please select payment due date' : ''}
                                            fullWidth
                                            InputProps={{
                                                startAdornment: <i className="ti ti-calendar me-2 text-primary"></i>
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            {formik.values.person && JSON.parse(formik.values.person.remaining_balance || '{}') &&
                                Object.keys(JSON.parse(formik.values.person.remaining_balance)).length > 0 && (
                                    <div className="has-authorized-section bg-light rounded-3 p-3 border mb-4">
                                        <div className="d-flex justify-content-between">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <i className="ti ti-alert-circle text-warning fs-4"></i>
                                                    <div>
                                                        <h5 className="mb-1">Outstanding Payments</h5>
                                                        <small className="text-muted">This customer has unpaid balances from previous sales</small>
                                                    </div>
                                                </div>
                                                <div className="border-top pt-2">
                                                    <div className="row">
                                                        {Object.entries(JSON.parse(formik.values.person.remaining_balance)).map(([saleId, amount]) => (
                                                            <div key={saleId} className="col-md-6 mb-2">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <span className="text-muted">{saleId}</span>
                                                                    <strong className="text-danger">{UtilMethods.formatNumber(amount as number)}</strong>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                                        <div>
                                                            <h6 className="mb-0">Total Unpaid</h6>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-danger mb-0">
                                                                {UtilMethods.formatNumber(
                                                                    Object.values(JSON.parse(formik.values.person.remaining_balance))
                                                                        .reduce((a, b) => (a as number) + (b as number), 0) as number
                                                                )}
                                                            </h5>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                                    <label className="form-check-label" htmlFor="has_authorized">
                                                        Ignore unpaid for this sell
                                                    </label>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="has_authorized"
                                                            name="has_authorized"
                                                            style={{
                                                                width: '3rem',
                                                                height: '1.5rem',
                                                                cursor: 'pointer'
                                                            }}
                                                            checked={formik.values.has_authorized}
                                                            onChange={(e) => formik.setFieldValue('has_authorized', e.target.checked)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            <button 
                                className="btn btn-primary w-100"
                                onClick={handleSubmit}
                                disabled={!isFormValid || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="ti ti-check me-2"></i>
                                        Complete Purchase
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <Dialog 
                        open={open} 
                        onClose={handleCloseDialog} 
                        maxWidth="sm" 
                        fullWidth
                        PaperProps={{
                            className: 'rounded-3'
                        }}
                    >
                        <DialogTitle className="bg-light border-bottom">
                            <div className="d-flex align-items-center">
                                <i className="ti ti-user-plus me-2 text-primary"></i>
                                Add New Customer
                            </div>
                        </DialogTitle>
                        <DialogContent className="py-4">
                            <div className="mb-3">
                                <TextField
                                    label="Last Name"
                                    name="lastname"
                                    value={newPerson.lastname}
                                    onChange={handleInputChange}
                                    error={!!errors.lastname}
                                    helperText={errors.lastname}
                                    fullWidth
                                    required
                                    margin="dense"
                                    InputProps={{
                                        startAdornment: <i className="ti ti-user me-2 text-muted"></i>
                                    }}
                                />
                            </div>
                            <div className="mb-3">
                                <TextField
                                    label="First Name"
                                    name="firstname"
                                    value={newPerson.firstname}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="dense"
                                    InputProps={{
                                        startAdornment: <i className="ti ti-user me-2 text-muted"></i>
                                    }}
                                />
                            </div>
                            <div className="mb-3">
                                <TextField
                                    label="Phone Number"
                                    name="phone"
                                    value={newPerson.phone}
                                    onChange={handleInputChange}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    fullWidth
                                    required
                                    margin="dense"
                                    InputProps={{
                                        startAdornment: <i className="ti ti-phone me-2 text-muted"></i>
                                    }}
                                />
                            </div>
                        </DialogContent>
                        <DialogActions className="bg-light border-top p-3">
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={handleCloseDialog}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={handleAddPerson}
                                disabled={isLoading || !!errors.phone || !!errors.lastname}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <i className="ti ti-user-plus me-2"></i>
                                        Add Customer
                                    </>
                                )}
                            </button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </>
    );
}