import React, { useCallback, useEffect, useRef, useState } from 'react'
import user from '@/assets/images/profile/user-1.jpg'
import { useAppContext } from '@/contexts/appContext'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Skeleton } from '@mui/material'
import UtilMethods from '@/Data/Utilities/UtilMethods'
import { setActivePage } from '@/Data/Slices/NavigationSlice'
import { motion } from 'framer-motion'
import Logo from '@/Components/common/Logo'
import { useTranslation } from 'react-i18next'

const iconOfMenus: Record<string, string> = {
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
    CUSTOMER: 'ti ti-users',
    SUPPLIER: 'ti ti-user-plus',
    INVOICE: 'ti ti-file-invoice',
    NOTIFICATION: 'ti ti-bell',
    PROFILE: 'ti ti-user-circle',
    USER_ACCESS_PAGE: 'ti ti-shield-lock',
    ACTIVITY_LOGS: 'ti ti-activity',
    POS_EXPRESS: 'ti ti-cash-register',
    SETTINGS: 'ti ti-settings',
    STOCK_MOVEMENTS: 'ti ti-arrows-exchange',
    PRODUCT_TEMPLATES: 'ti ti-template',
    REPORTS: 'ti ti-report-analytics',
    INVENTORY: 'ti ti-clipboard-list',
    PURCHASE_ORDERS: 'ti ti-truck-loading',
}

const getMenuIcon = (code: string): string => {
    return iconOfMenus[code] || 'ti ti-circle-dot';
}

interface AsideProps {
    role?: number | null;
    isSidebarOpen?: boolean;
}

