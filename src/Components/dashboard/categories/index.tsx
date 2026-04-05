import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAppContext } from "@/contexts/appContext";
import constants from "@/Data/Utilities/constants";
import Breadcrumd from "@/Components/Breadcrumd";
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
import axiosInstance, { IApiResponsePaginated } from '@/Data/Utilities/axiosInstance';
import {
  Box, Stack, IconButton, Tooltip, Typography, Button,
  Zoom, Chip
} from "@mui/material";
import {
  Refresh,
  Add,
  Edit,
  Delete,
  Layers,
  FileDownload,
  FolderOpen
} from '@mui/icons-material';

import UtilMethods from '@/Data/Utilities/UtilMethods';
import { Pages } from '@/Data/Objects/state';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import CustomAlert from '@/Components/CustomAlert';
import Toast from '@/Data/Utilities/Toast';
import { ICategory, ICategoryTableData } from '@/Data/Interfaces/Category';
import CategoryAPI from '@/Data/Api/Category';
import { useTranslation } from 'react-i18next';

export default function IndexCategory() {
  const { t } = useTranslation();
  const context = useAppContext();

  const [isError, setIsError] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [categories, setCategories] = useState<ICategory[] | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const dispatch = useAppDispatch()
  const { authorizations } = useAppSelector(state => state.userAuthorizing)

  useLayoutEffect(() => {
    context.togglePageLoading();
    document.title = constants.APP_NAME + ' .:. ' + t('navigation.categories');
  }, [context, t]);

  const resetScroll = () => {
    window.scrollTo(0, 0);
    const scrollableTableContainer = document.querySelector(".__table-container");
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0);
    }
  };

  const getCategories = useCallback(async () => {
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
      const { status, data: result } = await axiosInstance.get<IApiResponsePaginated<ICategory>>(url.href);
      const { data: categoryList } = result;
      if (status === 200) {
        setCategories(categoryList.data);
        setRowCount(categoryList.total);
      }
      resetScroll();
    } catch (error) {
      setIsError(true);
      setCategories([]);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    getCategories();
  }, [getCategories, isDeleted]);

  const handleRefresh = () => {
    setIsRefetching(true);
    getCategories();
  };

  const tableData: ICategoryTableData[] = useMemo(() => {
    return categories ? categories.map((category) => ({
      ...category,
      sub_category: category?.sub_categories?.length ?? 0,
      actions: (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('common.edit')} arrow TransitionComponent={Zoom}>
            <IconButton
              size="small"
              onClick={() => {
                context.togglePageLoading(true);
                dispatch(setActivePage({
                  page: Pages.CATEGORY,
                  id: category?.id,
                  param: { sub_page: 'UPDATE' }
                }));
              }}
              sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
            >
              <Edit sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')} arrow TransitionComponent={Zoom}>
            <IconButton
              size="small"
              onClick={() => {
                setCategoryId(category.id!)
                setOpenDetailModal(true)
              }}
              sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.18)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
            >
              <Delete sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    })) : [];
  }, [categories, dispatch, context]);

  const columns: MRT_ColumnDef<ICategoryTableData>[] = useMemo(() => [
    {
      accessorKey: "label",
      header: t('category.categoryStructure'),
      size: 300,
      Cell: ({ cell, row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            color: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
          }}>
            <FolderOpen sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>
              {cell.getValue() as string}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {t('category.categoryId')}: #{row.original.id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: "sub_category",
      header: t('category.content'),
      size: 200,
      enableColumnFilter: false,
      Cell: ({ cell }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<Layers sx={{ fontSize: '14px !important' }} />}
            label={`${cell.getValue() || 0} ${t('category.subCategories')}`}
            size="small"
            sx={{
              fontWeight: 900,
              bgcolor: 'rgba(100, 116, 139, 0.08)',
              color: '#475569',
              border: '1px solid rgba(100, 116, 139, 0.15)',
              borderRadius: '8px',
              fontSize: '0.65rem',
              px: 0.5,
              letterSpacing: '0.02em'
            }}
          />
        </Box>
      ),
    },
    {
      accessorKey: "created_at",
      header: t('common.createdAt'),
      size: 180,
      enableColumnFilter: false,
      Cell: ({ cell }) => (
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
          {new Date(cell.getValue() as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Typography>
      )
    },
    {
      accessorKey: "actions",
      header: t('common.actions'),
      size: 150,
      enableColumnFilter: false,
      enableSorting: false,
    },
  ], [t]);

  const mrTable = useMaterialReactTable({
    columns: columns,
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
      sx: { maxHeight: '650px' }
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
      sx: { px: 3, py: 2.5, borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }
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
      <Box sx={{ display: "flex", gap: 2, p: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
          {t('navigation.categories')}
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
            {t('common.refresh')}
          </Button>

          {UtilMethods.getHabilitations(authorizations, 'category').canCreate && (
            <Button
              onClick={() => {
                context.togglePageLoading(true)
                dispatch(setActivePage({
                  page: Pages.CATEGORY,
                  param: { sub_page: "CREATE" }
                }))
              }}
              variant="contained"
              startIcon={<Add />}
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
              {t('category.newCategory')}
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
        {UtilMethods.getHabilitations(authorizations, 'category').canExport && (
          <Tooltip title={t('category.exportCategories')} arrow TransitionComponent={Zoom}>
            <IconButton
              sx={{ color: '#64748b', '&:hover': { color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)' } }}
            >
              <FileDownload />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
  });

  const handleDelete = async () => {
    try {
      context.togglePageLoading(true)
      setInProgress(true)
      const { message } = await CategoryAPI.delete(categoryId!)
      Toast.success(message)
      setIsDeleted(prev => !prev)
    } catch (error) {
      console.error(error)
      Toast.error(t('category.deleteError'))
    } finally {
      setOpenDetailModal(false)
      setInProgress(false)
      context.togglePageLoading(false)
    }
  }

  return (
    <Box>
        <Breadcrumd parent="Administration" />
        <MaterialReactTable table={mrTable} />

      <CustomAlert
        openDetailModal={openDetailModal}
        content={{
          style: 'ti ti-info-circle text text-danger',
          icon: t('common.permanentDelete'),
          message: t('category.deleteConfirmMessage')
        }}
        onHandleDelete={handleDelete}
        onHandleOpenDetail={() => setOpenDetailModal(false)}
        inProgress={inProgress}
      />
    </Box>
  );
}