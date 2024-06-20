import {useEffect} from 'react';
import NotFound from '@/pages/NotFound';
import { useAppContext } from '@/contexts/appContext';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import UpdateUser from '@/Components/dashboard/users/update';

const UpdateUserPage = () => {
    const context = useAppContext();
    const {authorizations} = useAppSelector(state => state.userAuthorizing);

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>{
        UtilMethods.getHabilitations(authorizations, "account").canUpdate ?<UpdateUser /> : 
            <NotFound />
    }</>;
};

export default UpdateUserPage;