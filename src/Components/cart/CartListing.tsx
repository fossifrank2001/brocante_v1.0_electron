import React from 'react';
import { useAppDispatch } from "@/hooks";
import { clearCart, ICartState } from "Data/Slices/dashboard/seller/cartSlice.ts";
import { Link } from "@mui/material";
import Item from "Components/cart/Item.tsx";
import Toast from "Data/Utilities/Toast.ts";
import { FormikProps } from "formik";
import { FormValues } from "Components/cart/MultiStepFormCart.tsx";
import UtilMethods from "Data/Utilities/UtilMethods.ts";

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
};

const CartListing: React.FC<{
    cart: ICartState | never;
    onHandleSetStep: (payload: number) => void;
    formik: FormikProps<FormValues>;
}> = ({ cart, onHandleSetStep, formik }) => {
    const dispatch = useAppDispatch();

    const handleClearCart = () => {
        try {
            onHandleSetStep(0);
            dispatch(clearCart());
            Toast.success('The cart has been cleared successfully.');
        } catch (error) {
            Toast.error(error.message());
        }
    };

    const handleProceedToCheckout = () => {
        formik.setFieldValue('items', cart.items);
        formik.setFieldValue('summarize', {
            totalPrice: cart.totalPrice,
            tax: 0,
            shippingPrice: 0,
        });

        formik.submitForm().then(() => {
            if (formik.isValid) {
                onHandleSetStep(1);
            }
        });
    };

    return (
        <div className="container">
            <div className='row'>
                <div className='col-xs-12 col-md-8'>
                    <div className='d-flex w-100 align-items-center justify-content-between'>
                        <h4>List Items</h4>
                        {(cart.items.length !== 0) && (
                            <Link href='#'
                                  className='btn btn-danger text-white text-decoration-none d-flex align-items-center'
                                  onClick={handleClearCart}>
                                <i className='ti ti-trash me-1'></i>
                                <span>Clear cart</span>
                            </Link>
                        )}
                    </div>
                    {cart.totalQuantity > 0 ? (
                        <div className='list-items mt-2'>
                            <div style={styles.tableContainer}>
                                <table className='table table-hover' style={styles.table}>
                                    <thead style={styles.stickyTop}>
                                    <tr>
                                        <th style={styles.tableHeadTh}>N.</th>
                                        <th style={styles.tableHeadTh}>Name</th>
                                        <th style={styles.tableHeadTh}>Quantity</th>
                                        <th style={styles.tableHeadTh}>Unit price</th>
                                        <th style={styles.tableHeadTh}>Total price</th>
                                        <th style={styles.tableHeadTh}>Action</th>
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
                        <div className='list-items-empty text-center w-100 p-3 mt-2'>
                            OOps :) There is no article in the cart. Go back to the shop and choose your item(s).
                        </div>
                    )}
                </div>
                {cart.items.length !== 0 && (
                    <div className='col-xs-12 col-md-4'>
                        <div className='w-75 mx-auto'>
                            <h4 className='text-center mb-4'>Summarize List</h4>
                            <div className='summarize-details'>
                                {ProcessInfo('TOTAL PRICE', cart.totalPrice)}
                                {ProcessInfo('TAX', 0)}
                                {ProcessInfo('SHIPPING PRICE', 0)}

                                <hr />

                                {ProcessInfo('TOTAL INVOICE', cart.totalPrice)}
                            </div>
                            <div className='d-flex justify-content-center gap-1 mt-3'>
                                <Link href='#'
                                      className='btn w-100 btn-success justify-content-center text-decoration-none text-white d-flex align-items-center'
                                      onClick={handleProceedToCheckout}
                                >
                                    <i className='ti ti-package me-1'></i>
                                    <span>Proceed to checkout</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartListing;

const ProcessInfo = (label: string, value: number | string) => {
    return (
        <div className='d-flex my-1 align-items-center justify-content-between'>
            <h5>{label} :</h5>
            <span className='fw-lighter'>
                {UtilMethods.formatNumber(value as number)}
            </span>
        </div>
    );
};