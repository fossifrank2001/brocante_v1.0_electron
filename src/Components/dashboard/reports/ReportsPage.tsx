import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Chip, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Tab, Tabs, LinearProgress, Alert
} from '@mui/material';
import {
    TbShoppingCart, TbTrendingUp, TbAlertTriangle,
    TbCalendar, TbCurrencyDollar, TbPackage, TbChartBar, TbDownload, TbCalendarTime
} from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import Breadcrumd from '@/Components/Breadcrumd';
import ReportAPI from 'Data/Api/Report';
import UtilMethods from 'Data/Utilities/UtilMethods';
import { motion } from 'framer-motion';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
);

const ReportsPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    const [salesData, setSalesData] = useState<any>(null);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [profitData, setProfitData] = useState<any>(null);
    const [lowStockData, setLowStockData] = useState<any>(null);
    const [expiryData, setExpiryData] = useState<any>(null);
    const [expiryDays, setExpiryDays] = useState(30);
    const [exporting, setExporting] = useState(false);

    const reportTypes = ['sales_summary', 'top_products', 'profit', 'low_stock', 'expiry'];

    const handleExport = async () => {
        const type = reportTypes[activeTab] || 'sales_summary';
        setExporting(true);
        try {
            const params = activeTab === 3 || activeTab === 4 ? {} : { start_date: startDate, end_date: endDate };
            const res = await ReportAPI.exportCsv(type, params);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${type}_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Export error:', e);
        } finally {
            setExporting(false);
        }
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { start_date: startDate, end_date: endDate };
            const [salesRes, topRes, profitRes, lowStockRes, expiryRes] = await Promise.all([
                ReportAPI.salesSummary(params),
                ReportAPI.topProducts(params),
                ReportAPI.profitReport(params),
                ReportAPI.lowStock(),
                ReportAPI.expiryReport({ days: expiryDays }),
            ]);
            setSalesData(salesRes.data?.data);
            setTopProducts(topRes.data?.data || []);
            setProfitData(profitRes.data?.data);
            setLowStockData(lowStockRes.data?.data);
            setExpiryData(expiryRes.data?.data);
        } catch (e) {
            console.error('Report load error:', e);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, expiryDays]);

    useEffect(() => { loadData(); }, [loadData]);

    const statCardStyle = {
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumd parent={t('reports.title')} />

            {/* Date filters */}
            <Card sx={{ ...statCardStyle, mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <TbCalendar size={22} color="#4f46e5" />
                    <TextField
                        type="date" size="small" label={t('reports.from')}
                        value={startDate} onChange={e => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        type="date" size="small" label={t('reports.to')}
                        value={endDate} onChange={e => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <Button variant="contained" onClick={loadData} disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none', bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : t('reports.apply')}
                    </Button>
                    <Button variant="outlined" onClick={handleExport} disabled={exporting}
                        startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <TbDownload size={18} />}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }}>
                        {t('reports.exportCsv', 'Exporter CSV')}
                    </Button>
                </Box>
            </Card>

            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
                sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, borderRadius: '12px 12px 0 0' } }}>
                <Tab icon={<TbShoppingCart size={18} />} iconPosition="start" label={t('reports.salesSummary')} />
                <Tab icon={<TbTrendingUp size={18} />} iconPosition="start" label={t('reports.topProducts')} />
                <Tab icon={<TbCurrencyDollar size={18} />} iconPosition="start" label={t('reports.profitReport')} />
                <Tab icon={<TbAlertTriangle size={18} />} iconPosition="start" label={t('reports.lowStock')} />
                <Tab icon={<TbCalendarTime size={18} />} iconPosition="start" label={t('reports.expiry', 'Expiration')} />
            </Tabs>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

            {/* Sales Summary */}
            <TabPanel value={activeTab} index={0}>
                {salesData && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {[
                                { label: t('reports.totalSales'), value: salesData.summary?.total_sales, color: '#4f46e5', icon: <TbShoppingCart /> },
                                { label: t('reports.totalRevenue'), value: UtilMethods.formatAmount(salesData.summary?.total_revenue || 0), color: '#059669', icon: <TbCurrencyDollar /> },
                                { label: t('reports.paidSales'), value: salesData.summary?.paid_count, color: '#0891b2', icon: <TbChartBar /> },
                                { label: t('reports.pendingSales'), value: salesData.summary?.pending_count, color: '#d97706', icon: <TbAlertTriangle /> },
                                { label: t('reports.cancelledSales'), value: salesData.summary?.cancelled_count, color: '#dc2626', icon: <TbPackage /> },
                                { label: t('reports.totalDiscounts'), value: UtilMethods.formatAmount(salesData.summary?.total_discounts || 0), color: '#7c3aed', icon: <TbTrendingUp /> },
                            ].map((item, i) => (
                                <Grid item xs={6} md={4} lg={2} key={i}>
                                    <Card sx={statCardStyle}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: item.color }}>{item.value}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{item.label}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Daily breakdown table */}
                        {salesData.daily?.length > 0 && (
                            <Card sx={statCardStyle}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('reports.dailySales')}</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.count')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.revenue')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {salesData.daily.map((row: any, i: number) => (
                                                    <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.04)' } }}>
                                                        <TableCell>{row.day}</TableCell>
                                                        <TableCell align="right">{row.count}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600 }}>{UtilMethods.formatAmount(row.revenue)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* By seller */}
                        {salesData.by_seller?.length > 0 && (
                            <Card sx={{ ...statCardStyle, mt: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('reports.bySeller')}</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>Vendeur</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.count')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.revenue')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.avgBasket', 'Panier moyen')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.totalDiscounts')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {salesData.by_seller.map((row: any, i: number) => (
                                                    <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.04)' } }}>
                                                        <TableCell>{row.seller?.first_name} {row.seller?.last_name}</TableCell>
                                                        <TableCell align="right">{row.count}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600 }}>{UtilMethods.formatAmount(row.revenue)}</TableCell>
                                                        <TableCell align="right">{UtilMethods.formatAmount(row.avg_basket || 0)}</TableCell>
                                                        <TableCell align="right" sx={{ color: '#7c3aed' }}>{UtilMethods.formatAmount(row.total_discount || 0)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </TabPanel>

            {/* Top Products */}
            <TabPanel value={activeTab} index={1}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {topProducts.length > 0 ? (
                        <Card sx={statCardStyle}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('reports.topProducts')}</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>{t('reports.product')}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.qtySold')}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.revenue')}</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.count')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topProducts.map((row: any, i: number) => (
                                                <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.04)' } }}>
                                                    <TableCell>
                                                        <Chip label={i + 1} size="small"
                                                            sx={{ fontWeight: 700, bgcolor: i < 3 ? '#fef3c7' : 'default', color: i < 3 ? '#92400e' : 'default' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.product?.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{row.product?.internal_reference}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">{parseFloat(row.total_qty).toFixed(2)}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{UtilMethods.formatAmount(row.total_revenue)}</TableCell>
                                                    <TableCell align="right">{row.sell_count}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    ) : !loading && (
                        <Alert severity="info" sx={{ borderRadius: '16px' }}>{t('reports.noData')}</Alert>
                    )}
                </motion.div>
            </TabPanel>

            {/* Profit Report */}
            <TabPanel value={activeTab} index={2}>
                {profitData && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            {[
                                { label: t('reports.totalRevenue'), value: UtilMethods.formatAmount(profitData.totals?.total_revenue || 0), color: '#059669' },
                                { label: t('reports.totalCost'), value: UtilMethods.formatAmount(profitData.totals?.total_cost || 0), color: '#dc2626' },
                                { label: t('reports.totalProfit'), value: UtilMethods.formatAmount(profitData.totals?.total_profit || 0), color: '#4f46e5' },
                                { label: t('reports.marginPercent'), value: `${profitData.totals?.margin_percent || 0}%`, color: '#7c3aed' },
                            ].map((item, i) => (
                                <Grid item xs={6} md={3} key={i}>
                                    <Card sx={statCardStyle}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: item.color }}>{item.value}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{item.label}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {profitData.products?.length > 0 && (
                            <Card sx={statCardStyle}>
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>{t('reports.product')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.qtySold')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.revenue')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.totalCost')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.totalProfit')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {profitData.products.map((row: any, i: number) => (
                                                    <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.04)' } }}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.product?.name}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">{parseFloat(row.total_qty).toFixed(2)}</TableCell>
                                                        <TableCell align="right">{UtilMethods.formatAmount(row.total_revenue)}</TableCell>
                                                        <TableCell align="right">{UtilMethods.formatAmount(row.total_cost)}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700, color: parseFloat(row.total_profit) >= 0 ? '#059669' : '#dc2626' }}>
                                                            {UtilMethods.formatAmount(row.total_profit)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </TabPanel>

            {/* Low Stock */}
            <TabPanel value={activeTab} index={3}>
                {lowStockData && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={6} md={4}>
                                <Card sx={statCardStyle}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#d97706' }}>{lowStockData.total_low_stock}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('reports.lowStockCount')}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={4}>
                                <Card sx={statCardStyle}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626' }}>{lowStockData.total_out_of_stock}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('reports.outOfStockCount')}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={4}>
                                <Card sx={statCardStyle}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#4f46e5' }}>{lowStockData.global_threshold}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('reports.threshold')}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {lowStockData.products?.length > 0 ? (
                            <Card sx={statCardStyle}>
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>{t('reports.product')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.currentStock')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">{t('reports.threshold')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {lowStockData.products.map((product: any, i: number) => (
                                                    <TableRow key={i} sx={{
                                                        '&:hover': { bgcolor: 'rgba(79,70,229,0.04)' },
                                                        bgcolor: product.is_out_of_stock ? 'rgba(220,38,38,0.04)' : 'transparent'
                                                    }}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{product.internal_reference}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography sx={{ fontWeight: 700, color: product.is_out_of_stock ? '#dc2626' : '#d97706' }}>
                                                                {parseFloat(product.stock_quantity).toFixed(product.unit?.allows_decimal ? 3 : 0)}
                                                                {product.unit ? ` ${product.unit.abbreviation}` : ''}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">{product.effective_threshold}</TableCell>
                                                        <TableCell align="center">
                                                            <Chip size="small"
                                                                label={product.is_out_of_stock ? t('reports.outOfStock') : t('reports.lowStock')}
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    bgcolor: product.is_out_of_stock ? '#fef2f2' : '#fffbeb',
                                                                    color: product.is_out_of_stock ? '#dc2626' : '#d97706',
                                                                    borderRadius: '8px'
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        ) : !loading && (
                            <Alert severity="success" sx={{ borderRadius: '16px' }}>Tous les produits sont en stock !</Alert>
                        )}
                    </motion.div>
                )}
            </TabPanel>

            {/* Expiry Tracking */}
            <TabPanel value={activeTab} index={4}>
                {expiryData && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                            <TextField
                                type="number" size="small" label={t('reports.expiryDays', 'Jours avant alerte')}
                                value={expiryDays} onChange={e => setExpiryDays(parseInt(e.target.value) || 30)}
                                sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Button variant="outlined" size="small" onClick={() => loadData()}
                                sx={{ borderRadius: '12px', textTransform: 'none' }}>
                                {t('common.refresh')}
                            </Button>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {[
                                { label: t('reports.expired', 'Expirés'), value: expiryData.counts?.expired || 0, color: '#dc2626', bg: '#fef2f2' },
                                { label: t('reports.expiringSoon', 'Bientôt expirés'), value: expiryData.counts?.expiring_soon || 0, color: '#d97706', bg: '#fffbeb' },
                                { label: t('reports.safe', 'Sains'), value: expiryData.counts?.safe || 0, color: '#059669', bg: '#ecfdf5' },
                            ].map((item, i) => (
                                <Grid item xs={12} sm={4} key={i}>
                                    <Card sx={{ ...statCardStyle, bgcolor: item.bg }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: item.color }}>{item.value}</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: item.color }}>{item.label}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {(expiryData.expired?.length > 0 || expiryData.expiring_soon?.length > 0) ? (
                            <Card sx={{ ...statCardStyle }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>{t('reports.expiryTracking', 'Suivi d\'expiration')}</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
                                                    <TableCell sx={{ fontWeight: 700 }}>Produit</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Référence</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Stock</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Expiration</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Jours restants</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Statut</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {[...(expiryData.expired || []), ...(expiryData.expiring_soon || [])].map((product: any) => (
                                                    <TableRow key={product.id} hover>
                                                        <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                                                        <TableCell><Typography variant="caption" color="text.secondary">{product.internal_reference || '-'}</Typography></TableCell>
                                                        <TableCell align="right">{product.stock_quantity}</TableCell>
                                                        <TableCell align="right">{product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700, color: product.days_until_expiry < 0 ? '#dc2626' : '#d97706' }}>
                                                            {product.days_until_expiry < 0 ? `${Math.abs(product.days_until_expiry)} j dépassés` : `${product.days_until_expiry} j`}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip size="small"
                                                                label={product.expiry_status === 'expired' ? 'Expiré' : 'Bientôt'}
                                                                sx={{ fontWeight: 700, bgcolor: product.expiry_status === 'expired' ? '#fef2f2' : '#fffbeb', color: product.expiry_status === 'expired' ? '#dc2626' : '#d97706', borderRadius: '8px' }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        ) : !loading && (
                            <Alert severity="success" sx={{ borderRadius: '16px' }}>Aucun produit proche de l'expiration !</Alert>
                        )}
                    </motion.div>
                )}
            </TabPanel>
        </Box>
    );
};

export default ReportsPage;
