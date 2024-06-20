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
import axiosInstance from "Data/Utilities/axiosInstance";
import {Box} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { IMenu, IMenuList } from '@/Data/Interfaces';
import {useAppDispatch, useAppSelector} from "@/hooks";

export default function IndexMenu() {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [_, setReady] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [menus, setMenus] = useState<IMenu[] | null>(null);
    const {authorizations} = useAppSelector(state => state.userAuthorizing)

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Menus';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    // request all menus
    const getMenus = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/menus`);
            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            try {
                const { status, data: result } = await axiosInstance.get<IMenuList>(url.href);
                if (status === 200) {
                    setMenus(result.data.data);
                    setRowCount(result.data.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setMenus([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
        getMenus();
    }, [getMenus]);

    const tableData = useMemo(() => {
        return menus ? menus.map((menu) => ({
            id: menu.id,
            label: `${menu?.label || ""}`,
            group: menu.group,
            order: menu.order,
            parent: menus.find(_menu => _menu.id === menu.parent_id)?.label || '',
            code: menu?.code
        })) : [];
    }, [menus]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "label",
                header: "label",
                size: 100,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "group",
                header: "group",
                size: 150,
                enableColumnFilter: false,
            },
            {
                accessorKey: "parent",
                header: "parent",
                size: 150,
                enableColumnFilter: false
            },
            {
                accessorKey: "order",
                header: "order",
                size: 150,
                enableColumnFilter: false,
            },
            {
                accessorKey: "code",
                header: "code",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
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
                {UtilMethods.getHabilitations(authorizations, 'articles').canExport && <button type='button' className='btn btn-outline-primary' style={{ marginLeft: '12px' }}>
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

    return (
        <div className="container">
            <Breadcrumd parent="Menus" />
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
