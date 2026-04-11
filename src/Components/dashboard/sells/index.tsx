'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext"
import constants from "Data/Utilities/constants"
import Breadcrumd from "Components/Breadcrumd"
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleFiltersButton,
    MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from 'material-react-table'
import { MRT_Localization_EN } from "material-react-table/locales/en"
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance'
import { Autocomplete, Box, Stack, TextField, Typography, Chip, IconButton, Tooltip, Zoom, Button } from "@mui/material"
import {Visibility, Edit, Refresh, Add, Person, Download} from '@mui/icons-material'
import UtilMethods from '@/Data/Utilities/UtilMethods'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setActivePage } from '@/Data/Slices/NavigationSlice'
import { Pages } from '@/Data/Objects/state'
import { ISell, ISellTableData } from 'Data/Interfaces/Sell.ts'
import SellAPI from "Data/Api/Sell.ts"
import { IAppContext, IPerson, IPersonList } from 'Interfaces'
import CustomerAPI from "Data/Api/Customer.ts"
import { useTranslation } from 'react-i18next';

export default function IndexSell() {
    const { t } = useTranslation()
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
    const [sells, setSells] = useState<ISell[] | null>(null)
    const dispatch = useAppDispatch()
    const { authorizations } = useAppSelector(state => state.userAuthorizing)
    const [customers, setCustomers] = useState<IPerson[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<IPerson | null>(null)
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)

    useLayoutEffect(() => {
        context.togglePageLoading()
        document.title = constants.APP_NAME + ' .:. ' + t('navigation.sales')
    }, [context, t])

    const resetScroll = () => {
        window.scrollTo(0, 0)
        const scrollableTableContainer = document.querySelector(".__table-container")
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0)
        }
    }

    const getSells = useCallback(
        async () => {
            setIsLoading(true)
            const url = new URL(`${constants.BASE_URL}/sells`)
            const filters = UtilMethods.formatTableFilters(columnFilters)
            const sortingTab = UtilMethods.formatTableSorting(sorting)
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`)
            url.searchParams.set("per_page", `${pagination.pageSize}`)
            url.searchParams.set("filters", JSON.stringify(filters))
            url.searchParams.set("q", globalFilter ?? "")
            url.searchParams.set("sorting", JSON.stringify(sortingTab))

            try {
                const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<ISell>>(url.href)
                const { data: sellList }: IApiResponsePaginated<ISell> = result
                if (status === 200) {
                    setSells(sellList?.data)
                    setRowCount(sellList?.total)
                }
                resetScroll()
            } catch (error) {
                setIsError(true)
                setSells([])
            } finally {
                setIsLoading(false)
                setIsRefetching(false)
                setReady(true)
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    )

    const getCustomers = useCallback(async (query: string) => {
        setIsLoadingCustomers(true)
        try {
            const { data: _customers }: never = await CustomerAPI.get(query)
            const { data }: IPersonList = _customers
            setCustomers(data)
        } catch (e) {
            console.error("Error while loading customers for sell list:", e)
            setCustomers([])
        } finally {
            setIsLoadingCustomers(false)
        }
    }, [])

    useEffect(() => {
        getSells()
    }, [getSells])

    useEffect(() => {
        getCustomers("")
    }, [getCustomers])

    const handleRefresh = async () => {
        setIsRefetching(true)
        await getSells()
        await getCustomers("")
    }

    const tableData: ISellTableData[] = useMemo(() => {
        return sells ? sells.map((_sell) => ({
            ..._sell,
            person_id: _sell?.person ? `${_sell.person.lastname || ""} ${_sell.person.firstname || ""}` : "-",
            actions: (
                <Stack direction="row" spacing={1}>
                    <Tooltip title={t('common.viewDetails')} arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true)
                                dispatch(setActivePage({
                                    page: Pages.SELL,
                                    id: _sell.id,
                                    param: {
                                        sub_page: 'READ'
                                    }
                                }))
                            }}
                            sx={{ color: '#4f46e5', bgcolor: 'rgba(79, 70, 229, 0.05)', '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.15)' } }}
                        >
                            <Visibility sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.edit')} arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                context.togglePageLoading(true)
                                dispatch(setActivePage({
                                    page: Pages.SELL,
                                    id: _sell.id,
                                    param: {
                                        sub_page: 'UPDATE'
                                    }
                                }))
                            }}
                            sx={{ color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.05)', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.15)' } }}
                        >
                            <Edit sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        })) : []
    }, [sells, context, dispatch])

    const columns = useMemo<MRT_ColumnDef<ISellTableData>[]>(
        () => [
            {
                accessorKey: "sell_code",
                header: t('common.reference'),
                size: 120,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        #{cell.getValue() as string}
                    </Typography>
                ),
            },
            {
                accessorKey: "total_amount",
                header: t('sell.totalAmount'),
                size: 150,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        {UtilMethods.formatAmount(cell.getValue() as number)}
                    </Typography>
                ),
            },
            {
                accessorKey: "transaction_type",
                header: t('common.type'),
                size: 130,
                Cell: ({ cell }) => (
                    <Chip
                        label={t('sell.transactionType.' + String(cell.getValue()))}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                    />
                ),
                filterVariant: "select",
                filterSelectOptions: [
                    { label: t('sell.transactionType.total'), value: 'total' },
                    { label: t('sell.transactionType.advance'), value: 'advance' },
                    { label: t('sell.transactionType.loan'), value: 'loan' }
                ],
            },
            {
                accessorKey: "person_id",
                header: t('sell.customer'),
                size: 240,
                Cell: ({ row }) => {
                    const person = row.original.person;

                    if (!person) return (
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}> - </Typography>
                        </Box>
                    );

                    const lastName = person.lastname || "";
                    const firstName = person.firstname || "";
                    const phone = person.phone;
                    const address = (person as any).address;

                    return (
                        <Box>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1,fontWeight: 700, color: '#334155', mb: 0.5 }}>
                                <Person sx={{ fontSize: 16, color: '#64748b' }} /> {`${lastName} ${firstName}`.trim() || "N/A"}
                            </Typography>
                            {phone && (
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px', display: 'block' }}>
                                    📞 {phone}
                                </Typography>
                            )}
                            {address && (
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px', display: 'block' }}>
                                    📍 {address}
                                </Typography>
                            )}
                        </Box>
                    );
                },
                Filter: ({ column }) => (
                    <Autocomplete
                        options={customers || []}
                        getOptionLabel={(option: IPerson) => option ? `${option.lastname || ""} ${option.firstname || ""}` : ""}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                placeholder={t('sell.filterByCustomer')}
                                size="small"
                            />
                        )}
                        onChange={(_, newValue) => {
                            setSelectedCustomer(newValue)
                            column.setFilterValue(newValue ? newValue.id : null)
                        }}
                        value={selectedCustomer}
                        onInputChange={(_, newInputValue) => {
                            getCustomers(newInputValue.trim())
                        }}
                        loading={isLoadingCustomers}
                    />
                ),
            },
            {
                accessorKey: "status",
                header: t('common.status'),
                size: 130,
                Cell: ({ cell }) => {
                    const value = String(cell.getValue())
                    return (
                        <Chip
                            label={t(`sales.status.${value}`)}
                            size="small"
                            sx={{
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                bgcolor: value === 'paid' ? 'rgba(16, 185, 129, 0.1)' :
                                    value === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: value === 'paid' ? '#10b981' :
                                    value === 'pending' ? '#f59e0b' : '#ef4444',
                                border: 'none'
                            }}
                        />
                    )
                },
                filterVariant: "select",
                filterSelectOptions: [{
                    label: t('sales.status.pending'),
                    value: SellAPI.PENDING
                }, {
                    label: t('sales.status.paid'),
                    value: SellAPI.PAID
                }, {
                    label: t('sales.status.partially_paid'),
                    value: SellAPI.PARTIALLY_PAID
                }, {
                    label: t('sales.status.canceled'),
                    value: SellAPI.CANCELLED
                }],
            },
            {
                accessorKey: "actions",
                header: t('common.actions'),
                size: 100,
                enableColumnFilter: false,
            },
        ],
        [customers, selectedCustomer, isLoadingCustomers, getCustomers, t]
    )

    const mrTable = useMaterialReactTable({
        columns: columns,
        data: tableData,
        enableRowSelection: true,
        enableStickyHeader: true,
        initialState: {
            showColumnFilters: false,
            density: "comfortable",
        },
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        muiTablePaperProps: {
            sx: {
                borderRadius: '24px',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                overflow: 'hidden'
            }
        },
        muiTableContainerProps: {
            sx: { maxHeight: '600px' }
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: '#f8fafc',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                py: 2
            }
        },
        muiTableBodyRowProps: {
            sx: {
                '&:hover': {
                    bgcolor: 'rgba(79, 70, 229, 0.02) !important'
                }
            }
        },
        localization: MRT_Localization_EN,
        muiToolbarAlertBannerProps: isError
            ? {
                color: "error",
                children: t('template.loadError'),
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
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mr: 2 }}>
                    {t('navigation.sales')}
                </Typography>
                <Button
                    variant="outlined"
                    onClick={handleRefresh}
                    startIcon={<Refresh />}
                    disabled={isLoading || isRefetching}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                >
                    {t('common.refresh')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={async () => {
                        try {
                            setIsLoading(true);
                            const url = new URL(`${constants.BASE_URL}/sells/export-csv`);
                            const filters = UtilMethods.formatTableFilters(columnFilters);
                            const sortingTab = UtilMethods.formatTableSorting(sorting);
                            url.searchParams.set("filters", JSON.stringify(filters));
                            url.searchParams.set("q", globalFilter ?? "");
                            url.searchParams.set("sorting", JSON.stringify(sortingTab));
                            
                            const response = await axiosInstance.get(url.href, {
                                responseType: 'blob'
                            });
                            
                            const blob = new Blob([response.data as any], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            const downloadUrl = window.URL.createObjectURL(blob);
                            link.href = downloadUrl;
                            link.setAttribute('download', `sales_export_${new Date().getTime()}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        } catch (e) {
                            console.error("Export error", e);
                        } finally {
                            setIsLoading(false);
                            setIsRefetching(false);
                        }
                    }}
                    startIcon={<Download />}
                    disabled={isLoading || isRefetching || rowCount === 0}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                >
                    {t('sell.exportCsv')}
                </Button>
                {UtilMethods.getHabilitations(authorizations, 'sell').canCreate && (
                    <Button
                        variant="contained"
                        onClick={() => {
                            context.togglePageLoading(true)
                            dispatch(setActivePage({
                                page: Pages.SELL,
                                param: {
                                    sub_page: "CREATE"
                                }
                            }))
                        }}
                        startIcon={<Add />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                        }}
                    >
                        {t('sale.newSale')}
                    </Button>
                )}
            </Box>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 2 }}>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    })

    return (
        <Box>
            <Breadcrumd parent="Accueil" />
            <Box sx={{ mt: 2 }}>
                <MaterialReactTable table={mrTable} />
            </Box>
        </Box>
    )
}
