import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Chip, Tooltip, CircularProgress
} from '@mui/material';
import { PointOfSale, Lock, AccessTime, ShoppingCart, Storefront } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { fetchCurrentSession } from '@/Data/Slices/dashboard/cashSessionSlice';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import SessionOpenModal from './SessionOpenModal';
import SessionCloseModal from './SessionCloseModal';
import { useTranslation } from 'react-i18next';

const CashSessionBar = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { currentSession, isLoading, error } = useAppSelector((state) => state.cashSession);
    const [openModal, setOpenModal] = useState(false);
    const [closeModal, setCloseModal] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    useEffect(() => {
        dispatch(fetchCurrentSession());
    }, [dispatch]);

    useEffect(() => {
        if (!isLoading || currentSession) {
            setLoadingTimeout(false);
            return;
        }

        const timer = setTimeout(() => {
            setLoadingTimeout(true);
        }, 20000);

        return () => clearTimeout(timer);
    }, [isLoading, currentSession]);

    if (error && !currentSession) {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: '12px',
                bgcolor: 'rgba(254, 242, 242, 0.9)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
            }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#b91c1c' }}>
                    {t('cashSession.sessionError')}
                </Typography>
                <Tooltip title={String(error)} arrow>
                    <Chip
                        size="small"
                        label={t('common.details')}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                            color: '#b91c1c',
                            fontWeight: 800,
                            height: 22,
                        }}
                    />
                </Tooltip>
                <Button
                    onClick={() => dispatch(fetchCurrentSession())}
                    size="small"
                    variant="outlined"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        py: 0.25,
                        borderColor: 'rgba(239, 68, 68, 0.6)',
                        color: '#b91c1c',
                        '&:hover': {
                            borderColor: '#ef4444',
                            bgcolor: 'rgba(239, 68, 68, 0.05)',
                        }
                    }}
                >
                    {t('common.retry')}
                </Button>
            </Box>
        );
    }

    if (loadingTimeout && isLoading && !currentSession) {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 251, 235, 0.9)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
            }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400e' }}>
                    {t('cashSession.waitingForAPI')}
                </Typography>
                <Button
                    onClick={() => dispatch(fetchCurrentSession())}
                    size="small"
                    variant="outlined"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        py: 0.25,
                        borderColor: 'rgba(245, 158, 11, 0.55)',
                        color: '#92400e',
                        '&:hover': {
                            borderColor: '#f59e0b',
                            bgcolor: 'rgba(245, 158, 11, 0.06)',
                        }
                    }}
                >
                    {t('common.retry')}
                </Button>
            </Box>
        );
    }

    if (isLoading && !currentSession) {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: '12px',
                bgcolor: 'rgba(241, 245, 249, 0.8)',
            }}>
                <CircularProgress size={16} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                    {t('cashSession.loadingSession')}
                </Typography>
            </Box>
        );
    }

    if (!currentSession) {
        return (
            <>
                <Tooltip title={t('cashSession.openSessionTooltip')} arrow>
                    <Button
                        onClick={() => setOpenModal(true)}
                        variant="contained"
                        size="small"
                        startIcon={<PointOfSale />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            },
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' },
                                '50%': { boxShadow: '0 4px 20px rgba(16, 185, 129, 0.6)' },
                                '100%': { boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' },
                            }
                        }}
                    >
                        {t('cashSession.openCashRegister')}
                    </Button>
                </Tooltip>
                <SessionOpenModal open={openModal} onClose={() => setOpenModal(false)} />
            </>
        );
    }

    const elapsed = currentSession.opened_at
        ? Math.floor((Date.now() - new Date(currentSession.opened_at).getTime()) / 60000)
        : 0;
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;

    return (
        <>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 0.75,
                borderRadius: '14px',
                bgcolor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
                <Chip
                    icon={<PointOfSale sx={{ fontSize: '14px !important' }} />}
                    label={t('cashSession.cashRegisterOpen')}
                    size="small"
                    sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669',
                        borderRadius: '8px',
                        '& .MuiChip-icon': { color: '#059669' }
                    }}
                />

                <Tooltip title={t('cashSession.sessionDuration')} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 14, color: '#64748b' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                            {hours > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${minutes}min`}
                        </Typography>
                    </Box>
                </Tooltip>

                <Tooltip title={t('cashSession.salesCount')} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ShoppingCart sx={{ fontSize: 14, color: '#64748b' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                            {currentSession.sales_count}
                        </Typography>
                    </Box>
                </Tooltip>

                <Tooltip title={t('cashSession.totalSales')} arrow>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        {UtilMethods.formatNumber(currentSession.total_sales)}
                    </Typography>
                </Tooltip>

                <Tooltip title={t('cashSession.expressMode')} arrow>
                    <Button
                        onClick={() => dispatch(setActivePage({ page: Pages.POS_EXPRESS }))}
                        size="small"
                        variant="contained"
                        startIcon={<Storefront sx={{ fontSize: 14 }} />}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            py: 0.25,
                            bgcolor: '#6366f1',
                            '&:hover': { bgcolor: '#4f46e5' },
                            boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                        }}
                    >
                        POS
                    </Button>
                </Tooltip>

                <Tooltip title={t('cashSession.closeCashRegister')} arrow>
                    <Button
                        onClick={() => setCloseModal(true)}
                        size="small"
                        variant="outlined"
                        startIcon={<Lock sx={{ fontSize: 14 }} />}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            py: 0.25,
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            '&:hover': {
                                borderColor: '#dc2626',
                                bgcolor: 'rgba(239, 68, 68, 0.05)',
                            }
                        }}
                    >
                        {t('common.close')}
                    </Button>
                </Tooltip>
            </Box>

            <SessionCloseModal open={closeModal} onClose={() => setCloseModal(false)} />
        </>
    );
};

export default CashSessionBar;