export default function Aside({ role = null, isSidebarOpen = true }: AsideProps) {
    const { t } = useTranslation()
    const context = useAppContext()
    const dispatch = useAppDispatch()
    const { auth_access_id } = useAppSelector(state => state.userAuthorizing)
    const { authUser } = useAppSelector(state => state.user)
    const { menus_role: menus } = useAppSelector(state => state.menus_role)
    const { currentPage } = useAppSelector(state => state.navigaton)
    const asideRef = useRef(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [openParentId, setOpenParentId] = useState<number | null>(null)

    const handleLogout = async () => {
        try {
            context.togglePageLoading(true)
            const { logoutAsync } = await import("Data/Slices/auth/userSlice")
            await dispatch(logoutAsync())
        } catch (e) {
            console.error(e)
        }
    }

    const getMenus = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const { loadMenuByRoleAsync } = await import("Data/Slices/MenuRoleSlice")
            console.log('auth_access_id ASIDE FUNCTION ::: ', auth_access_id)
            const activeAccessId = Number(auth_access_id)
            const access = authUser?.accesses ? authUser?.accesses.find(access => Number(access.id) === activeAccessId) : null
            console.log('ROLE ASIDE FUNCTION ::: ', role)

            if (access && access.role && access.role.id) {
                await dispatch(loadMenuByRoleAsync(access.role.id))
            } else {
                console.warn('Access or role not found for user:', { access, auth_access_id, authUser })
            }
        } catch (e) {
            console.error(e)
            setError(t('aside.failedToLoadMenus'))
        } finally {
            setIsLoading(false)
        }
    }, [role, auth_access_id, authUser, dispatch])

    useEffect(() => {
        getMenus()
        console.log('ROLE ASIDE USEEFFECT ::: ', role)
    }, [getMenus, role])

    // Ouvrir automatiquement le parent du menu actif (si la page courante est un enfant)
    useEffect(() => {
        if (!menus || menus.length === 0) return
        const active = menus.find((m: any) => m.code === currentPage)
        if (active && active.parent_id) {
            setOpenParentId(active.parent_id)
        }
    }, [menus, currentPage])

    const handleToggleParent = (parentId: number) => {
        setOpenParentId(prev => (prev === parentId ? null : parentId))
    }

    const renderMenus = () => {
        if (!menus || menus.length === 0) return null

        // Masquer le menu 'bill'
        const filteredMenus = menus.filter((m: any) => m.code !== 'BILL')
        const parents = filteredMenus.filter((m) => m.parent_id === null)
        const childrenByParent = filteredMenus.reduce((acc: Record<number, any[]>, m: any) => {
            if (m.parent_id !== null) {
                acc[m.parent_id] = acc[m.parent_id] || []
                acc[m.parent_id].push(m)
            }
            return acc
        }, {})

        return parents.map((parent: any) => {
            const children = childrenByParent[parent.id] || []
            const hasChildren = children.length > 0
            const isOpen = openParentId === parent.id
            const isCurrentPage = parent.code === currentPage
            const isAnyChildActive = hasChildren && children.some((c: any) => c.code === currentPage)

            return (
                <li className="sidebar-item" key={parent.id}>
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className={`sidebar-link d-flex align-items-center justify-content-between ${isCurrentPage && !hasChildren
                            ? 'bg-primary text-white'
                            : isAnyChildActive
                                ? 'bg-primary-subtle'
                                : ''
                            }`}
                        onClick={() => {
                            if (hasChildren) {
                                handleToggleParent(parent.id)
                            } else if (parent.url && parent.url !== '#') {
                                context.togglePageLoading(true)
                                dispatch(setActivePage({ page: String(parent.code).trim() as any }))
                            }
                        }}
                        aria-expanded={isOpen}
                        aria-controls={`submenu-${parent.id}`}
                        role="button"
                    >
                        <span className="d-flex align-items-center gap-2">
                            <i className={getMenuIcon(parent.code)}></i>
                            <span className="hide-menu" style={{ userSelect: 'none' }}>{t(`menu.${parent.code}`)}</span>
                        </span>
                        {hasChildren && (
                            <i className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`}></i>
                        )}
                    </motion.div>

                    {hasChildren && (
                        <motion.ul
                            id={`submenu-${parent.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="list-unstyled ms-3 overflow-hidden"
                            style={{ marginTop: isOpen ? 8 : 0 }}
                        >
                            {children.map((child: any) => {
                                const isChildActive = child.code === currentPage
                                return (
                                    <li className="sidebar-item" key={child.id}>
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            className={`sidebar-link ${isChildActive ? 'bg-primary text-white' : ''}`}
                                            onClick={() => {
                                                context.togglePageLoading(true)
                                                dispatch(setActivePage({ page: String(child.code).trim() as any }))
                                            }}
                                        >
                                            <span>
                                                <i className={getMenuIcon(child.code)}></i>
                                            </span>
                                            <span className="hide-menu" style={{ userSelect: 'none' }}>{t(`menu.${child.code}`)}</span>
                                        </motion.div>
                                    </li>
                                )
                            })}
                        </motion.ul>
                    )}
                </li>
            )
        })
    }

    const handleRemoveSideBar = () => {
        const element: HTMLElement = asideRef.current
        element.style.transform = "translateX(" + -275 + "px)"
    }

    const SkeletonLoader = () => (
        <>
            {[...Array(3)].map((_, groupIndex) => (
                <React.Fragment key={groupIndex}>
                    <li className="nav-small-cap mt-3">
                        <Skeleton variant="text" width={100} height={24} />
                    </li>
                    {[...Array(3)].map((_, itemIndex) => (
                        <li className="sidebar-item" key={itemIndex}>
                            <div className="sidebar-link">
                                <Skeleton variant="circular" width={24} height={24} style={{ marginRight: '10px' }} />
                                <Skeleton variant="text" width={150} height={24} />
                            </div>
                        </li>
                    ))}
                </React.Fragment>
            ))}
        </>
    )

    return (
        <aside
            id="left-sidebar"
            ref={asideRef}
            className="left-sidebar"
            style={{
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-275px)',
                transition: 'transform 0.2s ease-in-out, background-color 0.3s ease',
                backgroundColor: 'var(--sidebar-bg)',
            }}
        >
            <div>
                <div className="brand-logo d-flex align-items-center justify-content-center">
                    <Logo
                        showVersion={true}
                        fontSize="1.25rem"
                        imageSize={125}
                        className="ps-3"
                    />
                    <div className="close-btn d-xl-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
                        <i className="ti ti-x fs-8" onClick={handleRemoveSideBar}></i>
                    </div>
                </div>
                <hr className='w-75 mx-auto' />
                <nav className="sidebar-nav scroll-sidebar" data-simplebar="" style={{
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto'
                }}>
                    {/* Reload button - always visible */}
                    <div className="d-flex align-items-center justify-content-between px-3 py-2">
                        <small className="text-muted fw-semibold" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                            {t('navigation.title')}
                        </small>
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                            transition={isLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
                            onClick={getMenus}
                            disabled={isLoading}
                            title={t('navigation.reloadMenus')}
                            style={{
                                background: 'none',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--accent-primary)',
                                cursor: 'pointer',
                                padding: '3px 8px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: isLoading ? 0.6 : 1,
                                transition: 'all 0.2s',
                            }}
                        >
                            <i className="ti ti-refresh" style={{ fontSize: '14px' }}></i>
                        </motion.button>
                    </div>
                    <ul id="sidebarnav" className="pt-1">
                        {isLoading ? (
                            <SkeletonLoader />
                        ) : error ? (
                            <li className="sidebar-item">
                                <div className="sidebar-link">
                                    <span>{error}</span>
                                </div>
                            </li>
                        ) : menus && menus.length > 0 ? (
                            renderMenus()
                        ) : (
                            <li className="sidebar-item">
                                <div className="sidebar-link d-flex flex-column gap-3">
                                    <span>{t('aside.noMenusAvailable')}</span>
                                </div>
                            </li>
                        )}
                    </ul>
                </nav>
                {authUser && (
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
                                <h6 className="mb-0 fs-4 fw-semibold">{`${authUser.last_name?.split(' ')[0] || t('aside.user')}...`}</h6>
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
                                whileTap={{ scale: 0.9 }}
                            >
                                <i className="ti ti-power fs-6"></i>
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}