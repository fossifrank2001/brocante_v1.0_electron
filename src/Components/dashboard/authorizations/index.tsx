import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable, MRT_ColumnDef,
    MRT_ShowHideColumnsButton, MRT_TableInstance,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import { Box, Typography, Button, Tooltip, IconButton, Zoom, Stack, Chip } from "@mui/material";
import { Refresh, Add, Edit, Delete, FileDownload } from '@mui/icons-material';
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
import { motion } from 'framer-motion';

const IndexAuthorization = () => {
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
    const { authorizations } = useAppSelector(state => state.userAuthorizing)
    const [roles, setRoles] = useState<IRole[] | null>([]);

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Authorisations';
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
            const { data: _roles } = await RoleAPI.index();
            setRoles(_roles.data)
        })()
    }, [])

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
        (async () => await getAccesses())();
    }, [getAccesses, isDeleted]);

    const handleRefresh = () => {
        setIsRefetching(true);
        getAccesses();
    };

    const tableData: IHabilitationTableData[] = useMemo(() => {
        return habilitations ? habilitations.map((habilitation) => ({
            id: habilitation.id,
            role: habilitation?.role?.label,
            menu: habilitation?.menu?.label,
            permission: habilitation?.permission?.label,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Modifier" TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({
                                    page: Pages.HABILITATION,
                                    id: habilitation.id,
                                    param: { sub_page: 'UPDATE' }
                                }));
                            }}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer" TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setHabilitationId(habilitation.id)
                                setOpenDetailModal(true)
                            }}
                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        })) : [];
    }, [habilitations, context, dispatch]);

    const columns: MRT_ColumnDef<IHabilitationTableData>[] = useMemo(
        () => [
            {
                accessorKey: "menu",
                header: "Menu",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filtrer" },
                }),
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        {cell.getValue() as string}
                    </Typography>
                ),
            },
            {
                accessorKey: "role",
                header: "Rôle",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filtrer" },
                }),
                filterVariant: "select",
                filterSelectOptions: roles?.map(role => ({
                    label: UtilMethods.capitalizeFirstLetter(role?.label || ''),
                    value: role?.code
                })),
                Cell: ({ cell }) => (
                    <Chip
                        label={cell.getValue() as string}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            borderRadius: '8px'
                        }}
                    />
                ),
            },
            {
                accessorKey: "permission",
                header: "Permission",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filtrer" },
                }),
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                        {cell.getValue() as string}
                    </Typography>
                ),
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 100,
                unexport: true,
                enableColumnFilter: false,
                enableSorting: false,
            },
        ],
        [roles],
    );

    const mrTable: MRT_TableInstance<IHabilitationTableData> = useMaterialReactTable({
        columns: columns,
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
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }
        },
        muiTableContainerProps: {
            className: "__table-container",
            sx: { maxHeight: '700px' }
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: 'rgba(248, 250, 252, 0.6)',
                color: '#64748b',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                py: 3,
                px: 3
            }
        },
        muiTableBodyRowProps: {
            sx: {
                '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.04) !important',
                },
                transition: 'background-color 0.2s'
            }
        },
        muiTableBodyCellProps: {
            sx: { px: 3, py: 2, borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }
        },
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
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 2.5, p: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                    Authorisations
                </Typography>

                <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                    <Button
                        onClick={handleRefresh}
                        variant="outlined"
                        startIcon={<Refresh />}
                        disabled={isLoading || isRefetching}
                        sx={{
                            borderRadius: '14px',
                            textTransform: 'none',
                            fontWeight: 800,
                            borderColor: 'rgba(99, 102, 241, 0.2)',
                            color: '#6366f1',
                            px: 3,
                            bgcolor: 'white',
                            '&:hover': { bgcolor: '#f5f7ff', borderColor: '#6366f1' }
                        }}
                    >
                        Rafraîchir
                    </Button>

                    {UtilMethods.isAdmin() && (
                        <Button
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({
                                    page: Pages.HABILITATION,
                                    param: { sub_page: "CREATE" }
                                }));
                            }}
                            variant="contained"
                            startIcon={<Add />}
                            sx={{
                                borderRadius: '16px',
                                textTransform: 'none',
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                                px: 4,
                                py: 1.2,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 15px 25px -5px rgba(99, 102, 241, 0.5)',
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                }
                            }}
                        >
                            Nouvelle Authorisation
                        </Button>
                    )}
                </Box>
            </Box>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: 1, pr: 3, alignItems: 'center' }}>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
                {UtilMethods.getHabilitations(authorizations, 'authorization').canExport && (
                    <Tooltip title="Exporter la liste" arrow TransitionComponent={Zoom}>
                        <IconButton
                            sx={{ color: '#64748b', '&:hover': { color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)' } }}
                        >
                            <FileDownload />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        ),
    });

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const { message } = await AuthorizationAPI.delete(habilitationId)
            Toast.success(message)

        } catch (error) {
            console.error(error)
        } finally {
            setOpenDetailModal(false)
            setIsDeleted(prev => !prev)
            setInProgress(false)
            context.togglePageLoading(false)
        }
    }

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 4 }}>
                    <Breadcrumd parent="Administration" />
                </Box>

                <MaterialReactTable table={mrTable} />
            </motion.div>

            <CustomAlert
                openDetailModal={openDetailModal}
                content={{
                    style: 'ti ti-info-circle text text-danger',
                    icon: 'Suppression d\'autorisation',
                    message: 'Voulez-vous vraiment supprimer cette autorisation ?'
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress={inProgress}
            />
        </Box>
    );
}

export default React.memo(IndexAuthorization)