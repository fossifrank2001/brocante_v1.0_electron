import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/hooks';
import defaultAvatar from '@/assets/images/profile/user-1.jpg';
import { Tab, Tabs } from '@mui/material';
import Breadcrumd from '../Breadcrumd';
import AccessAPI from '@/Data/Api/Access';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useTranslation } from 'react-i18next';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div className="p-3">
                    {children}
                </div>
            )}
        </div>
    );
}

const ProfileComponent: React.FC = () => {
    const { t } = useTranslation();
    const { authUser } = useAppSelector((state) => state.user);
    const [activeTab, setActiveTab] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: authUser?.first_name || '',
        lastName: authUser?.last_name || '',
        email: authUser?.email || '',
        phone: authUser?.phone || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // TODO: Implement save logic
        console.log('Saving profile data:', formData);
        setIsEditing(false);
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <Breadcrumd parent={t('profile.profile')} />
                </div>
            </div>

            <div className="row">
                {/* Profile Header */}
                <div className="col-12 mb-4">
                    <motion.div
                        className="card overflow-hidden shadow-sm border-0"
                        style={{
                            borderRadius: '25px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="card-body p-0 position-relative">
                            {/* Premium Cover Gradient */}
                            <div
                                className="w-100"
                                style={{
                                    height: '200px',
                                    background: 'rgb(20 14 117)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                                }} />
                            </div>

                            {/* Profile Overlay Content */}
                            <div className="px-4 pb-4" style={{ marginTop: '-80px', position: 'relative', zIndex: 2 }}>
                                <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end gap-4 text-center text-md-start">
                                    <div className="position-relative">
                                        <div className="rounded-circle p-1 bg-white shadow-lg">
                                            <img
                                                src={defaultAvatar}
                                                alt="profile"
                                                className="rounded-circle"
                                                width="150"
                                                height="150"
                                                style={{
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="btn btn-primary d-flex align-items-center justify-content-center position-absolute bottom-0 end-0 rounded-circle shadow-lg border-2 border-white"
                                            style={{ width: '42px', height: '42px' }}
                                        >
                                            <i className="ti ti-camera fs-5"></i>
                                        </motion.button>
                                    </div>
                                    <div className="flex-grow-1 pt-2 pb-1">
                                        <h2 className="fw-bold mb-1 text-dark">{authUser?.last_name} {authUser?.first_name || ''}</h2>
                                        <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 align-items-center">
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2  fw-semibold">
                                                <i className="ti ti-shield-check me-1 fs-4"></i>
                                                {UtilMethods.capitalizeFirstLetter(authUser?.status ?? 'Professionnel')}
                                            </span>
                                            <span className="text-muted d-flex align-items-center fw-medium">
                                                <i className="ti ti-mail me-2 fs-5"></i>
                                                {authUser?.email}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-md-2">
                                        <button className="btn btn-primary px-4 py-2  shadow-sm d-flex align-items-center gap-2" onClick={() => setIsEditing(true)}>
                                            <i className="ti ti-user-edit fs-5"></i>
                                            <span>Modifier le Profil</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Modern Stats Row */}
                                <div className="d-flex justify-content-center justify-content-md-start gap-5 mt-4 pt-4 border-top">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light-primary  p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            <i className="ti ti-shopping-cart text-primary fs-5"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">254</h5>
                                            <small className="text-muted text-uppercase fw-bold ls-1" style={{ fontSize: '10px' }}>Ventes</small>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light-success  p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            <i className="ti ti-device-laptop text-success fs-5"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">12</h5>
                                            <small className="text-muted text-uppercase fw-bold ls-1" style={{ fontSize: '10px' }}>Sessions</small>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light-warning  p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            <i className="ti ti-bolt text-warning fs-5"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">1.8k</h5>
                                            <small className="text-muted text-uppercase fw-bold ls-1" style={{ fontSize: '10px' }}>Score</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Profile Content */}
                <div className="col-12">
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="card-body">
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                className="mb-4"
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label={t('profile.overview')} />
                                <Tab label={t('profile.articles')} />
                                <Tab label={t('profile.settings')} />
                                <Tab label={t('profile.security')} />
                            </Tabs>

                            <TabPanel value={activeTab} index={0}>
                                <div className="row g-4">
                                    <div className="col-lg-7">
                                        <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h5 className="fw-bold mb-0">{t('profile.profileInfo')}</h5>
                                                    <button
                                                        className={`btn btn-${isEditing ? 'success' : 'light-primary'} btn-sm px-3 `}
                                                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                                    >
                                                        <i className={`ti ti-${isEditing ? 'check' : 'pencil'} me-1`}></i>
                                                        {isEditing ? t('common.save') : t('common.edit')}
                                                    </button>
                                                </div>
                                                <div className="row g-3">
                                                    <div className="col-md-6 text-start">
                                                        <label className="form-label text-muted small fw-bold">{t('profile.name')}</label>
                                                        <input
                                                            type="text"
                                                            className="form-control "
                                                            name="lastName"
                                                            value={isEditing ? formData.lastName : authUser?.last_name || ''}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            placeholder={t('profile.yourName')}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 text-start">
                                                        <label className="form-label text-muted small fw-bold">{t('profile.firstName')}</label>
                                                        <input
                                                            type="text"
                                                            className="form-control "
                                                            name="firstName"
                                                            value={isEditing ? formData.firstName : authUser?.first_name || ''}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            placeholder={t('profile.yourFirstName')}
                                                        />
                                                    </div>
                                                    <div className="col-md-12 text-start">
                                                        <label className="form-label text-muted small fw-bold">{t('user.email')}</label>
                                                        <input
                                                            type="email"
                                                            className="form-control "
                                                            name="email"
                                                            value={isEditing ? formData.email : authUser?.email || ''}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            placeholder={t('profile.yourEmail')}
                                                        />
                                                    </div>
                                                    <div className="col-md-12 text-start">
                                                        <label className="form-label text-muted small fw-bold">{t('user.phone')}</label>
                                                        <input
                                                            type="tel"
                                                            className="form-control "
                                                            name="phone"
                                                            value={isEditing ? formData.phone : authUser?.phone || ''}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            placeholder="+237 XXX XXX XXX"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-5">
                                        <div className="d-flex flex-column gap-4">
                                            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                                                <div className="card-body p-4 text-start">
                                                    <h6 className="fw-bold mb-3">{t('profile.accountStatus')}</h6>
                                                    <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-4">
                                                        <div className="bg-success-subtle rounded-circle p-2"><i className="ti ti-shield-check text-success fs-5"></i></div>
                                                        <div className="ms-3">
                                                            <p className="mb-0 text-muted small">{t('common.status')}</p>
                                                            <span className="fw-bold">{UtilMethods.capitalizeFirstLetter(authUser?.status ?? '')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center p-3 bg-light rounded-4">
                                                        <div className="bg-primary-subtle rounded-circle p-2"><i className="ti ti-calendar text-primary fs-5"></i></div>
                                                        <div className="ms-3">
                                                            <p className="mb-0 text-muted small">{t('profile.memberSince')}</p>
                                                            <span className="fw-bold">{UtilMethods.formatDate(authUser?.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                                                <div className="card-body p-4 text-start">
                                                    <h6 className="fw-bold mb-3">{t('profile.accessAndRoles')}</h6>
                                                    {authUser?.accesses && authUser.accesses.length > 0 ? (
                                                        <div className="d-flex flex-column gap-2">
                                                            {authUser.accesses.map((access, index) => (
                                                                <div key={index} className="p-2 border  d-flex justify-content-between align-items-center">
                                                                    <span className="fw-semibold">{access.role.label}</span>
                                                                    <span className={`badge bg-${access.status ? 'success' : 'danger'} `}>
                                                                        {access.status === AccessAPI.ACTIVE ? t('common.active') : t('common.inactive')}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-2 text-muted">{t('profile.noRolesAssigned')}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel value={activeTab} index={1}>
                                <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                                    <div className="card-body p-5 text-center">
                                        <div className="bg-light-primary rounded-circle d-inline-flex p-4 mb-4">
                                            <i className="ti ti-article fs-1 text-primary"></i>
                                        </div>
                                        <h4 className="fw-bold mb-2">{t('profile.yourArticles')}</h4>
                                        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                                            {t('profile.noArticlesYet')}
                                        </p>
                                        <button className="btn btn-primary px-4 ">
                                            <i className="ti ti-plus me-2"></i>
                                            {t('profile.addArticle')}
                                        </button>
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel value={activeTab} index={2}>
                                <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                                    <div className="card-body p-4 text-start">
                                        <h5 className="fw-bold mb-4">{t('profile.accountSettings')}</h5>

                                        <div className="mb-4 pt-2">
                                            <h6 className="fw-bold d-flex align-items-center mb-3">
                                                <i className="ti ti-bell-ringing me-2 text-primary"></i>
                                                {t('profile.notifications')}
                                            </h6>
                                            <div className="p-3 bg-light rounded-4 mb-2 d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0 fw-semibold">{t('profile.emailNotifications')}</h6>
                                                    <small className="text-muted">{t('profile.receiveSaleAlerts')}</small>
                                                </div>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" id="emailNotif" defaultChecked />
                                                </div>
                                            </div>
                                            <div className="p-3 bg-light rounded-4 d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0 fw-semibold">{t('profile.stockAlerts')}</h6>
                                                    <small className="text-muted">{t('profile.lowStockNotifications')}</small>
                                                </div>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" id="pushNotif" defaultChecked />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <h6 className="fw-bold d-flex align-items-center mb-3">
                                                <i className="ti ti-eye me-2 text-primary"></i>
                                                {t('profile.privacy')}
                                            </h6>
                                            <div className="p-3 bg-light rounded-4 d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0 fw-semibold">{t('profile.publicProfile')}</h6>
                                                    <small className="text-muted">{t('profile.showInfoToSellers')}</small>
                                                </div>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" id="profileVisibility" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel value={activeTab} index={3}>
                                <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                                    <div className="card-body p-4 text-start">
                                        <h5 className="fw-bold mb-4">{t('profile.accountSecurity')}</h5>

                                        <div className="row g-4">
                                            <div className="col-lg-6 border-end">
                                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                                    <i className="ti ti-key me-2 text-warning"></i>
                                                    {t('profile.changePassword')}
                                                </h6>
                                                <div className="mb-3">
                                                    <label className="form-label small fw-bold text-muted">{t('profile.currentPassword')}</label>
                                                    <input type="password" className="form-control " placeholder="••••••••" />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label small fw-bold text-muted">{t('profile.newPassword')}</label>
                                                    <input type="password" className="form-control " placeholder="••••••••" />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label small fw-bold text-muted">{t('profile.confirmPassword')}</label>
                                                    <input type="password" className="form-control " placeholder="••••••••" />
                                                </div>
                                                <button className="btn btn-warning px-4  text-white fw-bold">
                                                    {t('profile.updatePassword')}
                                                </button>
                                            </div>
                                            <div className="col-lg-6">
                                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                                    <i className="ti ti-shield-lock me-2 text-success"></i>
                                                    {t('profile.twoFactorAuth')}
                                                </h6>
                                                <div className="p-4 bg-light-success rounded-4 border border-success-subtle mb-4">
                                                    <div className="d-flex gap-3">
                                                        <div className="flex-shrink-0 text-success"><i className="ti ti-info-circle fs-6"></i></div>
                                                        <p className="small mb-0 text-success fw-medium">
                                                            {t('profile.twoFADescription')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">{t('profile.enable2FA')}</h6>
                                                        <small className="text-muted">{t('profile.enhancedProtection')}</small>
                                                    </div>
                                                    <div className="form-check form-switch">
                                                        <input className="form-check-input" type="checkbox" id="twoFactor" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfileComponent;
