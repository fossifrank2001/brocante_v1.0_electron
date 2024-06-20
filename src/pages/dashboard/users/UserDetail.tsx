import {useEffect} from 'react';
import NotFound from '@/pages/NotFound';
import { useAppContext } from '@/contexts/appContext';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import ReadUser from '@/Components/dashboard/users/read';
import { useAppSelector } from '@/hooks';

const ReadUserPage = () => {
    const context = useAppContext();
    const {authorizations} = useAppSelector(state => state.userAuthorizing);

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>{
        UtilMethods.getHabilitations(authorizations, "account").canRead ?<ReadUser /> : 
            <NotFound />
    }</>;
};

export default ReadUserPage;