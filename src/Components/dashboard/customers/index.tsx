import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import Breadcrumd from "Components/Breadcrumd";
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_ShowHideColumnsButton,
    MRT_ToggleFiltersButton,
    MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import axiosInstance, { IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {
    Box, Stack, Tooltip, IconButton, Chip, Typography, Button,
    Zoom
} from "@mui/material";
import {
    Refresh,
    FileDownload,
    Wallet,
    Edit,
    Delete,
    TrendingDown,
    AccountBalanceWallet,
    Add,
    Person,
    History
} from '@mui/icons-material';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { useAppSelector } from '@/hooks';
import Toast from '@/Data/Utilities/Toast';
import CustomAlert from '@/Components/CustomAlert';
import CustomerAPI from "Data/Api/Customer.ts";
import { IPerson, IPersonTableData } from 'Interfaces';
import UseCustomerBalance from './UseCustomerBalance';
import CustomerForm from './CustomerForm';
import CustomerHistory from './CustomerHistory';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function IndexCustomer() {
    const { t } = useTranslation();
    const context = useAppContext();

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [openBalanceModal, setOpenBalanceModal] = useState(false);
    const [openFormModal, setOpenFormModal] = useState(false);
    const [openHistoryModal, setOpenHistoryModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<IPerson | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [customers, setCustomers] = useState<IPerson[] | null>(null);
    const { authorizations } = useAppSelector(state => state.userAuthorizing)

    useLayoutEffect(() => {
        context.togglePageLoading();
        document.title = constants.APP_NAME + ' .:. ' + t('navigation.customers');
    }, [context, t]);

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
            }
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
    );

    useEffect(() => {
        getCustomers()
    }, [getCustomers, isDeleted]);

    const handleRefresh = () => {
        setIsRefetching(true);
        getCustomers();
    };

    const handleDelete = async () => {
        try {
            context.togglePageLoading(true)
            setInProgress(true)
            const { message } = await CustomerAPI.delete(customerId!)
            Toast.success(message)
            handleRefresh()
        } catch (error) {
            console.error(error)
        } finally {
            setOpenDetailModal(false)
            setIsDeleted(true)
            context.togglePageLoading(false)
            setInProgress(false)
        }
    }

    const handleOpenBalanceModal = (customer: IPerson) => {
        setSelectedCustomer(customer);
        setOpenBalanceModal(true);
    };

    const handleOpenFormModal = (customer: IPerson | null = null) => {
        setSelectedCustomer(customer);
        setOpenFormModal(true);
    };

    const handleCloseModels = () => {
        setOpenBalanceModal(false);
        setOpenFormModal(false);
        setOpenHistoryModal(false);
        setSelectedCustomer(null);
    };

    const handleSuccess = () => {
        handleRefresh();
    };

    const tableData: IPersonTableData[] = useMemo(() => {
        return customers ? customers.map((person) => ({
            ...person,
            actions: (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title={t('customer.useBalance')} arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => handleOpenBalanceModal(person)}
                            disabled={!person.company_balance || person.company_balance === 0}
                            sx={{
                                color: person.company_balance && person.company_balance > 0 ? '#10b981' : '#cbd5e1',
                                bgcolor: person.company_balance && person.company_balance > 0 ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' }
                            }}
                        >
                            <Wallet sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('customer.history', 'Historique')} arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSelectedCustomer(person);
                                setOpenHistoryModal(true);
                            }}
                            sx={{ color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.05)', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.12)' } }}
                        >
                            <History sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.edit')} arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => handleOpenFormModal(person)}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.12)' } }}
                        >
                            <Edit sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')} arrow TransitionComponent={Zoom}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setCustomerId(person.id!)
                                setOpenDetailModal(true)
                            }}
                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.12)' } }}
                        >
                            <Delete sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        })) : [];
    }, [customers, context, t]);

    const columns: MRT_ColumnDef<IPerson>[] = useMemo(
        () => [
            {
                accessorKey: "lastname",
                header: t('customer.customer'),
                size: 200,
                Cell: ({ row }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            p: 1,
                            borderRadius: '10px',
                            bgcolor: 'rgba(99, 102, 241, 0.05)',
                            color: '#6366f1'
                        }}>
                            <Person sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                {row.original.lastname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {row.original.firstname}
                            </Typography>
                        </Box>
                    </Box>
                ),
            },
            {
                accessorKey: "phone",
                header: t('customer.customerPhone'),
                size: 150,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {cell.getValue() as string || t('common.notAvailable')}
                    </Typography>
                ),
            },
            {
                accessorKey: "company_balance",
                header: t('customer.availableBalance'),
                size: 180,
                Cell: ({ cell }) => {
                    const value = cell.getValue() as number;
                    const hasBalance = value && value > 0;
                    return (
                        <Chip
                            icon={<AccountBalanceWallet sx={{ fontSize: '14px !important' }} />}
                            label={UtilMethods.formatNumber(value || 0)}
                            size="small"
                            sx={{
                                fontWeight: 800,
                                bgcolor: hasBalance ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.05)',
                                color: hasBalance ? '#10b981' : '#64748b',
                                border: `1px solid ${hasBalance ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.1)'}`,
                                borderRadius: '10px',
                                fontSize: '0.7rem'
                            }}
                        />
                    );
                },
            },
            {
                accessorKey: "remaining_balance",
                header: t('customer.totalDebts'),
                size: 180,
                Cell: ({ cell }) => {
                    const data = cell.getValue() as any;
                    let value = 0;

                    try {
                        const remaining = typeof data === 'string' ? JSON.parse(data) : data;
                        if (remaining && typeof remaining === 'object' && !Array.isArray(remaining)) {
                            value = Object.values(remaining).reduce((acc: number, curr: any) => acc + Number(curr), 0) as number;
                        }
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }

                    const hasDebts = value > 0;
                    return (
                        <Chip
                            icon={<TrendingDown sx={{ fontSize: '14px !important' }} />}
                            label={UtilMethods.formatNumber(value)}
                            size="small"
                            sx={{
                                fontWeight: 800,
                                bgcolor: hasDebts ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.05)',
                                color: hasDebts ? '#ef4444' : '#64748b',
                                border: `1px solid ${hasDebts ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.1)'}`,
                                borderRadius: '10px',
                                fontSize: '0.7rem'
                            }}
                        />
                    );
                },
            },
            {
                accessorKey: "actions",
                header: t('common.actions'),
                size: 150,
                enableColumnFilter: false,
                enableSorting: false,
            }
        ],
        [t],
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
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mr: 2, display: { xs: 'none', md: 'block' } }}>
                    {t('customer.customerManagement')}
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
                    {t('common.refresh')}
                </Button>
                {UtilMethods.getHabilitations(authorizations, 'customer').canCreate && (
                    <Button
                        onClick={() => handleOpenFormModal()}
                        variant="contained"
                        startIcon={<Add />}
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
                        {t('customer.newCustomer')}
                    </Button>
                )}
                {UtilMethods.getHabilitations(authorizations, 'customer').canExport && (
                    <Button
                        variant="text"
                        startIcon={<FileDownload />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            color: '#64748b',
                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)', color: '#6366f1' }
                        }}
                    >
                        {t('common.export')}
                    </Button>
                )}
            </Box>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: 0.5, pr: 2 }}>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>
        ),
    });

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent={t('menu.ADMINISTRATION')} />
                <MaterialReactTable table={mrTable} />
            </motion.div>

            <CustomAlert
                openDetailModal={openDetailModal}
                content={{
                    style: 'ti ti-info-circle text text-danger',
                    icon: t('common.permanentDelete'),
                    message: t('customer.deleteConfirmMessage')
                }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDetailModal(false)}
                inProgress={inProgress}
            />

            {selectedCustomer && openBalanceModal && (
                <UseCustomerBalance
                    customer={selectedCustomer}
                    open={openBalanceModal}
                    onClose={handleCloseModels}
                    onSuccess={handleSuccess}
                />
            )}

            {selectedCustomer && openHistoryModal && (
                <CustomerHistory
                    customer={selectedCustomer}
                    open={openHistoryModal}
                    onClose={handleCloseModels}
                />
            )}

            <CustomerForm
                open={openFormModal}
                onClose={handleCloseModels}
                customer={selectedCustomer}
                onSuccess={handleSuccess}
            />
        </Box>
    );
}