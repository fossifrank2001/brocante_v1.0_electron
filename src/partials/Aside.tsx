import {useCallback, useEffect, useRef} from 'react';
import logo from '@/assets/images/logos/dark-logo.svg';
import user from '@/assets/images/profile/user-1.jpg';
import { useAppContext } from '@/contexts/appContext';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Link } from '@mui/material';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { motion } from 'framer-motion';

const iconOfMenus = {
    DASHBOARD: 'ti ti-layout-dashboard',
    ADMINISTRATION: 'ti ti-dots',
    ACCOUNT: 'ti ti-article',
    ACCESS: 'ti ti-lock',
    ROLE: 'ti ti-user',
    HABILITATION: 'ti ti-fingerprint',
    MENU: 'ti ti-menu',
    SHOP: 'ti ti-shopping-cart',
    CATEGORY: 'ti ti-category-2',
    ARTICLE: 'ti ti-package',
    BILL: 'ti ti-receipt',
    SELL: 'ti ti-wallet',
};

export default function Aside({role=null}) {
    const context = useAppContext();
    const dispatch = useAppDispatch()
    const {auth_access_id} = useAppSelector(state => state.userAuthorizing)
    const {authUser} = useAppSelector(state => state.user)
    const {menus_role: menus} = useAppSelector(state => state.menus_role)
    const {currentPage} = useAppSelector(state => state.navigaton)
    const asideRef = useRef(null);
    const handleLogout = async () => {
        try {
            context.togglePageLoading(true);
            const {logoutAsync} = await import("Data/Slices/auth/userSlice")
            await dispatch(logoutAsync());
        } catch (e) {
            console.error(e)
        }
    };

    const getMenus = useCallback(async () => {
        try {
            const {loadMenuByRoleAsync} = await import("Data/Slices/MenuRoleSlice")
            const access = authUser?.accesses?.find(access => access.id === auth_access_id)
            await dispatch(loadMenuByRoleAsync(access?.role.id));
        } catch (e) {console.error(e)}
    }, [role]);

    useEffect(() => {
        getMenus();
    }, [getMenus, role]);

    const displayMenus = menus?.map((item) => {
        const isCurrentPage = item.code === currentPage;

        if (item.parent_id === null && item.url !== '#') {
            return (
                <li className="sidebar-item" key={item.id}>
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className={`sidebar-link ${isCurrentPage && 'bg-primary text-white'}`}
                        onClick={() => {
                            context.togglePageLoading(true)
                            dispatch(setActivePage({page: item.code}))
                        }}
                    >
                        <span>
                            <i className={`${iconOfMenus[item.code]}`}></i>
                        </span>
                        <span className="hide-menu" style={{userSelect:"none"}}>{UtilMethods.capitalizeFirstLetter(item.label)}</span>
                    </motion.div>
                </li>
            );
        } else if (item.parent_id === null && item.url === '#') {
            return (
                <li className="nav-small-cap mt-1 text text-primary-emphasis" key={item.id}>
                    <i className={`${iconOfMenus[item.code]} nav-small-cap-icon fs-4`}></i>
                    <span className="hide-menu" style={{userSelect:"none"}}>{item.label.toUpperCase()}</span>
                </li>
            );
        } else {
            return (
                <li className="sidebar-item ms-2" key={item.id}>
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className={`sidebar-link ${isCurrentPage && 'bg-primary text-white'}`}
                        onClick={() => {
                            context.togglePageLoading(true)
                            dispatch(setActivePage({page: item.code}))
                        }}
                    >
                        <span>
                            <i className={iconOfMenus[item.code]}></i>
                        </span>
                        <span className="hide-menu" style={{userSelect:"none"}}>{UtilMethods.capitalizeFirstLetter(String(item.label))}</span>
                    </motion.div>
                </li>
            );
        }
    });

    const handleRemoveSideBar = () =>{
        const element: HTMLElement = asideRef.current
        element.style.transform = "translateX("+ -275 +"px)";
    }

    return (
        <aside id="left-sidebar" ref={asideRef} className="left-sidebar">
            <div>
                <div className="brand-logo d-flex align-items-center justify-content-between">
                    <Link href="#" className="text-nowrap logo-img">
                        <img src={logo} width="180" alt="" />
                    </Link>
                    <div className="close-btn d-xl-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
                        <i className="ti ti-x fs-8" onClick={handleRemoveSideBar}></i>
                    </div>
                </div>
                <hr />
                <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
                    <ul id="sidebarnav pt-3">{displayMenus}</ul>
                </nav>
                <div
                    className="fixed-profile p-3 mb-2 bg-secondary-subtle rounded mt-3"
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        right: 'auto',
                        width: '80%',
                        margin: '0 auto',
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="hstack gap-3">
                        <div className="john-img">
                            <img src={user} className="rounded-circle" width="40" height="40" alt="modernize-img" />
                        </div>
                        <div className="john-title">
                            <h6 className="mb-0 fs-4 fw-semibold">{`${authUser?.last_name.split(' ')[0]}...`}</h6>
                            <span className="fs-2">{UtilMethods.getAuthRole(auth_access_id)}</span>
                        </div>
                        <motion.button
                            onClick={handleLogout}
                            className="border-0 bg-transparent text-primary ms-auto p-0"
                            tabIndex={0}
                            type="button"
                            aria-label="logout"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            data-bs-title="logout"
                            whileTap={{scale: 0.9}}  // Scale the button to 90% of its size when clicked
                        >
                            <i className="ti ti-power fs-6"></i>
                        </motion.button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
