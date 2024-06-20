import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {useAppContext} from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import axiosInstance, {IApiResponse} from "Data/Utilities/axiosInstance";
import {Box, Link, Stack} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import dayjs from "dayjs";
import {INotification} from "Data/Interfaces/Notifications.ts";
import NotificationsAPI from "Data/Api/Notifications.ts";
import Toast from "Data/Utilities/Toast.ts";

export default function NotificationIndex() {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [notificationId, setNotificationId] = useState<number>(null);
    const [_, setReady] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [notifications, setNotifications] = useState<INotification[] | null>(null);


    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Notifications';
    }, [context]);

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
                const { status, data: result } = await axiosInstance.get<IApiResponse>(url.href);
                if (status === 200) {
                    setNotifications(result.data);
                    setRowCount(result.data.total);
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

    const tableData = useMemo(() => {
        return notifications ? notifications.map((notification) => ({
            id: notification.id,
            type: `${notification?.data.nature}`,
            title: notification?.data.title,
            status: notification?.read_at? NotificationsAPI.READ : NotificationsAPI.UNREAD,
            message: notification?.data.message,
            read_at: notification?.read_at,
            created_at: notification?.created_at,
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

    const columns = useMemo(
        () => [
            {
                accessorKey: "title",
                header: "Title",
                size: 150,
                enableColumnFilter: false,
            },
            {
                accessorKey: "type",
                header: "Type",
                size: 100,
                filterVariant: "select",
                filterSelectOptions: [
                    {label: "Info", value: 'info'}
                ],
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 150,
                Cell: ({cell}) =>  <span className={`${UtilMethods.getStatus(cell.getValue())}`}>{cell.getValue()}</span>,
                enableColumnFilter: false
            },
            {
                accessorKey: "message",
                header: "Message",
                size: 150,
            },
            {
                accessorKey: "read_at",
                header: "Read At",
                size: 150,
                Cell: ({cell}) =>  <span>{dayjs(cell.getValue()).format('DD/MM/YYYY HH:mm:ss')}</span>,
                enableColumnFilter: false,
            },
            {
                accessorKey: "created_at",
                header: "Created At",
                size: 150,
                Cell: ({cell}) =>  <span>{dayjs(cell.getValue()).format('DD/MM/YYYY HH:mm:ss')}</span>,
                enableColumnFilter: false,
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 150,
                unexport: true,
                enableColumnFilter: false,
            },
        ],
        [],
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
                    <span className='ms-2'>Mark all as read</span>
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
            <Breadcrumd parent="Notifications" />
            <MaterialReactTable
                table={mrTable}
                muiTablePaperProps={{
                    sx: {
                        fontFamily: 'var(--bs-body-font-family)',
                    },
                }}
                muiTableHeadCellProps={{
                    sx: {
                        fontFamily: 'var(--bs-body-font-family)',
                    },
                }}
                muiTableBodyCellProps={{
                    sx: {
                        fontFamily: 'var(--bs-body-font-family)',
                    },
                }}
            />
        </div>
    );
}
