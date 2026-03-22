import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable, MRT_ColumnDef,
    MRT_ShowHideColumnsButton, MRT_TableInstance,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, Button, CircularProgress, Tooltip, IconButton, Zoom } from "@mui/material";
import { Refresh, FileDownload, Edit, Delete } from '@mui/icons-material';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { IRole, IRoleTableData } from '@/Data/Interfaces';
import { Pages } from '@/Data/Objects/state';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import CustomAlert from '@/Components/CustomAlert';
import RoleAPI from '@/Data/Api/Role';
import Toast from '@/Data/Utilities/Toast';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';

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
    const [roleId, setRoleId] = useState<number | null>(null);
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
    const { authorizations } = useAppSelector(state => state.userAuthorizing)
    const [initialValues, setInitialValues] = useState<FormValues>({
        label: '',
        code: ''
    });

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. Rôles';
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

    const handleRefresh = async () => {
        setIsRefetching(true);
        await getRoles();
    };

    const tableData: IRoleTableData[] = useMemo(() => {
        return roles ? roles.map((role) => ({
            ...role,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Modifier le rôle" TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setRoleId(role.id)
                                setInitialValues({
                                    label: role?.label || "",
                                    code: role?.code
                                })
                                setOpenUpdateModal(true)
                            }}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer le rôle" TransitionComponent={Zoom} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setRoleId(role.id)
                                setOpenDetailModal(true)
                            }}
                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        })) : [];
    }, [roles]);

    const columns: MRT_ColumnDef<IRoleTableData>[] = useMemo(
        () => [
            {
                accessorKey: "label",
                header: "Label",
                size: 200,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filtrer" },
                }),
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        {cell.getValue() as string}
                    </Typography>
                ),
            },
            {
                accessorKey: "code",
                header: "Code",
                size: 200,
                muiFilterTextFieldProps: () => ({
                    inputProps: { placeHolder: "filtrer" },
                }),
                Cell: ({ cell }) => (
                    <Box sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        color: '#6366f1',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '8px',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                    }}>
                        {cell.getValue() as string}
                    </Box>
                ),
            },
            {
                accessorKey: "actions",
                header: "Actions",
                size: 150,
                unexport: true,
                enableColumnFilter: false,
                enableSorting: false,
            },
        ],
        [],
    );

    const mrTable: MRT_TableInstance<IRoleTableData> = useMaterialReactTable({
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
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }
        },
        muiTableContainerProps: {
            className: "__table-container",
            sx: { maxHeight: '700px' }
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: 'rgba(248, 250, 252, 0.6)',
                color: '#64748b',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                py: 3,
                px: 3
            }
        },
        muiTableBodyRowProps: {
            sx: {
                '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.04) !important',
                },
                transition: 'background-color 0.2s'
            }
        },
        muiTableBodyCellProps: {
            sx: { px: 3, py: 2, borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }
        },
        localization: MRT_Localization_EN,
        muiToolbarAlertBannerProps: isError
            ? {
                color: "error",
                children: "Erreur de chargement des données",
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
            <Box sx={{ display: "flex", gap: 2.5, p: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                    Gestion des Rôles
                </Typography>

                <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                    <Button
                        onClick={handleRefresh}
                        variant="outlined"
                        startIcon={<Refresh />}
                        disabled={isLoading || isRefetching}
                        sx={{
                            borderRadius: '14px',
                            textTransform: 'none',
                            fontWeight: 800,
                            borderColor: 'rgba(99, 102, 241, 0.2)',
                            color: '#6366f1',
                            px: 3,
                            bgcolor: 'white',
                            '&:hover': { bgcolor: '#f5f7ff', borderColor: '#6366f1' }
                        }}
                    >
                        Rafraîchir
                    </Button>

                    {UtilMethods.getHabilitations(authorizations, 'role').canExport && (
                        <Button
                            variant="contained"
                            startIcon={<FileDownload />}
                            sx={{
                                borderRadius: '16px',
                                textTransform: 'none',
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                                px: 4,
                                py: 1.2,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 15px 25px -5px rgba(99, 102, 241, 0.5)',
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                }
                            }}
                        >
                            Exporter
                        </Button>
                    )}
                </Box>
            </Box>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: 1, pr: 3, alignItems: 'center' }}>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    });

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const { message } = await RoleAPI.delete(roleId)
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

    const handleSubmit = async (values: FormValues) => {
        setInProgress(true);
        try {
            const { message } = await RoleAPI.update(roleId, values);
            Toast.success(message)
            setIsDeleted(true)
            dispatch(setActivePage({ page: Pages.ROLE }))
        } catch (error) { console.log(error) } finally {
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
                errors.label = 'Le champ Label est requis.';
            }

            if (!values.code) {
                errors.code = 'Le champ Code est requis.';
            } else if (!/^[A-Z*]{4,}$/.test(values.code)) {
                errors.code = 'Code invalide.';
            }

            return errors;
        },
    });

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 4 }}>
                    <Breadcrumd parent="Rôles" />
                </Box>
                <MaterialReactTable table={mrTable} />

                <CustomAlert
                    openDetailModal={openDetailModal}
                    content={{
                        style: 'ti ti-info-circle text text-danger',
                        icon: 'Warning',
                        message: 'Voulez-vous vraiment supprimer ce rôle ?'
                    }}
                    onHandleDelete={handleDelete}
                    onHandleOpenDetail={() => setOpenDetailModal(false)}
                    inProgress={inProgress}
                />

                <Dialog
                    open={openUpdateModal}
                    onClose={() => setOpenUpdateModal(false)}
                    aria-labelledby="alert-delete-access"
                    aria-describedby="confirm-delete-access"
                    PaperProps={{
                        sx: {
                            borderRadius: '32px',
                            p: 2,
                            backdropFilter: 'blur(10px)',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'
                        }
                    }}
                >
                    <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
                        <Stack direction='row' alignItems="center" gap={2}>
                            <Box sx={{ width: 48, height: 48, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <Edit sx={{ fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                                Mettre à jour le rôle
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <form onSubmit={formik.handleSubmit}>
                        <DialogContent sx={{ pt: 3 }}>
                            <div className="row">
                                <div className="col-12 mx-auto">
                                    <div className="row gap-4">
                                        <div className="col-12">
                                            <label htmlFor="label" className="form-label fw-bold text-secondary mb-2" style={{ fontSize: '0.875rem' }}>Label <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="label"
                                                name='label'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.label}
                                                style={{
                                                    borderRadius: '16px',
                                                    padding: '14px 20px',
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    fontWeight: 600,
                                                    color: '#1e293b',
                                                    ...formik.errors.label && { borderColor: "var(--bs-danger)", background: 'rgba(239, 68, 68, 0.05)' }
                                                }}
                                            />
                                            {formik.errors.label &&
                                                <div className='text fs-10 text-danger d-flex align-items-center mt-2'>
                                                    <i className='ti ti-alert-circle me-1'></i>
                                                    <span style={{ fontWeight: 600 }}>{formik.errors.label}</span>
                                                </div>
                                            }
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="code" className="form-label fw-bold text-secondary mb-2" style={{ fontSize: '0.875rem' }}>Code <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="code"
                                                name='code'
                                                disabled
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.code}
                                                style={{
                                                    borderRadius: '16px',
                                                    padding: '14px 20px',
                                                    background: '#f1f5f9',
                                                    color: '#64748b',
                                                    border: '1px dashed #cbd5e1',
                                                    fontWeight: 800,
                                                    fontFamily: 'monospace',
                                                    ...formik.errors.code && { borderColor: "var(--bs-danger)", background: 'rgba(239, 68, 68, 0.05)' }
                                                }}
                                            />
                                            {formik.errors.code &&
                                                <div className='text fs-10 text-danger d-flex align-items-center mt-2'>
                                                    <i className='ti ti-alert-circle me-1'></i>
                                                    <span style={{ fontWeight: 600 }}>{formik.errors.code}</span>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2, pt: 3, gap: 2 }}>
                            <Button
                                disabled={inProgress}
                                onClick={() => setOpenUpdateModal(false)}
                                sx={{ color: '#64748b', fontWeight: 700, borderRadius: '14px', px: 3, py: 1.2, '&:hover': { bgcolor: '#f1f5f9' } }}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={inProgress}
                                sx={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                    color: 'white',
                                    fontWeight: 900,
                                    borderRadius: '14px',
                                    px: 4,
                                    py: 1.2,
                                    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 15px 25px -5px rgba(99, 102, 241, 0.5)'
                                    }
                                }}
                            >
                                {inProgress ? <CircularProgress size={20} color="inherit" /> : 'Enregistrer'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </motion.div>
        </Box>
    );
}