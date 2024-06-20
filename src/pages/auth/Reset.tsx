import {useEffect} from 'react'
import {useAppContext} from "@/contexts/appContext";
import PageLoadingIndicator from "Components/PageLoadingIndicator";
import constants from "Data/Utilities/constants";
import ResetComponent from "@/Components/auth/ResetComponent";

export default function Reset() {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading(); 
        document.title = constants.APP_NAME + ' .:. Reset'
    }, [context]);

    return <>
        <PageLoadingIndicator visible={context.pageLoading}/>
        <ResetComponent />
    </>
}
