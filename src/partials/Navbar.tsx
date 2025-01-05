import React, {useCallback, useEffect, useState, useRef} from 'react';
import user from "../assets/images/profile/user-1.jpg";
import {useAppContext} from "../contexts/appContext";
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
    const notificationRef = useRef<HTMLDivElement>(null);
    const accessDropdownRef = useRef<HTMLLIElement>(null);
    const userDropdownRef = useRef<HTMLLIElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAccessDropdown, setShowAccessDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

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

    const roleIcons = {
        'ADMIN': 'ti ti-shield-check',
        'SELLER': 'ti ti-shopping-cart',
        'BUYER': 'ti ti-user',
        'SUPER_ADMIN': 'ti ti-crown',
    };

    const roleDescriptions = {
        'ADMIN': 'Manage the entire system',
        'SELLER': 'Create and manage your shop',
        'BUYER': 'Browse and purchase items',
        'SUPER_ADMIN': 'Full system control',
    };

    const displayAccesses = authUser?.accesses?.map(access => {
        const isActual = access?.role?.id === authUser?.accesses?.find(access => access.id === auth_access_id)?.role?.id;
        return (
            <button
                key={access.id}
                onClick={() => {
                    handleChangeAccess(access.id);
                    setShowAccessDropdown(false);
                }}
                className={`dropdown-item d-flex align-items-center gap-3 py-2 px-3 border-0 w-100 ${
                    isActual ? 'bg-light-primary' : 'hover-bg-light'
                }`}
                style={{ transition: 'all 0.2s ease' }}
            >
                <div className={`rounded-circle p-2 ${isActual ? 'bg-primary' : 'bg-light'}`}>
                    <i className={`${roleIcons[access.role.code] || 'ti ti-user'} fs-4 ${isActual ? 'text-white' : 'text-primary'}`}></i>
                </div>
                <div className="d-flex flex-column">
                    <span className={`fw-semibold mb-0 ${isActual ? 'text-primary' : ''}`}>
                        {access.role.label}
                    </span>
                    <small className="text-muted">
                        {roleDescriptions[access.role.code] || 'Access to system'}
                    </small>
                </div>
                {isActual && (
                    <div className="ms-auto">
                        <i className="ti ti-check text-primary fs-4"></i>
                    </div>
                )}
            </button>
        );
    });

    const countNotifications = useCallback(async () => {
        try {
            const { data } = await NotificationsAPI.count();
            console.log('Notification count:', data);
            setCount(data);
        } catch (e) {
            console.error('Error counting notifications:', e);
        }
    }, []);

    const getNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data: notifList } = await NotificationsAPI.index();
            setNotifications(notifList as INotification[]);
        } catch (e) {
            console.error('Error fetching notifications:', e);
            setError('Failed to load notifications');
        } finally {
            setIsLoading(false);
            context.togglePageLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log('Effect triggered - hasClickToLoadNotif:', hasClickToLoadNotif);
        countNotifications();
        getNotifications();
    }, [countNotifications, getNotifications, hasClickToLoadNotif]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Ferme le popup des notifications
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setHasClickToLoadNotif(false);
            }
            // Ferme le popup des accès
            if (accessDropdownRef.current && !accessDropdownRef.current.contains(event.target as Node)) {
                setShowAccessDropdown(false);
            }
            // Ferme le popup utilisateur
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                                    ref={notificationRef}
                                    className="notification-box position-absolute end-0 mt-2 p-3 bg-white border rounded shadow"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{ width: '400px', zIndex: 800, maxHeight: '500px', overflowY: 'auto' }}
                                >
                                    <div className="notification-header d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">You have {count} new notification(s)</h6>
                                    </div>
                                    {isLoading ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : error ? (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    ) : !notifications ? (
                                        <div className="text-center py-3 text-muted">
                                            Loading notifications...
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="text-center py-3 text-muted">
                                            No notifications
                                        </div>
                                    ) : (
                                        <ul className="notification-list list-unstyled">
                                            {notifications.map((notification) => {
                                                const notifData = notification.data;
                                                return (
                                                    <li key={notification.id} 
                                                        className={`notification-item d-flex align-items-start mb-3 p-2 hover-bg-light rounded ${!notification.read_at ? 'bg-light' : ''}`}
                                                    >
                                                        <div className='d-flex align-items-start w-100'>
                                                            {renderNotificationIcon(notifData.nature)}
                                                            <div className="notification-content ms-3 flex-grow-1">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <h6 className="notification-title mb-1 fw-bolder">
                                                                        {notifData.title}
                                                                        {!notification.read_at && (
                                                                            <span className="badge bg-primary ms-2 rounded-pill">New</span>
                                                                        )}
                                                                    </h6>
                                                                    <small className="text-muted">
                                                                        {timeAgo(notification.created_at)}
                                                                    </small>
                                                                </div>
                                                                <p className="notification-message mb-0 fs-9 opacity-75">
                                                                    {notifData.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                    <div className="d-flex text-center justify-content-center mt-3 pt-2 border-top">
                                        <Link 
                                            href="#" 
                                            className="see-more-link text-primary text-decoration-none" 
                                            onClick={() => {
                                                dispatch(setActivePage({page:Pages.NOTIFICATION}));
                                                setHasClickToLoadNotif(false);
                                            }}
                                        >
                                            Show all notifications
                                        </Link>
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
                        <li className="nav-item dropdown position-relative" ref={accessDropdownRef}>
                            <button
                                type="button"
                                className="nav-link nav-icon-hover bg-transparent border-0 position-relative"
                                onClick={() => setShowAccessDropdown(!showAccessDropdown)}
                                aria-expanded={showAccessDropdown}
                            >
                                <i className='ti ti-switch-3 fs-5 bg-primary text-white p-2 rounded'></i>
                            </button>
                            <div 
                                className={`dropdown-menu dropdown-menu-end shadow-lg ${showAccessDropdown ? 'show' : ''}`}
                                style={{ 
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    marginTop: '0.5rem',
                                    minWidth: '280px',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    zIndex: 800,
                                    backgroundColor: '#fff'
                                }}
                            >
                                <div className="p-3">
                                    <h6 className="dropdown-header border-bottom pb-2 mb-2 text-primary">
                                        Switch Role
                                    </h6>
                                    {displayAccesses}
                                </div>
                            </div>
                        </li>
                        <li className="nav-item dropdown position-relative" ref={userDropdownRef}>
                            <button
                                type="button"
                                className="nav-link nav-icon-hover bg-transparent border-0 d-flex align-items-center gap-2"
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                aria-expanded={showUserDropdown}
                            >
                                <img 
                                    src={user} 
                                    alt="user profile" 
                                    width="35" 
                                    height="35"
                                    className="rounded-circle" 
                                />
                            </button>
                            <div 
                                className={`dropdown-menu dropdown-menu-end shadow-lg ${showUserDropdown ? 'show' : ''}`}
                                style={{ 
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    marginTop: '0.5rem',
                                    minWidth: '200px',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    zIndex: 800,
                                    backgroundColor: '#fff'
                                }}
                            >
                                <div className="p-3">
                                    <div className="d-flex align-items-center border-bottom pb-3 mb-3">
                                        <div className="flex-shrink-0">
                                            <img 
                                                src={user} 
                                                alt="" 
                                                width="45" 
                                                height="45"
                                                className="rounded-circle" 
                                            />
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-1 fw-semibold">{authUser?.last_name +' '+ authUser?.first_name}</h6>
                                            <small className="text-muted">{authUser?.email}</small>
                                        </div>
                                    </div>
                                    <a
                                        href="#"
                                        className="d-flex align-items-center gap-2 dropdown-item"
                                        onClick={(e: React.SyntheticEvent) => {
                                            e.preventDefault();
                                            dispatch(setActivePage({ page: Pages.PROFILE }));
                                            setShowUserDropdown(false);
                                        }}
                                    >
                                        <i className="ti ti-user-circle fs-6"></i>
                                        <p className="mb-0 fs-3">My Profile</p>
                                    </a>
                                    <button
                                        onClick={() => {
                                            (async () => {
                                                context.togglePageLoading(true)
                                                await handleLogout();
                                                setShowUserDropdown(false);
                                            })()
                                        }}
                                        className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                                    >
                                        <i className="ti ti-logout fs-5"></i>
                                        <span>Logout</span>
                                    </button>
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
