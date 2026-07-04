import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Box, Typography,
    Card, CardContent, Grid, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Tabs, Tab, Divider, Avatar, Stack
} from '@mui/material';
import { Close, Person, ShoppingBag, AccountBalanceWallet, Loyalty, TrendingDown, Receipt } from '@mui/icons-material';
import CustomerAPI from '@/Data/Api/Customer';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { IPerson } from '@/Data/Interfaces/Person';
import { useTranslation } from 'react-i18next';

interface CustomerHistoryProps {
    customer: IPerson;
    open: boolean;
    onClose: () => void;
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    paid: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Payé' },
    pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', label: 'En attente' },
    partially_paid: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', label: 'Partiel' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Annulé' },
};

const CustomerHistory: React.FC<CustomerHistoryProps> = ({ customer, open, onClose }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [tab, setTab] = useState(0);

    const fetchHistory = useCallback(async () => {
        if (!customer?.id) return;
        setLoading(true);
        try {
            const res = await CustomerAPI.history(customer.id);
            setData(res.data);
        } catch (e) {
            console.error('Error fetching history:', e);
        } finally {
            setLoading(false);
        }
    }, [customer?.id]);

    useEffect(() => {
        if (open) {
            fetchHistory();
            setTab(0);
        }
    }, [open, fetchHistory]);

    const summary = data?.summary;
    const sells = data?.sells?.data || [];
    const balanceTransactions = data?.balance_transactions || [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { borderRadius: '20px' } }}>
            <DialogTitle sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 3, borderBottom: '1px solid', borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <Person />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            {customer.lastname} {customer.firstname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {customer.phone}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {[
                                { label: t('customer.totalSells', 'Total ventes'), value: summary?.total_sells ?? 0, icon: <ShoppingBag />, color: '#4f46e5' },
                                { label: t('customer.totalSpent', 'Total dépensé'), value: UtilMethods.formatNumber(summary?.total_spent ?? 0), icon: <Receipt />, color: '#059669' },
                                { label: t('customer.availableBalance'), value: UtilMethods.formatNumber(summary?.company_balance ?? 0), icon: <AccountBalanceWallet />, color: '#10b981' },
                                { label: t('customer.totalDebts'), value: UtilMethods.formatNumber(summary?.total_debt ?? 0), icon: <TrendingDown />, color: '#ef4444' },
                                { label: t('posCheckout.loyaltyPoints', 'Points'), value: summary?.loyalty_points ?? 0, icon: <Loyalty />, color: '#f59e0b' },
                            ].map((item, i) => (
                                <Grid item xs={6} sm={4} md={2.4} key={i}>
                                    <Card variant="outlined" sx={{ borderRadius: '14px', textAlign: 'center' }}>
                                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Box sx={{ color: item.color, mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                                                {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: item.color, fontSize: '1rem' }}>
                                                {item.value}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
                                                {item.label}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                            <Tab label={t('customer.purchases', 'Achats')} />
                            <Tab label={t('customer.transactions', 'Transactions')} />
                        </Tabs>

                        {tab === 0 && (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '14px' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="right">Payé</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="center">Statut</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sells.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                    <Typography color="text.secondary">{t('common.noData', 'Aucune donnée')}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sells.map((sell: any) => {
                                                const st = statusColors[sell.status] || statusColors.pending;
                                                return (
                                                    <TableRow key={sell.id} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                                                {sell.sell_code}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {sell.created_at ? new Date(sell.created_at).toLocaleDateString('fr-FR') : '-'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                            {UtilMethods.formatNumber(sell.total_amount)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {UtilMethods.formatNumber(sell.amount_paid || 0)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={st.label}
                                                                size="small"
                                                                sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700, borderRadius: '8px', fontSize: '0.7rem' }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {tab === 1 && (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '14px' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="right">Montant</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {balanceTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                    <Typography color="text.secondary">{t('common.noData', 'Aucune donnée')}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            balanceTransactions.map((txn: any) => (
                                                <TableRow key={txn.id} hover>
                                                    <TableCell>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {txn.created_at ? new Date(txn.created_at).toLocaleDateString('fr-FR') : '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={txn.type}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700, borderRadius: '8px', fontSize: '0.7rem',
                                                                bgcolor: txn.type === 'credit' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                color: txn.type === 'credit' ? '#10b981' : '#ef4444',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: txn.type === 'credit' ? '#10b981' : '#ef4444' }}>
                                                        {txn.type === 'credit' ? '+' : '-'}{UtilMethods.formatNumber(txn.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {txn.description || txn.source || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CustomerHistory;
