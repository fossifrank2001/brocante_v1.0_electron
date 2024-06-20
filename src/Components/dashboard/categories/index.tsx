import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {useAppContext} from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import {Box, Link, Stack} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { Pages } from '@/Data/Objects/state';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import CustomAlert from '@/Components/CustomAlert';
import Toast from '@/Data/Utilities/Toast';
import { ICategory } from '@/Data/Interfaces/Category';
import CategoryAPI from '@/Data/Api/Category';


const IndexCategory = () => {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [categoryId, setCategoryId] = useState<number>(null);
    const [_, setReady] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [categories, setCategories] = useState<ICategory[] | null>(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const dispatch = useAppDispatch()
    const {authorizations} = useAppSelector(state => state.userAuthorizing)

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Categories';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    // request all menus
    const getRoles = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/categories`);
            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            try {
                const { status, data: result } = await axiosInstance.get<IApiResponse>(url.href);
                if (status === 200) {
                    setCategories(result.data.data);
                    setRowCount(result.data.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setCategories([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, isDeleted],
    );

    useEffect(() => {
        getRoles();
    }, [getRoles, isDeleted]);

    const tableData = useMemo(() => {
        return categories ? categories.map((category) => ({
            id: category.id,
            label: `${category?.label || ""}`,
            sub_categories:category?.sub_categories.length,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => dispatch(setActivePage({
                            page: Pages.CATEGORY,
                            id: category?.id,
                            param: {
                                sub_page: 'UPDATE'
                            }
                        }))}
                    >
                        <i color="primary" className="ti ti-pencil"></i>
                    </Link>
                    <i
                        onClick={() => {
                            setCategoryId(category.id)
                            setOpenDetailModal(true)
                        }}
                        className="ti ti-trash cursor-pointer text-danger"
                    ></i>
                </Stack>
            ),
        })) : [];
    }, [categories]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "label",
                header: "Label",
                size: 100,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "sub_categories",
                header: "Sub Categories",
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
        [],
    );

    const mrTable = useMaterialReactTable({
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
                {UtilMethods.getHabilitations(authorizations, 'category').canCreate && <button onClick={() => {
                    context.togglePageLoading(true)
                    dispatch(setActivePage({
                        page: Pages.CATEGORY,
                        param: {
                            sub_page: "CREATE"
                        }
                    }))
                }} type='button' className='btn btn-primary' style={{ marginLeft: '12px' }}>
                    <i className='ti ti-plus'></i>
                    <span className='ms-2'>ADD</span>
                </button>}
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
            const {message} = await CategoryAPI.delete(categoryId)
            Toast.success(message)
            setIsDeleted(prev => !prev)
            
        } catch (error) {
            console.error(error)
        }finally{
            setOpenDetailModal(false)
            setInProgress(false)
            context.togglePageLoading(false)
        }
    }


    return (
        <div className="container">
            <Breadcrumd parent="Categories" />
            <MaterialReactTable
                table={mrTable}
                muiTablePaperProps={{
                sx: {
                    fontFamily: 'var(--bs-body-font-family)',
                },
                }}
                muiTableHeadCellProps={{
                sx: {
                    fontFamily: 'var(--bs-body-font-family)',
                },
                }}
                muiTableBodyCellProps={{
                sx: {
                    fontFamily: 'var(--bs-body-font-family)',
                },
                }}
            />
            <CustomAlert 
                 openDetailModal={openDetailModal} 
                 content={{style: 'ti ti-info-circle text text-danger',
                     icon: 'Warning',
                     message: 'Would you like to delete this category?'
                 }}  
                 onHandleDelete={handleDelete}
                 onHandleOpenDetail={() => setOpenDetailModal(false)}
                 inProgress= {inProgress}
            />
        </div>
    );
}


export default React.memo(IndexCategory);