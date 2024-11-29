import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {useAppContext} from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable, MRT_ColumnDef,
    MRT_ShowHideColumnsButton, MRT_TableInstance,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {Box, Link, Stack} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import Toast from '@/Data/Utilities/Toast';
import CustomAlert from '@/Components/CustomAlert';
import CustomerAPI from "Data/Api/Customer.ts";
import { IPerson, IPersonTableData } from 'Interfaces';

export default function IndexCustomer() {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [, setReady] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [customers, setCustomers] = useState<IPerson[] | null>(null);
    const {authorizations} = useAppSelector(state => state.userAuthorizing)

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Customers';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    const getCustomers = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/customers`);
            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            try {
                const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<IPerson>>(url.href);
                const { data: personList }: IApiResponsePaginated<IPerson> = result;
                if (status === 200) {
                    setCustomers(personList.data);
                    setRowCount(personList.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setCustomers([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
        (async () => await getCustomers())()
    }, [getCustomers, isDeleted]);

    const handleRefresh = () => {
        setIsRefetching(true);
        getCustomers();
    };

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const {message} = await CustomerAPI.delete(customerId)
            Toast.success(message)
        } catch (error) {
            console.error(error)
        }finally{
            setOpenDetailModal(false)
            setIsDeleted(true)
            context.togglePageLoading(false)
            setInProgress(false)
        }
    }

    const tableData : IPersonTableData[] = useMemo(() => {
        return customers ? customers.map((person) => ({
            ...person,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true);
                        }}>
                        <i color="primary" className="ti ti-pencil"></i>
                    </Link>
                    <i
                        onClick={() => {
                            setCustomerId(person.id)
                            setOpenDetailModal(true)
                        }}
                        className="ti ti-trash cursor-pointer text-danger"
                    ></i>
                </Stack>
            ),
        })) : [];
    }, [customers]);

    const columns : MRT_ColumnDef<IPerson>[] = useMemo(
        () => [
            {
                accessorKey: "lastname",
                header: "Last Name",
                size: 100,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "firstname",
                header: "First Name",
                size: 100,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "phone",
                header: "Phone",
                size: 150,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "company_balance",
                header: "Company Balance",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as number;
                    return value ? UtilMethods.formatNumber(value) : null;
                },
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "remaining_balance",
                header: "Remaining Balance",
                size: 150,
                Cell: ({ cell }) => {
                    const data = cell.getValue() as string;
                    let value: unknown = 0;

                    try {
                        const remaining = JSON.parse(data);
                        if (remaining && typeof remaining === 'object' && !Array.isArray(remaining)) {
                            value = Object.values(remaining).reduce((acc: number, curr: number) => acc + Number(curr) , 0);
                        }
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }

                    return value ? UtilMethods.formatNumber(value as number) : null;
                },
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 150,
                unexport: true,
                enableColumnFilter: false,
            },
        ],
        [],
    );

    const mrTable : MRT_TableInstance<IPerson>  = useMaterialReactTable({
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
                children: "errorLoadingData",
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
                {UtilMethods.getHabilitations(authorizations, 'customer').canExport && <button type='button' className='btn btn-outline-primary' style={{ marginLeft: '12px' }}>
                    <i className='ti ti-file-export'></i>
                    <span className='ms-2'>EXPORT ALL</span>
                </button>}
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

    return (
        <div className="container">
            <Breadcrumd parent="Users" />
            <MaterialReactTable table={mrTable} />
            <CustomAlert
                openDetailModal={openDetailModal}
                content={{style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: 'Would you like to delete this customer?'
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress = {inProgress}
            />
        </div>
    );
}