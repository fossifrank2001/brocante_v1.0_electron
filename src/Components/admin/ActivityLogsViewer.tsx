import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Grid,
    Alert,
    Tooltip,
    IconButton,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import {
    Refresh,
    Download,
    Visibility,
    Timeline,
    TrendingUp,
    TrendingDown,
    Error as ErrorIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ActivityLogService from '@/Services/ActivityLogService';
import { ActivityLog, ActivityLogFilters, ActivityType, ActivityAction, ActivityStatus } from '@/Data/Interfaces/ActivityLog';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Breadcrumd from '../Breadcrumd';

const glassCardStyle = {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
};

const glassTableContainerStyle = {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.45)',
    bgcolor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
    overflow: 'hidden'
};

const ActivityLogsViewer: React.FC = () => {
    const { t } = useTranslation();
    const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
    const [filters, setFilters] = useState<ActivityLogFilters>({});
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<any>(null);
    const [showStateDiagram, setShowStateDiagram] = useState(false);
    const [stateDiagram, setStateDiagram] = useState('');

    const activityLogService = ActivityLogService.getInstance();

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const [logs, sum] = await Promise.all([
                activityLogService.getLogs(filters),
                activityLogService.getSummary(filters)
            ]);
            setFilteredLogs(logs);
            setSummary(sum);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const handleFilterChange = (key: keyof ActivityLogFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const handleExportLogs = async () => {
        try {
            const logs = await activityLogService.getLogs(filters);
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export logs:', error);
        }
    };

    const handleViewStateDiagram = async (log: ActivityLog) => {
        const entityType = log.sellCode ? 'sale' : 'customer';
        const entityId = log.sellCode || log.customerId?.toString();
        if (!entityId) return;
        const diagram = await activityLogService.generateStateDiagram(entityType, entityId);
        setStateDiagram(diagram);
        setShowStateDiagram(true);
    };

    const getStatusColor = (status: ActivityStatus) => {
        switch (status) {
            case ActivityStatus.COMPLETED:
                return 'success';
            case ActivityStatus.FAILED:
                return 'error';
            case ActivityStatus.PENDING:
                return 'warning';
            case ActivityStatus.CANCELLED:
                return 'default';
            case ActivityStatus.PARTIAL:
                return 'info';
            default:
                return 'default';
        }
    };

    const getTypeColor = (type: ActivityType) => {
        switch (type) {
            case ActivityType.SALE:
                return 'primary';
            case ActivityType.PAYMENT:
                return 'success';
            case ActivityType.DEBT_RECOVERY:
                return 'warning';
            case ActivityType.REFUND:
                return 'error';
            case ActivityType.INVOICE:
                return 'info';
            default:
                return 'default';
        }
    };

    const getActionIcon = (action: ActivityAction) => {
        switch (action) {
            case ActivityAction.CREATE:
                return <TrendingUp color="success" />;
            case ActivityAction.PAY:
                return <TrendingUp color="primary" />;
            case ActivityAction.RECOVER:
                return <TrendingDown color="warning" />;
            case ActivityAction.CANCEL:
                return <ErrorIcon color="error" />;
            case ActivityAction.REFUND:
                return <TrendingDown color="error" />;
            default:
                return <Timeline />;
        }
    };

    return (<Box>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Breadcrumd parent={`📊 ${t('activityLogs.title')}`} />
            <Box>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ ...glassCardStyle }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#6366f1' }}>
                                    {summary?.total_logs ?? '-'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>{t('activityLogs.totalActivities')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ ...glassCardStyle }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981' }}>
                                    {summary ? UtilMethods.formatAmount(summary.total_amount) : '-'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>{t('activityLogs.totalAmount')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ ...glassCardStyle }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981' }}>
                                    {summary?.successful_transactions ?? '-'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>{t('activityLogs.successfulTransactions')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ ...glassCardStyle }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#ef4444' }}>
                                    {summary?.failed_transactions ?? '-'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>{t('activityLogs.failedTransactions')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filtres */}
                <Card sx={{ ...glassCardStyle, mb: 4 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#1e293b' }}>
                            🔍 {t('activityLogs.filters')}
                        </Typography>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label={t('activityLogs.search')}
                                    value={filters.search || ''}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    size="small"
                                    InputProps={{
                                        sx: { borderRadius: '14px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#94a3b8' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontWeight: 600, color: '#64748b' }}>{t('activityLogs.type')}</InputLabel>
                                    <Select
                                        value={filters.type || ''}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        label={t('activityLogs.type')}
                                        sx={{ borderRadius: '14px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } }}
                                    >
                                        <MenuItem value="">{t('activityLogs.all')}</MenuItem>
                                        {Object.values(ActivityType).map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontWeight: 600, color: '#64748b' }}>{t('activityLogs.status')}</InputLabel>
                                    <Select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        label={t('activityLogs.status')}
                                        sx={{ borderRadius: '14px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } }}
                                    >
                                        <MenuItem value="">{t('activityLogs.all')}</MenuItem>
                                        {Object.values(ActivityStatus).map(status => (
                                            <MenuItem key={status} value={status}>{status}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    label={t('activityLogs.sellCode')}
                                    value={filters.sellCode || ''}
                                    onChange={(e) => handleFilterChange('sellCode', e.target.value)}
                                    size="small"
                                    InputProps={{
                                        sx: { borderRadius: '14px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleClearFilters}
                                        startIcon={<Refresh />}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            borderColor: '#e2e8f0',
                                            color: '#64748b',
                                            flex: 1
                                        }}
                                    >
                                        {t('activityLogs.clear')}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleExportLogs}
                                        startIcon={<Download />}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                                            flex: 1,
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                            }
                                        }}
                                    >
                                        {t('activityLogs.export')}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Tableau des logs */}
                <TableContainer component={Paper} sx={{ ...glassTableContainerStyle }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', py: 2 }}>{t('activityLogs.date')}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', py: 2 }}>{t('activityLogs.type')}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', py: 2 }}>{t('activityLogs.action')}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', py: 2 }}>{t('activityLogs.description')}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', py: 2 }}>{t('activityLogs.amount')}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', py: 2 }}>{t('activityLogs.status')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', py: 2 }}>{t('common.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        {!loading && <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                                            {t('activityLogs.noActivitiesFound')}
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            ) : <>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log.id} sx={{ '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)' }, transition: 'background-color 0.2s' }}>
                                        <TableCell sx={{ color: '#475569', fontWeight: 600 }}>
                                            {new Date(log.timestamp).toLocaleString(localStorage.getItem('i18nextLng') || 'fr')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={t(`activityLogs.types.${log.type}`)}
                                                color={getTypeColor(log.type)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 700, borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569', fontWeight: 600 }}>
                                                {getActionIcon(log.action)}
                                                {t(`activityLogs.actions.${log.action}`)}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: '#475569', fontSize: '0.85rem' }}>{log.description}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#4f46e5' }}>
                                            {log.amount ? UtilMethods.formatAmount(log.amount) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={t(`activityLogs.statuses.${log.status}`)}
                                                color={getStatusColor(log.status)}
                                                size="small"
                                                sx={{ fontWeight: 700, borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={t('activityLogs.viewStateDiagram')}>
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewStateDiagram(log)}
                                                        disabled={!log.sellCode && !log.customerId}
                                                        sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>}
                        </TableBody>}
                    </Table>

                    {loading && <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={40} />
                    </Box>}
                </TableContainer>

                {/* Modal du diagramme d'états */}
                {showStateDiagram && (
                    <Card sx={{ ...glassCardStyle, mt: 4 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                    🔄 {t('activityLogs.stateDiagramTitle')}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowStateDiagram(false)}
                                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                >
                                    {t('activityLogs.close')}
                                </Button>
                            </Box>
                            <Box sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                color: '#334155',
                                whiteSpace: 'pre-wrap',
                                overflow: 'auto'
                            }}>
                                {stateDiagram}
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </motion.div>
    </Box>);
};

export default ActivityLogsViewer;
