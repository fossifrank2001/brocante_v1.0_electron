import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {useAppContext} from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable, MRT_ColumnDef,
    MRT_ShowHideColumnsButton, MRT_TableInstance,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {Box, Link, Stack} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import Toast from '@/Data/Utilities/Toast';
import CustomAlert from '@/Components/CustomAlert';
import { IHabilitation, IHabilitationTableData } from '@/Data/Interfaces/Habilitation';
import { IRole } from '@/Data/Interfaces';
import RoleAPI from '@/Data/Api/Role';
import AuthorizationAPI from '@/Data/Api/Authorizations';

const  IndexAuthorization = () => {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [, setReady] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [habilitationId, setHabilitationId] = useState<number | null>(null);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [habilitations, setHabilitations] = useState<IHabilitation[] | null>(null);
    const dispatch = useAppDispatch()
    const {authorizations} = useAppSelector(state => state.userAuthorizing)
    const [roles, setRoles] = useState<IRole[] | null>([]);

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Authorizations';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    useEffect(() => {
        (async () => {
            const {data: _roles} = await RoleAPI.index(); 
            setRoles(_roles.data)
        })()
    }, [])


    // request all menus
    const getAccesses = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/authorizations`);
            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            try {
                const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<IHabilitation>>(url.href);
              const { data: authorizationList }: IApiResponsePaginated<IHabilitation> = result;
                if (status === 200) {
                    setHabilitations(authorizationList.data);
                    setRowCount(authorizationList.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setHabilitations([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
      (async () => await getAccesses() )();
    }, [getAccesses, isDeleted]);

    const tableData:IHabilitationTableData[] = useMemo(() => {
        return habilitations ? habilitations.map((habilitation) => ({
            id: habilitation.id,
            role: habilitation?.role?.label,
            menu: habilitation?.menu?.label,
            permission: habilitation?.permission?.label,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true);
                            dispatch(setActivePage({
                                page: Pages.HABILITATION, 
                                id: habilitation.id, 
                                param: {
                                    sub_page: 'UPDATE'
                                }
                            }))
                        }}>
                        <i color="primary" className="ti ti-pencil"></i>
                    </Link>
                    <i
                        onClick={() => {
                            setHabilitationId(habilitation.id)
                            setOpenDetailModal(true)
                        }}
                        className="ti ti-trash cursor-pointer text-danger"
                    ></i>
                </Stack>
            ),
        })) : [];
    }, [habilitations]);

    const columns : MRT_ColumnDef<IHabilitationTableData>[] = useMemo(
        () => [
            {
                accessorKey: "menu",
                header: "Menu",
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
                filterVariant: "select",
                filterSelectOptions: roles?.map(role => ({
                    label: UtilMethods.capitalizeFirstLetter(role?.label || ''), 
                    value: role?.code
                })),
            },
            {
                accessorKey: "permission",
                header: "Permission",
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
        [roles],
    );

    const mrTable : MRT_TableInstance<IHabilitationTableData>  = useMaterialReactTable({
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
                        page: Pages.HABILITATION,
                        param: {
                            sub_page: "CREATE"
                        }
                    }))
                }} type='button' className='btn btn-primary' style={{ marginLeft: '12px' }}>
                    <i className='ti ti-plus'></i>
                    <span className='ms-2'>ADD</span>
                </button>}
                {UtilMethods.getHabilitations(authorizations, 'authorization').canExport && <button type='button' className='btn btn-outline-primary' style={{ marginLeft: '12px' }}>
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
            const {message} = await AuthorizationAPI.delete(habilitationId)
            Toast.success(message)
            
        } catch (error) {
            console.error(error)
        }finally{
            setOpenDetailModal(false)
            setIsDeleted(prev => !prev)
            setInProgress(false)
            context.togglePageLoading(false)
        }
    }

    return (
        <div className="container">
            <Breadcrumd parent="Authorizations" />
            <MaterialReactTable
                table={mrTable}
            />
           <CustomAlert 
                openDetailModal={openDetailModal} 
                content={{style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: 'Would you like to delete this Authorization?'
                }}  
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress= {inProgress}
           />
        </div>
    );
}

export default React.memo(IndexAuthorization)