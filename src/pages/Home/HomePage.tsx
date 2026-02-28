import React, { useLayoutEffect, useState, useEffect } from "react";
import { motion } from "framer-motion";
import 'react-toastify/dist/ReactToastify.css';
import PageLoadingIndicator from "Components/PageLoadingIndicator.tsx";
import { useAppContext } from "@/contexts/appContext.tsx";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setActivePage } from "Data/Slices/NavigationSlice.ts";
import { Pages } from "Data/Objects/state.ts";
import constants from "Data/Utilities/constants.ts";
import ShopComponent from "Components/dashboard/shop/Shop.tsx";
import logo from "../../../public/favicon.png";
import { handleRedirectToDashboard } from "Components/App.tsx";
import Toast from "Data/Utilities/Toast.ts";
import { Badge, IconButton } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

function HomePage() {
    const context = useAppContext();
    const dispatch = useAppDispatch();

    const { totalQuantity, items } = useAppSelector(state => state.cart);
    const { authUser } = useAppSelector(state => state.user);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showCart, setShowCart] = useState(false);

    useLayoutEffect(() => {
        document.title = constants.APP_NAME + " .:. Shop";
        context.togglePageLoading();
    }, []);

    useEffect(() => {
        setShowCart(totalQuantity > 0);
    }, [totalQuantity]);

    useEffect(() => {
        if (items.length > 0) {
            const lastItem = items[items.length - 1];
            notifyProductAdded(lastItem.product.name);
        }
    }, [items]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleDashboardAccess = async () => {
        context.togglePageLoading(true);
        if (authUser.accesses.length > 1) {
            const lastVisitedPage = localStorage.getItem('lastVisitedPage');

            if (lastVisitedPage) {
                dispatch(setActivePage({ page: lastVisitedPage } as any));
            } else {
                dispatch(setActivePage({ page: Pages.USER_ACCESS_PAGE }));
            }
            localStorage.removeItem('lastVisitedPage');
        } else {
            await handleRedirectToDashboard(authUser.accesses[0].id, dispatch);
        }
    };

    const notifyProductAdded = (productName: string) => {
        Toast.success(`${productName} added to cart!`, 1000, 'bottom-left');
    };

    return (
        <>
            <PageLoadingIndicator visible={context.pageLoading} />
            <div className="body-wrapper-home">
                {/* Navbar */}
                <div className="container-fluid px-0 position-sticky top-0 start-0 glass-effect" style={{ zIndex: 1000, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="container navbar navbar-expand-lg py-3">
                        <div className="container-fluid px-0">
                            <a className="navbar-brand d-flex align-items-center" href="#">
                                <img
                                    src={logo}
                                    alt='logo'
                                    style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <span className='ms-2 fw-bolder fs-5' style={{ letterSpacing: '-0.5px' }}>
                                    Brocante<span className='ms-1 text-primary' style={{ fontWeight: 800 }}>V1.0</span>
                                </span>
                            </a>

                            <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
                                <form className="position-relative me-4" style={{ width: '400px' }} onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="text"
                                        className="form-control border-0 py-2 ps-5"
                                        placeholder="Rechercher des produits..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        style={{ borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.04)', fontSize: '0.9rem' }}
                                    />
                                    <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 ms-3 text-muted"></i>
                                </form>

                                <div className='auth-btns'>
                                    {!authUser ? (
                                        <motion.button
                                            className='btn btn-primary rounded-pill px-4'
                                            onClick={() => {
                                                context.togglePageLoading(true);
                                                dispatch(setActivePage({ page: Pages.LOGIN }));
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className='ti ti-login me-2'></i>
                                            <span>Connexion</span>
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            className='btn rounded-pill px-4'
                                            style={{
                                                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                                color: '#4f46e5',
                                                border: '1px solid rgba(79, 70, 229, 0.2)',
                                                fontWeight: 600
                                            }}
                                            onClick={handleDashboardAccess}
                                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(79, 70, 229, 0.15)' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className='ti ti-dashboard me-2'></i>
                                            <span>Dashboard</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
                    <ShopComponent searchTerm={searchTerm} onResetFilter={() => setSearchTerm('')} />

                    {/* Cart FAB */}
                    {showCart && (
                        <motion.div
                            className="position-fixed"
                            style={{ bottom: '2rem', right: '2rem', zIndex: 1000 }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <motion.button
                                className="btn rounded-circle d-flex align-items-center justify-content-center position-relative"
                                style={{
                                    width: '4rem',
                                    height: '4rem',
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
                                }}
                                whileHover={{
                                    scale: 1.1,
                                    backgroundColor: '#4338ca',
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    context.togglePageLoading(true);
                                    dispatch(setActivePage({ page: Pages.CART_PAGE }));
                                }}
                            >
                                <Badge badgeContent={totalQuantity} color="error">
                                    <ShoppingCart sx={{ fontSize: '1.5rem' }} />
                                </Badge>

                                {totalQuantity > 0 && (
                                    <motion.div
                                        className="position-absolute"
                                        style={{
                                            inset: '-8px',
                                            borderRadius: '50%',
                                            border: '2px solid #4f46e5',
                                            opacity: 0.4
                                        }}
                                        animate={{
                                            scale: [1, 1.4, 1],
                                            opacity: [0.4, 0, 0.4]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}

export default HomePage;