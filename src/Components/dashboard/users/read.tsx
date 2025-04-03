import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Grid, Paper, Skeleton, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import Breadcrumd from '@/Components/Breadcrumd';
import InfoItem from '@/Components/InfoItem';
import UserAPI from '@/Data/Api/Users';
import { IUser } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Toast from '@/Data/Utilities/Toast';
import Constants from '@/Data/Utilities/constants';
import '@/Styles/details.scss';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

const ReadUser = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState<IUser | null>(null);
    const [inProgress, setInProgress] = useState(false);
    const { authorizations } = useAppSelector(state => state.userAuthorizing);
    const [isLoading, setIsLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const dispatch = useAppDispatch();

    const getRecord = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await UserAPI.show(id);
            setRecord(data);
        } catch (e) {
            console.error(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [id, reload]);

    useEffect(() => {
        getRecord();
    }, [getRecord]);

    const handleTreatAccountStatus = async () => {
        try {
            setInProgress(true);
            let actions = null;
            if (record.status === 'active') {
                actions = UserAPI.disable;
            } else {
                actions = UserAPI.reactivate;
            }
            const { message } = await actions(id);
            setReload(prev => !prev);
            Toast.success(message);
        } catch (e) {
            console.error(e);
        } finally {
            setInProgress(false);
        }
    };

    const SkeletonLoader = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Skeleton variant="circular" width={150} height={150} sx={{ margin: '0 auto' }} />
                <Skeleton variant="text" width={120} height={24} sx={{ margin: '1rem auto' }} />
            </Grid>
            <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                    {[...Array(6)].map((_, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Skeleton variant="rectangular" height={80} />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'disabled':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <motion.div 
            className="container details-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Breadcrumd parent="Users" url={currentPage} _child={id} />
            
            <Paper elevation={0} className="details-card">
                <div className="card-title">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                    >
                        <i className="ti ti-arrow-left"></i>
                        Back
                    </button>
                </div>

                {isLoading ? (
                    <SkeletonLoader />
                ) : record ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} className="user-profile-section">
                            <div className="profile-image">
                                <Avatar
                                    src={record.thumbnail ? `${Constants.URL}/${record.thumbnail.path}` : undefined}
                                    alt={`${record.first_name} ${record.last_name}`}
                                    sx={{ width: 150, height: 150 }}
                                >
                                    {record.first_name?.[0]}{record.last_name?.[0]}
                                </Avatar>
                            </div>
                            <Typography variant="h5" className="user-name">
                                {record.first_name} {record.last_name}
                            </Typography>
                            <div className={`status-badge status-${getStatusColor(record.status)}`}>
                                {record.status}
                            </div>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <div className="info-grid">
                                <div className="info-section">
                                    <Typography variant="h6" className="section-title">
                                        <i className="ti ti-user"></i>
                                        Personal Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <InfoItem
                                                label="Phone"
                                                value={record.phone}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoItem
                                                label="Email"
                                                value={record.email}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoItem
                                                label="Gender"
                                                value={record.gender}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoItem
                                                label="First connexion"
                                                value={record.first_connexion ? 'Yes' : 'No'}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                <div className="info-section">
                                    <Typography variant="h6" className="section-title">
                                        <i className="ti ti-shield"></i>
                                        Roles & Access
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <div className="roles-list">
                                                {record?.accesses?.map((access, index) => (
                                                    <Tooltip 
                                                        key={index} 
                                                        title={`Role assigned on ${dayjs(access.created_at).format('DD/MM/YYYY')}`}
                                                        arrow
                                                    >
                                                        <span className="role-badge">
                                                            {access?.role?.label}
                                                        </span>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        </Grid>
                                    </Grid>
                                </div>

                                <div className="info-section">
                                    <Typography variant="h6" className="section-title">
                                        <i className="ti ti-calendar"></i>
                                        Timestamps
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <InfoItem
                                                label="Created At"
                                                value={dayjs(record.created_at).format('DD/MM/YYYY HH:mm:ss')}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoItem
                                                label="Updated At"
                                                value={dayjs(record.updated_at).format('DD/MM/YYYY HH:mm:ss')}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        dispatch(setActivePage({
                                            page: Pages.ACCOUNT,
                                            id,
                                            param: { sub_page: 'UPDATE' }
                                        }));
                                    }}
                                >
                                    <i className="ti ti-pencil"></i>
                                    Edit Profile
                                </button>

                                {(UtilMethods.getHabilitations(authorizations, "account").canDisable && !UtilMethods.isAuth(id)) && (
                                    !inProgress ? (
                                        <button 
                                            className={`btn ${record.status === Constants.STATUS_ACCESS.ACTIVE ? 'btn-danger' : 'btn-success'}`}
                                            onClick={handleTreatAccountStatus}
                                        >
                                            <i className={`ti ti-${record.status === Constants.STATUS_ACCESS.ACTIVE ? 'user-off' : 'user-check'}`}></i>
                                            {record.status === Constants.STATUS_ACCESS.ACTIVE ? 'Disable Account' : 'Reactivate Account'}
                                        </button>
                                    ) : (
                                        <button className="btn btn-loading" disabled>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            {record.status === Constants.STATUS_ACCESS.ACTIVE ? 'Disabling...' : 'Reactivating...'}
                                        </button>
                                    )
                                )}
                            </div>
                        </Grid>
                    </Grid>
                ) : (
                    <div className="no-data">
                        <i className="ti ti-user-off"></i>
                        <Typography>No user data available.</Typography>
                    </div>
                )}
            </Paper>
        </motion.div>
    );
};

export default ReadUser;