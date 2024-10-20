import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Form, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import "Styles/Product.less";
import {CartItem, clearCart, ICartState} from "Data/Slices/dashboard/seller/cartSlice.ts";
import CartListing from "Components/cart/CartListing.tsx";
import CheckoutProcess from "Components/cart/CheckoutProcess.tsx";
import { IPerson } from "Data/Interfaces/Person.ts";
import CustomerAPI from "Data/Api/Customer.ts";
import SellAPI from "Data/Api/Sell.ts";
import {ISellPayload, TPayment, TTransactionType} from "Data/Interfaces/Sell.ts";
import {useAppContext} from "@/contexts/appContext.tsx";
import {useAppDispatch} from "@/hooks";
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";

export interface FormValues {
    person: IPerson | null;
    payment: TPayment;
    transactionType: TTransactionType,
    advanceAmount: number,
    date_to_pay: string | null,
    items: CartItem[];
    summarize: {
        totalPrice: number;
        tax: number;
        shippingPrice: number;
    };
    has_authorized: boolean
}

const stepVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

interface IMultiStepFormCartProps {
    cart: ICartState;
}

const MultiStepFormCart: React.FC<IMultiStepFormCartProps> = ({ cart }) => {
    const [step, setStep] = useState<number>(0);
    const steps = ['Cart Listing', 'Checkout Process'];
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const isLastStep = step === steps.length - 1;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [paymentModes] = useState<Array<string>>(['Cash', 'Orange Money', 'MTN Money']);
    const [payment, setPayment] = useState<string>('');
    const [persons, setPersons] = useState<IPerson[]>([]);
    const [qPerson, setqPerson] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    const initialValues: FormValues = {
        person: null,
        payment: "Cash",
        items: cart.items,
        transactionType: "total",
        advanceAmount: 0,
        summarize: {
            totalPrice: cart.totalPrice,
            tax: 0,
            shippingPrice: 0
        },
        date_to_pay: formattedToday,
        has_authorized: true
    };

    const getCustomers = useCallback(async (_qPerson: string) => {
        try {
            const result = await CustomerAPI.get(_qPerson, true);
            setPersons(result?.data || []);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        getCustomers(qPerson);
    }, [getCustomers, qPerson]);

    const validationSchema = [
        Yup.object({
            items: Yup.array().of(
                Yup.object().shape({
                    product: Yup.object().shape({
                        id: Yup.number().required('Product ID is required'),
                        name: Yup.string().required('Product name is required'),
                    }),
                    quantity: Yup.number()
                        .required('Quantity is required')
                        .min(1, 'Quantity must be at least 1'),
                    subtotal: Yup.number().required('Subtotal is required'),
                })
            ),
            summarize: Yup.object({
                totalPrice: Yup.number().required(),
                tax: Yup.number().required(),
                shippingPrice: Yup.number().required()
            }).required('Summary is required'),
        }),
        Yup.object({
            payment: Yup.string().required('Payment method is required').default('Cash'),
            person: Yup.object().nullable().required('Person is required'),
            transactionType: Yup.string()
                .oneOf(['total', 'advance', 'loan'])
                .required('Transaction type is required'),
            advanceAmount: Yup.number().when('transactionType', (transactionType) => {
                if (transactionType.includes('advance')) {
                    return Yup.number()
                        .required('Advance amount is required')
                        .min(1, 'Advance amount must be greater than 0');
                }
                return Yup.number().notRequired();
            }),
            date_to_pay: Yup.date()
                .when('transactionType', (transactionType) => {
                    if (transactionType.includes('loan') || transactionType.includes('advance') ) {
                        return Yup.date().min(today, 'The payment date cannot be earlier than today').required('Date to pay is required').nullable();
                    }
                    return Yup.date().notRequired().nullable();
                }),
            has_authorized: Yup.boolean().default(true)
        })
    ];

    const handleSubmit = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
        if (isLastStep) {
            try {
                setIsLoading(true)
                const treatedData = treatedDataFunc(values)
                const result = await SellAPI.create(treatedData)
                actions.resetForm();

                dispatch(clearCart());
                context.togglePageLoading()
                dispatch(setActivePage({
                    page: Pages.SUCCESS_ORDER,
                    param: {
                        type: treatedData.transaction_type,
                        number: result.data?.sell_code
                    }
                }))
            } catch (error) {
                console.error(error);
            }finally {
                setIsLoading(false)
            }
        } else {
            setStep(step + 1);
        }
        actions.setSubmitting(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePersonChange = (newPerson: IPerson) => {
        // set(newPerson);
        console.log(newPerson)
    };

    const handleAddPerson = (person: IPerson) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        setPersons([ person, ...persons]);
        setqPerson('');
    };

    return (
        <div className="container px-0">
            <div className="stepper mt-4">
                <ul className="d-flex justify-content-between">
                    {steps.map((label, index) => (
                        <li
                            key={index}
                            className={`stepper-item ${index <= step ? 'completed' : ''}`}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className='d-flex justify-content-center align-items-center'
                            >
                                <span className='indice me-1'>{index + 1}</span>
                                <span className='label'>{label}</span>
                            </motion.div>
                        </li>
                    ))}
                </ul>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema[step]}
                onSubmit={handleSubmit}
            >
                {(formik: FormikProps<FormValues>) => (
                    <Form>
                        <div className='px-1'>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={stepVariants}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="mb-1"
                                >
                                    {step === 0 && <CartListing
                                        cart={cart}
                                        onHandleSetStep={(value: number) => setStep(value)}
                                        formik={formik}
                                    />}
                                    {step === 1 && <CheckoutProcess
                                        persons={persons}
                                        paymentModes={paymentModes}
                                        onHandleSettingPayment={setPayment}
                                        onPersonChange={handlePersonChange}
                                        payment={payment}
                                        onHandleSearchCustomer={setqPerson}
                                        onAddPerson={handleAddPerson}
                                        formik={formik}
                                    />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="row mt-3">
                            <div className="col-12 mx-auto">
                                <div className="d-flex justify-content-between">
                                    {step > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary d-flex align-items-center"
                                            onClick={() => setStep(step - 1)}
                                        >
                                            <i className='ti ti-arrow-back me-1'></i>
                                            <span>Back</span>
                                        </button>
                                    )}
                                    {step === 1 && <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                    >
                                        Submit
                                    </button>}
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default MultiStepFormCart;


const treatedDataFunc = (_data: FormValues):ISellPayload => {
    console.log("Data ::: ", _data)
    const formattedData = {
        person_id: _data.person.id,
        payment: _data.payment,
        total_amount: _data.summarize.totalPrice,
        tax: _data.summarize.tax,
        shipping_price: _data.summarize.shippingPrice,
        transaction_type: _data.transactionType,
        amount_paid: _data.transactionType === 'advance' ? _data.advanceAmount : (_data.transactionType === 'loan') ? 0: _data.summarize.totalPrice,
        remaining_balance: _data.transactionType === 'advance' ? _data.summarize.totalPrice - _data.advanceAmount : 0,
        date_to_pay: _data.transactionType === 'advance' ? new Date().toISOString() : null,
        items: _data.items.map(item => ({
            product_id: item.product.id,
            price: item.product.price,
            quantity: item.quantity,
            total_unit: item.subtotal
        })),
        has_authorized: _data.has_authorized
    };

    console.log("Formatted data ::: ", formattedData)
    return formattedData;
};