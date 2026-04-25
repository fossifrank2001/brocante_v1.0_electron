import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {useAppContext} from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable, MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from 'material-react-table';
import {MRT_Localization_EN} from "material-react-table/locales/en";
import axiosInstance from 'Data/Utilities/axiosInstance';
import {Box, Link, Stack, Chip, Typography, Tooltip, IconButton} from "@mui/material";
import {
    NotificationsActive,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    CheckCircle as SuccessIcon,
    Drafts,
    MarkEmailRead
} from '@mui/icons-material';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import dayjs from "dayjs";
import { INotification, INotificationTableData } from 'Data/Interfaces/Notifications.ts';
import NotificationsAPI from "Data/Api/Notifications.ts";
import Toast from "Data/Utilities/Toast.ts";
import { useTranslation } from 'react-i18next';

export default function NotificationIndex() {
    const context = useAppContext();
    const { t } = useTranslation();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [, setReady] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [notifications, setNotifications] = useState<INotification[] | null>(null);


    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. ' + t('notifications.notifications');
    }, [context, t]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    // request all notifications
    const getNotifications = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/notifications`);
            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            try {
                const { status, data: result } = await axiosInstance.get<any>(url.href);
                if (status === 200) {
                    // Check if response is paginated or direct list
                    const notList = result.data;
                    if (Array.isArray(notList)) {
                        setNotifications(notList);
                        setRowCount(notList.length);
                    } else if (notList && Array.isArray(notList.data)) {
                        setNotifications(notList.data);
                        setRowCount(notList.total || notList.data.length);
                    }
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setNotifications([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, isDeleted],
    );



    useEffect(() => {
        getNotifications();
    }, [getNotifications, isDeleted]);

    const tableData: any[] = useMemo(() => {
        return notifications ? notifications.map((notification) => ({
            ...notification,
            title: notification?.data?.title,
            message: notification?.data?.message,
            type: `${notification?.data?.nature}`,
            item_type: notification?.data?.item,
            status: notification?.read_at ? NotificationsAPI.READ : NotificationsAPI.UNREAD,
            actions: (
                <Stack direction="row" spacing={1}>
                    {!notification?.read_at && (
                        <Tooltip title={t('notifications.markAsRead')}>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                <Drafts fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        })) : [];
    }, [notifications]);

    const columns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                accessorKey: "title",
                header: t('notifications.title'),
                size: 200,
                enableColumnFilter: false,
                Cell: ({ row }) => {
                    const nature = row.original.type;
                    const isUnread = row.original.status === NotificationsAPI.UNREAD;
                    const itemType = row.original.item_type;

                    let icon = <NotificationsActive fontSize="small" />;
                    let color = "#6366f1";

                    if (nature === 'warning' || itemType === 'invoice') {
                        icon = <WarningIcon fontSize="small" />;
                        color = "#f59e0b";
                    } else if (nature === 'error') {
                        icon = <ErrorIcon fontSize="small" />;
                        color = "#ef4444";
                    } else if (nature === 'success') {
                        icon = <SuccessIcon fontSize="small" />;
                        color = "#10b981";
                    }

                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                bgcolor: `${color}15`,
                                color: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                animation: isUnread && (nature === 'error' || nature === 'warning') ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': {
                                    '0%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${color}40` },
                                    '70%': { transform: 'scale(1.05)', boxShadow: `0 0 0 10px ${color}00` },
                                    '100%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${color}00` },
                                }
                            }}>
                                {icon}
                            </Box>
                            <Typography variant="body2" sx={{
                                fontWeight: isUnread ? 800 : 500,
                                color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}>
                                {row.original.title}
                            </Typography>
                        </Box>
                    );
                }
            },
            {
                accessorKey: "type",
                header: t('notifications.nature'),
                size: 100,
                filterVariant: "select",
                filterSelectOptions: [
                    { label: t('notifications.info'), value: 'info' },
                    { label: t('notifications.warning'), value: 'warning' },
                    { label: t('notifications.error'), value: 'error' },
                    { label: t('notifications.success'), value: 'success' },
                ],
                Cell: ({ cell }) => {
                    const value = cell.getValue<string>();
                    let color: "info" | "warning" | "error" | "success" | "default" = "info";
                    if (value === 'warning') color = "warning";
                    else if (value === 'error') color = "error";
                    else if (value === 'success') color = "success";

                    return (
                        <Chip
                            label={t(`notifications.${value}`)}
                            size="small"
                            color={color}
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: '6px' }}
                        />
                    );
                }
            },
            {
                accessorKey: "status",
                header: t('notifications.status'),
                size: 120,
                Cell: ({ cell }) => {
                    const value = cell.getValue<string>();
                    const isUnread = value === NotificationsAPI.UNREAD;
                    return (
                        <Chip
                            label={isUnread ? t('notifications.unread') : t('notifications.read')}
                            size="small"
                            icon={isUnread ? <Drafts sx={{ fontSize: '14px !important' }} /> : <MarkEmailRead sx={{ fontSize: '14px !important' }} />}
                            sx={{
                                fontWeight: 800,
                                bgcolor: isUnread ? 'rgba(99, 102, 241, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                color: isUnread ? '#6366f1' : '#64748b',
                                border: 'none'
                            }}
                        />
                    );
                },
                enableColumnFilter: false,
            },
            {
                accessorKey: "message",
                header: t('notifications.message'),
                size: 300,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{
                        color: 'var(--text-secondary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4
                    }}>
                        {cell.getValue<string>()}
                    </Typography>
                )
            },
            {
                accessorKey: "created_at",
                header: t('notifications.sentAt'),
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue<string>();
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {dayjs(value).format('DD/MM/YYYY')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                {dayjs(value).format('HH:mm')}
                            </Typography>
                        </Box>
                    );
                },
                enableColumnFilter: false,
            },
            {
                accessorKey: "actions",
                header: "",
                size: 80,
                enableColumnFilter: false,
                enableSorting: false,
            },
        ],
        [t],
    );

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
        muiTablePaperProps: { className: "__table-expandable" },
        muiTableContainerProps: { className: "__table-container" },
        localization: MRT_Localization_EN,
        muiToolbarAlertBannerProps: isError
            ? {
                color: "error",
                children: "errorLoadingData",
            }
            : undefined,
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
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
                <button type='button' className='btn btn-outline-primary' onClick={handleMarkAllAsRead} style={{ marginLeft: '12px' }}>
                    <i className='ti ti-mask-off'></i>
                    <span className='ms-2'>{t('notifications.markAllAsRead')}</span>
                </button>
            </Box>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <Box>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <button type='button' className='btn'>
                    <i className='ti ti-cloud-download'></i>
                </button>
                <MRT_ToggleDensePaddingButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    });

    const handleMarkAsRead = async (id : string) => {
        try {
            context.togglePageLoading(true)
            const {message} = await NotificationsAPI.maskAsRead(id)
            Toast.success(message)

        } catch (error) {
            console.error(error)
        }finally{
            setIsDeleted(prev => !prev)
            context.togglePageLoading(false)
        }
    }

    const handleMarkAllAsRead = async () =>{
        try {
            context.togglePageLoading(true)
            const {message} = await NotificationsAPI.maskAllAsRead()
            Toast.success(message)
        } catch (error) {
            console.error(error)
        }finally{
            setIsDeleted(prev => !prev)
            context.togglePageLoading(false)
        }
    }

    return (
        <div className="container">
            <Breadcrumd parent={t('notifications.notifications')} />
            <MaterialReactTable table={mrTable}/>
        </div>
    );
}
