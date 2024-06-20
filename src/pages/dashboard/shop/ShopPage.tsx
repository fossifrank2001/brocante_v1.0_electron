import {useEffect} from 'react';
import { useAppContext } from '@/contexts/appContext.tsx';
import constants from "Data/Utilities/constants.ts";
import ShopComponent from "Components/dashboard/shop/Shop.tsx";

const ShopPage = () => {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Shop'
    }, [context]);

    return <ShopComponent />
};

export default ShopPage;