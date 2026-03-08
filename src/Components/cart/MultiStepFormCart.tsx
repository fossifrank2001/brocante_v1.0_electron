import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Form, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import "Styles/Product.less";
import { CartItem, clearCart, ICartState } from "Data/Slices/dashboard/seller/cartSlice.ts";
import CartListing from "Components/cart/CartListing.tsx";
import CheckoutProcess from "Components/cart/CheckoutProcess.tsx";
import { IPerson } from "Data/Interfaces/Person.ts";
import CustomerAPI from "Data/Api/Customer.ts";
import SellAPI from "Data/Api/Sell.ts";
import { ISellPayload, TPayment, TTransactionType } from "Data/Interfaces/Sell.ts";
import { useAppContext } from "@/contexts/appContext.tsx";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setActivePage } from "Data/Slices/NavigationSlice.ts";
import { Pages } from "Data/Objects/state.ts";
import DebtRecoveryModal from './DebtRecoveryModal';
import Toast from "Data/Utilities/Toast";
import ActivityLogService from '@/Services/ActivityLogService';
import { incrementSalesCount, addToTotalSales } from '@/Data/Slices/dashboard/cashSessionSlice';

// LocalStorage keys
const CART_STEP_KEY = 'brocante_cart_step';
const CART_FORM_DATA_KEY = 'brocante_cart_form_data';

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
    has_authorized: boolean;
    amount_paid: number;
    use_company_balance?: boolean;
    use_surplus_for_debts?: boolean;
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
    const loadSavedStep = () => {
        try {
            const savedStep = localStorage.getItem(CART_STEP_KEY);
            return savedStep ? parseInt(savedStep) : 0;
        } catch (error) {
            return 0;
        }
    };

    const [step, setStep] = useState<number>(loadSavedStep());
    const steps = ['Cart Listing', 'Checkout Process'];
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const { currentSession } = useAppSelector((state) => state.cashSession);
    const isLastStep = step === steps.length - 1;
    const activityLogService = ActivityLogService.getInstance();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [paymentModes] = useState<Array<string>>(['Cash', 'Orange Money', 'MTN Money']);
    const [payment, setPayment] = useState<string>('Cash');
    const [persons, setPersons] = useState<IPerson[]>([]);
    const [qPerson, setqPerson] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const [isRefresh, setIsRefresh] = useState(false);
    const [openDebtModal, setOpenDebtModal] = useState(false);
    const [pendingSubmission, setPendingSubmission] = useState<FormValues | null>(null);

    // Save step to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(CART_STEP_KEY, step.toString());
    }, [step]);

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
        has_authorized: false,
        amount_paid: 0,
        use_company_balance: false,
        use_surplus_for_debts: true,
    };

    const getCustomers = useCallback(async (_qPerson: string) => {
        try {
            const { data: _customers } = await CustomerAPI.get(_qPerson, true);
            setPersons(_customers || []);
        } catch (error) {
            console.error(error);
        }
    }, [isRefresh]);

    useEffect(() => {
        getCustomers(qPerson);
    }, [getCustomers, qPerson, isRefresh]);

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
            person: Yup.object().nullable().when('transactionType', (transactionType) => {
                if (transactionType.includes('advance') || transactionType.includes('loan')) {
                    return Yup.object().nullable().required('Le client est obligatoire pour les avances et crédits');
                }
                return Yup.object().nullable().notRequired();
            }),
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
                    if (transactionType.includes('loan') || transactionType.includes('advance')) {
                        return Yup.date().min(today, 'The payment date cannot be earlier than today').required('Date to pay is required').nullable();
                    }
                    return Yup.date().notRequired().nullable();
                }),
            has_authorized: Yup.boolean().default(true),
            amount_paid: Yup.number()
                .required('Le montant payé est requis')
                .min(0, 'Le montant doit être supérieur ou égal à 0')
        })
    ];

    const handleSubmit = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
        if (isLastStep) {
            const customer = values.person;

            // Si pas de client, soumettre directement (paiement total anonyme)
            if (!customer) {
                await submitSell(values, actions);
                actions.setSubmitting(false);
                return;
            }

            // Vérifier s'il faut ouvrir le modal de recouvrement
            const excessAmount = values.amount_paid - cart.totalPrice;
            const companyBalance = customer.company_balance || 0;
            const remainingBalance = customer.remaining_balance ? JSON.parse(customer.remaining_balance) : {};
            const hasDebts = Object.keys(remainingBalance).length > 0;

            // Ouvrir le modal si : (excédent > 0 OU company_balance > 0) ET le client a des dettes
            if ((excessAmount > 0 || companyBalance > 0) && hasDebts) {
                setPendingSubmission(values);
                setOpenDebtModal(true);
                actions.setSubmitting(false);
                return;
            }

            // Sinon, soumettre directement
            await submitSell(values, actions);
        } else {
            setStep(step + 1);
        }
        actions.setSubmitting(false);
    };

    const submitSell = async (values: FormValues, actions: FormikHelpers<FormValues>, useCompanyBalance = false, useSurplusForDebts = false) => {
        try {
            // GUARD: Vérifier qu'une session de caisse est ouverte
            if (!currentSession) {
                Toast.error(
                    'Veuillez ouvrir une session de caisse avant de créer une vente.',
                    4000,
                    'top-center'
                );
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const treatedData = treatedDataFunc(values, useCompanyBalance, useSurplusForDebts);
            
            // Ajouter le cash_session_id au payload
            const dataWithSession = {
                ...treatedData,
                cash_session_id: currentSession.id,
            };
            
            const result = await SellAPI.create(dataWithSession);
            
            // Mettre à jour les compteurs de la session UNIQUEMENT pour les paiements en espèces
            const isCashPayment = values.payment === 'Cash';
            dispatch(incrementSalesCount());
            if (isCashPayment) {
                dispatch(addToTotalSales(cart.totalPrice));
            }
            
            actions.resetForm();

            dispatch(clearCart());
            localStorage.removeItem(CART_STEP_KEY);
            localStorage.removeItem(CART_FORM_DATA_KEY);
            context.togglePageLoading();
            dispatch(setActivePage({
                page: Pages.SUCCESS_ORDER,
                param: {
                    type: treatedData.transaction_type,
                    number: result.data?.sell_code
                }
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDebtRecoveryConfirm = async (useCompanyBalance: boolean, useExcess: boolean) => {
        if (!pendingSubmission) return;

        try {
            // GUARD: Vérifier qu'une session de caisse est ouverte
            if (!currentSession) {
                Toast.error(
                    'Veuillez ouvrir une session de caisse avant de créer une vente.',
                    4000,
                    'top-center'
                );
                setOpenDebtModal(false);
                return;
            }

            setIsLoading(true);

            // TODO: Créer un nouvel endpoint backend qui gère:
            // 1. Création de la vente avec paiement
            // 2. Si useExcess: utiliser l'excédent pour recouvrer les dettes
            // 3. Si useCompanyBalance: utiliser le solde client pour recouvrer les dettes

            console.log('Options de recouvrement:', { useCompanyBalance, useExcess });

            // Backend gère maintenant company_balance et surplus automatiquement
            const treatedData = treatedDataFunc(pendingSubmission, useCompanyBalance, useExcess);
            
            // Ajouter le cash_session_id au payload
            const dataWithSession = {
                ...treatedData,
                cash_session_id: currentSession.id,
            };
            
            const result = await SellAPI.create(dataWithSession);
            
            // Mettre à jour les compteurs de la session UNIQUEMENT pour les paiements en espèces
            const isCashPayment = pendingSubmission.payment === 'Cash';
            dispatch(incrementSalesCount());
            if (isCashPayment) {
                dispatch(addToTotalSales(cart.totalPrice));
            }

            // Log de la vente
            console.log('[MultiStepFormCart] About to log sale:', {
                sellCode: result.data?.sell_code,
                customer: pendingSubmission.person,
                totalPrice: cart.totalPrice
            });
            activityLogService.logSale(
                (result.data?.sell_code?.toString() || 'UNKNOWN'),
                pendingSubmission.person!,
                cart.items,
                cart.totalPrice,
                pendingSubmission
            );
            console.log('[MultiStepFormCart] Sale log called');

            // Log du recouvrement de dettes si applicable
            const responseData = result.data as any;
            if (responseData?.debts_recovered && responseData.debts_recovered.length > 0) {
                const message = `${responseData.debts_recovered.length} dette(s) recouverte(s) !`;
                Toast.success(message, 3000, 'top-right');
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Log du recouvrement
                const method = useExcess && useCompanyBalance ? 'both' : useExcess ? 'excess' : 'balance';
                const recoveredAmount = responseData.total_recovered || 0;
                activityLogService.logDebtRecovery(pendingSubmission.person!, recoveredAmount, method);
            }

            dispatch(clearCart());
            localStorage.removeItem(CART_STEP_KEY);
            localStorage.removeItem(CART_FORM_DATA_KEY);
            context.togglePageLoading();
            dispatch(setActivePage({
                page: Pages.SUCCESS_ORDER,
                param: {
                    type: treatedData.transaction_type,
                    number: result.data?.sell_code
                }
            }));

            setOpenDebtModal(false);
            setPendingSubmission(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePersonChange = (newPerson: IPerson) => {
        console.log(newPerson)
    };

    const handleAddPerson = (person: IPerson) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        setPersons([...persons, person]);
        setqPerson('');
    };


    return (
        <div className="container px-0">
            <div className="stepper header">
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
                                        cart={cart}
                                        onHandleSearchCustomer={setqPerson}
                                        onAddPerson={handleAddPerson}
                                        formik={formik}
                                        onRefreshPersons={() => setIsRefresh(prevState => !prevState)}
                                    />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="row mt-3 sticky-bottom bg-white py-4">
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

            {pendingSubmission && pendingSubmission.person && (
                <DebtRecoveryModal
                    open={openDebtModal}
                    onClose={() => {
                        setOpenDebtModal(false);
                        setPendingSubmission(null);
                    }}
                    customer={pendingSubmission.person}
                    excessAmount={Math.max(0, pendingSubmission.amount_paid - cart.totalPrice)}
                    totalAmount={cart.totalPrice}
                    onConfirm={handleDebtRecoveryConfirm}
                    loading={isLoading}
                />
            )}
        </div>
    );
};

export default MultiStepFormCart;


const treatedDataFunc = (_data: FormValues, useCompanyBalance = false, useSurplusForDebts = false): ISellPayload => {
    console.log("Data ::: ", _data)

    const totalWithShipping = _data.summarize.totalPrice + _data.summarize.shippingPrice;

    let actualAmountPaid = 0;

    switch (_data.transactionType) {
        case 'total':
            actualAmountPaid = _data.amount_paid;
            break;
        case 'advance':
            actualAmountPaid = _data.advanceAmount;
            break;
        case 'loan':
            actualAmountPaid = 0;
            break;
    }

    const remainingBalance = Math.max(0, totalWithShipping - actualAmountPaid);

    const formattedData = {
        person_id: _data.person?.id ?? null,
        payment: _data.payment,
        total_amount: _data.summarize.totalPrice,
        tax: _data.summarize.tax,
        shipping_price: _data.summarize.shippingPrice,
        transaction_type: _data.transactionType,
        amount_paid: actualAmountPaid,
        remaining_balance: remainingBalance,
        date_to_pay: _data.transactionType === 'advance' || _data.transactionType === 'loan' ? _data.date_to_pay : null,
        items: _data.items.map(item => ({
            product_id: item.product.id,
            price: item.product.price,
            quantity: item.quantity,
            total_unit: item.subtotal
        })),
        has_authorized: _data.has_authorized,
        use_company_balance: useCompanyBalance,
        use_surplus_for_debts: useSurplusForDebts
    };

    console.log("Formatted data ::: ", formattedData)
    console.log("Transaction type:", _data.transactionType)
    console.log("Amount paid:", actualAmountPaid)
    console.log("Remaining balance:", remainingBalance)

    return formattedData;
};