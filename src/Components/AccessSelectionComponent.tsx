import {useState} from 'react';
import logo from "../assets/images/logos/dark-logo.svg";
import {Link, Typography} from "@mui/material";
import '@/assets/css/owner/access_selection.css';
import {useAppContext} from "../contexts/appContext";
import PageLoadingIndicator from "./PageLoadingIndicator";
import { IAccess } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';

export const icons = {
    ADMIN: "ti ti-settings",
    SELLER: "ti ti-user-circle"
}

export default function AccessSelectionComponent() {
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const {authUser: currentUser} = useAppSelector((state) => state.user)

    const accessElements = currentUser.accesses.map((access : IAccess) => {
        return <div key={access.id} onClick={() => handleChangeAccess(access.id)} className="col-md-6 col-lg-5 col-xxl-5 cursor-pointer">
            <div className="card mb-0  rounded-5" style={{
                    border: "1px solid lightgray",
                    borderBottom: "2px solid var(--bs-blue)!important"
                }}
            >
                <div className="card-body px-0 py-4 d-flex  flex-column justify-content-center">
                    <i className={` ${icons[access.role.code]} text-center`}  style={{fontSize: '36px'}}></i>
                    <div className="fw-bolder text-center fs-5">{access.role.label}</div>
                </div>
            </div>
        </div>
    })

    const handleChangeAccess = async (access_id: number | string) => {
        try {
            context.togglePageLoading(true);
    
            const { loadAuthorizationAsync } = await import('Data/Slices/auth/authorizationSlice');
            await dispatch(loadAuthorizationAsync({ access_id }));
        } catch (e) {
        } finally {
        }
    };

    return <>
        <PageLoadingIndicator visible={context.pageLoading}/>
        <div className="page-wrapper access-selection" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
             data-sidebar-position="fixed" data-header-position="fixed">
            <div
                className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center">
                <div className="d-flex align-items-center justify-content-center w-100">
                    <div className="row flex-column justify-content-center w-100">
                        <Link href="#" className="text-nowrap logo-img text-center d-block py-3 w-100" style={{transform: "scale(1.5)"}}>
                            <img src={logo} width="180" alt="" />
                        </Link>
                        <Typography className="text text-center col-6 mx-auto mt-4 fs-8"> Welcome, <strong>{`${currentUser.last_name} ${currentUser.first_name}`} </strong> </Typography>
                        <Typography className="text text-center col-6 mx-auto fs-5 mb-4 fw-lighter">Choose one of these accesses to continue navigating through the app. We're glad to have you with us!</Typography>                        <div className="col-md-8 col-lg-8 col-xxl-5 mx-auto">
                            <div className="row align-items-center justify-content-center">
                                {accessElements}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}
