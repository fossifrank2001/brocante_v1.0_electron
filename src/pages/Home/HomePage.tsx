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
            if (totalQuantity > 0) {
                await cartAnimation.start({
                    opacity: [1, 0.5, 1],
                    scale: [1, 1.1, 1],
                    transition: { 
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }
                });
            }
        };

        if (items.length > 0) {
            animateCart();
            const lastItem = items[items.length - 1];
            notifyProductAdded(lastItem.product.name);
        }
    }, [items, cartAnimation, totalQuantity]);

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
                <div className="container-fluid px-0 position-sticky top-0 start-0 bg-white" style={{zIndex: 1000}}>
                    <nav className="container navbar navbar-expand-lg navbar-light border-bottom border-light-gray border-2 py-3">
                        <div className="container-fluid">
                            <a className="navbar-brand d-flex align-items-center" href="#">
                                <img src={logo} alt='logo' style={{width: '26px', height: '26px', objectFit: "cover", objectPosition: "center"}}/>
                                <span className='ms-1 fs-5 fw-bolder'>Brocante<span className='bg-primary text-white py-1 px-2' style={{borderRadius: '10px', backgroundColor: '#007bff'}}>V1.0</span></span>
                            </a>
                            <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
                                <form className="position-relative me-4" style={{width: "400px"}}>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 py-2 ps-5"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        style={{
                                            borderRadius: "25px",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                        }}
                                    />
                                    <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 ms-3 text-muted"></i>
                                </form>
                                <div className='auth-btns'>
                                    {!authUser ? (
                                        <motion.button
                                            className='btn btn-primary rounded-pill px-4'
                                            onClick={() => {
                                                context.togglePageLoading(true);
                                                dispatch(setActivePage({page: Pages.LOGIN}));
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className='ti ti-login me-2'></i>
                                            <span>Sign In</span>
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            className='btn btn-outline-primary rounded-pill px-4'
                                            onClick={handleDashboardAccess}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className='ti ti-dashboard me-2'></i>
                                            <span>Dashboard</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
                <div className="min-vh-100 position-relative">
                    <ShopComponent searchTerm={searchTerm} onResetFilter={() => setSearchTerm('')}/>
                    
                    {/* Cart Button */}
                    <AnimatePresence>
                        {showCart && (
                            <motion.div
                                className="position-fixed"
                                style={{
                                    bottom: '2rem',
                                    right: '2rem',
                                    zIndex: 1000
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <motion.button
                                    className="btn rounded-circle d-flex align-items-center justify-content-center position-relative"
                                    style={{
                                        width: '3.5rem',
                                        height: '3.5rem',
                                        backgroundColor: '#8a8a8a',
                                        border: 'none',
                                        boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
                                        opacity: '0.9'
                                    }}
                                    whileHover={{ 
                                        scale: 1.05,
                                        backgroundColor: '#808080',
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        context.togglePageLoading(true);
                                        dispatch(setActivePage({page: Pages.CART_PAGE}));
                                    }}
                                >
                                    <i className="ti ti-basket fs-4" style={{ color: '#fff' }}></i>
                                    
                                    {/* Badge du panier */}
                                    {totalQuantity > 0 && (
                                        <motion.div
                                            className="position-absolute d-flex align-items-center justify-content-center"
                                            style={{
                                                top: '-8px',
                                                right: '-8px',
                                                backgroundColor: '#fff',
                                                color: '#8a8a8a',
                                                borderRadius: '50%',
                                                width: '22px',
                                                height: '22px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                border: '2px solid #8a8a8a'
                                            }}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 17
                                            }}
                                        >
                                            {totalQuantity}
                                        </motion.div>
                                    )}

                                    {/* Animation de pulsation */}
                                    {totalQuantity > 0 && (
                                        <motion.div
                                            className="position-absolute"
                                            style={{
                                                inset: '-4px',
                                                borderRadius: '50%',
                                                border: '2px solid #8a8a8a',
                                                opacity: 0.2
                                            }}
                                            initial={{ scale: 1 }}
                                            animate={{ 
                                                scale: [1, 1.2, 1],
                                                opacity: [0.2, 0.1, 0.2]
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
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}

export default HomePage;