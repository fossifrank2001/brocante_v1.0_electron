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
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {Box, Link, Stack} from "@mui/material";
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

    // request all menus
    const getProducts = useCallback(
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
                const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<INotification>>(url.href);
                const { data: notList }: IApiResponsePaginated<INotification> = result;
                if (status === 200) {
                    setNotifications(notList.data);
                    setRowCount(notList.total);
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
        getProducts();
    }, [getProducts, isDeleted]);

    const tableData: INotificationTableData[] = useMemo(() => {
        return notifications ? notifications.map((notification) => ({
            ...notification,
            type: `${notification?.data.nature}`,
            status: notification?.read_at? NotificationsAPI.READ : NotificationsAPI.UNREAD,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => handleMarkAsRead(notification.id)}>
                        <i color="primary" className="ti ti-mask-off text-primary"></i>
                    </Link>
                </Stack>
            ),
        })) : [];
    }, [notifications]);

    const columns: MRT_ColumnDef<INotificationTableData>[] = useMemo(
        () => [
            {
                accessorKey: "title",
                header: t('notifications.title'),
                size: 150,
                enableColumnFilter: false,
            },
            {
                accessorKey: "type",
                header: t('notifications.type'),
                size: 100,
                filterVariant: "select",
                filterSelectOptions: [
                    {label: t('notifications.info'), value: 'info'}
                ],
            },
            {
                accessorKey: "status",
                header: t('notifications.status'),
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    const status = typeof value === 'string' ? UtilMethods.getStatus(value) : '';
                    return <span className={status}>{String(value)}</span>;
                },
                enableColumnFilter: false,
            },
            {
                accessorKey: "message",
                header: t('notifications.message'),
                size: 150,
            },
            {
                accessorKey: "read_at",
                header: t('notifications.readAt'),
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return <span>{dayjs(String(value)).format('DD/MM/YYYY HH:mm:ss')}</span> ;
                },
                enableColumnFilter: false
            },
            {
                accessorKey: "created_at",
                header: t('notifications.createdAt'),
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return <span>{dayjs(String(value)).format('DD/MM/YYYY HH:mm:ss')}</span> ;
                },
                enableColumnFilter: false,
            },
            {
                accessorKey: "actions",
                header: t('common.actions'),
                size: 150,
                unexport: true,
                enableColumnFilter: false,
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

    const handleMarkAsRead = async (id : number) => {
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
