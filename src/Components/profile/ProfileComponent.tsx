import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/hooks';
import defaultAvatar from '@/assets/images/profile/user-1.jpg';
import { Tab, Tabs } from '@mui/material';
import Breadcrumd from '../Breadcrumd';
import AccessAPI from '@/Data/Api/Access';
import UtilMethods from '@/Data/Utilities/UtilMethods';

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

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <Breadcrumd parent="Profile" />
                </div>
            </div>

            <div className="row">
                {/* Profile Header */}
                <div className="col-12 mb-4">
                    <motion.div 
                        className="card overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="card-body position-relative">
                            {/* Cover Image */}
                            <div 
                                className="position-absolute top-0 start-0 w-100"
                                style={{
                                    height: '150px',
                                    background: 'linear-gradient(45deg, #3a7bd5, #00d2ff)',
                                    zIndex: 1
                                }}
                            />
                            
                            {/* Profile Content */}
                            <div className="position-relative" style={{ zIndex: 2 }}>
                                <div className="text-center mt-5">
                                    <div className="d-inline-block position-relative">
                                        <img
                                            src={defaultAvatar}
                                            alt="profile"
                                            className="rounded-circle"
                                            width="130"
                                            height="130"
                                            style={{ 
                                                border: '4px solid white',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <button 
                                            className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
                                            style={{ width: '32px', height: '32px' }}
                                        >
                                            <i className="ti ti-pencil fs-5"></i>
                                        </button>
                                    </div>
                                    <h4 className="mt-3 mb-1">{authUser?.last_name} {authUser?.first_name || ''}</h4>
                                    <p className="text-muted">{authUser?.email}</p>
                                </div>

                                {/* Stats */}
                                <div className="d-flex justify-content-center gap-4 mt-4">
                                    <div className="text-center">
                                        <h5 className="mb-0">254</h5>
                                        <small className="text-muted">Articles</small>
                                    </div>
                                    <div className="text-center">
                                        <h5 className="mb-0">12.8k</h5>
                                        <small className="text-muted">Followers</small>
                                    </div>
                                    <div className="text-center">
                                        <h5 className="mb-0">1.8k</h5>
                                        <small className="text-muted">Following</small>
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
                                <Tab label="Overview" />
                                <Tab label="Articles" />
                                <Tab label="Settings" />
                                <Tab label="Security" />
                            </Tabs>

                            <TabPanel value={activeTab} index={0}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Personal Information</h6>
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="mb-0">Informations du profil</h6>
                                                        <button 
                                                            className={`btn btn-${isEditing ? 'success' : 'primary'} btn-sm`}
                                                            onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                                        >
                                                            <i className={`ti ti-${isEditing ? 'check' : 'pencil'} me-1`}></i>
                                                            {isEditing ? 'Sauvegarder' : 'Modifier'}
                                                        </button>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-muted">Nom</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            name="lastName"
                                                            value={isEditing ? formData.lastName : authUser?.last_name || ''} 
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            placeholder="Votre nom"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-muted">Prénom</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            name="firstName"
                                                            value={isEditing ? formData.firstName : authUser?.first_name || ''} 
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            placeholder="Votre prénom"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-muted">Email</label>
                                                        <input 
                                                            type="email" 
                                                            className="form-control" 
                                                            name="email"
                                                            value={isEditing ? formData.email : authUser?.email || ''} 
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            placeholder="votre@email.com"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-muted">Téléphone</label>
                                                        <input 
                                                            type="tel" 
                                                            className="form-control" 
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
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Account Information</h6>
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className="flex-shrink-0">
                                                            <i className="ti ti-shield-check fs-4 text-primary"></i>
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <h6 className="mb-1">Account Status</h6>
                                                            <span className="badge bg-success">{UtilMethods.capitalizeFirstLetter(authUser?.status ?? '')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className="flex-shrink-0">
                                                            <i className="ti ti-calendar fs-4 text-primary"></i>
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <h6 className="mb-1">Member Since</h6>
                                                            <p className="text-muted mb-0">{UtilMethods.formatDate(authUser?.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-shrink-0">
                                                            <i className="ti ti-award fs-4 text-primary"></i>
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <h6 className="mb-1">Account Type</h6>
                                                            <p className="text-muted mb-0">Premium</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Accès et Rôles</h6>
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="mb-4">
                                                        <h6 className="mb-3">Accès</h6>
                                                        {authUser?.accesses && authUser.accesses.length > 0 ? (
                                                            <div className="list-group">
                                                                {authUser.accesses.map((access, index) => (
                                                                    <div key={index} className="list-group-item list-group-item-action">
                                                                        <div className="d-flex w-100 justify-content-between align-items-center">
                                                                            <div>
                                                                                <h6 className="mb-1">{access.role.label}</h6>
                                                                            </div>
                                                                            <span className={`badge bg-${access.status ? 'success' : 'danger'}`}>
                                                                                {access.status === AccessAPI.ACTIVE ? AccessAPI.ACTIVE : AccessAPI.INACTIVE}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-muted py-3">
                                                                <i className="ti ti-door-off fs-3 mb-2 d-block"></i>
                                                                <p>Aucun accès disponible</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel value={activeTab} index={1}>
                                <div className="row">
                                    <div className="col-12">
                                        <h6 className="text-muted mb-3">Your Articles</h6>
                                        {/* Article list will go here */}
                                        <div className="text-center text-muted py-5">
                                            <i className="ti ti-article fs-1 mb-3 d-block"></i>
                                            <p>No articles yet</p>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel value={activeTab} index={2}>
                                <div className="row">
                                    <div className="col-12">
                                        <h6 className="text-muted mb-3">Account Settings</h6>
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="mb-4">
                                                    <h6 className="mb-3">Notifications</h6>
                                                    <div className="form-check form-switch mb-2">
                                                        <input className="form-check-input" type="checkbox" id="emailNotif" />
                                                        <label className="form-check-label" htmlFor="emailNotif">
                                                            Email Notifications
                                                        </label>
                                                    </div>
                                                    <div className="form-check form-switch mb-2">
                                                        <input className="form-check-input" type="checkbox" id="pushNotif" />
                                                        <label className="form-check-label" htmlFor="pushNotif">
                                                            Push Notifications
                                                        </label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="mb-3">Privacy</h6>
                                                    <div className="form-check form-switch mb-2">
                                                        <input className="form-check-input" type="checkbox" id="profileVisibility" />
                                                        <label className="form-check-label" htmlFor="profileVisibility">
                                                            Profile Visibility
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel value={activeTab} index={3}>
                                <div className="row">
                                    <div className="col-12">
                                        <h6 className="text-muted mb-3">Security Settings</h6>
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="mb-4">
                                                    <h6 className="mb-3">Change Password</h6>
                                                    <div className="mb-3">
                                                        <label className="form-label">Current Password</label>
                                                        <input type="password" className="form-control" />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">New Password</label>
                                                        <input type="password" className="form-control" />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Confirm New Password</label>
                                                        <input type="password" className="form-control" />
                                                    </div>
                                                    <button className="btn btn-primary">Update Password</button>
                                                </div>
                                                <div>
                                                    <h6 className="mb-3">Two-Factor Authentication</h6>
                                                    <div className="form-check form-switch">
                                                        <input className="form-check-input" type="checkbox" id="twoFactor" />
                                                        <label className="form-check-label" htmlFor="twoFactor">
                                                            Enable Two-Factor Authentication
                                                        </label>
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
