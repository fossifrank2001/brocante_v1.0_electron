import PageLoadingIndicator from "Components/PageLoadingIndicator.tsx";
import {useAppContext} from "@/contexts/appContext.tsx";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";
import React, {useLayoutEffect, useState} from "react";
import constants from "Data/Utilities/constants.ts";
import ShopComponent from "Components/dashboard/shop/Shop.tsx";
import logo from "../../../public/favicon.png"
import {Divider, Link} from "@mui/material";
import {handleRedirectToDashboard} from "Components/App.tsx";

function HomePage() {
    const context = useAppContext();
    const dispatch = useAppDispatch();
    
    const {totalQuantity} = useAppSelector(state => state.cart);
    const {authUser} = useAppSelector(state => state.user)
    const [searchTerm, setSearchTerm] = useState<string>('');

    useLayoutEffect(() => {
        document.title = constants.APP_NAME + " .:. Shop"
        context.togglePageLoading()
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleDashboardAccess = () => {
        context.togglePageLoading(true)
        if (authUser.accesses.length > 1) {
            const lastVisitedPage = localStorage.getItem('lastVisitedPage');

            if (lastVisitedPage) {
                dispatch(setActivePage({ page: lastVisitedPage }));
            } else {
                dispatch(setActivePage({page: Pages.USER_ACCESS_PAGE}));
            }
            localStorage.removeItem('lastVisitedPage');
        } else {
            handleRedirectToDashboard(authUser.accesses[0].id, dispatch);
        }
    }

    return  <>
        <PageLoadingIndicator visible={context.pageLoading} />
        <div className="body-wrapper-home">
            <nav className="container navbar navbar-expand-lg navbar-light border-bottom border-light-gray border-2 position-sticky top-0 start-0 bg-white py-3" style={{zIndex: 1200}}>
                <div className="container-fluid ">
                    <a className="navbar-brand d-flex align-items-center" href="#">
                        <img src={logo} alt='logo'/>
                        <span className='ms-1 fs-5 fw-bolder'>Brocante<span className='bg-primary text-white py-1 px-2' style={{borderRadius: '10px', backgroundColor: '#007bff'}}>V1.0</span></span>
                    </a>
                    <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
                        <form className="position-relative w-50">
                            <input
                                type="text"
                                className="form-control search-chat bg-white py-2 ps-5"
                                id="text-srh"
                                placeholder="Search Product"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <i className="ti ti-search position-absolute top-50 start-0
                                translate-middle-y fs-6 text-dark ms-3"></i>
                        </form>
                        <Divider />
                        <ul className="navbar-nav flex-row align-items-center justify-content-end">
                            <li className="nav-item nav-icon-hover-bg rounded-circle">
                                <Link className="nav-link position-relative text-decoration-none" href="#"
                                      data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight"
                                      aria-controls="offcanvasRight"
                                      onClick={() => {
                                          if(totalQuantity > 0){
                                              context.togglePageLoading(true)
                                              dispatch(setActivePage({page: Pages.CART_PAGE}))
                                          }
                                      }}
                                >
                                    <i className="ti ti-basket fs-3"></i>
                                    {totalQuantity > 0 && <span className="popup-badge position-absolute top-0 start-50 rounded-pill bg-danger text-white fs-2">{totalQuantity}</span>}
                                </Link>
                            </li>
                        </ul>
                        <div className='auth-btns ms-2'>
                            {!authUser ?<button className='btn btn-primary' onClick={() => {
                                    context.togglePageLoading(true)
                                    dispatch(setActivePage({page: Pages.LOGIN}))
                                }}>
                                    <i className='ti ti-login me-1'></i>
                                    <span className=''>Sign In</span>
                                </button>
                                :
                                <button className='btn btn-outline-secondary'
                                        onClick={handleDashboardAccess}
                                >
                                    <i className='ti ti-dashboard me-1'></i>
                                    <span className=''>Dashboard</span>
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </nav>
            <div className="min-vh-100">
                <ShopComponent searchTerm={searchTerm}/>
            </div>
        </div>
    </>
}

export default HomePage
