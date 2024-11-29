import React from 'react';
import { useAppSelector } from "@/hooks";
import Breadcrumd from "Components/Breadcrumd.tsx";
import {ICartState} from "Data/Slices/dashboard/seller/cartSlice.ts";
import MultiStepFormCart from "Components/cart/MultiStepFormCart.tsx";

const CartComponent: React.FC = () => {
    const cart: ICartState = useAppSelector(state => state.cart);

    return (
        <div className="min-vh-100" style={{backgroundColor: "rgba(208,208,208,0.28)"}}>
            <div className="sticky-top">
                <div className="container pt-2">
                    <Breadcrumd parent="Cart" for_dashboard={true} />
                </div>
            </div>
            <div className="container" style={{transform: "translate(0, -16px)!important"}}>
                <div className="" style={{
                    height: "calc(100vh - 120px)!important",
                    overflowY: "auto",
                }}>
                    <div className='card m-0'>
                        <div className='card-body'>
                            <MultiStepFormCart
                                cart={cart}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartComponent;