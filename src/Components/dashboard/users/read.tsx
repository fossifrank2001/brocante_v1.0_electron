import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Avatar, Grid, Typography, Box, Button,
    Chip, Fade, CircularProgress,
    Card, CardContent, Divider, Tooltip, Stack, Paper
} from '@mui/material';
import {
    ArrowBack, Edit, PersonAdd as UserCheck, PersonOff as UserX,
    Shield, Person, Mail,
    Security, Warning,
    CalendarMonth,
    AccessTime,
    Badge,
    Phone,
    Transgender,
    AppRegistration
} from '@mui/icons-material';
import dayjs from 'dayjs';
import Breadcrumd from '@/Components/Breadcrumd';
import UserAPI from '@/Data/Api/Users';
import { IUser } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useTranslation } from 'react-i18next';
import Constants from '@/Data/Utilities/constants';
import Toast from '@/Data/Utilities/Toast';

const InfoBlock = ({ icon: Icon, label, value, color = '#6366f1', t }: any) => (
    <Box sx={{
        display: 'flex',
        gap: 2,
        p: 2.5,
        borderRadius: '16px',
        bgcolor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        transition: 'all 0.2s',
        '&:hover': {
            bgcolor: 'var(--bg-surface)',
            transform: 'translateY(-2px)',
            boxShadow: 'var(--shadow-sm)'
        }
    }}>
        <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value || t('common.notSpecified')}
            </Typography>
        </Box>
    </Box>
);

const ReadUser = () => {
    const { t } = useTranslation();
    const { id } = useAppSelector((state) => state.navigaton);
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
        } catch (e: any) {
            console.error(e.message);
            Toast.error(t('user.profileLoadError'));
        } finally {
            setIsLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        getRecord();
    }, [getRecord, reload]);

    const handleTreatAccountStatus = async () => {
        try {
            setInProgress(true);
            const actions = record?.status === 'active' ? UserAPI.disable : UserAPI.reactivate;
            const { message } = await actions(id);
            setReload(prev => !prev);
            Toast.success(message);
        } catch (e) {
            console.error(e);
            Toast.error(t('user.accountActionFailed'));
        } finally {
            setInProgress(false);
        }
    };

    if (isLoading) {
        return (
            <Box>
                <Breadcrumd parent={t('navigation.administration')} url={Pages.ACCOUNT} _child={id} />
                <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            boxShadow: 'var(--shadow-lg)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress size={60} thickness={4} sx={{ color: '#4f46e5', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                                    {t('user.loadingProfile')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (!record) {
        return (
            <Box>
                <Breadcrumd parent={t('navigation.administration')} url={Pages.ACCOUNT} _child={id} />
                <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            boxShadow: 'var(--shadow-lg)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 8, textAlign: 'center' }}>
                                <Warning sx={{ fontSize: 60, color: '#f59e0b', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 1 }}>
                                    {t('user.userNotFound')}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                                    {t('user.userNotFoundDesc')}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBack />}
                                    onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                                    sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700 }}
                                >
                                    {t('user.returnToList')}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent={t('navigation.administration')} url={Pages.ACCOUNT} _child={id} />

                {/* Header Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: 'var(--border-color)', color: '#64748b' }}
                        >
                            {t('common.back')}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {UtilMethods.getHabilitations(authorizations, "account").canDisable && !UtilMethods.isAuth(id) && (
                            <Button
                                variant="outlined"
                                color={record.status === 'active' ? 'error' : 'success'}
                                startIcon={inProgress ? <CircularProgress size={20} color="inherit" /> : (record.status === 'active' ? <UserX /> : <UserCheck />)}
                                onClick={handleTreatAccountStatus}
                                disabled={inProgress}
                                sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 800 }}
                            >
                                {inProgress ? t('common.actionInProgress') : (record.status === 'active' ? t('user.suspendAccount') : t('user.activateAccount'))}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => dispatch(setActivePage({
                                page: Pages.ACCOUNT,
                                id,
                                param: { sub_page: 'UPDATE' }
                            }))}
                            sx={{
                                borderRadius: '15px',
                                textTransform: 'none',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            {t('common.edit')}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* Left Column: Info Cards */}
                    <Grid item xs={12} md={7}>
                        <Grid container spacing={3}>
                            {/* Personal Details Card */}
                            <Grid item xs={12}>
                                <Card sx={{
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-surface)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                                <Badge />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: 'var(--text-primary)' }}>
                                                {t('user.personalDetails')}
                                            </Typography>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <InfoBlock icon={Phone} label={t('user.phoneContact')} value={record.phone} color="#3b82f6" t={t} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoBlock icon={Mail} label={t('user.emailAddress')} value={record.email} color="#ec4899" t={t} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoBlock icon={Transgender} label={t('user.genderSex')} value={record.gender === 'male' ? t('user.male') : (record.gender === 'female' ? t('user.female') : t('common.undefined'))} color="#f59e0b" t={t} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoBlock icon={AppRegistration} label={t('user.registrationStatus')} value={record.first_connexion ? t('user.firstConnectionRequired') : t('user.alreadyConnected')} color="#10b981" t={t} />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Roles & Access Card */}
                            <Grid item xs={12}>
                                <Card sx={{
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-surface)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                                                <Security />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: 'var(--text-primary)' }}>{t('user.rolesAndAccess')}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {record.accesses && record.accesses.length > 0 ? record.accesses.map((access, index) => (
                                                <Tooltip key={index} title={`${t('common.assigned')} ${dayjs(access.created_at).format('DD MMM YYYY')}`} arrow TransitionComponent={Fade}>
                                                    <Chip
                                                        label={access?.role?.label}
                                                        icon={<Shield sx={{ fontSize: '1rem !important' }} />}
                                                        sx={{
                                                            height: 36,
                                                            fontWeight: 700,
                                                            bgcolor: 'rgba(99, 102, 241, 0.06)',
                                                            color: '#4f46e5',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(99, 102, 241, 0.12)',
                                                            '& .MuiChip-label': { px: 1.5 }
                                                        }}
                                                    />
                                                </Tooltip>
                                            )) : (
                                                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{t('user.noRolesAssigned')}</Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Right Column: Profile Overview */}
                    <Grid item xs={12} md={5}>
                        <Stack spacing={4}>
                            <Card sx={{
                                borderRadius: '24px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-surface)',
                                boxShadow: 'var(--shadow-sm)',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                        <Person />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{t('user.profile')}</Typography>
                                </Box>
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                        <Avatar
                                            src={record.thumbnail ? `${Constants.URL}/${record.thumbnail.path}` : undefined}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                fontSize: '3rem',
                                                fontWeight: 900,
                                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                                color: '#6366f1',
                                                border: '4px solid var(--bg-surface)',
                                                boxShadow: 'var(--shadow-md)'
                                            }}
                                        >
                                            {record.last_name?.[0]}{record.first_name?.[0]}
                                        </Avatar>
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: 5,
                                            right: 5,
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            bgcolor: record.status === 'active' ? '#10b981' : '#ef4444',
                                            border: '3px solid var(--bg-surface)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }} />
                                    </Box>

                                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', mb: 0.5 }}>
                                        {record.last_name} {record.first_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                                        {record.email}
                                    </Typography>

                                    <Divider sx={{ my: 3 }} />

                                    {/* Timeline Info */}
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                                <CalendarMonth sx={{ fontSize: 18 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                                                    {t('user.registration')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {dayjs(record.created_at).format('DD MMM YYYY')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                                <AccessTime sx={{ fontSize: 18 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                                                    {t('user.lastActivity')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {dayjs(record.updated_at).format('DD MMM YYYY HH:mm')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default ReadUser;
