import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Alert,
    Tabs,
    Tab,
    Paper,
    TextField,
    IconButton,
    Stack,
    Tooltip,
    Skeleton,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';
import {useAppSelector} from "@/hooks";
import {AccountStats, SaleStats, ProductStats} from "Data/Interfaces/dashboard.ts";
import UtilMethods from "Data/Utilities/UtilMethods.ts";
import {SalesStats} from "Components/dashboard/SalesStats.tsx";
import {AccountsStats} from "Components/dashboard/AccountsStats.tsx";
import {ProductsStats} from "Components/dashboard/ProductsStats";
import {Dashboard as DasboardAPI} from "Data/Api/Dashboard.ts";

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
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const DashboardIndicator: React.FC = () => {
    const [accountStats, setAccountStats] = useState<AccountStats | null>(null);
    const [salesStats, setSalesStats] = useState<SaleStats | null>(null);
    const [productStats, setProductStats] = useState<ProductStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { authUser: user } = useAppSelector(state => state.user);
    const {active_role} = useAppSelector(state => state.menus_role)

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const salesResponse = await DasboardAPI.getSalesStats({
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            setSalesStats(salesResponse.data as SaleStats);

            const productResponse = await DasboardAPI.getProductStats();
            setProductStats(productResponse.data as ProductStats);

            if (UtilMethods.isAdmin()) {
                const accountResponse = await DasboardAPI.getAccountStats();
                setAccountStats(accountResponse.data as AccountStats);
            }
        } catch (err) {
            setError('Failed to load dashboard data. Please try again later.');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
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

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
                    {/* Tabs Skeleton */}
                    <Box sx={{ mb: 3 }}>
                        <Skeleton variant="rectangular" width={200} height={40} />
                    </Box>

                    {/* Stats Cards Skeletons */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={30} />
                                    <Skeleton variant="rectangular" height={60} sx={{ my: 2 }} />
                                    <Skeleton variant="text" width="40%" />
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={30} />
                                    <Skeleton variant="rectangular" height={60} sx={{ my: 2 }} />
                                    <Skeleton variant="text" width="40%" />
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={30} />
                                    <Skeleton variant="rectangular" height={60} sx={{ my: 2 }} />
                                    <Skeleton variant="text" width="40%" />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            <Box 
                sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    zIndex: 1000 
                }}
            >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Tooltip title="Refresh Data">
                        <IconButton 
                            onClick={handleRefresh}
                            sx={{
                                bgcolor: 'background.paper',
                                boxShadow: 2,
                                '&:hover': {
                                    bgcolor: 'background.paper',
                                }
                            }}
                            color="primary"
                            disabled={loading}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </motion.div>
            </Box>

            <Container maxWidth="lg">
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                indicatorColor="primary"
                                textColor="primary"
                            >
                                <Tab label="Sales" />
                                {UtilMethods.isAdmin() && <Tab label="Accounts" />}
                                <Tab label="Products" />
                            </Tabs>
                            
                            {tabValue === 0 && (
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <TextField
                                        type="date"
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(e) => handleDateChange('start', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                    />
                                    <TextField
                                        type="date"
                                        label="End Date"
                                        value={endDate}
                                        onChange={(e) => handleDateChange('end', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                    />
                                </Stack>
                            )}
                        </Stack>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        {loading ? (
                            <Skeleton variant="rectangular" height={200} />
                        ) : salesStats && (
                            <SalesStats stats={salesStats} />
                        )}
                    </TabPanel>

                    {UtilMethods.isAdmin() && (
                        <TabPanel value={tabValue} index={1}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={200} />
                            ) : accountStats && (
                                <AccountsStats stats={accountStats} />
                            )}
                        </TabPanel>
                    )}

                    <TabPanel value={tabValue} index={UtilMethods.isAdmin() ? 2 : 1}>
                        {loading ? (
                            <Skeleton variant="rectangular" height={200} />
                        ) : productStats && (
                            <ProductsStats stats={productStats} />
                        )}
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
};
