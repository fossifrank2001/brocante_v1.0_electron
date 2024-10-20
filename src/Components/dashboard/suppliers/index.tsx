import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
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
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {Box, Link, Stack} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import Toast from '@/Data/Utilities/Toast';
import CustomAlert from '@/Components/CustomAlert';
import { IAppContext, ISupply } from 'Interfaces';
import SupplyAPI from "Data/Api/Suppliers.ts";

export default function IndexSupply() {
    const context:IAppContext = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [supplyId, setSupplyId] = useState<number | null>(null);
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
    const [suppliers, setSuppliers] = useState<ISupply[] | null>(null);
    const {authorizations} = useAppSelector(state => state.userAuthorizing)

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

    // request all menus
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
                setReady(true);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
      (async () => await getSuppliers())();
    }, [getSuppliers, isDeleted]);

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const {message} = await SupplyAPI.delete(supplyId)
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

    const tableData = useMemo(() => {
        return suppliers ? suppliers.map((user) => ({
            id: user.id,
            name: user.name,
            contact_info: `${user?.contact_info || ""}`,
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
                            setSupplyId(user.id)
                            setOpenDetailModal(true)
                        }}
                        className="ti ti-trash cursor-pointer text-danger"
                    ></i>
                </Stack>
            ),
        })) : [];
    }, [suppliers, context]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                size: 100,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filter" },
                }),
            },
            {
                accessorKey: "contact_info",
                header: "Contact Info",
                size: 100,
                unexport: true,
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
                {UtilMethods.getHabilitations(authorizations, 'supply').canExport && <button type='button' className='btn btn-outline-primary' style={{ marginLeft: '12px' }}>
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
            <Breadcrumd parent="Suppliers" />
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
