import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    Grid,
    Tooltip,
    IconButton,
    CircularProgress,
    Stack
} from '@mui/material';
import {
    Refresh,
    Download,
    Visibility,
    Timeline,
    TrendingUp,
    TrendingDown,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton,
    MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import ActivityLogService from '@/Services/ActivityLogService';
import { ActivityLog, ActivityLogFilters, ActivityType, ActivityAction, ActivityStatus } from '@/Data/Interfaces/ActivityLog';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Breadcrumd from '../Breadcrumd';
import constants from '@/Data/Utilities/constants';
import { useAppContext } from '@/contexts/appContext';
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import ActivityLogAPI from '@/Data/Api/ActivityLog';

interface IActivityLogTableData extends ActivityLog {
    actions: React.ReactNode;
}

const glassCardStyle = {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
};

const ActivityLogsViewer: React.FC = () => {
    const { t } = useTranslation();
    const context = useAppContext();
    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<any[]>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [activityLogs, setActivityLogs] = useState<ActivityLog[] | null>(null);
    const [summary, setSummary] = useState<any>(null);
    const [showStateDiagram, setShowStateDiagram] = useState(false);
    const [stateDiagram, setStateDiagram] = useState('');

    const activityLogService = ActivityLogService.getInstance();

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. ' + t('activityLogs.title');
    }, [context, t]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const el = document.querySelector(".__table-container");
        if (el) el.scrollTo(0, 0);
    };

    const loadLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await ActivityLogAPI.list({
                type: columnFilters.find(f => f.id === 'type')?.value,
                action: columnFilters.find(f => f.id === 'action')?.value,
                status: columnFilters.find(f => f.id === 'status')?.value,
                sellCode: columnFilters.find(f => f.id === 'sellCode')?.value,
                search: globalFilter,
            });
            setActivityLogs(response.data.data);
            setRowCount(response.data.total);
            resetScroll();
        } catch (error) {
            console.error('Failed to load logs:', error);
            setIsError(true);
            setActivityLogs([]);
        } finally {
            setIsLoading(false);
            setIsRefetching(false);
        }
    }, [columnFilters, globalFilter]);

    const loadSummary = useCallback(async () => {
        try {
            const sum = await activityLogService.getSummary({});
            setSummary(sum);
        } catch (error) {
            console.error('Failed to load summary:', error);
        }
    }, [activityLogService]);

    useEffect(() => {
        loadLogs();
        loadSummary();
    }, [loadLogs, loadSummary]);

    const handleRefresh = () => {
        setIsRefetching(true);
        loadLogs();
        loadSummary();
    };

    const handleExportLogs = async () => {
        try {
            const logs = await activityLogService.getLogs({});
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
                return '#10b981';
            case ActivityStatus.FAILED:
                return '#ef4444';
            case ActivityStatus.PENDING:
                return '#f59e0b';
            case ActivityStatus.CANCELLED:
                return '#64748b';
            case ActivityStatus.PARTIAL:
                return '#3b82f6';
            default:
                return '#64748b';
        }
    };

    const getTypeColor = (type: ActivityType) => {
        switch (type) {
            case ActivityType.SALE:
                return '#6366f1';
            case ActivityType.PAYMENT:
                return '#10b981';
            case ActivityType.DEBT_RECOVERY:
                return '#f59e0b';
            case ActivityType.REFUND:
                return '#ef4444';
            case ActivityType.INVOICE:
                return '#3b82f6';
            default:
                return '#64748b';
        }
    };

    const getActionIcon = (action: ActivityAction) => {
        switch (action) {
            case ActivityAction.CREATE:
                return <TrendingUp sx={{ color: '#10b981', fontSize: 18 }} />;
            case ActivityAction.PAY:
                return <TrendingUp sx={{ color: '#6366f1', fontSize: 18 }} />;
            case ActivityAction.RECOVER:
                return <TrendingDown sx={{ color: '#f59e0b', fontSize: 18 }} />;
            case ActivityAction.CANCEL:
                return <ErrorIcon sx={{ color: '#ef4444', fontSize: 18 }} />;
            case ActivityAction.REFUND:
                return <TrendingDown sx={{ color: '#ef4444', fontSize: 18 }} />;
            default:
                return <Timeline sx={{ color: '#64748b', fontSize: 18 }} />;
        }
    };

    const tableData: IActivityLogTableData[] = useMemo(() => {
        return activityLogs ? activityLogs.map((log) => ({
            ...log,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Tooltip title={t('activityLogs.viewStateDiagram')} arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleViewStateDiagram(log)}
                            disabled={!log.sellCode && !log.customerId}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)', '&:hover': { bgcolor: 'rgba(99,102,241,0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Visibility sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        })) : [];
    }, [activityLogs, t]);

    const columns: MRT_ColumnDef<IActivityLogTableData>[] = useMemo(() => [
        {
            accessorKey: "created_at",
            header: t('activityLogs.date'),
            size: 180,
            Cell: ({ cell }) => (
                <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                    {cell.getValue() ? new Date(cell.getValue() as string).toLocaleString(localStorage.getItem('i18nextLng') || 'fr') : '-'}
                </Typography>
            ),
        },
        {
            accessorKey: "type",
            header: t('activityLogs.type'),
            size: 120,
            filterVariant: "select",
            filterSelectOptions: Object.values(ActivityType).map(type => ({ label: t(`activityLogs.types.${type}`), value: type })),
            Cell: ({ cell, row }) => {
                const type = cell.getValue() as ActivityType;
                const color = getTypeColor(type);
                return (
                    <Chip
                        label={t(`activityLogs.types.${type}`)}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontWeight: 700,
                            bgcolor: `${color}15`,
                            color,
                            borderColor: `${color}40`,
                            borderRadius: '6px',
                        }}
                    />
                );
            },
        },
        {
            accessorKey: "action",
            header: t('activityLogs.action'),
            size: 120,
            filterVariant: "select",
            filterSelectOptions: Object.values(ActivityAction).map(action => ({ label: t(`activityLogs.actions.${action}`), value: action })),
            Cell: ({ cell, row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569', fontWeight: 600 }}>
                    {getActionIcon(cell.getValue() as ActivityAction)}
                    {t(`activityLogs.actions.${cell.getValue()}`)}
                </Box>
            ),
        },
        {
            accessorKey: "description",
            header: t('activityLogs.description'),
            size: 300,
            Cell: ({ cell }) => (
                <Typography sx={{ color: '#475569', fontSize: '0.85rem' }}>
                    {cell.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: "amount",
            header: t('activityLogs.amount'),
            size: 120,
            Cell: ({ cell }) => (
                <Typography sx={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.85rem' }}>
                    {cell.getValue() ? UtilMethods.formatAmount(cell.getValue() as number) : '-'}
                </Typography>
            ),
        },
        {
            accessorKey: "status",
            header: t('activityLogs.status'),
            size: 120,
            filterVariant: "select",
            filterSelectOptions: Object.values(ActivityStatus).map(status => ({ label: t(`activityLogs.statuses.${status}`), value: status })),
            Cell: ({ cell }) => {
                const status = cell.getValue() as ActivityStatus;
                const color = getStatusColor(status);
                return (
                    <Chip
                        label={t(`activityLogs.statuses.${status}`)}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: `${color}15`,
                            color,
                            borderRadius: '6px',
                        }}
                    />
                );
            },
        },
        {
            accessorKey: "actions",
            header: t('common.actions'),
            size: 80,
            enableColumnFilter: false,
            enableSorting: false,
        },
    ], [t]);

    const mrTable = useMaterialReactTable({
        columns,
        data: tableData,
        enableRowSelection: true,
        enableStickyHeader: true,
        initialState: {
            showColumnFilters: true,
            density: "compact",
        },
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        muiTablePaperProps: {
            sx: {
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.4)',
            }
        },
        muiTableContainerProps: { className: "__table-container" },
        localization: MRT_Localization_EN,
        muiToolbarAlertBannerProps: isError ? { color: "error", children: "Erreur lors du chargement des données" } : undefined,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        rowCount,
        state: {
            columnFilters,
            globalFilter,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isRefetching,
            sorting,
            rowSelection,
        },
        muiTableHeadCellProps: {
            sx: {
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
                backgroundColor: 'rgba(248,250,252,0.9)',
                borderBottom: '1px solid rgba(226,232,240,0.8)',
            }
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: "0.75rem", p: "4px", alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                    {t('activityLogs.title')}
                </Typography>
                <Tooltip title={t('common.refresh')} arrow>
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                            onClick={handleRefresh}
                            variant="outlined"
                            disabled={isLoading || isRefetching}
                            startIcon={<Refresh />}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                borderColor: 'rgba(99,102,241,0.3)',
                                color: '#6366f1',
                                '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99,102,241,0.05)' }
                            }}
                        >
                            {t('common.refresh')}
                        </Button>
                    </motion.div>
                </Tooltip>
                <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                        onClick={handleExportLogs}
                        variant="outlined"
                        startIcon={<Download />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            borderColor: 'rgba(16,185,129,0.3)',
                            color: '#059669',
                            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16,185,129,0.05)' }
                        }}
                    >
                        {t('activityLogs.export')}
                    </Button>
                </motion.div>
            </Box>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <Box>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ToggleDensePaddingButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    });

    return (<Box>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Breadcrumd parent={`📊 ${t('activityLogs.title')}`} />
        </motion.div>
        <Box sx={{ mt: 4 }}>
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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <MaterialReactTable table={mrTable} />
            </motion.div>

            {/* Modal du diagramme d'états */}
            {showStateDiagram && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
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
                </motion.div>
            )}
            </Box>
    </Box>);
};

export default ActivityLogsViewer;
