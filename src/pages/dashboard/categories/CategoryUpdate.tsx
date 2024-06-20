import {useEffect} from 'react';
import NotFound from '@/pages/NotFound';
import { useAppContext } from '@/contexts/appContext';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import UpdateCategory from "Components/dashboard/categories/update.tsx";

const CategoryUpdatePage = () => {
    const context = useAppContext();
    const {authorizations} = useAppSelector(state => state.userAuthorizing);

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>{
        UtilMethods.getHabilitations(authorizations, "category").canUpdate ?<UpdateCategory /> :
            <NotFound />
    }</>;
};

export default CategoryUpdatePage;