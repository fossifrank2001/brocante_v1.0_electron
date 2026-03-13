import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Breadcrumd from '@/Components/Breadcrumd';
import constants from '@/Data/Utilities/constants';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton,
    MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    CircularProgress,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Stack,
    IconButton,
    Tooltip,
    Zoom,
} from '@mui/material';
import {
    Add as AddIcon,
    Inventory as InventoryIcon,
    TrendingUp,
    TrendingDown,
    SwapVert,
    Refresh,
} from '@mui/icons-material';
import StockMovementAPI from '@/Data/Api/StockMovement';
import { IStockMovement, StockMovementType, IStockMovementPayload } from '@/Data/Interfaces/StockMovement';
import Toast from '@/Data/Utilities/Toast';
import {motion} from "framer-motion";

const typeConfig: Record<StockMovementType, { label: string; color: any; icon: React.ReactNode }> = {
    sale: { label: 'Vente', color: 'error', icon: <TrendingDown fontSize="small" /> },
    sale_cancel: { label: 'Annul. vente', color: 'warning', icon: <TrendingUp fontSize="small" /> },
    refund: { label: 'Remboursement', color: 'warning', icon: <TrendingUp fontSize="small" /> },
    adjustment: { label: 'Ajustement', color: 'info', icon: <SwapVert fontSize="small" /> },
    purchase: { label: 'Achat/Entrée', color: 'success', icon: <TrendingUp fontSize="small" /> },
    transfer_in: { label: 'Transfert +', color: 'success', icon: <TrendingUp fontSize="small" /> },
    transfer_out: { label: 'Transfert -', color: 'error', icon: <TrendingDown fontSize="small" /> },
    loss: { label: 'Perte', color: 'error', icon: <TrendingDown fontSize="small" /> },
    return: { label: 'Retour', color: 'success', icon: <TrendingUp fontSize="small" /> },
    initial: { label: 'Stock initial', color: 'default', icon: <InventoryIcon fontSize="small" /> },
};

const manualTypes = [
    { value: 'purchase', label: 'Achat / Entrée de stock' },
    { value: 'adjustment', label: 'Ajustement manuel' },
    { value: 'loss', label: 'Perte / Casse' },
    { value: 'return', label: 'Retour fournisseur' },
    { value: 'initial', label: 'Stock initial' },
];

