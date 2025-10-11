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
import { Box, Link, Stack } from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { Pages } from '@/Data/Objects/state';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import CustomAlert from '@/Components/CustomAlert';
import Toast from '@/Data/Utilities/Toast';
import { IProduct, IProductTableData, ISupply } from '@/Data/Interfaces/Supply';
import ProductAPI from "@/Data/Api/Product";
import dayjs from "dayjs";
import SupplyAPI from "@/Data/Api/Suppliers";

export default function IndexProduct() {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [productId, setProductId] = useState<number | null>(null);
    const [, setReady] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState<never[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<never[]>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [products, setProducts] = useState<IProduct[] | null>(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const dispatch = useAppDispatch()
    const { authorizations } = useAppSelector(state => state.userAuthorizing)
    const [suppliers, setSuppliers] = useState<ISupply[]>([]);

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Products';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    const getProducts = useCallback(
        async () => {
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
            } catch (error) {
                setIsError(true);
                setProducts([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, isDeleted],
    );

    const getSuppliers = useCallback(
        async () => {
            try {
                const { data: __suppliers } = await SupplyAPI.index()
                if (__suppliers) {
                    setSuppliers(__suppliers)
                }
            } catch (e) {
                console.error('Error occurred while getting suppliers for product listing', e)
            }
        },
        [],
    );

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
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => {
                            context.togglePageLoading(true);
                            dispatch(setActivePage({
                                page: Pages.ARTICLE,
                                id: product.id,
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
                            context.togglePageLoading(true);
                            dispatch(setActivePage({
                                page: Pages.ARTICLE,
                                id: product.id,
                                param: {
                                    sub_page: 'UPDATE'
                                }
                            }))
                        }}>
                        <i color="primary" className="ti ti-pencil"></i>
                    </Link>
                    <i
                        onClick={() => {
                            setProductId(product.id)
                            setOpenDetailModal(true)
                        }}
                        className="ti ti-trash cursor-pointer text-danger"
                    ></i>
                </Stack>
            ),
        })) : [];
    }, [products, context, dispatch]);

    const columns: MRT_ColumnDef<IProductTableData>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                size: 100,
            },
            {
                accessorKey: "price",
                header: "Price",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue<number>();
                    return <span>{value} </span>
                },
            },
            {
                accessorKey: "stock_quantity",
                header: "Quantity",
                size: 150,
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue<string>();
                    const status = UtilMethods.getStatus(value);
                    return <span className={status}>{value}</span>;
                },
                enableColumnFilter: false,
            },
            {
                accessorKey: "suppliers",
                header: "Suppliers",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue<ISupply[]>();
                    return <span>{value.map(supply => supply.name).join('-')}</span>;
                },
                filterVariant: 'select',
                filterSelectOptions: suppliers.map(_supply => ({
                    label: _supply.name,
                    value: _supply.contact_info
                })),
            },
            {
                accessorKey: "created_at",
                header: "Created At",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue<string>();
                    return <span>{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</span>;
                },
                enableColumnFilter: false
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 150,
                enableColumnFilter: false,
            },
        ],
        [suppliers],
    );

    const table = useMaterialReactTable({
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
                {UtilMethods.getHabilitations(authorizations, 'article').canCreate && (
                    <button onClick={() => {
                        context.togglePageLoading(true)
                        dispatch(setActivePage({
                            page: Pages.ARTICLE,
                            param: {
                                sub_page: "CREATE"
                            }
                        }))
                    }} type='button' className='btn btn-primary' style={{ marginLeft: '12px' }}>
                        <i className='ti ti-plus'></i>
                        <span className='ms-2'>ADD</span>
                    </button>
                )}
                {UtilMethods.getHabilitations(authorizations, 'article').canExport && (
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
                <button type='button' className='btn'>
                    <i className='ti ti-cloud-download'></i>
                </button>
                <MRT_ToggleDensePaddingButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    });

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const { message } = await ProductAPI.delete(productId!)
            Toast.success(message)
        } catch (error) {
            console.error(error)
        } finally {
            setOpenDetailModal(false)
            setIsDeleted(prev => !prev)
            setInProgress(false)
            context.togglePageLoading(false)
        }
    }

    return (
        <div className="container">
            <Breadcrumd parent="Articles" />
            <MaterialReactTable table={table} />
            <CustomAlert
                openDetailModal={openDetailModal}
                content={{
                    style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: 'Would you like to delete this product?'
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress={inProgress}
            />
        </div>
    );
}