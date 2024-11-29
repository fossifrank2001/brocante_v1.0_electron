import React, { useLayoutEffect, useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import 'react-toastify/dist/ReactToastify.css';
import PageLoadingIndicator from "Components/PageLoadingIndicator.tsx";
import { useAppContext } from "@/contexts/appContext.tsx";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setActivePage } from "Data/Slices/NavigationSlice.ts";
import { Pages } from "Data/Objects/state.ts";
import constants from "Data/Utilities/constants.ts";
import ShopComponent from "Components/dashboard/shop/Shop.tsx";
import logo from "../../../public/favicon.png";
import { Divider, Link } from "@mui/material";
import { handleRedirectToDashboard } from "Components/App.tsx";
import Toast from "Data/Utilities/Toast.ts";

function HomePage() {
    const context = useAppContext();
    const dispatch = useAppDispatch();

    const { totalQuantity, items } = useAppSelector(state => state.cart);
    const { authUser } = useAppSelector(state => state.user);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showCart, setShowCart] = useState(false);
    const cartAnimation = useAnimation();

    useLayoutEffect(() => {
        document.title = constants.APP_NAME + " .:. Shop";
        context.togglePageLoading();
    }, []);

    useEffect(() => {
        setShowCart(totalQuantity > 0);
    }, [totalQuantity]);

    useEffect(() => {
        const animateCart = async () => {
            await cartAnimation.start({
                x: [0, -4, 4, -4, 4, 0],
                transition: { duration: 0.4 }
            });
        };

        if (items.length > 0) {
            animateCart();
            const lastItem = items[items.length - 1];
            notifyProductAdded(lastItem.product.name);
        }
    }, [items, cartAnimation]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleDashboardAccess = async () => {
        context.togglePageLoading(true);
        if (authUser.accesses.length > 1) {
            const lastVisitedPage = localStorage.getItem('lastVisitedPage');

            if (lastVisitedPage) {
                dispatch(setActivePage({ page: lastVisitedPage }));
            } else {
                dispatch(setActivePage({page: Pages.USER_ACCESS_PAGE}));
            }
            localStorage.removeItem('lastVisitedPage');
        } else {
            await handleRedirectToDashboard(authUser.accesses[0].id, dispatch);
        }
    };

    const notifyProductAdded = (productName: string) => {
        Toast.success(`${productName} added to cart!`, 1000, 'bottom-right');
    };

    return (
        <>
            <PageLoadingIndicator visible={context.pageLoading} />
            <div className="body-wrapper-home">
                <div className="container-fluid px-0 position-sticky top-0 start-0 bg-white" style={{zIndex: 1200}}>
                    <nav className="container navbar navbar-expand-lg navbar-light border-bottom border-light-gray border-2 py-3">
                        <div className="container-fluid">
                            <a className="navbar-brand d-flex align-items-center" href="#">
                                <img src={logo} alt='logo' style={{width: '26px', height: '26px', objectFit: "cover", objectPosition: "center"}}/>
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
                                        style={{borderRadius: "25px"}}
                                    />
                                    <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 text-dark ms-3 opacity-50"></i>
                                </form>
                                <Divider/>
                                <ul className="navbar-nav flex-row align-items-center justify-content-end">
                                    <AnimatePresence>
                                        {showCart && (
                                            <motion.li
                                                className="nav-item nav-icon-hover-bg rounded-circle"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Link
                                                    className="nav-link position-relative text-decoration-none"
                                                    href="#"
                                                    data-bs-toggle="offcanvas"
                                                    data-bs-target="#offcanvasRight"
                                                    aria-controls="offcanvasRight"
                                                    onClick={() => {
                                                        context.togglePageLoading(true);
                                                        dispatch(setActivePage({page: Pages.CART_PAGE}));
                                                    }}
                                                >
                                                    <motion.i
                                                        className="ti ti-basket fs-3 d-inline-block"
                                                        style={{transform: "scale(1.5)"}}
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        animate={cartAnimation}
                                                    ></motion.i>
                                                    <motion.span
                                                        className="popup-badge position-absolute top-0 start-50 rounded-pill bg-danger text-white fs-2"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                                    >
                                                        {totalQuantity}
                                                    </motion.span>
                                                </Link>
                                            </motion.li>
                                        )}
                                    </AnimatePresence>
                                </ul>
                                <div className='auth-btns ms-2'>
                                    {!authUser ? (
                                        <motion.button
                                            className='btn btn-primary'
                                            onClick={() => {
                                                context.togglePageLoading(true);
                                                dispatch(setActivePage({page: Pages.LOGIN}));
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className='ti ti-login me-1'></i>
                                            <span className=''>Sign In</span>
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            className='btn btn-outline-secondary'
                                            onClick={handleDashboardAccess}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className='ti ti-dashboard me-1'></i>
                                            <span className=''>Dashboard</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
                <div className="min-vh-100">
                    <ShopComponent searchTerm={searchTerm} onResetFilter={() => setSearchTerm('')}/>
                </div>
            </div>
        </>
    );
}

export default HomePage;