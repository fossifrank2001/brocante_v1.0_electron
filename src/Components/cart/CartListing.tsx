import React from 'react';
import { useAppDispatch } from "@/hooks";
import { clearCart, ICartState } from "Data/Slices/dashboard/seller/cartSlice.ts";
import { Link } from "@mui/material";
import Item from "Components/cart/Item.tsx";
import Toast from "Data/Utilities/Toast.ts";
import { FormikProps } from "formik";
import { FormValues } from "Components/cart/MultiStepFormCart.tsx";

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
        // Update form values with the cart data before proceeding
        formik.setFieldValue('items', cart.items);
        formik.setFieldValue('summarize', {
            totalPrice: cart.totalPrice,
            tax: 0,
            shippingPrice: 0,
        });

        // Simulate form submission for validation and then move to the next step
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
                            <div className="container">
                                <table className='table table-striped'>
                                    <thead>
                                    <tr>
                                        <th>N.</th>
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Unit price</th>
                                        <th>Total price</th>
                                        <th>Action</th>
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
                {value} <span style={{ fontSize: '10px' }}>FCFA</span>
            </span>
        </div>
    );
};
