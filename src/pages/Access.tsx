import {useEffect} from 'react'
import {useAppContext} from "../contexts/appContext";
import constants from "Data/Utilities/constants";
import PageLoadingIndicator from "Components/PageLoadingIndicator";
import AccessSelectionComponent from "Components/AccessSelectionComponent";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Data/Objects/store';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';

export default function Access() {
    const context = useAppContext();
    const dispatch: AppDispatch = useDispatch();
    const {token, authUser} = useSelector((state: RootState) => state.user)

    useEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Access-selection'
    }, [context]);

    if(!token || !authUser){
        context.togglePageLoading(true)
        dispatch(setActivePage({page: Pages.DASHBOARD}));
    }

    return <>
        <PageLoadingIndicator visible={context.pageLoading}/>
        <AccessSelectionComponent />
    </>
}
