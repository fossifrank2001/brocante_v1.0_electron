import '@/assets/css/owner/access_selection.css';
import {useAppContext} from "../contexts/appContext";
import PageLoadingIndicator from "./PageLoadingIndicator";
import {IAccess} from '@/Data/Interfaces';
import {useAppDispatch, useAppSelector} from '@/hooks';
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";
import { useState } from 'react';
import Logo from '@/Components/common/Logo';

const roleIcons = {
    'ADMIN': 'ti ti-shield-check',
    'SELLER': 'ti ti-shopping-cart',
    'BUYER': 'ti ti-user',
    'SUPER_ADMIN': 'ti ti-crown',
};

const roleDescriptions = {
    'ADMIN': 'Manage the entire system and users',
    'SELLER': 'Create and manage your shop',
    'BUYER': 'Browse and purchase items',
    'SUPER_ADMIN': 'Full system control and monitoring',
};

export default function AccessSelectionComponent() {
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const {authUser: currentUser} = useAppSelector((state) => state.user);
    const [selectedAccess, setSelectedAccess] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChangeAccess = async (access_id: number | string) => {
        try {
            setSelectedAccess(Number(access_id));
            setIsLoading(true);
            context.togglePageLoading(true);
    
            const { loadAuthorizationAsync } = await import('Data/Slices/auth/authorizationSlice');
            await dispatch(loadAuthorizationAsync({ access_id }));
            dispatch(setActivePage({page: Pages.DASHBOARD}));
        } catch (e) {
            console.error(e);
            setSelectedAccess(null);
        } finally {
            setIsLoading(false);
            context.togglePageLoading(false);
        }
    };

    const accessElements = currentUser?.accesses?.map((access: IAccess) => {
        const isSelected = selectedAccess === access.id;
        return (
            <div 
                key={access.id} 
                onClick={() => !isLoading && handleChangeAccess(access.id)} 
                className="col-md-6 col-lg-5 col-xxl-5 cursor-pointer"
            >
                <div 
                    className={`card mb-4 rounded-4 hover-shadow transition-all ${isSelected ? 'border-primary shadow' : 'border-light'}`}
                    style={{
                        borderWidth: isSelected ? '2px' : '1px',
                        transform: isSelected ? 'translateY(-5px)' : 'none',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-3">
                            <div className={`rounded-circle p-3 ${isSelected ? 'bg-primary' : 'bg-light'}`}>
                                <i className={`${roleIcons[access.role.code] || 'ti ti-user'} fs-4 ${isSelected ? 'text-white' : 'text-primary'}`}></i>
                            </div>
                            <div className="ms-3">
                                <h5 className="mb-1 fw-bold">{access.role.label}</h5>
                                <p className="text-muted mb-0 small">
                                    {roleDescriptions[access.role.code] || 'Access to system'}
                                </p>
                            </div>
                        </div>
                        {isSelected && (
                            <div className="d-flex justify-content-center mt-3">
                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    });

    return (
        <>
            <PageLoadingIndicator visible={context.pageLoading}/>
            <div 
                className="page-wrapper access-selection min-vh-100 d-flex align-items-center justify-content-center bg-light"
                style={{ padding: '2rem' }}
            >
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6 text-center">
                            <div className="d-flex justify-content-center mb-5">
                                <Logo 
                                    showVersion={true}
                                    animate={true}
                                    imageSize={45}
                                    fontSize="2.5rem"
                                />
                            </div>
                            
                            <h4 className="fw-bold mb-2">Welcome back, {currentUser?.first_name}!</h4>
                            <p className="text-muted mb-5">
                                Please select your access role to continue to your dashboard
                            </p>
                            
                            <div className="row justify-content-center g-4">
                                {accessElements}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