const StockMovementsPage: React.FC = () => {
    const [movements, setMovements] = useState<IStockMovement[]>([]);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 15,
    });
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newMovement, setNewMovement] = useState<IStockMovementPayload>({
        product_id: 0,
        type: 'purchase',
        quantity: 0,
        reason: '',
        reference: '',
    });
    const [products, setProducts] = useState<Array<{ id: number; name: string; stock_quantity: number }>>([]);

    const fetchMovements = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);

            const url = new URL(`${constants.BASE_URL}/stock-movements`);
            url.searchParams.set('page', `${pagination.pageIndex + 1}`);
            url.searchParams.set('per_page', `${pagination.pageSize}`);

            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);

            url.searchParams.set('filters', JSON.stringify(filters));
            url.searchParams.set('q', globalFilter ?? '');
            url.searchParams.set('sorting', JSON.stringify(sortingTab));

            // Compat backend existant: si l'API lit encore `type` / `reference` comme params simples
            if (filters?.type) {
                url.searchParams.set('type', String(filters.type));
            }
            if (filters?.reference) {
                url.searchParams.set('reference', String(filters.reference));
            }

            const response = await StockMovementAPI.index(Object.fromEntries(url.searchParams.entries()));
            const data = response.data;
            setMovements(data?.data || []);
            setRowCount(data?.total || 0);
        } catch (e) {
            console.error('Error fetching stock movements:', e);
            setIsError(true);
            setMovements([]);
        } finally {
            setIsLoading(false);
            setIsRefetching(false);
        }
    }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

    const fetchProducts = useCallback(async () => {
        try {
            const { default: ProductAPI } = await import('@/Data/Api/Product');
            const response = await ProductAPI.index();
            const data = (response as any)?.data;
            const productList = data?.data || data || [];
            setProducts(Array.isArray(productList) ? productList : []);
        } catch (e) {
            console.error('Error fetching products:', e);
        }
    }, []);

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    useLayoutEffect(() => {
        document.title = constants.APP_NAME + ' .:. Mouvements de stock';
    }, []);

    const handleOpenDialog = () => {
        fetchProducts();
        setNewMovement({ product_id: 0, type: 'purchase', quantity: 0, reason: '', reference: '' });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!newMovement.product_id || !newMovement.quantity || !newMovement.reason) {
            Toast.error('Veuillez remplir tous les champs obligatoires', 2000, 'top-right');
            return;
        }
        try {
            setSubmitting(true);
            await StockMovementAPI.store(newMovement);
            Toast.success('Mouvement de stock enregistré', 2000, 'top-right');
            setDialogOpen(false);
            fetchMovements();
        } catch (e: any) {
            Toast.error(e?.message || 'Erreur', 2000, 'top-right');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    const handleRefresh = () => {
        setIsRefetching(true);
        fetchProducts();
        fetchMovements();
    };

    const columns = useMemo<MRT_ColumnDef<IStockMovement>[]>(
        () => [
            {
                accessorKey: 'created_at',
                header: 'Date',
                size: 170,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                        {formatDate(String(cell.getValue()))}
                    </Typography>
                ),
            },
            {
                id: 'product',
                header: 'Produit',
                size: 260,
                Cell: ({ row }) => (
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {row.original.product?.name || `#${row.original.product_id}`}
                        </Typography>
                        {row.original.product?.internal_reference && (
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {row.original.product.internal_reference}
                            </Typography>
                        )}
                    </Box>
                ),
            },
            {
                accessorKey: 'type',
                header: 'Type',
                size: 150,
                filterVariant: 'select',
                filterSelectOptions: Object.entries(typeConfig).map(([key, v]) => ({
                    label: v.label,
                    value: key,
                })),
                Cell: ({ cell }) => {
                    const t = cell.getValue<StockMovementType>();
                    const config = typeConfig[t] || typeConfig.adjustment;
                    return (
                        <Chip
                            icon={config.icon as any}
                            label={config.label}
                            color={config.color}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                        />
                    );
                },
            },
            {
                accessorKey: 'quantity',
                header: 'Qté',
                size: 90,
                Cell: ({ cell }) => {
                    const qty = Number(cell.getValue());
                    return (
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 900,
                                color: qty > 0 ? '#16a34a' : qty < 0 ? '#dc2626' : '#0f172a',
                                textAlign: 'right',
                            }}
                        >
                            {qty > 0 ? '+' : ''}{qty}
                        </Typography>
                    );
                },
            },
            {
                accessorKey: 'stock_before',
                header: 'Avant',
                size: 100,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ textAlign: 'right', color: '#334155', fontWeight: 700 }}>
                        {Number(cell.getValue())}
                    </Typography>
                ),
            },
            {
                accessorKey: 'stock_after',
                header: 'Après',
                size: 100,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ textAlign: 'right', color: '#0f172a', fontWeight: 900 }}>
                        {Number(cell.getValue())}
                    </Typography>
                ),
            },
            {
                accessorKey: 'reference',
                header: 'Référence',
                size: 180,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {(cell.getValue() as string) || '—'}
                    </Typography>
                ),
            },
            {
                accessorKey: 'reason',
                header: 'Motif',
                size: 280,
                Cell: ({ cell }) => (
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#334155',
                            maxWidth: 340,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {(cell.getValue() as string) || '—'}
                    </Typography>
                ),
            },
            {
                id: 'user',
                header: 'Utilisateur',
                size: 200,
                Cell: ({ row }) => (
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>
                        {row.original.user ? `${row.original.user.first_name} ${row.original.user.last_name}` : '—'}
                    </Typography>
                ),
            },
        ],
        [],
    );

    const mrTable = useMaterialReactTable({
        columns,
        data: movements,
        enableRowSelection: true,
        enableColumnActions: false,
        initialState: {
            showColumnFilters: true,
            density: "comfortable",
        },
        enableStickyHeader: true,
        enableColumnFilters: true,
        enableSorting: true,
        enablePagination: true,
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
        rowCount,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
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
        localization: MRT_Localization_EN,
        muiToolbarAlertBannerProps: isError
        ? {
            color: "error",
            children: "Erreur lors du chargement des données",
        }
        : undefined,
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: 2, p: 2, alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                    Stock movements
                </Typography>
                <Tooltip title="Rafraîchir" TransitionComponent={Zoom} arrow>
                    <motion.div whileTap={{ scale: 0.93 }}>
                        <Button
                            onClick={handleRefresh}
                            variant="outlined"
                            startIcon={<Refresh />}
                            disabled={isLoading || isRefetching}
                            sx={{
                                borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                                borderColor: '#e2e8f0', color: '#64748b', px: 2.5,
                                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                            }}
                        >
                            Actualiser
                        </Button>
                    </motion.div>
                </Tooltip>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    sx={{
                        borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 3,
                        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                        boxShadow: '0 8px 16px -4px rgba(99,102,241,0.3)',
                        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 20px -4px rgba(99,102,241,0.4)' }
                    }}
                >
                    Nouveau mouvement
                </Button>
            </Box>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: 0.5, pr: 2 }}>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleDensePaddingButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    });

    return (
        <Box>
            <Breadcrumd parent="Stock movements" />
            <MaterialReactTable table={mrTable} />

            {/* Dialog: New Movement */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon color="primary" />
                    Nouveau mouvement de stock
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Produit"
                                value={newMovement.product_id || ''}
                                onChange={e => setNewMovement(prev => ({ ...prev, product_id: Number(e.target.value) }))}
                                fullWidth
                                size="small"
                                required
                            >
                                <MenuItem value="" disabled>Sélectionner un produit</MenuItem>
                                {products.map(p => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.name} — stock: {p.stock_quantity}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Type de mouvement"
                                value={newMovement.type}
                                onChange={e => setNewMovement(prev => ({ ...prev, type: e.target.value as any }))}
                                fullWidth
                                size="small"
                                required
                            >
                                {manualTypes.map(t => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Quantité"
                                type="number"
                                value={newMovement.quantity || ''}
                                onChange={e => setNewMovement(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                                fullWidth
                                size="small"
                                required
                                helperText={newMovement.type === 'loss' ? 'Sera soustrait du stock' : 'Sera ajouté au stock'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Motif / Raison"
                                value={newMovement.reason}
                                onChange={e => setNewMovement(prev => ({ ...prev, reason: e.target.value }))}
                                fullWidth
                                size="small"
                                required
                                multiline
                                rows={2}
                                placeholder="Expliquez la raison de ce mouvement..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Référence (optionnel)"
                                value={newMovement.reference || ''}
                                onChange={e => setNewMovement(prev => ({ ...prev, reference: e.target.value }))}
                                fullWidth
                                size="small"
                                placeholder="N° bon de livraison, N° facture fournisseur..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>Annuler</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StockMovementsPage;
