import {useEffect} from 'react'
import {useAppContext} from "@/contexts/appContext";
import PageLoadingIndicator from "Components/PageLoadingIndicator";
import constants from "Data/Utilities/constants"; 
import ForgotComponent from "@/Components/auth/ForgotComponent";

export default function Reset() {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Forgot' 
    }, [context]);

    return <>
        <PageLoadingIndicator visible={context.pageLoading}/>
        <ForgotComponent />
    </>
}
