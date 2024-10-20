import React from 'react';
import Breadcrumd from 'Components/Breadcrumd.tsx';
import {useAppSelector} from "@/hooks";
import MultiStepFormCart from "Components/cart/MultiStepFormCart.tsx";
import {ICartState} from "Data/Slices/dashboard/seller/cartSlice.ts";

const CartComponent: React.FC = () => {
    const cart : ICartState = useAppSelector(state => state.cart )

    return (
        <div className="" style={{minHeight: '100vh', backgroundColor: "rgba(208,208,208,0.28)"}}>
            <div className="container">
                <Breadcrumd parent="Cart" for_dashboard={true} />
                <div className="overflow-hidden">
                    <div className='card m-0 '>
                        <div className='card-body mt-1 pt-1'>
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
