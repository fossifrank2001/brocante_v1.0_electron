import {useEffect} from 'react';
import NotFound from '@/pages/NotFound';
import { useAppContext } from '@/contexts/appContext';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import NewCategory from '@/Components/dashboard/categories/create';

const CategoryCreatePage = () => {
    const context = useAppContext();
    const {authorizations} = useAppSelector(state => state.userAuthorizing);

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>{
        UtilMethods.getHabilitations(authorizations, "category").canCreate ?<NewCategory /> : 
            <NotFound />
    }</>;
};

export default CategoryCreatePage;