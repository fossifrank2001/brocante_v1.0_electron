import {useEffect} from 'react';
import { useAppContext } from '@/contexts/appContext.tsx';
import constants from "Data/Utilities/constants.ts";
import CartComponent from "Components/cart";

const CartPage = () => {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Cart'
    }, [context]);

    return <CartComponent />
};

export default CartPage;