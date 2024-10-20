import React, {useRef, useState, useEffect} from 'react';
import {IPerson} from "Data/Interfaces/Person.ts";
import { Autocomplete, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import {FormikProps} from "formik";
import {FormValues} from "Components/cart/MultiStepFormCart.tsx";
import CustomerAPI from "Data/Api/Customer.ts";
import Toast from "Data/Utilities/Toast.ts";
import { IApiResponseBase } from 'Data/Utilities/axiosInstance.ts';
import UtilMethods from "Data/Utilities/UtilMethods.ts";

interface CheckoutProcessProps {
    persons: IPerson[];
    paymentModes: string[];
    payment: string;
    onHandleSettingPayment: (payment: string) => void;
    onPersonChange: (person: IPerson) => void;
    onHandleSearchCustomer: (qPerson: string) => void;
    onAddPerson: (person: IPerson) => void;
    formik: FormikProps<FormValues>;
}

const CheckoutProcess: React.FC<CheckoutProcessProps> = ({
         persons,
         paymentModes,
         onHandleSettingPayment,
         onPersonChange,
         payment,
         onHandleSearchCustomer,
         onAddPerson,
         formik
     }) => {
    const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
    const [open, setOpen] = useState(false);
    const [newPerson, setNewPerson] = useState<IPerson>({
        id: 0,
        lastname: '',
        firstname: '',
        phone: ''
    });
    const [unpaidAmount, setUnpaidAmount] = useState<number |  undefined>(0);
    const [remainingBalance, setRemainingBalance] = useState<never | null | undefined>(null);

    const [errors, setErrors] = useState({
        phone: '',
        lastname: ''
    });
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        formik.setFieldValue('summarize.shippingPrice', 0);
        if (paymentModes.includes("Cash")) {
            console.log("Setting default payment to Cash");
            onHandleSettingPayment("Cash");
            formik.setFieldValue('payment', "Cash");
            formik.setFieldValue('transactionType', "total");
            formik.setFieldValue('advanceAmount', 0);
            formik.setFieldValue('has_authorized', true);
        } else {
            console.log("Cash payment not available in paymentModes");
        }
    }, []);


    const handlePersonSelect = (person: IPerson) => {
        setRemainingBalance(null)
        setUnpaidAmount(0)
        setSelectedPerson(person);
        onPersonChange(person);
        formik.setFieldValue('person', person) ;
    };

    const personRef = useRef(null)

    useEffect(() => {
        if (selectedPerson){
            const remainingBalance = JSON.parse(selectedPerson.remaining_balance)
            setRemainingBalance(() => {
                if (Array.isArray(remainingBalance)) {
                    return {}
                }
                return remainingBalance
            })
            setUnpaidAmount(selectedPerson.company_balance)
        }
    }, [selectedPerson]);

    const handleOpenDialog = () => {
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleAddPerson = async () => {
        try {
            if (newPerson.phone && newPerson.lastname) {
                setIsLoading(true)
                const { data }: IApiResponseBase<IPerson> = await CustomerAPI.create(newPerson)
                onAddPerson(data);
                handleCloseDialog();
                setNewPerson({ id: 0, lastname: '', firstname: '', phone: '' });
                setSelectedPerson(null);
            } else {
                throw new Error('New person is not valid');
            }
        }catch (error){
            console.error(error);
            Toast.error(error)
        }finally{
            setIsLoading(false)
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if(name === 'phone' && !/^6[0-9]{8}$/.test(value.trim())){
            setErrors(_prev => ({
                ..._prev,
                [name]: 'Invalid Phone number, should be like (6.......)',
            }))
        }else{
            setErrors(_prev => ({
                ..._prev,
                [name]: '',
            }))
        }

        if(name === 'lastname' && value.trim().length < 3){
            setErrors(_prev => ({
                ..._prev,
                [name]: 'Invalid last name, should be at least 03 characters',
            }))
        }else{
            setErrors(_prev => ({
                ..._prev,
                [name]: '',
            }))
        }
        setNewPerson(prevPerson => ({
            ...prevPerson,
            [name]: value,
        }));
    };

    return (
        <div className="container">
            <div className='row'>
                {remainingBalance && Object.keys(remainingBalance).length > 0 && <div className="col-xs-12 col-md-12 mx-auto">
                    <div className="alert alert-danger">
                        <strong>There are some unpaid for the selected customer.</strong>
                        <ul>
                            {Object.keys(remainingBalance).map(_item =>
                                <li key={_item}>
                                    Sell code ::: {_item} | Unpaid ::: {UtilMethods.formatNumber(remainingBalance[_item])}
                                </li>)
                            }
                        </ul>
                    </div>
                </div>}
                <div className="col-xs-12 col-md-8 payment-method-list payment-method" style={{display: "block"}}>
                    <div className="delivery-option w-100 btn-group-active  card shadow-none border">
                        <div className="card-body p-4 w-100">
                            <h6 className="mb-3 fw-semibold fs-4">Delivery Option</h6>
                            <div className="btn-group flex-row gap-3 w-100" role="group"
                                 aria-label="Basic radio toggle button group">
                                <div className='col-6'>
                                    <div className="position-relative form-check btn-custom-fill flex-fill ps-0" >
                                        <input
                                            type="radio"
                                            className="form-check-input ms-4 round-16"
                                            name="deliveryOpt1"
                                            id="free_delivery"
                                            autoComplete="off"
                                            style={{position: 'absolute', top: '35%'}}
                                            checked={formik.values.summarize.shippingPrice === 0} // controlled state
                                            onChange={() => formik.setFieldValue('summarize.shippingPrice', 0)}
                                        />
                                        <label className="btn btn-outline-primary mb-0 p-3 rounded ps-5 w-100"
                                               htmlFor="free_delivery">
                                            <div className="text-start ps-2">
                                                <h6 className="fs-3 fw-semibold mb-0">Free delivery</h6>
                                                <p className="mb-0 fs-1 text-muted">Shipping price(0 <span className=''
                                                       style={{fontSize: '10px'}}>FCFA</span>)
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className='col-6'>
                                    <div className="position-relative form-check btn-custom-fill flex-fill ps-0">
                                        <input type="radio" className="form-check-input ms-4 round-16"
                                               name="deliveryOpt1"
                                               id="fast_delivery" autoComplete="off"
                                               style={{position: 'absolute', top: '35%'}} onChange={() =>
                                            formik.setFieldValue('summarize.shippingPrice', 500)}/>
                                        <label className="btn btn-outline-primary mb-0 p-3 rounded ps-5 w-100"
                                               htmlFor="fast_delivery">
                                            <div className="text-start ps-2">
                                                <h6 className="fs-3 fw-semibold mb-0">Fast delivery</h6>
                                                <p className="mb-0 f-1 text-muted">Shipping price(500 <span className=''
                                                           style={{fontSize: '10px!important'}}>FCFA</span>)
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {/*</div>*/}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-xs-12 col-md-4'>
                    <div className='card w-100'>
                        <div className="card-body p-4 w-100">
                            <h6 className="mb-3 fw-semibold fs-4">Select Customer</h6>
                            <Autocomplete
                                ref={personRef}
                                id="person"
                                options={persons}
                                getOptionLabel={(option) => `${option.firstname} ${option.lastname}`}
                                value={formik.values.person}
                                onChange={(_, person) => handlePersonSelect(person)}
                                onInputChange={(_, val) => onHandleSearchCustomer(String(val ?? '').trim())}
                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Customer"
                                        variant="outlined"
                                        error={Boolean(formik.errors.person && formik.touched.person)}
                                        helperText={formik.errors.person ? 'Person is required' : ''}
                                    />
                                )}
                            />
                            <button type='button' className='btn btn-outline-primary mt-2' onClick={handleOpenDialog}>
                                Add Customer
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-xs-12 col-md-7'>
                    <div className=' card w-100'>
                        <div className="card-body p-4 w-100">
                            <h6 className="mb-3 fw-semibold fs-4">Select Payment Mode</h6>
                            <div className="btn-group flex-row gap-1 w-100" role="group"
                                 aria-label="Basic radio toggle button group">
                                {
                                    paymentModes.map((_payment, key) => {
                                        return <div key={key} className='col-4'>
                                            <div
                                                className="position-relative form-check btn-custom-fill flex-fill ps-0"
                                                style={(() => {
                                                    if(_payment === payment) {
                                                        return {
                                                            backgroundColor: 'rgba(17, 32, 76, 0.1)',
                                                            borderColor: 'var(--bs-primary)'
                                                        }
                                                    }
                                                })()}
                                            >
                                                <input
                                                    type="radio"
                                                    className="form-check-input ms-4 round-16"
                                                    name="payment"
                                                    id={`${_payment}`}
                                                    autoComplete="off"
                                                    style={{position: 'absolute', top: '30%'}}
                                                    checked={_payment === payment} // controlled state
                                                    onChange={() => {
                                                        onHandleSettingPayment(_payment);
                                                        formik.setFieldValue('payment', _payment);
                                                    }}
                                                />

                                                <label className="btn btn-outline-primary mb-0 p-3 rounded ps-5 w-100"
                                                       htmlFor={`${_payment}`}>
                                                    <div className="text-start ps-2">
                                                        <h6 className="fs-3 fw-semibold mb-0">{_payment}</h6>
                                                        <p className="mb-0 fs-1 text-muted">Pay with {_payment}</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-xs-12 col-md-5'>
                    <div className='card col-xs-12'>
                        <div className="card-body p-4 w-100">
                            <div className="transaction-type-section mb-4">
                                <h5>Transaction Type</h5>
                                <div className="d-flex justify-content-between">
                                    <div className="w-100 me-2">
                                        <input
                                          type="radio"
                                          className="btn-check"
                                          name="transactionType"
                                          id="total"
                                          value="total"
                                          checked={formik.values.transactionType === 'total'}
                                          onChange={(e) => formik.setFieldValue('transactionType', e.target.value)}
                                        />
                                        <label className="btn btn-outline-primary w-100" htmlFor="total">Total</label>
                                    </div>

                                    <div className="w-100 me-2">
                                        <input
                                          type="radio"
                                          className="btn-check"
                                          name="transactionType"
                                          id="advance"
                                          value="advance"
                                          checked={formik.values.transactionType === 'advance'}
                                          onChange={(e) => formik.setFieldValue('transactionType', e.target.value)}
                                        />
                                        <label className="btn btn-outline-primary w-100"
                                               htmlFor="advance">Advance</label>
                                    </div>

                                    <div className="w-100">
                                        <input
                                          type="radio"
                                          className="btn-check"
                                          name="transactionType"
                                          id="loan"
                                          value="loan"
                                          checked={formik.values.transactionType === 'loan'}
                                          onChange={(e) => formik.setFieldValue('transactionType', e.target.value)}
                                        />
                                        <label className="btn btn-outline-primary w-100" htmlFor="loan">Loan</label>
                                    </div>
                                </div>

                                {formik.errors.transactionType && formik.touched.transactionType && (
                                  <div className="text-danger">{formik.errors.transactionType}</div>
                                )}
                            </div>
                            <div className="row">
                                {formik.values.transactionType === 'advance' && (
                                  <div className="col-lg-6">
                                      <div className="form-group mb-4">
                                          <label htmlFor="loanAmount">Loan Amount</label>
                                          <input
                                            type="number"
                                            name="advanceAmount"
                                            className="form-control"
                                            value={formik.values.advanceAmount}
                                            onChange={(e) => formik.setFieldValue('advanceAmount', e.target.value)}
                                            style={{ ...(formik.errors.advanceAmount && formik.touched.advanceAmount) && { borderColor: 'red' } }}
                                          />
                                          {formik.errors.advanceAmount && formik.touched.advanceAmount && (
                                            <div className="text-danger">{formik.errors.advanceAmount}</div>
                                          )}
                                      </div>
                                  </div>

                                )}
                                {(formik.values.transactionType === 'advance' || formik.values.transactionType === 'loan') && (
                                  <div className="col-lg-6">
                                      <div className="form-group mb-4">
                                          <label htmlFor="date_to_pay">Date to Pay</label>
                                          <input
                                            type="date"
                                            name="date_to_pay"
                                            className="form-control"
                                            value={formik.values.date_to_pay || ''}
                                            onChange={(e) => formik.setFieldValue('date_to_pay', e.target.value)}
                                            style={{ ...(formik.errors.date_to_pay && formik.touched.date_to_pay) && { borderColor: 'red' } }}
                                            min={new Date().toISOString().split('T')[0]}
                                          />
                                          {formik.errors.date_to_pay && formik.touched.date_to_pay && (
                                            <div className="text-danger">{formik.errors.date_to_pay}</div>
                                          )}
                                          {formik.values.transactionType === 'loan' && (
                                            <small className="text-muted">
                                                Please specify the date by which the loan should be repaid.
                                            </small>
                                          )}
                                          {formik.values.transactionType === 'advance' && (
                                            <small className="text-muted">
                                                Please specify the date by which the advance should be completed.
                                            </small>
                                          )}
                                      </div>
                                  </div>
                                )}
                            </div>
                            <div className="has-authorized-section row">
                                <div className="d-flex justify-content-between align-items-center col-12">
                                    <label className="col-form-label col-md-9" htmlFor="has_authorized">
                                        <h5>Ignore unpaid for this sell</h5>
                                    </label>
                                    <div className="col-md-3">
                                        <div className="form-check form-switch">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              id="has_authorized"
                                              name="has_authorized"
                                              checked={formik.values.has_authorized}
                                              onChange={(e) => formik.setFieldValue('has_authorized', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>Add New Person</DialogTitle>
                <DialogContent>
                    <div className="d-flex align-items-center gap-3 justify-content-between">
                        <div className="mb-3">
                            <TextField
                              autoFocus
                              margin="dense"
                              id="lastname"
                              label="Last Name"
                              type="text"
                              fullWidth
                              variant="outlined"
                              name="lastname"
                              value={newPerson.lastname}
                                onChange={handleInputChange}
                                error={Boolean(errors.lastname)}
                                helperText={errors.lastname}

                            />
                        </div>
                        <div className="mb-3">
                            <TextField
                                margin="dense"
                                id="firstname"
                                label="First Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                name="firstname"
                                value={newPerson.firstname}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <TextField
                            margin="dense"
                            id="phone"
                            label="Phone Number"
                            type="text"
                            fullWidth
                            variant="outlined"
                            name="phone"
                            value={newPerson.phone}
                            onChange={handleInputChange}
                            error={Boolean(errors.phone)}
                            helperText={errors.phone}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <button type="button" className="btn btn-secondary" onClick={handleCloseDialog}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleAddPerson} disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Person'}
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CheckoutProcess;
