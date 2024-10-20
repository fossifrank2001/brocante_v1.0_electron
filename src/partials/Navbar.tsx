import React, {useCallback, useEffect, useState} from 'react';
import user from "../assets/images/profile/user-1.jpg";
import {useAppContext} from "../contexts/appContext";
import {icons} from "Components/AccessSelectionComponent";
import {useAppDispatch, useAppSelector} from '@/hooks';
import {IRole} from '@/Data/Interfaces';
import {Link} from '@mui/material';
import NotificationsAPI from '@/Data/Api/Notifications';
import {INotification} from '@/Data/Interfaces/Notifications';
import {AnimatePresence, motion} from 'framer-motion';
import "Styles/Navbar.less"
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";

interface INavBarPropsInterface{
    onHandleChangeRole: (role?: IRole) => void
}
const Navbar: React.FC<INavBarPropsInterface> = ({ onHandleChangeRole }) => {
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const { authUser } = useAppSelector(state => state.user);
    const [count, setCount] = useState<number>(0);
    const [hasClickToLoadNotif, setHasClickToLoadNotif] = useState(false);
    const { auth_access_id } = useAppSelector(state => state.userAuthorizing);
    const [notifications, setNotifications] = useState<INotification[] | null>(null);
    const [hasClickSecond, setHasClickSecond] = useState(false);
    const {totalQuantity} = useAppSelector(state => state.cart);

    const handleLogout = async () => {
        try {
            context.togglePageLoading(true);
            const { logoutAsync } = await import("Data/Slices/auth/userSlice");
            await dispatch(logoutAsync());
        } catch (e) { console.error(e); }
    };

    const handleChangeAccess = async (access_id: number | string) => {
        try {
            context.togglePageLoading(true);
            console.log('access_id ::: ', access_id)
            const { loadAuthorizationAsync } = await import('Data/Slices/auth/authorizationSlice');
            await dispatch(loadAuthorizationAsync({ access_id }));
            const role = authUser?.accesses?.find(access => access.id === access_id)?.role;
            onHandleChangeRole(role);
        } catch (e) {
            console.error(e);
        } finally {
            context.togglePageLoading(false);
        }
    };

    const displayAccesses = authUser?.accesses?.map(access => {
        const isActual = access?.role?.id === authUser?.accesses?.find(access => access.id === auth_access_id)?.role?.id;
        return (
            <Link
                key={access.id} type="button"
                onClick={() => {
                    handleChangeAccess(access.id);
                    setHasClickToLoadNotif(prev => !prev);
                }}
                href="#" className={`d-flex align-items-center gap-2 dropdown-item ${isActual ? 'bg-primary text-white' : 'btn'}`}
                style={{ borderRadius: 0 }}
            >
                <i className={`${icons[access.role.code]} fs-6`}></i>
                <p className="mb-0 fs-3">{access.role.label}</p>
            </Link>
        );
    });

    const countNotifications = useCallback(async () => {
        try {
            const { data } = await NotificationsAPI.count();
            setCount(data);
        } catch (e) { console.error(e); }
    }, []);

    const getNotifications = useCallback(async () => {
        try {
            const { data: notifList } = await NotificationsAPI.index();
            context.togglePageLoading(true);
            setNotifications(notifList.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        countNotifications();
        getNotifications();
    }, [countNotifications, getNotifications, hasClickToLoadNotif]);

    const renderNotificationIcon = (nature: string) => {
        switch (nature) {
            case 'info':
                return <i className="ti ti-info-circle text-info" style={{fontSize: "32px"}}></i>;
            case 'success':
                return <i className="ti ti-circle-check text-success" style={{fontSize: "32px"}}></i>;
            case 'warning':
                return <i className="ti ti-alert-triangle text-warning" style={{fontSize: "32px"}}></i>;
            case 'error':
                return <i className="ti ti-alert-circle text-danger" style={{fontSize: "32px"}}></i>;
            default:
                return <i className="ti ti-info-circle" style={{fontSize: "32px"}}></i>;
        }
    };

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = Math.floor(seconds / 31536000);

        if (interval > 1) return `${interval} years ago`;
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return `${interval} months ago`;
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return `${interval} days ago`;
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return `${interval} hours ago`;
        interval = Math.floor(seconds / 60);
        if (interval > 1) return `${interval} minutes ago`;
        return "Just now";
    };

    const handleToggleOpening = () => {
        setHasClickSecond(prev => !prev)
        const aside = document.querySelector("#left-sidebar");
        aside.classList.toggle('visible')
    }

    return (
        <header className="app-header">
            <nav className="navbar navbar-expand-lg navbar-light" style={{ borderBottom: "1px solid lightgray" }}>
                <ul className="navbar-nav">
                    <li className="nav-item d-block d-xl-none">
                        <Link className="nav-link sidebartoggler nav-icon-hover" id="headerCollapse" onClick={handleToggleOpening} href="#">
                            {!hasClickSecond? <i className="ti ti-menu-2"></i> : <i className="ti ti-x" ></i>}
                        </Link>
                    </li>
                    <li className="nav-item nav-icon-hover-bg rounded-circle position-relative">
                        <Link className="nav-link nav-icon-hover position-relative" href="#" onClick={() => setHasClickToLoadNotif(prev => !prev)}>
                            <i className="ti ti-bell-ringing"></i>
                            {count > 0 && <span className="popup-badge rounded-pill bg-danger text-white fs-2">{count}</span>}
                        </Link>
                        <AnimatePresence>
                            {hasClickToLoadNotif && (
                                <motion.div
                                    className="notification-box position-absolute end-0 mt-2 p-3 bg-white border rounded shadow"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{ width: '400px', zIndex: 1000 }}
                                >
                                    <div className="notification-header d-flex justify-content-between align-items-center">
                                        <h6>You have {count} new notification(s)</h6>
                                    </div>
                                    <ul className="notification-list list-unstyled">
                                        {notifications?.map((notification) => (
                                            <li key={notification.id} className="notification-item d-flex align-items-start mb-2">
                                                <div className='d-flex align-items-center'>
                                                    {renderNotificationIcon(notification.data?.nature)}
                                                    <div className="notification-content ms-3">
                                                        <h6 className="notification-title mb-1 fw-bolder">{notification.data?.title}</h6>
                                                        <p className="notification-message mb-0 fs-9 opacity-75">{notification.data?.message}</p>
                                                        <small
                                                            className="text-muted">{timeAgo(notification.created_at)}</small>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="d-flex text-center justify-content-center">
                                        <Link href="#" className="see-more-link text-primary text-underline" onClick={() => dispatch(setActivePage({page:Pages.NOTIFICATION}))}>Show all notifications</Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </li>
                </ul>
                <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
                    <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
                        <li className="nav-item nav-icon-hover-bg rounded-circle">
                            <button className="btn btn-primary d-flex align-items-center" onClick={() => dispatch(setActivePage({page: Pages.HOME}))} >
                                <i className='ti ti-building-store me-1'></i>
                                <span>Shop</span>
                            </button>
                        </li>
                        <li className="nav-item nav-icon-hover-bg rounded-circle">
                            <Link className="nav-link position-relative" href="#"
                               data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight"
                               aria-controls="offcanvasRight">
                                <i className="ti ti-basket"></i>
                                {totalQuantity > 0 && <span className="popup-badge rounded-pill bg-danger text-white fs-2">{totalQuantity}</span>}
                            </Link>
                        </li>
                        <li className="nav-item dropdown">
                            <Link onClick={() => {}}
                                  className="nav-link nav-icon-hover"
                                  href="#"
                                  id="drop2"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                            >
                                <i className='ti ti-lock-access m-1 p-1 text-white bg-primary rounded-1'></i>
                            </Link>
                            <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up py-3"
                                 aria-labelledby="drop2">
                                <div className="message-body">
                                    {displayAccesses}
                                </div>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <Link className="nav-link nav-icon-hover" href="#" id="drop2"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false">
                                <img src={user} alt="" width="35" height="35"
                                     className="rounded-circle" />
                            </Link>
                            <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up"
                                 aria-labelledby="drop2">
                                <div className="message-body">
                                    <Link href="#" className="d-flex align-items-center gap-2 dropdown-item">
                                        <i className="ti ti-user fs-6"></i>
                                        <p className="mb-0 fs-3">My Profile</p>
                                    </Link>
                                    <button onClick={handleLogout} type='button'
                                            className="btn btn-outline-primary w-75 mx-auto mt-2 d-block">Logout</button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};
export default React.memo(Navbar);
