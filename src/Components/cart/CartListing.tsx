import React, { useState } from 'react';
import { useAppDispatch } from "@/hooks";
import { clearCart, ICartState } from "Data/Slices/dashboard/seller/cartSlice.ts";
import { Link } from "@mui/material";
import Item from "Components/cart/Item.tsx";
import Toast from "Data/Utilities/Toast.ts";
import { FormikProps } from "formik";
import { FormValues } from "Components/cart/MultiStepFormCart.tsx";
import UtilMethods from "Data/Utilities/UtilMethods.ts";
import CheckoutProcess from "./CheckoutProcess";

const styles = {
    tableContainer: {
        border: '1px solid #dee2e6',
        borderRadius: '0.25rem',
        maxHeight: '400px',
        overflowY: 'auto' as const,
    },
    table: {
        marginBottom: 0,
    },
    tableHeadTh: {
        borderTop: 'none',
    },
    stickyTop: {
        zIndex: 1020,
        position: 'sticky' as const,
        top: 0,
        backgroundColor: 'white',
    },
    offcanvas: {
        width: '750px',
    }
};

const CartListing: React.FC<{
    cart: ICartState | never;
    onHandleSetStep: (payload: number) => void;
    formik: FormikProps<FormValues>;
    persons?: never[];
    paymentModes?: string[];
    payment?: string;
    onHandleSettingPayment?: (payment: string) => void;
    onPersonChange?: (person: never) => void;
    onHandleSearchCustomer?: (qPerson: string) => void;
    onAddPerson?: (person: never) => void;
    onRefreshPersons?: () => void;
}> = ({ 
    cart, 
    onHandleSetStep, 
    formik,
    persons = [],
    paymentModes = [],
    payment = '',
    onHandleSettingPayment = () => {},
    onPersonChange = () => {},
    onHandleSearchCustomer = () => {},
    onAddPerson = () => {},
    onRefreshPersons = () => {}
}) => {
    const dispatch = useAppDispatch();
    const [showCheckout, setShowCheckout] = useState(false);

    const handleClearCart = () => {
        try {
            if (window.confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
                onHandleSetStep(0);
                dispatch(clearCart());
                Toast.success('The cart has been cleared successfully.');
            }
        } catch (error) {
            Toast.error(error.message());
        }
    };

    const handleProceedToCheckout = () => {
        if (cart.items.length === 0) {
            Toast.error('Your cart is empty. Please add items before proceeding to checkout.');
            return;
        }
        setShowCheckout(true);
    };

    const handleCloseCheckout = () => {
        setShowCheckout(false);
    };

    return (
        <div className="container">
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light py-3">
                    <div className='d-flex w-100 align-items-center justify-content-between'>
                        <h4 className="mb-0">Shopping Cart ({cart.totalQuantity} items)</h4>
                        {(cart.items.length !== 0) && (
                            <Link href='#'
                                className='btn btn-outline-danger text-decoration-none d-flex align-items-center'
                                onClick={handleClearCart}>
                                <i className='ti ti-trash me-1'></i>
                                <span>Clear cart</span>
                            </Link>
                        )}
                    </div>
                </div>
                <div className="card-body">
                    <div className='row g-4'>
                        <div className='col-xs-12 col-lg-8'>
                            {cart.totalQuantity > 0 ? (
                                <div className='list-items'>
                                    <div style={styles.tableContainer} className="table-responsive">
                                        <table className='table table-hover align-middle' style={styles.table}>
                                            <thead className="bg-light" style={styles.stickyTop}>
                                                <tr>
                                                    <th className="text-uppercase small fw-bold" style={styles.tableHeadTh}>N.</th>
                                                    <th className="text-uppercase small fw-bold" style={styles.tableHeadTh}>Name</th>
                                                    <th className="text-uppercase small fw-bold" style={styles.tableHeadTh}>Quantity</th>
                                                    <th className="text-uppercase small fw-bold" style={styles.tableHeadTh}>Unit price</th>
                                                    <th className="text-uppercase small fw-bold" style={styles.tableHeadTh}>Total price</th>
                                                    <th className="text-uppercase small fw-bold" style={styles.tableHeadTh}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cart.items?.map((_item, index) => (
                                                    <Item key={index} item={_item} index={index} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className='alert alert-info text-center'>
                                    <i className="ti ti-shopping-cart mb-3" style={{ fontSize: '48px' }}></i>
                                    <h5>Your cart is empty</h5>
                                    <p className="mb-0">Go back to the shop and choose your items.</p>
                                </div>
                            )}
                        </div>
                        {cart.items.length !== 0 && (
                            <div className='col-xs-12 col-lg-4'>
                                <div className='card border-0 shadow-sm'>
                                    <div className='card-body'>
                                        <h5 className='card-title mb-4'>
                                            <i className="ti ti-receipt text-primary me-2"></i>
                                            Order Summary
                                        </h5>
                                        <div className='summarize-details'>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="text-muted">Subtotal</span>
                                                <div className="d-flex align-items-center">
                                                    <i className="ti ti-shopping-cart text-primary me-2"></i>
                                                    <span className="fw-bold">{UtilMethods.formatNumber(cart.totalPrice)}</span>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="text-muted">TAX (0%)</span>
                                                <span className="fw-bold">{UtilMethods.formatNumber(0)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="text-muted">Shipping</span>
                                                <div className="d-flex align-items-center">
                                                    <i className="ti ti-truck-delivery text-warning me-2"></i>
                                                    <span className="fw-bold">
                                                        {UtilMethods.formatNumber(formik.values.summarize?.shippingPrice || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <hr className="my-3" />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="h6 mb-0">TOTAL</span>
                                                <div className="d-flex align-items-center">
                                                    <i className="ti ti-cash text-success me-2"></i>
                                                    <span className="h5 text-primary mb-0">
                                                        {UtilMethods.formatNumber(cart.totalPrice + (formik.values.summarize?.shippingPrice || 0))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            className='btn btn-primary w-100 mt-4'
                                            onClick={handleProceedToCheckout}
                                            disabled={cart.items.length === 0}
                                        >
                                            <i className='ti ti-check me-2'></i>
                                            Proceed to checkout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div 
                className={`offcanvas offcanvas-end ${showCheckout ? 'show' : ''}`} 
                tabIndex={-1} 
                id="checkoutOffcanvas"
                aria-labelledby="checkoutOffcanvasLabel"
                style={styles.offcanvas}
            >
                <div className="offcanvas-header border-bottom">
                    <h5 className="offcanvas-title" id="checkoutOffcanvasLabel">Checkout Details</h5>
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={handleCloseCheckout}
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body">
                    <CheckoutProcess
                        persons={persons}
                        paymentModes={paymentModes}
                        payment={payment}
                        onHandleSettingPayment={onHandleSettingPayment}
                        onPersonChange={onPersonChange}
                        onHandleSearchCustomer={onHandleSearchCustomer}
                        onAddPerson={onAddPerson}
                        formik={formik}
                        cart={cart}
                        onRefreshPersons={onRefreshPersons}
                    />
                </div>
            </div>

            {showCheckout && (
                <div 
                    className="offcanvas-backdrop fade show" 
                    onClick={handleCloseCheckout}
                ></div>
            )}
        </div>
    );
};

export default CartListing;
