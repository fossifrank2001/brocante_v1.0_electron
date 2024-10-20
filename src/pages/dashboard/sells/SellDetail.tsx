import {useEffect} from 'react';
import NotFound from '@/pages/NotFound';
import { useAppContext } from '@/contexts/appContext';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import ReadSell from "Components/dashboard/sells/read.tsx";

const ReadSellPage = () => {
    const context = useAppContext();
    const {authorizations} = useAppSelector(state => state.userAuthorizing);

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>{
        UtilMethods.getHabilitations(authorizations, "sell").canRead ?<ReadSell /> :
            <NotFound />
    }</>;
};

export default ReadSellPage;