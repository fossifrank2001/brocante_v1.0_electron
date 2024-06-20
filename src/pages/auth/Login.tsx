import {useEffect} from 'react'
import {useAppContext} from "@/contexts/appContext";
import PageLoadingIndicator from "Components/PageLoadingIndicator";
import constants from "Data/Utilities/constants"; 
import LoginComponent from "Components/auth/LoginComponent";

export default function Login() {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Login'
    }, [context]);

    return <>
        <PageLoadingIndicator visible={context.pageLoading}/>
        <LoginComponent />
    </>
}
