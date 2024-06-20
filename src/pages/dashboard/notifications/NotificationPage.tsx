import {useEffect} from 'react';
import { useAppContext } from '@/contexts/appContext';
import NotificationIndex from "Components/notifications";

const NotificationPage = () => {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <NotificationIndex />
};

export default NotificationPage;