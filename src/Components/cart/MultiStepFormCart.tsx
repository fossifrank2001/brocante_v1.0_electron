import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import "Styles/Product.less";
import {CartItem, clearCart, ICartState} from "Data/Slices/dashboard/seller/cartSlice.ts";
import CartListing from "Components/cart/CartListing.tsx";
import {IPerson} from "Data/Interfaces/Person.ts";
import CustomerAPI from "Data/Api/Customer.ts";
import SellAPI from "Data/Api/Sell.ts";
import {ISellPayload, TPayment, TTransactionType} from "Data/Interfaces/Sell.ts";
import {useAppDispatch} from "@/hooks";
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";
import {useAppContext} from "@/contexts/appContext.tsx";

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
    const dispatch = useAppDispatch();
    const [paymentModes] = useState<Array<string>>(['Cash', 'Orange Money', 'MTN Money']);
    const [payment, setPayment] = useState<string>('');
    const [persons, setPersons] = useState<IPerson[]>([]);
    const [qPerson, setqPerson] = useState('');
    const [, setIsLoading] = useState(false);
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const [isRefresh, setIsRefresh] = useState(false);
    const context = useAppContext();

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
            const {data: _customers} = await CustomerAPI.get(_qPerson, true);
            setPersons(_customers || []);
        } catch (error) {
            console.error(error);
        }
    }, [isRefresh]);

    useEffect(() => {
        getCustomers(qPerson);
    }, [getCustomers, qPerson, isRefresh]);

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            setIsLoading(true);
            const payload = treatedDataFunc(values);
            const {data} = await SellAPI.create(payload);
            context.togglePageLoading(true);
            dispatch(setActivePage({
                page: Pages.CART_PAGE,
                param:{
                    number: data.sell_code,
                    type: data.transaction_type
                }
            } as never));
            dispatch(clearCart());
        } catch (error) {
            // Toast.error(error);
        } finally {
            setIsLoading(false);
            setSubmitting(false);
        }
    };

    const handleSearchCustomer = (value: string) => {setqPerson(value);};
    const handleRefreshPersons = () => {setIsRefresh(!isRefresh);};
    const handleSettingPayment = (value: string) => {setPayment(value);};

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {(formik) => (
                <Form>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            {step === 0 && <CartListing
                                cart={cart}
                                onHandleSetStep={setStep}
                                formik={formik as never}
                                persons={persons}
                                paymentModes={paymentModes}
                                payment={payment}
                                onHandleSettingPayment={handleSettingPayment}
                                onPersonChange={(person) => formik.setFieldValue('person', person)}
                                onHandleSearchCustomer={handleSearchCustomer}
                                onAddPerson={(person) => setPersons([...persons, person])}
                                onRefreshPersons={handleRefreshPersons}
                            />}
                        </motion.div>
                    </AnimatePresence>
                </Form>
            )}
        </Formik>
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