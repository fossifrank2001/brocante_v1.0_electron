import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useAppContext } from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleFiltersButton,
    MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {
    Box, Stack, Tooltip, IconButton, Typography, Button,
    Chip, Zoom
} from "@mui/material";
import {
    Refresh,
    Add,
    Edit,
    Delete,
    ContactPhone,
    Inventory,
    Storefront,
    FileDownload
} from '@mui/icons-material';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import Toast from '@/Data/Utilities/Toast';
import CustomAlert from '@/Components/CustomAlert';
import { IAppContext, ISupply } from 'Interfaces';
import SupplyAPI from "Data/Api/Suppliers.ts";
import { motion } from 'framer-motion';

export default function IndexSupply() {
    const context: IAppContext = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openFormModal, setOpenFormModal] = useState(false);
    const [supplyId, setSupplyId] = useState<number | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<ISupply | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [suppliers, setSuppliers] = useState<ISupply[] | null>(null);
    const { authorizations } = useAppSelector(state => state.userAuthorizing);

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Suppliers';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    const getSuppliers = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/suppliers`);
            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            try {
                const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<ISupply>>(url.href, {
                    headers: {
                        "Without-Pagination": 1
                    }
                });
                const { data: supplyList }: IApiResponsePaginated<ISupply> = result;
                if (status === 200) {
                    setSuppliers(supplyList.data);
                    setRowCount(supplyList.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setSuppliers([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
        getSuppliers();
    }, [getSuppliers, isDeleted]);

    const handleRefresh = () => {
        setIsRefetching(true);
        getSuppliers();
    };

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true);
            setInProgress(true);
            const { message } = await SupplyAPI.delete(supplyId!);
            Toast.success(message);
        } catch (error) {
            console.error(error);
        } finally {
            setOpenDetailModal(false);
            setIsDeleted(true);
            context.togglePageLoading(false);
            setInProgress(false);
        }
    };

    const handleOpenFormModal = (supplier: ISupply | null = null) => {
        setSelectedSupplier(supplier);
        setOpenFormModal(true);
    };

    const handleCloseModels = () => {
        setOpenFormModal(false);
        setSelectedSupplier(null);
    };

    const handleSuccess = () => {
        handleRefresh();
    };

    const tableData = useMemo(() => {
        return suppliers ? suppliers.map((user) => ({
            ...user,
            actions: (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Modifier" arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => handleOpenFormModal(user)}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.12)' } }}
                        >
                            <Edit sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer" arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSupplyId(user.id!)
                                setOpenDetailModal(true)
                            }}
                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.12)' } }}
                        >
                            <Delete sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        })) : [];
    }, [suppliers, context]);

    const columns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Fournisseur",
                size: 250,
                Cell: ({ cell }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            p: 1,
                            borderRadius: '10px',
                            bgcolor: 'rgba(99, 102, 241, 0.05)',
                            color: '#6366f1'
                        }}>
                            <Storefront sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {cell.getValue() as string}
                        </Typography>
                    </Box>
                ),
            },
            {
                accessorKey: "contact_info",
                header: "Contact",
                size: 250,
                Cell: ({ cell }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ContactPhone sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                            {cell.getValue() as string}
                        </Typography>
                    </Box>
                ),
            },
            {
                accessorKey: "products_count",
                header: "Produits",
                size: 150,
                Cell: ({ cell }) => (
                    <Chip
                        icon={<Inventory sx={{ fontSize: '14px !important' }} />}
                        label={`${cell.getValue() || 0} Produits`}
                        size="small"
                        sx={{
                            fontWeight: 800,
                            bgcolor: 'rgba(100, 116, 139, 0.05)',
                            color: '#64748b',
                            border: '1px solid rgba(100, 116, 139, 0.1)',
                            borderRadius: '10px',
                            fontSize: '0.7rem'
                        }}
                    />
                ),
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 120,
                enableColumnFilter: false,
                enableSorting: false,
            }
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
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mr: 2, display: { xs: 'none', md: 'block' } }}>
                    Fournisseurs
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
                {UtilMethods.getHabilitations(authorizations, 'supply').canCreate && (
                    <Button
                        onClick={() => handleOpenFormModal()}
                        variant="contained"
                        startIcon={<Add />}
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
                        Nouveau Fournisseur
                    </Button>
                )}
                {UtilMethods.getHabilitations(authorizations, 'supply').canExport && (
                    <Button
                        variant="text"
                        startIcon={<FileDownload />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            color: '#64748b',
                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)', color: '#6366f1' }
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
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    });

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Administration" />
                <MaterialReactTable table={mrTable} />
            </motion.div>

            <CustomAlert
                openDetailModal={openDetailModal}
                content={{
                    style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: 'Voulez-vous vraiment supprimer ce fournisseur ?'
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress={inProgress}
            />
        </Box>
    );
}
