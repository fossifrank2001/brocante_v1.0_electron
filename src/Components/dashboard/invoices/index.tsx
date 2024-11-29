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
import { Box, Link, Stack } from "@mui/material"
import UtilMethods from '@/Data/Utilities/UtilMethods'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setActivePage } from '@/Data/Slices/NavigationSlice'
import { Pages } from '@/Data/Objects/state'
import {IAppContext, IInvoice, IInvoiceTableData} from 'Interfaces'
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
        document.title = constants.APP_NAME + ' .:. Invoices'
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
            setIsRefetching(true)
            await StreamedDocumentAPI.generate(_type, record.invoice_number);
        } catch (error) {
            console.error('Error downloading document:', error);
            // Handle error (e.g., show an error message to the user)
        } finally {
            context.togglePageLoading(false);
            setIsRefetching(false)
        }
    };

    const tableData: IInvoiceTableData[] = useMemo(() => {
        return records ? records.map((_record) => ({
            ..._record,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true);
                            dispatch(setActivePage({
                                page: Pages.INVOICE,
                                id: _record.id,
                                param: {
                                    sub_page: 'READ'
                                }
                            }));
                        }}
                    >
                        <i className="ti ti-eye text-dark"></i>
                    </Link>
                    <Link
                        href="#"
                        onClick={() => handleDownload(_record.status === 'paid' ? 'receipt' : 'invoice', _record)}
                    >
                        <i className={`ti ${_record.status === 'paid' ? 'ti-download' : 'ti-file-invoice'} text-primary`}></i>
                    </Link>
                </Stack>
            ),
        })) : [];
    }, [records, context, dispatch]);

    const columns = useMemo<MRT_ColumnDef<IInvoiceTableData>[]>(
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
                accessorKey: "invoice_date",
                header: "Invoice Date",
                size: 150,
            },
            {
                accessorKey: "amount_paid",
                header: "Amount paid",
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
                    label: 'Unpaid',
                    value: SellAPI.UNPAID
                }, {
                    label: 'Paid',
                    value: SellAPI.PAID
                }],
            },
            {
                accessorKey: "remaining_balance",
                header: "Remaining Balance",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as number
                    return value ? UtilMethods.formatNumber(value ?? 0) : null
                },
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeholder: "filter" },
                }),
            },
            {
                accessorKey: "date_to_pay",
                header: "Date To Pay",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as number
                    return value ? dayjs(value).format("YYYY-MM-DD H:mm:s") : null
                },
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeholder: "filter" },
                }),
            },
            {
                accessorKey: "invoice_number",
                header: "Invoice Number",
                size: 150,
            },
            {
                accessorKey: "created_at",
                header: "Created At",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as number
                    return value ? dayjs(value).format("YYYY-MM-DD H:mm:s") : null
                },
            },
            {
                accessorKey: "updated_at",
                header: "Updated At",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as number
                    return value ? dayjs(value).format("YYYY-MM-DD H:mm:s") : null
                },
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 150,
                unexport: true,
                enableColumnFilter: false,
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
                {UtilMethods.getHabilitations(authorizations, 'invoice').canExport && (
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
            <Breadcrumd parent="Invoices" />
            <MaterialReactTable table={mrTable} />
        </div>
    )
}