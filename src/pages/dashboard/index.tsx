import React, { useEffect, useMemo, useState } from 'react';
import {
    Container,
    Box,
    Alert,
    Tabs,
    Tab,
    Paper,
    TextField,
    MenuItem,
    IconButton,
    Stack,
    Tooltip,
    Skeleton,
    Grid,
    Card,
    CardContent,
    Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppSelector } from "@/hooks";
import { AccountStats, DashboardChartsStats, SaleStats, ProductStats } from "Data/Interfaces/dashboard.ts";
import UtilMethods from "Data/Utilities/UtilMethods.ts";
import { SalesStats } from "Components/dashboard/SalesStats.tsx";
import { AccountsStats } from "Components/dashboard/AccountsStats.tsx";
import { ProductsStats } from "Components/dashboard/ProductsStats";
import { Dashboard as DasboardAPI } from "Data/Api/Dashboard.ts";
import { TrendingUp, AccountBalance, Inventory } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import UserAPI from '@/Data/Api/Users';
import CategoryAPI from '@/Data/Api/Category';
import { ICategory } from 'Data/Interfaces';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';

const glassContainerStyle = {
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    bgcolor: 'var(--bg-glass)',
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1
};

const glassCardStyle = {
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        boxShadow: '0 25px 50px rgba(0,0,0,0.08)',
        transform: 'translateY(-4px)'
    }
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            <AnimatePresence mode="wait">
                {value === index && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box sx={{ p: { xs: 2, md: 4 } }}>
                            {children}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export const DashboardIndicator: React.FC = () => {
    const { t } = useTranslation();
    const [accountStats, setAccountStats] = useState<AccountStats | null>(null);
    const [salesStats, setSalesStats] = useState<SaleStats | null>(null);
    const [productStats, setProductStats] = useState<ProductStats | null>(null);
    const [chartsData, setChartsData] = useState<DashboardChartsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sellers, setSellers] = useState<Array<{ id: number; label: string }>>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string>('');
    const [isLoadingSellers, setIsLoadingSellers] = useState(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const { authUser: user } = useAppSelector(state => state.user);
    const { active_role } = useAppSelector(state => state.menus_role)

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const chartParams = {
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                sellerId: UtilMethods.isAdmin() ? selectedSellerId || undefined : undefined,
                categoryId: selectedCategoryId || undefined,
            };

            const chartsResponse = await DasboardAPI.getCharts(chartParams);
            setChartsData(chartsResponse.data as DashboardChartsStats);

            const salesResponse = await DasboardAPI.getSalesStats(chartParams);
            setSalesStats(salesResponse.data as SaleStats);

            const productResponse = await DasboardAPI.getProductStats();
            setProductStats(productResponse.data as ProductStats);

            if (UtilMethods.isAdmin()) {
                const accountResponse = await DasboardAPI.getAccountStats();
                setAccountStats(accountResponse.data as AccountStats);
            }
        } catch (err) {
            setError(t('dashboard.errorLoadingData'));
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const salesChart = useMemo((): { series: any[]; options: ApexOptions } => {
        const seriesData = chartsData?.sales_overview?.amounts ?? [];
        const categories = chartsData?.sales_overview?.days ?? [];

        return {
            series: [{ name: t('dashboard.paidSales'), data: seriesData }],
            options: {
                chart: {
                    type: 'bar',
                    height: 330,
                    toolbar: { show: false },
                },
                plotOptions: {
                    bar: {
                        borderRadius: 10,
                        columnWidth: '55%',
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                xaxis: {
                    categories,
                    labels: {
                        style: {
                            colors: '#64748b',
                            fontWeight: 600,
                            fontSize: '12px'
                        }
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            colors: '#64748b',
                            fontWeight: 600,
                            fontSize: '12px'
                        },
                        formatter: (value) => UtilMethods.formatAmount(value),
                    }
                },
                grid: { borderColor: 'rgba(226, 232, 240, 0.6)' },
                colors: ['#6366f1'],
                tooltip: {
                    y: { formatter: (value) => UtilMethods.formatAmount(value) },
                },
            }
        };
    }, [chartsData]);

    const revenueChart = useMemo((): { series: number[]; options: ApexOptions } => {
        const seriesData = chartsData?.revenue_distribution?.amounts ?? [];
        const labels = chartsData?.revenue_distribution?.labels ?? [];

        return {
            series: seriesData,
            options: {
                chart: {
                    type: 'donut',
                    height: 330,
                },
                labels,
                legend: {
                    position: 'bottom',
                    labels: { colors: '#64748b' },
                },
                dataLabels: { enabled: false },
                tooltip: {
                    y: { formatter: (value) => UtilMethods.formatAmount(value) },
                },
                plotOptions: {
                    pie: {
                        donut: {
                            labels: {
                                show: true,
                                total: {
                                    show: true,
                                    showAlways: true,
                                    label: t('dashboard.total'),
                                    formatter: function (w) {
                                        return UtilMethods.formatAmount(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0));
                                    }
                                }
                            }
                        }
                    }
                },
                colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#14b8a6'],
            }
        };
    }, [chartsData]);

    const loadSellers = async () => {
        if (!UtilMethods.isAdmin()) {
            setSellers([]);
            return;
        }

        try {
            setIsLoadingSellers(true);
            const res = await UserAPI.sellers('');
            const users = res?.data?.data ?? [];

            const sellerList = users
                .map(u => ({
                    id: u.id,
                    label: `${u?.last_name ?? ''} ${u?.first_name ?? ''}`.trim() || u.email,
                }))
                .sort((a, b) => a.label.localeCompare(b.label));

            setSellers(sellerList);
        } catch (err) {
            console.error('Error loading sellers:', err);
            setSellers([]);
        } finally {
            setIsLoadingSellers(false);
        }
    };

    const loadCategories = async () => {
        setIsLoadingCategories(true);
        try {
            const response = await CategoryAPI.indexAll('');
            setCategories(response.data || []);
        } catch (err) {
            console.error('Failed to load categories:', err);
            setCategories([]);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user, active_role, startDate, endDate, selectedSellerId, selectedCategoryId]);

    useEffect(() => {
        loadSellers();
        loadCategories();
    }, [user, active_role]);

    const handleRefresh = async () => {
        await fetchDashboardData();
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        if (type === 'start') {
            setStartDate(value);
        } else {
            setEndDate(value);
        }
    };

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4, borderRadius: '16px' }}>{error}</Alert>
            </Container>
        );
    }

    return <Box sx={{ position: 'relative' }}>
        <Tooltip title={t('dashboard.refresh')} arrow>
            <IconButton
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    zIndex: 10,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    py: 1.5,
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    '&:hover': {
                        bgcolor: '#f8fafc',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.2s'
                }}
            >
                <RefreshIcon color="primary" />
            </IconButton>
        </Tooltip>

        <Box >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Paper elevation={0} sx={{ ...glassContainerStyle }}>
                    {/* Background decorations for tabs area */}
                    <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '30%', height: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />

                    {/* Tabs */}
                    <Box sx={{
                        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                        px: { xs: 2, md: 4 },
                        pt: 3,
                        pb: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                minHeight: 48,
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)'
                                }
                            }}
                        >
                            <Tab
                                icon={<TrendingUp />}
                                label={t('dashboard.sales')}
                                iconPosition="start"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    color: '#64748b',
                                    '&.Mui-selected': { color: '#6366f1' },
                                    minHeight: 48,
                                    px: 3
                                }}
                            />
                            {UtilMethods.isAdmin() && (
                                <Tab
                                    icon={<AccountBalance />}
                                    label={t('dashboard.accounts')}
                                    iconPosition="start"
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        color: '#64748b',
                                        '&.Mui-selected': { color: '#6366f1' },
                                        minHeight: 48,
                                        px: 3
                                    }}
                                />
                            )}
                            <Tab
                                icon={<Inventory />}
                                label={t('dashboard.products')}
                                iconPosition="start"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    color: '#64748b',
                                    '&.Mui-selected': { color: '#6366f1' },
                                    minHeight: 48,
                                    px: 3
                                }}
                            />
                        </Tabs>

                        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                            <TextField
                                type="date"
                                label={t('dashboard.startDate')}
                                value={startDate}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        fontWeight: 600,
                                        color: '#334155',
                                        '& fieldset': { borderColor: 'rgba(226, 232, 240, 0.8)' },
                                        '&:hover fieldset': { borderColor: '#94a3b8' },
                                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                                    }
                                }}
                            />
                            <TextField
                                type="date"
                                label={t('dashboard.endDate')}
                                value={endDate}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        fontWeight: 600,
                                        color: '#334155',
                                        '& fieldset': { borderColor: 'rgba(226, 232, 240, 0.8)' },
                                        '&:hover fieldset': { borderColor: '#94a3b8' },
                                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                                    }
                                }}
                            />

                            {UtilMethods.isAdmin() && (
                                <TextField
                                    select
                                    label={t('dashboard.seller')}
                                    value={selectedSellerId}
                                    onChange={(e) => setSelectedSellerId(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    sx={{
                                        minWidth: 220,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            bgcolor: 'rgba(255, 255, 255, 0.6)',
                                            fontWeight: 600,
                                            color: '#334155',
                                            '& fieldset': { borderColor: 'rgba(226, 232, 240, 0.8)' },
                                            '&:hover fieldset': { borderColor: '#94a3b8' },
                                            '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        {isLoadingSellers ? t('common.loading') : t('dashboard.allSellers')}
                                    </MenuItem>
                                    {sellers.map(s => (
                                        <MenuItem key={s.id} value={String(s.id)}>{s.label}</MenuItem>
                                    ))}
                                </TextField>
                            )}

                            <TextField
                                select
                                label={t('dashboard.category')}
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{
                                    minWidth: 220,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        fontWeight: 600,
                                        color: '#334155',
                                        '& fieldset': { borderColor: 'rgba(226, 232, 240, 0.8)' },
                                        '&:hover fieldset': { borderColor: '#94a3b8' },
                                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    {isLoadingCategories ? t('common.loading') : t('dashboard.allCategories')}
                                </MenuItem>
                                {categories.map(c => (
                                    <MenuItem key={c.id} value={String(c.id)}>{c.label}</MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Box>

                    {/* Tab Content */}
                    <Box sx={{ position: 'relative', zIndex: 1, minHeight: 400 }}>
                        <TabPanel value={tabValue} index={0}>
                            {loading ? (
                                <Grid container spacing={4}>
                                    {[1, 2, 3].map((item) => (
                                        <Grid item xs={12} md={4} key={item}>
                                            <Card sx={{ ...glassCardStyle }}>
                                                <CardContent sx={{ p: 4 }}>
                                                    <Skeleton variant="text" width="60%" height={30} />
                                                    <Skeleton variant="rectangular" height={80} sx={{ my: 2, borderRadius: '16px' }} />
                                                    <Skeleton variant="text" width="40%" />
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <>
                                    <Grid container spacing={4} sx={{ mb: 2 }}>
                                        <Grid item xs={12} md={7}>
                                            <Card sx={{ ...glassCardStyle }}>
                                                <CardContent sx={{ p: 4 }}>
                                                    <Typography sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 2 }}>
                                                        {t('dashboard.salesOverview')}
                                                    </Typography>
                                                    <ReactApexChart options={salesChart.options} series={salesChart.series} type="bar" height={330} />
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <Card sx={{ ...glassCardStyle }}>
                                                <CardContent sx={{ p: 4 }}>
                                                    <Typography sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 2 }}>
                                                        {t('dashboard.revenueDistribution')}
                                                    </Typography>
                                                    <ReactApexChart options={revenueChart.options} series={revenueChart.series} type="donut" height={330} />
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>

                                    {salesStats && <SalesStats stats={salesStats} />}
                                </>
                            )}
                        </TabPanel>

                        {UtilMethods.isAdmin() && (
                            <TabPanel value={tabValue} index={1}>
                                {loading ? (
                                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '24px' }} />
                                ) : accountStats && (
                                    <AccountsStats stats={accountStats} />
                                )}
                            </TabPanel>
                        )}

                        <TabPanel value={tabValue} index={UtilMethods.isAdmin() ? 2 : 1}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '24px' }} />
                            ) : productStats && (
                                <ProductsStats stats={productStats} />
                            )}
                        </TabPanel>
                    </Box>
                </Paper>
            </motion.div>
        </Box>
    </Box>
};
