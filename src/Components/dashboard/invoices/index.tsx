'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext"
import constants from "Data/Utilities/constants"
import Breadcrumd from "Components/Breadcrumd"
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton,
    MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from 'material-react-table'
import { MRT_Localization_EN } from "material-react-table/locales/en"
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance'
import {
    Box, Typography, Tooltip, IconButton, Zoom,
    Button, Chip, Stack
} from "@mui/material"
import {
    Visibility, Download, Refresh, FileDownload,
    FilePresent, AccessTime, Person
} from '@mui/icons-material'
import UtilMethods from '@/Data/Utilities/UtilMethods'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setActivePage } from '@/Data/Slices/NavigationSlice'
import { Pages } from '@/Data/Objects/state'
import { IAppContext, IInvoice, IInvoiceTableData } from 'Interfaces'
import dayjs from "dayjs";
import SellAPI from "Data/Api/Sell.ts";
import StreamedDocumentAPI from "Data/Api/StreamedDocument.ts";

export default function IndexInvoice() {
    const context: IAppContext = useAppContext()

    const [isError, setIsError] = useState(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [, setReady] = useState(false)
    const [isRefetching, setIsRefetching] = useState(false)
    const [rowCount, setRowCount] = useState(0)
    const [columnFilters, setColumnFilters] = useState([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [sorting, setSorting] = useState([])
    const [rowSelection, setRowSelection] = useState({})
    const [records, setRecords] = useState<IInvoice[] | null>(null)
    const dispatch = useAppDispatch()
    const { authorizations } = useAppSelector(state => state.userAuthorizing)

    useLayoutEffect(() => {
        context.togglePageLoading()
        document.title = constants.APP_NAME + ' .:. Factures'
    }, [context])

    const resetScroll = () => {
        window.scrollTo(0, 0)
        const scrollableTableContainer = document.querySelector(".__table-container")
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0)
        }
    }

    const getRecords = useCallback(
        async () => {
            setIsLoading(true)
            const url = new URL(`${constants.BASE_URL}/invoices`)
            const filters = UtilMethods.formatTableFilters(columnFilters)
            const sortingTab = UtilMethods.formatTableSorting(sorting)
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`)
            url.searchParams.set("per_page", `${pagination.pageSize}`)
            url.searchParams.set("filters", JSON.stringify(filters))
            url.searchParams.set("q", globalFilter ?? "")
            url.searchParams.set("sorting", JSON.stringify(sortingTab))

            try {
                const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<IInvoice>>(url.href)
                const { data: invoiceList }: IApiResponsePaginated<IInvoice> = result
                if (status === 200) {
                    setRecords(invoiceList?.data)
                    setRowCount(invoiceList?.total)
                }
                resetScroll()
            } catch (error) {
                setIsError(true)
                setRecords([])
            } finally {
                setIsLoading(false)
                setIsRefetching(false)
                setReady(true)
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    )

    useEffect(() => {
        getRecords()
    }, [getRecords])

    const handleRefresh = async () => {
        setIsRefetching(true)
        await getRecords()
    }

    const handleDownload = async (_type: 'receipt' | 'invoice', record) => {
        try {
            context.togglePageLoading(true);
            setIsRefetching(true);
            
            if (_type === 'receipt') {
                try {
                    const invoiceResponse = await axiosInstance.get(`/invoices/${record.id}`);
                    const invoiceData = invoiceResponse.data.data;

                    if (invoiceData.sell_id) {
                        const sellId = invoiceData.sell_id;
                        console.log('Using sell_id from invoice:', sellId);
                        const response = await axiosInstance.get(`/sells/${sellId}/pdf-receipt`, {
                            responseType: 'blob'
                        });
                        const blob = new Blob([response.data], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                        setTimeout(() => URL.revokeObjectURL(url), 100);
                        return;
                    }
                    
                    throw new Error('Aucun receipt_number ou sell_id trouvé dans l\'invoice');
                    
                } catch (receiptError) {
                    console.error('Error getting receipt:', receiptError);
                    throw new Error('Impossible de récupérer le reçu: ' + (receiptError as Error).message);
                }
            } else {
                await StreamedDocumentAPI.generate('invoice', record.invoice_number);
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Erreur lors du téléchargement du document: ' + (error as Error).message);
        } finally {
            context.togglePageLoading(false);
            setIsRefetching(false);
        }
    };

    const tableData: IInvoiceTableData[] = useMemo(() => {
        return records ? records.map((_record) => ({
            ..._record,
            actions: (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Voir les détails" TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true);
                                dispatch(setActivePage({
                                    page: Pages.INVOICE,
                                    id: _record.id,
                                    param: { sub_page: 'READ' }
                                }));
                            }}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={_record.status === 'paid' ? "Télécharger Reçu" : "Télécharger Facture"} TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => handleDownload(_record.status === 'paid' ? 'receipt' : 'invoice', _record)}
                            sx={{ color: '#ec4899', bgcolor: 'rgba(236, 72, 153, 0.08)', '&:hover': { bgcolor: 'rgba(236, 72, 153, 0.15)' } }}
                        >
                            {_record.status === 'paid' ? <Download fontSize="small" /> : <FilePresent fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        })) : [];
    }, [records, context, dispatch]);

    const columns = useMemo<MRT_ColumnDef<IInvoiceTableData>[]>(
        () => [
            {
                accessorKey: "invoice_number",
                header: "N° Facture",
                size: 140,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '0.05em' }}>
                        {cell.getValue() as string}
                    </Typography>
                ),
            },
            {
                id: "client",
                header: "Client",
                size: 220,
                Cell: ({ row }) => {
                    const customer = row.original.sell?.person;

                    if (!customer) return (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                    -
                                </Typography>
                            </Box>
                        </Box>
                    );

                    const lastName = customer.lastname || "";
                    const firstName = customer.firstname || "";
                    const phone = customer.phone;
                    const address = customer.address;

                    return (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Person sx={{ fontSize: 16, color: '#64748b' }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                    {`${lastName} ${firstName}`.trim() || "N/A"}
                                </Typography>
                            </Box>
                            {phone && (
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px', ml: 3.5 }}>
                                    📞 {phone}
                                </Typography>
                            )}
                            {address && (
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px', ml: 3.5, display: 'block' }}>
                                    📍 {address}
                                </Typography>
                            )}
                        </Box>
                    );
                },
            },
            {
                accessorKey: "sell_code",
                header: "Code Vente",
                size: 120,
                Cell: ({ cell }) => (
                    <Chip
                        label={cell.getValue() as string}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', fontWeight: 700, borderRadius: '8px', color: '#475569' }}
                    />
                ),
            },
            {
                accessorKey: "total_amount",
                header: "Montant Total",
                size: 150,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#0f172a' }}>
                        {UtilMethods.formatNumber(cell.getValue() as number)}
                    </Typography>
                ),
            },
            {
                accessorKey: "amount_paid",
                header: "Payé",
                size: 130,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>
                        {UtilMethods.formatNumber(cell.getValue() as number)}
                    </Typography>
                ),
            },
            {
                accessorKey: "remaining_balance",
                header: "Reste",
                size: 130,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as number;
                    return (
                        <Typography variant="body2" sx={{ fontWeight: 800, color: value > 0 ? '#ef4444' : '#64748b' }}>
                            {UtilMethods.formatNumber(value)}
                        </Typography>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Statut",
                size: 120,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as string;
                    const isPaid = value === SellAPI.PAID;
                    return (
                        <Chip
                            label={isPaid ? 'PAYÉ' : 'IMPAYÉ'}
                            size="small"
                            sx={{
                                fontWeight: 900,
                                fontSize: '0.65rem',
                                bgcolor: isPaid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                color: isPaid ? '#10b981' : '#f59e0b',
                                border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                                borderRadius: '10px'
                            }}
                        />
                    );
                },
                filterVariant: "select",
                filterSelectOptions: [
                    { label: 'Impayé', value: SellAPI.UNPAID },
                    { label: 'Payé', value: SellAPI.PAID }
                ],
            },
            {
                accessorKey: "date_to_pay",
                header: "Échéance",
                size: 160,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as string;
                    return value ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                                {dayjs(value).format("DD MMM YYYY")}
                            </Typography>
                        </Box>
                    ) : '-';
                },
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 100,
                enableColumnFilter: false,
                enableSorting: false,
            },
        ],
        []
    )

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
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mr: 2 }}>
                    Gestion des Factures
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
                {UtilMethods.getHabilitations(authorizations, 'invoice').canExport && (
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
    })

    return (
        <Box>
            <Breadcrumd parent="Invoices" />
            <MaterialReactTable table={mrTable} />
        </Box>
    )
}
