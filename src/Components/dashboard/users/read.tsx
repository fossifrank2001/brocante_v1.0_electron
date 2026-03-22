import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Avatar, Grid, Paper, Skeleton, Tooltip,
    Typography, Box, Button, IconButton,
    Stack, Chip, Fade, CircularProgress
} from '@mui/material';
import {
    ArrowBack, Edit, PersonAdd as UserCheck, PersonOff as UserX,
    Shield, Person, Mail,
    Phone, Transgender, AppRegistration,
    AutoAwesome,
    History,
    Key,
    Security
} from '@mui/icons-material';
import dayjs from 'dayjs';
import Breadcrumd from '@/Components/Breadcrumd';
import UserAPI from '@/Data/Api/Users';
import { IUser } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Toast from '@/Data/Utilities/Toast';
import Constants from '@/Data/Utilities/constants';

const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const InfoBlock = ({ icon: Icon, label, value, color = '#6366f1' }: any) => (
    <Box sx={{
        display: 'flex',
        gap: 2.5,
        p: 3,
        borderRadius: '24px',
        bgcolor: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)',
            borderColor: `${color}40`
        }
    }}>
        <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            bgcolor: `${color}12`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value || 'Non renseigné'}
            </Typography>
        </Box>
    </Box>
);

const ReadUser = () => {
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
            Toast.error("Erreur lors du chargement du profil");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        getRecord();
    }, [getRecord, reload]);

    const handleTreatAccountStatus = async () => {
        try {
            setInProgress(true);
            let actions = record?.status === 'active' ? UserAPI.disable : UserAPI.reactivate;
            const { message } = await actions(id);
            setReload(prev => !prev);
            Toast.success(message);
        } catch (e) {
            console.error(e);
            Toast.error("Échec de l'action sur le compte");
        } finally {
            setInProgress(false);
        }
    };

    const SkeletonLoader = () => (
        <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 4, borderRadius: '32px', textAlign: 'center' }}>
                    <Skeleton variant="circular" width={140} height={140} sx={{ mx: 'auto', mb: 3 }} />
                    <Skeleton variant="text" width="70%" sx={{ mx: 'auto', height: 40 }} />
                    <Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} />
                </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 4, borderRadius: '32px' }}>
                    <Grid container spacing={3}>
                        {[...Array(4)].map((_, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '24px' }} />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );

    return (
        <Box>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Breadcrumd parent="Administration" url={Pages.ACCOUNT} _child={id} />

                <Box sx={{ mb: 6, mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IconButton
                            onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                            sx={{
                                bgcolor: '#fff',
                                width: 50,
                                height: 50,
                                borderRadius: '16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: '#f1f5f9', transform: 'translateX(-4px)' },
                                transition: 'all 0.2s'
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                                Profil Utilisateur
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                                Détails complets et gestion des accès
                            </Typography>
                        </Box>
                    </Box>

                    {record && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => dispatch(setActivePage({
                                    page: Pages.ACCOUNT,
                                    id,
                                    param: { sub_page: 'UPDATE' }
                                }))}
                                sx={{
                                    borderRadius: '16px',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    borderColor: 'rgba(99, 102, 241, 0.2)',
                                    color: '#6366f1',
                                    px: 4,
                                    py: 1,
                                    bgcolor: 'white',
                                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#6366f1' }
                                }}
                            >
                                Modifier
                            </Button>
                        </Box>
                    )}
                </Box>

                {isLoading ? (
                    <SkeletonLoader />
                ) : record ? (
                    <Grid container spacing={5}>
                        {/* Profile Card */}
                        <Grid item xs={12} md={4}>
                            <motion.div variants={cardVariants}>
                                <Paper sx={{
                                    p: 5,
                                    borderRadius: '35px',
                                    textAlign: 'center',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(20px) saturate(180%)',
                                    border: '1px solid rgba(255, 255, 255, 0.45)',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                                    position: 'sticky',
                                    top: 32
                                }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
                                        <Box sx={{
                                            width: 160,
                                            height: 160,
                                            borderRadius: '50%',
                                            padding: '4px',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                            boxShadow: '0 15px 30px -5px rgba(99, 102, 241, 0.4)'
                                        }}>
                                            <Avatar
                                                src={record.thumbnail ? `${Constants.URL}/${record.thumbnail.path}` : undefined}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    fontSize: '3.5rem',
                                                    fontWeight: 900,
                                                    bgcolor: '#f8fafc',
                                                    color: '#6366f1',
                                                    border: '4px solid white'
                                                }}
                                            >
                                                {record.last_name?.[0]}{record.first_name?.[0]}
                                            </Avatar>
                                        </Box>
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: 10,
                                            right: 10,
                                            bgcolor: record.status === 'active' ? '#10b981' : '#ef4444',
                                            color: 'white',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: '10px',
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            border: '3px solid white',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                            textTransform: 'uppercase'
                                        }}>
                                            {record.status}
                                        </Box>
                                    </Box>

                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, letterSpacing: '-0.02em' }}>
                                        {record.last_name}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748b', mb: 4 }}>
                                        {record.first_name}
                                    </Typography>

                                    <Stack spacing={2}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<Edit />}
                                            onClick={() => dispatch(setActivePage({
                                                page: Pages.ACCOUNT,
                                                id,
                                                param: { sub_page: 'UPDATE' }
                                            }))}
                                            sx={{
                                                borderRadius: '18px',
                                                py: 1.8,
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                                boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 25px -5px rgba(99, 102, 241, 0.5)' }
                                            }}
                                        >
                                            Éditer les informations
                                        </Button>

                                        {UtilMethods.getHabilitations(authorizations, "account").canDisable && !UtilMethods.isAuth(id) && (
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                color={record.status === 'active' ? 'error' : 'success'}
                                                startIcon={inProgress ? <CircularProgress size={20} color="inherit" /> : (record.status === 'active' ? <UserX /> : <UserCheck />)}
                                                onClick={handleTreatAccountStatus}
                                                disabled={inProgress}
                                                sx={{
                                                    borderRadius: '18px',
                                                    py: 1.8,
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    borderWidth: '2px',
                                                    '&:hover': { borderWidth: '2px' }
                                                }}
                                            >
                                                {inProgress ? 'Action...' : (record.status === 'active' ? 'Suspendre le compte' : 'Activer le compte')}
                                            </Button>
                                        )}
                                    </Stack>

                                    <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                            <Key sx={{ fontSize: 16 }} />
                                            ID Système : #{record.id}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>

                        {/* Details Area */}
                        <Grid item xs={12} md={8}>
                            <Stack spacing={4}>
                                {/* Info Cards Grid */}
                                <Paper sx={{
                                    p: 5,
                                    borderRadius: '35px',
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 15px 30px -10px rgba(0,0,0,0.05)'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex' }}>
                                            <Person />
                                        </Box>
                                        Détails Personnels
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <InfoBlock icon={Phone} label="Contact Téléphonique" value={record.phone} color="#3b82f6" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoBlock icon={Mail} label="Adresse de Messagerie" value={record.email} color="#ec4899" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoBlock icon={Transgender} label="Sexe / Genre" value={record.gender === 'male' ? 'Masculin' : (record.gender === 'female' ? 'Féminin' : 'Non défini')} color="#f59e0b" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoBlock icon={AppRegistration} label="Statut d'Inscription" value={record.first_connexion ? 'Première connexion requise' : 'Déjà connecté'} color="#10b981" />
                                        </Grid>
                                    </Grid>
                                </Paper>

                                {/* Roles & Security */}
                                <Paper sx={{
                                    p: 5,
                                    borderRadius: '35px',
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 15px 30px -10px rgba(0,0,0,0.05)'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex' }}>
                                            <Security />
                                        </Box>
                                        Privilèges & Sécurité
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {record.accesses && record.accesses.length > 0 ? record.accesses.map((access, index) => (
                                            <Tooltip key={index} title={`Attribué le ${dayjs(access.created_at).format('DD MMM YYYY')}`} arrow TransitionComponent={Fade}>
                                                <Chip
                                                    label={access?.role?.label}
                                                    icon={<Shield sx={{ fontSize: '1rem !important' }} />}
                                                    sx={{
                                                        height: 44,
                                                        fontWeight: 800,
                                                        bgcolor: 'rgba(99, 102, 241, 0.06)',
                                                        color: '#4f46e5',
                                                        borderRadius: '14px',
                                                        border: '1px solid rgba(99, 102, 241, 0.12)',
                                                        px: 1.5,
                                                        '& .MuiChip-label': { px: 2 },
                                                        transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.12)', transform: 'scale(1.02)' }
                                                    }}
                                                />
                                            </Tooltip>
                                        )) : (
                                            <Box sx={{ p: 3, textAlign: 'center', width: '100%', borderRadius: '20px', bgcolor: 'rgba(0,0,0,0.02)', border: '1px dashed #cbd5e1' }}>
                                                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 }}>
                                                    Aucun rôle ou privilège spécifique n'a été attribué à ce compte.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>

                                {/* Timeline */}
                                <Grid container spacing={4}>
                                    <Grid item xs={12} sm={6}>
                                        <Paper sx={{
                                            p: 4,
                                            borderRadius: '35px',
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(241,245,249,0.8) 100%)',
                                            border: '1px solid rgba(255, 255, 255, 0.8)',
                                            height: '100%'
                                        }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <History sx={{ fontSize: 16 }} /> Inscription
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                                {dayjs(record.created_at).format('DD MMMM YYYY')}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                à {dayjs(record.created_at).format('HH:mm')}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Paper sx={{
                                            p: 4,
                                            borderRadius: '35px',
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(241,245,249,0.8) 100%)',
                                            border: '1px solid rgba(255, 255, 255, 0.8)',
                                            height: '100%'
                                        }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <AutoAwesome sx={{ fontSize: 16 }} /> Dernière activité
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                                {dayjs(record.updated_at).format('DD MMMM YYYY')}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                à {dayjs(record.updated_at).format('HH:mm')}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Grid>
                    </Grid>
                ) : (
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '35px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                        <Person sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 700 }}>
                            Oups ! Données introuvables.
                        </Typography>
                        <Button
                            onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                            sx={{ mt: 3, textTransform: 'none', fontWeight: 700 }}
                        >
                            Retourner au listing
                        </Button>
                    </Paper>
                )}
            </motion.div>
        </Box>
    );
};

export default ReadUser;