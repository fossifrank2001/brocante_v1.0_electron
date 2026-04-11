'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext";
import constants from "@/Data/Utilities/constants";
import Breadcrumd from "@/Components/Breadcrumd";
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton,
    MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from '@/Data/Utilities/axiosInstance';
import {
    Box, Typography, Tooltip, IconButton, Zoom,
    Button, Chip, Stack, Avatar
} from "@mui/material";
import {
    Visibility, Edit, Delete, Refresh, Add,
    FileDownload, Inventory2, LocalOffer,
    Warning
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { Pages } from '@/Data/Objects/state';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import CustomAlert from '@/Components/CustomAlert';
import Toast from '@/Data/Utilities/Toast';
import { IProduct, IProductTableData, ISupply } from '@/Data/Interfaces/Supply';
import ProductAPI from "@/Data/Api/Product";
import SupplyAPI from "@/Data/Api/Suppliers";
import dayjs from "dayjs";
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

export default function IndexProduct() {
    const { t } = useTranslation();
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [productId, setProductId] = useState<number | null>(null);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState<never[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<never[]>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [products, setProducts] = useState<IProduct[] | null>(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const dispatch = useAppDispatch();
    const { authorizations } = useAppSelector(state => state.userAuthorizing);
    const [suppliers, setSuppliers] = useState<ISupply[]>([]);

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. ' + t('navigation.products');
    }, [context, t]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const el = document.querySelector(".__table-container");
        if (el) el.scrollTo(0, 0);
    };

    const getProducts = useCallback(async () => {
        setIsLoading(true);
        const url = new URL(`${constants.BASE_URL}/products`);
        const filters = UtilMethods.formatTableFilters(columnFilters);
        const sortingTab = UtilMethods.formatTableSorting(sorting);
        url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
        url.searchParams.set("per_page", `${pagination.pageSize}`);
        url.searchParams.set("filters", JSON.stringify(filters));
        url.searchParams.set("q", globalFilter ?? "");
        url.searchParams.set("sorting", JSON.stringify(sortingTab));

        try {
            const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<IProduct>>(url.href);
            if (status === 200 && result.data) {
                setProducts(result.data.data);
                setRowCount(result.data.total);
            }
            resetScroll();
        } catch {
            setIsError(true);
            setProducts([]);
        } finally {
            setIsLoading(false);
            setIsRefetching(false);
        }
    }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, isDeleted]);

    const getSuppliers = useCallback(async () => {
        try {
            const { data: __suppliers } = await SupplyAPI.index();
            if (__suppliers) setSuppliers(__suppliers as any);
        } catch (e) {
            console.error('Error fetching suppliers', e);
        }
    }, []);

    useEffect(() => {
        getProducts();
        getSuppliers();
    }, [getProducts, isDeleted, getSuppliers]);

    const handleRefresh = () => {
        setIsRefetching(true);
        getProducts();
        getSuppliers();
    };

    const tableData: IProductTableData[] = useMemo(() => {
        return products ? products.map((product) => ({
            ...product,
            status: product?.stock_quantity > 0 ? ProductAPI.STOCK : ProductAPI.OUT_OF_STOCK,
            actions: (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title={t('common.viewDetails')} TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({ page: Pages.ARTICLE, id: product.id, param: { sub_page: 'READ' } }));
                            }}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)', '&:hover': { bgcolor: 'rgba(99,102,241,0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Visibility sx={{ fontSize: '17px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.edit')} TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({ page: Pages.ARTICLE, id: product.id, param: { sub_page: 'UPDATE' } }));
                            }}
                            sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)', '&:hover': { bgcolor: 'rgba(245,158,11,0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Edit sx={{ fontSize: '17px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')} TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => { setProductId(product.id); setOpenDetailModal(true); }}
                            sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)', '&:hover': { bgcolor: 'rgba(239,68,68,0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Delete sx={{ fontSize: '17px' }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        })) : [];
    }, [products, context, dispatch, t]);

    const columns: MRT_ColumnDef<IProductTableData>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: t('common.product'),
            size: 220,
            Cell: ({ cell, row }) => {
                const inStock = (row.original as any).stock_quantity > 0;
                const initials = (cell.getValue() as string).substring(0, 2).toUpperCase();
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: inStock ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.2) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.15) 100%)',
                            color: inStock ? '#059669' : '#dc2626',
                            fontWeight: 900, fontSize: '0.8rem',
                            border: `2px solid ${inStock ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
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
            accessorKey: "internal_reference",
            header: t('product.internalRef'),
            size: 130,
            Cell: ({ cell }) => (
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', fontFamily: 'monospace' }}>
                    {cell.getValue() as string || '-'}
                </Typography>
            ),
        },
        {
            accessorKey: "barcode",
            header: t('product.barcode'),
            size: 130,
            Cell: ({ cell }) => (
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', fontFamily: 'monospace' }}>
                    {cell.getValue() as string || '-'}
                </Typography>
            ),
        },
        {
            accessorKey: "qrcode_data",
            header: "QR Code",
            size: 100,
            Cell: ({ cell }) => (
                cell.getValue() ? (
                    <Tooltip
                        title={
                            <Box sx={{ p: 1, bgcolor: 'white', borderRadius: '8px' }}>
                                <QRCodeCanvas
                                    value={cell.getValue() as string}
                                    size={150}
                                    level="H"
                                    includeMargin={true}
                                />
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#1e293b', fontWeight: 700 }}>
                                    {cell.getValue() as string}
                                </Typography>
                            </Box>
                        }
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    bgcolor: 'white',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid #e2e8f0',
                                    p: 0
                                }
                            }
                        }}
                        arrow
                    >
                        <Box sx={{ cursor: 'zoom-in', display: 'inline-block', p: 0.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <QRCodeCanvas
                                value={cell.getValue() as string}
                                size={32}
                                level="M"
                            />
                        </Box>
                    </Tooltip>
                ) : (
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontStyle: 'italic' }}>{t('product.notGenerated')}</Typography>
                )
            ),
        },
        {
            accessorKey: "price",
            header: t('product.unitPrice'),
            size: 140,
            Cell: ({ cell, row }) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>
                        {UtilMethods.formatAmount(cell.getValue<number>())}
                    </Typography>
                    {(row.original as any).unit?.abbreviation && (row.original as any).unit?.abbreviation !== 'pce' && (
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                            {t('product.per')} {(row.original as any).unit.abbreviation}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            accessorKey: "stock_quantity",
            header: t('product.productStock'),
            size: 110,
            Cell: ({ cell, row }) => {
                const qty = cell.getValue<number>();
                const isLow = qty > 0 && qty <= 5;
                const isOut = qty === 0;
                const unit = (row.original as any).unit?.abbreviation || 'pce';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isOut && <Warning sx={{ fontSize: 14, color: '#ef4444' }} />}
                        <Box>
                            <Typography variant="body2" sx={{
                                fontWeight: 800, fontSize: '0.9rem',
                                color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981'
                            }}>
                                {qty}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                {unit}
                            </Typography>
                        </Box>
                    </Box>
                );
            },
        },
        {
            accessorKey: "status",
            header: t('product.availability'),
            size: 140,
            enableColumnFilter: false,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                const inStock = value === ProductAPI.STOCK;
                return (
                    <Chip
                        icon={<Inventory2 sx={{ fontSize: '14px !important' }} />}
                        label={inStock ? t('product.inStock') : t('product.outOfStock')}
                        size="small"
                        sx={{
                            fontWeight: 900,
                            bgcolor: inStock ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: inStock ? '#059669' : '#dc2626',
                            border: `1px solid ${inStock ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            borderRadius: '10px',
                        }}
                    />
                );
            },
        },
        {
            accessorKey: "suppliers",
            header: t('navigation.suppliers'),
            size: 180,
            Cell: ({ cell }) => {
                const value = cell.getValue<ISupply[]>();
                if (!value || value.length === 0) return (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{t('common.none')}</Typography>
                );
                return (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {value.map((s) => (
                            <Chip
                                key={s.id || s.name}
                                label={s.name}
                                size="small"
                                icon={<LocalOffer sx={{ fontSize: '12px !important' }} />}
                                sx={{ bgcolor: '#f8fafc', fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px', color: '#475569', border: '1px solid #e2e8f0' }}
                            />
                        ))}
                    </Stack>
                );
            },
            filterVariant: 'select',
            filterSelectOptions: suppliers.map(s => ({ label: s.name, value: s.contact_info })),
        },
        {
            accessorKey: "created_at",
            header: t('common.date'),
            size: 150,
            enableColumnFilter: false,
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>
                        {dayjs(value).format('DD MMM YYYY')}
                    </Typography>
                );
            },
        },
        {
            accessorKey: "actions",
            header: t('common.actions'),
            size: 120,
            enableColumnFilter: false,
            enableSorting: false,
        },
    ], [suppliers, t]);

    const table = useMaterialReactTable({
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
                border: '1px solid rgba(255,255,255,0.4)',
                bgcolor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                overflow: 'hidden',
            }
        },
        muiTableContainerProps: {
            className: "__table-container",
            sx: { maxHeight: '600px' }
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: 'rgba(248,250,252,0.5)',
                color: '#64748b',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                py: 2,
            }
        },
        muiTableBodyRowProps: {
            sx: {
                '&:hover': {
                    bgcolor: 'rgba(99,102,241,0.03) !important',
                    transition: 'all 0.2s',
                }
            }
        },
        localization: MRT_Localization_EN,
        muiToolbarAlertBannerProps: isError
            ? { color: "error", children: t('common.errorLoading') }
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
                    {t('navigation.products')}
                </Typography>
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
                        {t('common.refresh')}
                    </Button>
                </motion.div>
                {UtilMethods.getHabilitations(authorizations, 'article').canCreate && (
                    <motion.div whileTap={{ scale: 0.93 }}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({ page: Pages.ARTICLE, param: { sub_page: "CREATE" } }));
                            }}
                            sx={{
                                borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 3,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                boxShadow: '0 8px 16px -4px rgba(99,102,241,0.3)',
                                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 20px -4px rgba(99,102,241,0.4)' }
                            }}
                        >
                            {t('common.add')}
                        </Button>
                    </motion.div>
                )}
                {UtilMethods.getHabilitations(authorizations, 'article').canExport && (
                    <Button
                        variant="outlined"
                        startIcon={<FileDownload />}
                        sx={{
                            borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2.5,
                            borderColor: 'rgba(16,185,129,0.3)', color: '#059669',
                            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16,185,129,0.05)' }
                        }}
                    >
                        {t('product.export')}
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

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true);
            setInProgress(true);
            const { message } = await ProductAPI.delete(productId!);
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
        <Box>
            <Breadcrumd parent={t('menu.ARTICLE')} />
            <MaterialReactTable table={table} />
            <CustomAlert
                openDetailModal={openDetailModal}
                content={{
                    style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: t('product.deleteConfirm')
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress={inProgress}
            />
        </Box>
    );
}