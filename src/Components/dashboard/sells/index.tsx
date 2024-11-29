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
import { Autocomplete, Box, Link, Stack, TextField } from "@mui/material"
import UtilMethods from '@/Data/Utilities/UtilMethods'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setActivePage } from '@/Data/Slices/NavigationSlice'
import { Pages } from '@/Data/Objects/state'
import { ISell, ISellTableData } from 'Data/Interfaces/Sell.ts'
import SellAPI from "Data/Api/Sell.ts"
import { IAppContext, IPerson, IPersonList } from 'Interfaces'
import CustomerAPI from "Data/Api/Customer.ts"

export default function IndexSell() {
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
        document.title = constants.APP_NAME + ' .:. Sells'
    }, [context])

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
            const { data: _customers }:never = await CustomerAPI.get(query)
            const {data}:IPersonList = _customers
            console.log("Customer", data)
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
            person_id: `${_sell?.person.lastname || ""} ${_sell?.person.firstname || ""}`,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true)
                            dispatch(setActivePage({
                                page: Pages.SELL,
                                id: _sell.id,
                                param: {
                                    sub_page: 'READ'
                                }
                            }))
                        }}>
                        <i color="primary" className="ti ti-eye text-dark"></i>
                    </Link>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true)
                            dispatch(setActivePage({
                                page: Pages.SELL,
                                id: _sell.id,
                                param: {
                                    sub_page: 'UPDATE'
                                }
                            }))
                        }}>
                        <i color="primary" className="ti ti-pencil"></i>
                    </Link>
                </Stack>
            ),
        })) : []
    }, [sells, context, dispatch])

    const columns = useMemo<MRT_ColumnDef<ISellTableData>[]>(
        () => [
            {
                accessorKey: "sell_code",
                header: "Sell Code",
                size: 100,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeholder: "filter" },
                }),
            },
            {
                accessorKey: "total_amount",
                header: "Total Amount",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as number
                    return value ? UtilMethods.formatNumber(value) : null
                },
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeholder: "filter" },
                }),
            },
            {
                accessorKey: "transaction_type",
                header: "Transaction Type",
                size: 150,
                filterVariant: "select",
                filterSelectOptions: ['Total', 'Advance', 'Loan']?.map(_type => ({
                    label: _type,
                    value: _type.toLowerCase()
                })) ?? [],
            },
            {
                accessorKey: "person_id",
                header: "Customer",
                size: 150,
                Filter: ({ column }) => (
                    <Autocomplete
                        options={customers}
                        getOptionLabel={(option: IPerson) => `${option.lastname} ${option.firstname}`}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                placeholder="Filter customers"
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
                        loadingText="Loading..."
                        noOptionsText="No options"
                    />
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue()
                    const status = typeof value === 'string' ? UtilMethods.getStatus(value) : ''
                    return <span className={status}>{String(value)}</span>
                },
                enableColumnFilter: false,
                filterVariant: "select",
                filterSelectOptions: [{
                    label: 'Pending',
                    value: SellAPI.PENDING
                }, {
                    label: 'Paid',
                    value: SellAPI.PAID
                }, {
                    label: 'Partially paid',
                    value: SellAPI.PARTIALLY_PAID
                }, {
                    label: 'Canceled',
                    value: SellAPI.CANCELLED
                }],
            },
            {
                accessorKey: "cancel_reason",
                header: "Cancel Reason",
                size: 150,
                enableColumnFilter: false,
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 150,
                unexport: true,
                enableColumnFilter: false,
            },
        ],
        [customers, selectedCustomer, isLoadingCustomers, getCustomers]
    )

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
        muiTablePaperProps: { className: "__table-expandable" },
        muiTableContainerProps: { className: "__table-container" },
        localization: MRT_Localization_EN,
        muiToolbarAlertBannerProps: isError
            ? {
                color: "error",
                children: "Error loading data",
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
                <button
                    onClick={handleRefresh}
                    type='button'
                    className='btn btn-outline-secondary'
                    style={{ marginLeft: '12px' }}
                    disabled={isLoading || isRefetching}
                >
                    <i className='ti ti-refresh'></i>
                    <span className='ms-2'>Refresh</span>
                </button>
                {UtilMethods.getHabilitations(authorizations, 'sell').canCreate && (
                    <button onClick={() => {
                        context.togglePageLoading(true)
                        dispatch(setActivePage({
                            page: Pages.ACCOUNT,
                            param: {
                                sub_page: "CREATE"
                            }
                        }))
                    }} type='button' className='btn btn-primary' style={{ marginLeft: '12px' }}>
                        <i className='ti ti-plus'></i>
                        <span className='ms-2'>ADD</span>
                    </button>
                )}
                {UtilMethods.getHabilitations(authorizations, 'sell').canExport && (
                    <button type='button' className='btn btn-outline-primary' style={{ marginLeft: '12px' }}>
                        <i className='ti ti-file-export'></i>
                        <span className='ms-2'>EXPORT ALL</span>
                    </button>
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
    })

    return (
        <div className="container">
            <Breadcrumd parent="Sell" />
            <MaterialReactTable table={mrTable} />
        </div>
    )
}