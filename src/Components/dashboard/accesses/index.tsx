import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext";
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
import { MRT_Localization_EN } from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {
    Box, Stack, IconButton, Tooltip, Typography, Button,
    Zoom, Chip, Avatar
} from "@mui/material";
import {
    Refresh,
    Add,
    Edit,
    Delete,
    Shield,
    Person,
    Key,
    CheckCircle,
    Cancel,
    FileDownload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { Pages } from '@/Data/Objects/state';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import CustomAlert from '@/Components/CustomAlert';
import Toast from '@/Data/Utilities/Toast';
import { IAccess, IAccessTableData } from '@/Data/Interfaces/Access';
import AccessAPI from '@/Data/Api/Access';
import { removeAccessToAuthUser } from '@/Data/Slices/auth/userSlice';

export default function IndexAccess() {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [accessId, setAccessId] = useState<number | null>(null);
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<any[]>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [accesses, setAccesses] = useState<IAccess[] | null>(null);
    const dispatch = useAppDispatch();
    const { authorizations } = useAppSelector(state => state.userAuthorizing);

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Accès';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const el = document.querySelector(".__table-container");
        if (el) el.scrollTo(0, 0);
    };

    const getAccesses = useCallback(async () => {
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
            const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<IAccess>>(url.href);
            const { data: accessList } = result;
            if (status === 200) {
                setAccesses(accessList.data);
                setRowCount(accessList.total);
            }
            resetScroll();
        } catch {
            setIsError(true);
            setAccesses([]);
        } finally {
            setIsLoading(false);
            setIsRefetching(false);
        }
    }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

    useEffect(() => {
        getAccesses();
    }, [getAccesses, isDeleted]);

    const handleRefresh = () => {
        setIsRefetching(true);
        getAccesses();
    };

    const getRoleColor = (roleCode: string): string => {
        const colors: Record<string, string> = {
            ADMIN: '#6366f1',
            SUPER_ADMIN: '#7c3aed',
            SELLER: '#10b981',
            BUYER: '#f59e0b',
        };
        return colors[roleCode] || '#64748b';
    };

    const tableData: IAccessTableData[] = useMemo(() => {
        return accesses ? accesses.map((access) => ({
            ...access,
            user: `${access?.user?.last_name || ""} ${access?.user?.first_name || ""}`,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Modifier" arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({
                                    page: Pages.ACCESS,
                                    id: access.id,
                                    param: { sub_page: 'UPDATE' }
                                }));
                            }}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)', '&:hover': { bgcolor: 'rgba(99,102,241,0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Edit sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                    {!UtilMethods.isActiveAccess(access.id) && (
                        <Tooltip title="Supprimer" arrow TransitionComponent={Zoom}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setAccessId(access.id);
                                    setOpenDetailModal(true);
                                }}
                                sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)', '&:hover': { bgcolor: 'rgba(239,68,68,0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                            >
                                <Delete sx={{ fontSize: '18px' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        })) : [];
    }, [accesses, context, dispatch]);

    const columns: MRT_ColumnDef<IAccessTableData>[] = useMemo(() => [
        {
            accessorKey: "user",
            header: "Utilisateur",
            size: 220,
            Cell: ({ cell, row }) => {
                const initials = (row.original as any)?.user?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';
                const roleCode = (row.original as any)?.role?.code || '';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                            width: 38, height: 38,
                            background: `linear-gradient(135deg, ${getRoleColor(roleCode)}22 0%, ${getRoleColor(roleCode)}44 100%)`,
                            color: getRoleColor(roleCode),
                            fontWeight: 800, fontSize: '0.85rem',
                            border: `2px solid ${getRoleColor(roleCode)}33`,
                        }}>
                            {initials}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>
                                {cell.getValue() as string}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                ID #{(row.original as any)?.id}
                            </Typography>
                        </Box>
                    </Box>
                );
            },
        },
        {
            accessorKey: "role.label",
            header: "Rôle",
            size: 160,
            Cell: ({ row }) => {
                const roleCode = (row.original as any)?.role?.code || '';
                const roleLabel = (row.original as any)?.role?.label || '-';
                const color = getRoleColor(roleCode);
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            p: 0.5, borderRadius: '8px',
                            bgcolor: `${color}15`, color,
                        }}>
                            <Shield sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>
                            {roleLabel}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Statut",
            size: 130,
            filterVariant: "select",
            filterSelectOptions: [
                { label: 'Active', value: UtilMethods.ACTIVE },
                { label: 'Inactive', value: UtilMethods.INACTIVE },
            ],
            Cell: ({ cell }) => {
                const value = String(cell.getValue());
                const isActive = value.toLowerCase() === 'active';
                return (
                    <Chip
                        icon={isActive ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Cancel sx={{ fontSize: '14px !important' }} />}
                        label={value}
                        size="small"
                        sx={{
                            fontWeight: 900,
                            bgcolor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isActive ? '#059669' : '#dc2626',
                            border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            borderRadius: '8px',
                        }}
                    />
                );
            },
        },
        {
            accessorKey: "code",
            header: "Code",
            size: 160,
            Cell: ({ cell }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Key sx={{ fontSize: 14, color: '#94a3b8' }} />
                    <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {cell.getValue() as string}
                    </Typography>
                </Box>
            ),
        },
        {
            accessorKey: "actions",
            header: "Actions",
            size: 120,
            enableColumnFilter: false,
            enableSorting: false,
        },
    ], []);

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
                    Accès
                </Typography>
                <Tooltip title="Rafraîchir" arrow>
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
                            Actualiser
                        </Button>
                    </motion.div>
                </Tooltip>
                {UtilMethods.isAdmin() && (
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({ page: Pages.ACCESS, param: { sub_page: "CREATE" } }));
                            }}
                            variant="contained"
                            startIcon={<Add />}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                                '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', boxShadow: '0 6px 16px rgba(99,102,241,0.4)' }
                            }}
                        >
                            Nouvel Accès
                        </Button>
                    </motion.div>
                )}
                {UtilMethods.getHabilitations(authorizations, 'access').canExport && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FileDownload />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            borderColor: 'rgba(16,185,129,0.3)',
                            color: '#059669',
                            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16,185,129,0.05)' }
                        }}
                    >
                        Exporter
                    </Button>
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
    });

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true);
            setInProgress(true);
            const { message } = await AccessAPI.delete(accessId);
            if (UtilMethods.isOneOfAuthAccess(accessId)) {
                dispatch(removeAccessToAuthUser(accessId));
            }
            Toast.success(message);
        } catch (error) {
            console.error(error);
        } finally {
            setOpenDetailModal(false);
            setIsDeleted(prev => !prev);
            setInProgress(false);
            context.togglePageLoading(false);
        }
    };

    return (
        <Box >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Administration" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <MaterialReactTable table={mrTable} />
            </motion.div>

            <CustomAlert
                openDetailModal={openDetailModal}
                content={{
                    style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: 'Voulez-vous supprimer cet accès ?'
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress={inProgress}
            />
        </Box>
    );
}