import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext";
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
import { MRT_Localization_EN } from "material-react-table/locales/en";
import axiosInstance from "Data/Utilities/axiosInstance";
import { Box, Typography, Button } from "@mui/material";
import { Refresh, FileDownload } from '@mui/icons-material';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { IMenu, IMenuList, IMenuTableData } from '@/Data/Interfaces';
import { useAppSelector } from "@/hooks";

export default function IndexMenu() {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [, setReady] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [menus, setMenus] = useState<IMenu[] | null>(null);
    const { authorizations } = useAppSelector(state => state.userAuthorizing)

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

    const getMenus = useCallback(async () => {
        setIsLoading(true);
        const url = new URL(`${constants.BASE_URL}/menus`);
        const filters: { [p: string]: undefined } = UtilMethods.formatTableFilters(columnFilters);
        const sortingTab: { [p: string]: undefined } = UtilMethods.formatTableSorting(sorting);
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
    }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

    useEffect(() => {
        (async () => await getMenus())()
    }, [getMenus]);

    const handleRefresh = async () => {
        setIsRefetching(true);
        await getMenus();
    };

    const tableData: IMenuTableData[] = useMemo(() => {
        return menus ? menus.map((menu) => ({
            ...menu,
            parent: menus.find(_menu => _menu.id === menu.parent_id)?.label || '',
        })) : [];
    }, [menus]);

    const columns: MRT_ColumnDef<IMenu>[] = useMemo(
        () => [
            {
                accessorKey: "label",
                header: "Label",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        {cell.getValue() as string}
                    </Typography>
                ),
            },
            {
                accessorKey: "group",
                header: "Groupe",
                size: 150,
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                        {cell.getValue() as string}
                    </Typography>
                ),
            },
            {
                accessorKey: "parent",
                header: "Parent",
                size: 150,
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                        {cell.getValue() as string || '-'}
                    </Typography>
                ),
            },
            {
                accessorKey: "order",
                header: "Ordre",
                size: 100,
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                        {cell.getValue() as number}
                    </Typography>
                ),
            },
            {
                accessorKey: "code",
                header: "Code",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
                Cell: ({ cell }) => (
                    <Box sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        color: '#4f46e5',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                    }}>
                        {cell.getValue() as string}
                    </Box>
                ),
            },
        ],
        [],
    );

    const mrTable: MRT_TableInstance<IMenu> = useMaterialReactTable({
        columns,
        data: tableData,
        enableRowSelection: true,
        enableStickyHeader: true,
        initialState: {
            showColumnFilters: true,
            density: "comfortable",
        },
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        muiTablePaperProps: {
            sx: {
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }
        },
        muiTableContainerProps: {
            className: "__table-container",
            sx: { maxHeight: '600px' }
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: 'rgba(248, 250, 252, 0.5)',
                color: '#64748b',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                py: 2
            }
        },
        muiTableBodyRowProps: {
            sx: {
                '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.03) !important',
                    transition: 'all 0.2s'
                }
            }
        },
        localization: MRT_Localization_EN,
        muiToolbarAlertBannerProps: isError
            ? {
                color: "error",
                children: "Erreur lors du chargement des données",
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
            <Box sx={{ display: "flex", gap: 2, p: 2, alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                    Menus
                </Typography>
                <Button
                    onClick={handleRefresh}
                    variant="outlined"
                    startIcon={<Refresh />}
                    disabled={isLoading || isRefetching}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        px: 3,
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                    }}
                >
                    Actualiser
                </Button>
                {UtilMethods.getHabilitations(authorizations, 'articles').canExport && (
                    <Button
                        variant="contained"
                        startIcon={<FileDownload />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.3)',
                            px: 3,
                            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 20px -4px rgba(99, 102, 241, 0.4)' }
                        }}
                    >
                        Exporter
                    </Button>
                )}
            </Box>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: 0.5, pr: 2 }}>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ToggleDensePaddingButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    });

    return (
        <Box>
            <Breadcrumd parent="Menus" />
            <MaterialReactTable table={mrTable} />
        </Box>
    );
}