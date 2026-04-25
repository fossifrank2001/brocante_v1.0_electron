import '@/assets/css/owner/access_selection.css';
import { useAppContext } from "../contexts/appContext";
import PageLoadingIndicator from "./PageLoadingIndicator";
import { IAccess } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from "Data/Slices/NavigationSlice.ts";
import { Pages } from "Data/Objects/state.ts";
import { useState } from 'react';
import Logo from '@/Components/common/Logo';
import { Box, Typography, Card, CardContent, CircularProgress, alpha, Grid  } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const roleIcons = {
    'ADMIN': 'ti ti-shield-check',
    'SELLER': 'ti ti-shopping-cart',
    'BUYER': 'ti ti-user',
    'SUPER_ADMIN': 'ti ti-crown',
};

const roleDescriptions = {
    'ADMIN': 'Gérer l\'ensemble du système et les utilisateurs',
    'SELLER': 'Créer et gérer votre boutique',
    'BUYER': 'Parcourir et acheter des articles',
    'SUPER_ADMIN': 'Contrôle complet du système et surveillance',
};

// Couleurs spécifiques par rôle pour le rendu glassmorphism
const roleColors = {
    'ADMIN': '#6366f1', // Indigo
    'SELLER': '#10b981', // Emerald
    'BUYER': '#f59e0b', // Amber
    'SUPER_ADMIN': '#ef4444', // Red
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

export default function AccessSelectionComponent() {
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const { authUser: currentUser } = useAppSelector((state) => state.user);
    const [selectedAccess, setSelectedAccess] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChangeAccess = async (access_id: number | string) => {
        try {
            setSelectedAccess(Number(access_id));
            setIsLoading(true);
            context.togglePageLoading(true);

            const { loadAuthorizationAsync } = await import('Data/Slices/auth/authorizationSlice');
            await dispatch(loadAuthorizationAsync({ access_id }));

            // Vérifier si un état de navigation précédent a été sauvegardé
            const savedStateStr = localStorage.getItem('savedStateBeforeLogin');
            if (savedStateStr) {
                try {
                    const savedState = JSON.parse(savedStateStr);
                    // On supprime l'état sauvegardé pour ne pas boucler dessus
                    localStorage.removeItem('savedStateBeforeLogin');
                    localStorage.removeItem('lastVisitedPage');

                    dispatch(setActivePage({
                        page: savedState.page,
                        id: savedState.id,
                        param: savedState.param,
                        search: savedState.search
                    }));
                    return;
                } catch (error) {
                    console.error('Error parsing saved navigation state:', error);
                }
            }

            // Par défaut, rediriger vers le dashboard
            dispatch(setActivePage({ page: Pages.DASHBOARD }));
        } catch (e) {
            console.error(e);
            setSelectedAccess(null);
        } finally {
            setIsLoading(false);
            context.togglePageLoading(false);
        }
    };



    return (
        <>
            <PageLoadingIndicator visible={context.pageLoading} />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    background: 'var(--bg-primary)',
                    backgroundSize: 'cover',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative background elements */}
                <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />

                <Box sx={{ maxWidth: 800, width: '100%', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Box>
                                <Logo
                                    showVersion={true}
                                    animate={true}
                                    imageSize={250}
                                    fontSize="2.5rem"
                                />
                            </Box>
                        </Box>

                        <Typography variant="h3" sx={{ fontWeight: 900, color: 'var(--text-primary)', mb: 2, letterSpacing: '-0.03em' }}>
                            Bienvenue, <Box component="span" sx={{ color: '#6366f1' }}>{currentUser?.first_name}</Box> !
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'var(--text-secondary)', mb: 6, fontWeight: 600, fontSize: '1.1rem', maxWidth: 500, mx: 'auto' }}>
                            Veuillez sélectionner le rôle avec lequel vous souhaitez accéder au système.
                        </Typography>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Grid container spacing={3} justifyContent="center" pl={0} xs={12} component="div" sx={{ margin: 0, width: '100%' }}>
                            {currentUser?.accesses?.map((access: IAccess) => {
                                const isSelected = selectedAccess === access.id;
                                const roleCode = access.role.code as keyof typeof roleColors;
                                const color = roleColors[roleCode] || '#6366f1';

                                return (
                                    <Grid item xs={12} sm={6} md={5} key={access.id}>
                                        <motion.div variants={itemVariants} whileHover={!isLoading && !isSelected ? { scale: 1.03 } : {}} whileTap={!isLoading && !isSelected ? { scale: 0.98 } : {}}>
                                            <Card
                                                onClick={() => !isLoading && handleChangeAccess(access.id)}
                                                sx={{
                                                    cursor: isLoading ? 'default' : 'pointer',
                                                    borderRadius: '24px',
                                                    border: `1px solid ${isSelected ? color : 'var(--border-color)'}`,
                                                    background: isSelected
                                                        ? alpha(color, 0.08)
                                                        : 'var(--bg-surface)',
                                                    backdropFilter: 'blur(16px)',
                                                    boxShadow: isSelected
                                                        ? `0 20px 40px ${alpha(color, 0.2)}`
                                                        : 'var(--shadow-md)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '&:hover': {
                                                        border: `1px solid ${isSelected ? color : alpha(color, 0.5)}`,
                                                        background: isSelected
                                                            ? alpha(color, 0.08)
                                                            : 'var(--bg-elevated)',
                                                        boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
                                                    }
                                                }}
                                            >
                                                {isSelected && (
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: '4px',
                                                        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`
                                                    }} />
                                                )}
                                                <CardContent sx={{ p: 4, paddingBottom: "32px !important" }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: isSelected ? 2 : 0 }}>
                                                        <Box sx={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: '16px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: isSelected
                                                                ? `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`
                                                                : alpha(color, 0.1),
                                                            boxShadow: isSelected ? `0 10px 20px ${alpha(color, 0.4)}` : 'none',
                                                            transition: 'all 0.3s ease'
                                                        }}>
                                                            <i className={`${roleIcons[roleCode] || 'ti ti-user'} fs-2 ${isSelected ? 'text-white' : ''}`} style={{ color: !isSelected ? color : undefined }}></i>
                                                        </Box>
                                                        <Box sx={{ ml: 3, flex: 1, textAlign: 'left' }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: isSelected ? color : '#1e293b', mb: 0.5 }}>
                                                                {access.role.label}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, lineHeight: 1.4 }}>
                                                                {roleDescriptions[roleCode] || 'Accès au système'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <AnimatePresence>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                style={{ overflow: 'hidden' }}
                                                            >
                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, gap: 2, background: alpha(color, 0.05), borderRadius: '12px' }}>
                                                                    <CircularProgress size={20} sx={{ color }} />
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, color }}>
                                                                        Connexion en cours...
                                                                    </Typography>
                                                                </Box>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </motion.div>
                </Box>
            </Box>
        </>
    );
}
