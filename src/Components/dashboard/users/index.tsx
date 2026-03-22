import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable, MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from 'material-react-table';
import { MRT_Localization_EN } from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import { Box, Stack, Button, Typography, Tooltip, IconButton, Zoom, Chip } from "@mui/material";
import {
    Refresh, Add, Visibility, Edit, Delete,
    Mail, Phone,
    FileDownload
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [users, setUsers] = useState<IUser[] | null>(null);
    const dispatch = useAppDispatch()
    const { authorizations } = useAppSelector(state => state.userAuthorizing)

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

    const getUsers = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/users`);
            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);
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
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
        getUsers();
    }, [getUsers, isDeleted]);

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const { message } = await UserAPI.delete(userId!)
            Toast.success(message)
        } catch (error: any) {
            console.error(error)
            Toast.error(error?.message || "Erreur lors de la suppression")
        } finally {
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
            name: `${user.last_name || ''} ${user.first_name || ''}`,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Voir Profil" TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({
                                    page: Pages.ACCOUNT,
                                    id: user.id,
                                    param: { sub_page: 'READ' }
                                }));
                            }}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier" TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({
                                    page: Pages.ACCOUNT,
                                    id: user.id,
                                    param: { sub_page: 'UPDATE' }
                                }));
                            }}
                            sx={{ color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.08)', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {(UtilMethods.authEmail() !== user.email) && (
                        <Tooltip title="Supprimer" TransitionComponent={Zoom} arrow>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setUserId(user.id!)
                                    setOpenDetailModal(true)
                                }}
                                sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        })) : [];
    }, [users, context, dispatch]);

    const columns = useMemo<MRT_ColumnDef<IUserTableData>[]>(
        () => [
            {
                accessorKey: "last_name",
                header: "Identité Utilisateur",
                size: 250,
                Cell: ({ row }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                            color: '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            fontSize: '1.2rem',
                            fontWeight: 900
                        }}>
                            {row.original.last_name?.charAt(0)}
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                                {`${row.original.last_name || ''} ${row.original.first_name || ''}`}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                {row.original.gender === 'male' ? '👤 Homme' : '👤 Femme'}
                            </Typography>
                        </Box>
                    </Box>
                ),
            },
            {
                accessorKey: "email",
                header: "Email & Contact",
                size: 250,
                Cell: ({ row }) => (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Mail sx={{ fontSize: 16, color: '#6366f1' }} />
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                                {row.original.email}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                {row.original.phone || 'N/A'}
                            </Typography>
                        </Box>
                    </Box>
                ),
            },
            {
                accessorKey: "status",
                header: "État du Compte",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as string;
                    const isActive = value === 'active';
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: isActive ? '#10b981' : '#ef4444',
                                boxShadow: `0 0 10px ${isActive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                            }} />
                            <Chip
                                label={isActive ? 'ACTIF' : 'SUSPENDU'}
                                size="small"
                                sx={{
                                    fontWeight: 900,
                                    fontSize: '0.65rem',
                                    bgcolor: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                    color: isActive ? '#059669' : '#dc2626',
                                    border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                    borderRadius: '8px'
                                }}
                            />
                        </Box>
                    );
                },
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 150,
                enableColumnFilter: false,
                enableSorting: false,
            },
        ],
        []
    );

    const mrTable = useMaterialReactTable({
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
                    Utilisateurs
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

                    {UtilMethods.getHabilitations(authorizations, 'account').canCreate && (
                        <Button
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({
                                    page: Pages.ACCOUNT,
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
                            Ajouter un Compte
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
                {UtilMethods.getHabilitations(authorizations, 'account').canExport && (
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
                    icon: 'Suppression de compte',
                    message: 'Êtes-vous certain de vouloir supprimer cet utilisateur ? Cette action est irréversible.'
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress={inProgress}
            />
        </Box>
    );
}