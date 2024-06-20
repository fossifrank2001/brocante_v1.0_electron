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
} from "material-react-table";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import {Box, Link, Stack} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { IAccess } from '@/Data/Interfaces/Access';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import Toast from '@/Data/Utilities/Toast';
import AccessAPI from '@/Data/Api/Access';
import CustomAlert from '@/Components/CustomAlert';
import { removeAccessToAuthUser } from '@/Data/Slices/auth/userSlice';

export default function IndexAccess() {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [_, setReady] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [accessId, setAccessId] = useState<number | null>(null);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [accesses, setAccesses] = useState<IAccess[] | null>(null);
    const dispatch = useAppDispatch()
    const {authorizations} = useAppSelector(state => state.userAuthorizing)

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Access';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    // request all menus
    const getAccesses = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/accesses`);
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
                    setAccesses(result.data.data);
                    setRowCount(result.data.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setAccesses([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
        getAccesses();
    }, [getAccesses, isDeleted]);

    const tableData = useMemo(() => {
        return accesses ? accesses.map((access) => ({
            id: access.id,
            user: `${access?.user?.last_name || ""} ${access?.user?.first_name || ""}`,
            role: access?.role?.label,
            status: access.status,
            code: access.code,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true);
                            dispatch(setActivePage({
                                page: Pages.ACCESS, 
                                id: access.id, 
                                param: {
                                    sub_page: 'UPDATE'
                                }
                            }))
                        }}>
                        <i color="primary" className="ti ti-pencil"></i>
                    </Link>
                    {!UtilMethods.isActiveAccess(access.id) && <i
                        onClick={() => {
                            setAccessId(access.id)
                            setOpenDetailModal(true)
                        }}
                        className="ti ti-trash cursor-pointer text-danger"
                    ></i>}
                </Stack>
            ),
        })) : [];
    }, [accesses]);

    const columns = useMemo<MRT_ColumnDef<IAccess>[] | any>(
        () => [
            {
                accessorKey: "user",
                header: "User",
                size: 100,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "role",
                header: "Role",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 150,
                Cell: ({cell}) =>  <span className={`${UtilMethods.getStatus(cell.getValue())}`}>{cell.getValue()}</span>,
                filterVariant: "select",
                filterSelectOptions: [
                  {label: 'Active', value: UtilMethods.ACTIVE},
                  {label: 'Inactive', value: UtilMethods.INACTIVE},
                ],
            },
            {
                accessorKey: "code",
                header: "Code",
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

    const mrTable = useMaterialReactTable({
        columns: columns,
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
                {UtilMethods.isAdmin() && <button onClick={() => {
                    context.togglePageLoading(true)
                    dispatch(setActivePage({
                        page: Pages.ACCESS,
                        param: {
                            sub_page: "CREATE"
                        }
                    }))
                }} type='button' className='btn btn-primary' style={{ marginLeft: '12px' }}>
                    <i className='ti ti-plus'></i>
                    <span className='ms-2'>ADD</span>
                </button>}
                {UtilMethods.getHabilitations(authorizations, 'access').canExport && <button type='button' className='btn btn-outline-primary' style={{ marginLeft: '12px' }}>
                    <i className='ti ti-file-export'></i>
                    <span className='ms-2'>EXPORT ALL</span>
                </button>}
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

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const {message} = await AccessAPI.delete(accessId)
            if(UtilMethods.isOneOfAuthAccess(accessId)){
                dispatch(removeAccessToAuthUser(accessId))
            }
            Toast.success(message)
            
        } catch (error) {
            console.error(error)
        }finally{
            setOpenDetailModal(false)
            setIsDeleted(true)
            setInProgress(false)
            context.togglePageLoading(false)
        }
    }

    return (
        <div className="container">
            <Breadcrumd parent="Accesses" />
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
           <CustomAlert 
                openDetailModal={openDetailModal} 
                content={{style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: 'Would you like to delete this access?'
                }}  
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress= {inProgress}
           />
        </div>
    );
}
