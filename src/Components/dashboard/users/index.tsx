import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {useAppContext} from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable, MRT_ColumnDef,
    MRT_ShowHideColumnsButton, MRT_TableOptions,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from 'material-react-table';
import {MRT_Localization_EN} from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {Box, Link, Stack} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { IAppContext, IUser, IUserTableData } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import UserAPI from '@/Data/Api/Users';
import Toast from '@/Data/Utilities/Toast';
import CustomAlert from '@/Components/CustomAlert';

export default function IndexUser() {
    const context: IAppContext = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [, setReady] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [users, setUsers] = useState<IUser[] | null>(null);
    const dispatch = useAppDispatch()
    const {authorizations} = useAppSelector(state => state.userAuthorizing)

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Users';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    // request all menus
    const getUsers = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/users`);
            const filters: { [p: string]: undefined } = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab: { [p: string]: undefined } = UtilMethods.formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            try {
                const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<IUser>>(url.href);
                const { data: userList }: IApiResponsePaginated<IUser> = result;
                if (status === 200) {
                    setUsers(userList.data);
                    setRowCount(userList.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setUsers([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
        (async () => await getUsers())()
    }, [getUsers, isDeleted]);

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const {message} = await UserAPI.delete(userId)
            Toast.success(message)
        } catch (error) {
            console.error(error)
        }finally{
            setOpenDetailModal(false)
            setIsDeleted(true)
            context.togglePageLoading(false)
            setInProgress(false)
        }
    }

    const handleRefresh = () => {
        setIsRefetching(true);
        getUsers();
    };

    const tableData: IUserTableData[] = useMemo(() => {
        return users ? users.map((user: IUser) => ({
            ...user,
            name: `${user.last_name || ""} ${user.first_name || ""}`,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true);
                            dispatch(setActivePage({
                                page: Pages.ACCOUNT,
                                id: user.id,
                                param: {
                                    sub_page: 'READ'
                                }
                            }))
                        }}>
                        <i color="primary" className="ti ti-eye text-dark"></i>
                    </Link>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true);
                            dispatch(setActivePage({
                                page: Pages.ACCOUNT,
                                id: user.id,
                                param: {
                                    sub_page: 'UPDATE'
                                }
                            }))
                        }}>
                        <i color="primary" className="ti ti-pencil"></i>
                    </Link>
                    {(UtilMethods.authEmail() !== user.email) && (
                        <i
                            onClick={() => {
                                setUserId(user.id)
                                setOpenDetailModal(true)
                            }}
                            className="ti ti-trash cursor-pointer text-danger"
                        ></i>
                    )}
                </Stack>
            ),
        })) : [];
    }, [users, context, dispatch]);

    const columns: MRT_ColumnDef<IUser>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                size: 100,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "email",
                header: "Email",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    const status = typeof value === 'string' ? UtilMethods.getStatus(value) : '';
                    return <span className={status}>{String(value)}</span>;
                },
                enableColumnFilter: false,
            },
            {
                accessorKey: "phone",
                header: "Phone",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "gender",
                header: "Gender",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
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

    const tableOptions: MRT_TableOptions<IUser> = {
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
                children: "Error loading data",
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
                <button
                    onClick={handleRefresh}
                    type='button'
                    className='btn btn-outline-secondary'
                    style={{ marginLeft: '12px' }}
                >
                    <i className='ti ti-refresh'></i>
                    <span className='ms-2'>Refresh</span>
                </button>
                {UtilMethods.getHabilitations(authorizations, 'account').canCreate && (
                    <button
                        onClick={() => {
                            context.togglePageLoading(true);
                            dispatch(setActivePage({
                                page: Pages.ACCOUNT,
                                param: {
                                    sub_page: "CREATE"
                                }
                            }));
                        }}
                        type='button'
                        className='btn btn-primary'
                        style={{ marginLeft: '12px' }}
                    >
                        <i className='ti ti-plus'></i>
                        <span className='ms-2'>ADD</span>
                    </button>
                )}
                {UtilMethods.getHabilitations(authorizations, 'account').canExport && (
                    <button type='button' className='btn btn-outline-primary' style={{ marginLeft: '12px' }}>
                        <i className='ti ti-file-export'></i>
                        <span className='ms-2'>EXPORT ALL</span>
                    </button>
                )}
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
    };

    const table = useMaterialReactTable(tableOptions);

    return (
        <div className="container">
            <Breadcrumd parent="Users" />
            <MaterialReactTable table={table} />
            <CustomAlert
                openDetailModal={openDetailModal}
                content={{style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: 'Would you like to delete this user?'
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress = {inProgress}
            />
        </div>
    );
}