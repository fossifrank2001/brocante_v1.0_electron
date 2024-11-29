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
import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Link, Stack, Typography} from "@mui/material";
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { IRole, IRoleTableData } from '@/Data/Interfaces';
import { Pages } from '@/Data/Objects/state';
import { useAppDispatch } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import CustomAlert from '@/Components/CustomAlert';
import RoleAPI from '@/Data/Api/Role';
import Toast from '@/Data/Utilities/Toast';
import { useFormik } from 'formik';

interface FormValues {
    label: string;
    code: string;
}

export default function IndexRole() {
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [roleId, setRoleId] = useState<number>(null);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [roles, setRoles] = useState<IRole[] | null>(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const dispatch = useAppDispatch()
    const [initialValues, setInitialValues] = useState<FormValues>({
        label: '',
        code: ''
    });

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Roles';
    }, [context]);

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    const getRoles = useCallback(
        async () => {
            setIsLoading(true);
            const url = new URL(`${constants.BASE_URL}/roles`);
            const filters = UtilMethods.formatTableFilters(columnFilters);
            const sortingTab = UtilMethods.formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            try {
                const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<IRole>>(url.href);
                const { data: roleList }: IApiResponsePaginated<IRole> = result;

                if (status === 200) {
                    setRoles(roleList.data);
                    setRowCount(roleList.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                setRoles([]);
            } finally {
                setIsLoading(false);
                setIsRefetching(false);
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, isDeleted],
    );

    useEffect(() => {
        (async () => await getRoles())();
    }, [getRoles, isDeleted]);

    const handleRefresh = () => {
        setIsRefetching(true);
        getRoles();
    };

    const tableData: IRoleTableData[] = useMemo(() => {
        return roles ? roles.map((role) => ({
            ...role,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link
                        href="#"
                        onClick={() => {
                            setRoleId(role.id)
                            setInitialValues({
                                label: role?.label || "",
                                code: role?.code
                            })
                            setOpenUpdateModal(true)
                        }}>
                        <i color="primary" className="ti ti-pencil"></i>
                    </Link>
                    <i
                        onClick={() => {
                            setRoleId(role.id)
                            setOpenDetailModal(true)
                        }}
                        className="ti ti-trash cursor-pointer text-danger"
                    ></i>
                </Stack>
            ),
        })) : [];
    }, [roles]);

    const columns : MRT_ColumnDef<IRoleTableData>[] = useMemo(
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
                accessorKey: "code",
                header: "Code",
                size: 150,
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

    const mrTable : MRT_TableInstance<IRoleTableData> = useMaterialReactTable({
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
            const {message} = await RoleAPI.delete(roleId)
            Toast.success(message)

        } catch (error) {
            console.error(error)
        }finally{
            setOpenDetailModal(false)
            setIsDeleted(prev => !prev)
            setInProgress(false)
            context.togglePageLoading(false)
        }
    }

    const handleSubmit = async (values: FormValues) => {
        setInProgress(true);
        try {
            const {message} = await RoleAPI.update(roleId, values);
            Toast.success(message)
            setIsDeleted(true)
            dispatch(setActivePage({page: Pages.ROLE}))
        } catch (error) { console.log(error)} finally {
            setInProgress(false);
            setOpenUpdateModal(false)
        }
    };

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        enableReinitialize: true,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};

            if (!values.label) {
                errors.label = 'Label field is required.';
            }

            if (!values.code) {
                errors.code = 'Code field is required.';
            }else if (!/^[A-Z*]{4,}$/.test(values.code)) {
                errors.code = 'Invalid code.';
            }

            return errors;
        },
    });

    return (
        <div className="container">
            <Breadcrumd parent="Roles" />
            <MaterialReactTable  table={mrTable}/>
            <CustomAlert
                openDetailModal={openDetailModal}
                content={{style: 'ti ti-info-circle text text-danger',
                    icon: 'Warning',
                    message: 'Would you like to delete this role?'
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress= {inProgress}
            />

            <Dialog
                open={openUpdateModal}
                onClose={() => setOpenUpdateModal(false)}
                aria-labelledby="alert-delete-access"
                aria-describedby="confirm-delete-access"
            >
                <DialogTitle id="alert-dialog-title">
                    <Stack className='fs-8' direction='row' alignItems="center">
                        <i className='ti ti-pencil text text-info' style={{marginRight: '12px'}} ></i>
                        <Typography variant="h5" className='text text-info fw-bolder'>
                            Update the role
                        </Typography>
                    </Stack>
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <div className="row">
                            <div className="col-12 mx-auto">
                                <div className="row gap-10">
                                    <div className="col-12 mb-3">
                                        <label htmlFor="label" className="form-label">Label <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="label"
                                                name='label'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.label}
                                                style={{ ...formik.errors.label && { borderColor: "var(--bs-danger)" } }}
                                            />
                                        </div>
                                        {formik.errors.label &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.label}</span>
                                            </div>
                                        }
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label htmlFor="code" className="form-label">Code <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="code"
                                                name='code'
                                                disabled
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.code}
                                                style={{ ...formik.errors.code && { borderColor: "var(--bs-danger)" } }}
                                            />
                                        </div>
                                        {formik.errors.code &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.code}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions style={{display:"flex", justifyContent:"flex-end", alignItems:"center"}}>
                        <button disabled={inProgress} className='btn btn-light text-dark' onClick={() => setOpenUpdateModal(false)}>
                            cancel
                        </button>
                        {!inProgress ? <button type='submit' className="btn btn-primary rounded-2">UPDATE</button> :
                            <button className="btn btn-primary rounded-2" type="button" disabled>
                                <span className="spinner-grow spinner-grow-sm ms-4" role="status" aria-hidden="true"></span>
                                UPDATE...
                            </button>
                        }
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}