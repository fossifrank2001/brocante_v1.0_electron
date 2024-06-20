import {useEffect} from 'react';
import NotFound from '@/pages/NotFound';
import { useAppContext } from '@/contexts/appContext';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import ReadProduct from "Components/dashboard/products/read.tsx";

const ReadProductPage = () => {
    const context = useAppContext();
    const {authorizations} = useAppSelector(state => state.userAuthorizing);

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>{
        UtilMethods.getHabilitations(authorizations, "article").canRead ?<ReadProduct /> :
            <NotFound />
    }</>;
};

export default ReadProductPage;