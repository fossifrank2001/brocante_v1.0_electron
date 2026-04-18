import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Chip, Button, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    LinearProgress, Alert, IconButton, Switch, FormControlLabel, Tooltip, Pagination
} from '@mui/material';
import {
    TbClipboardList, TbPlus, TbPlayerPlay, TbCheck, TbX,
    TbArrowBack, TbEdit, TbEye, TbSearch, TbPackage
} from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import Breadcrumd from '@/Components/Breadcrumd';
import InventoryAPI from 'Data/Api/Inventory';
import UtilMethods from 'Data/Utilities/UtilMethods';
import Toast from 'Data/Utilities/Toast';
import { motion } from 'framer-motion';

const statusColors: Record<string, { bg: string; color: string }> = {
    draft: { bg: '#f1f5f9', color: '#475569' },
    in_progress: { bg: '#dbeafe', color: '#1d4ed8' },
    completed: { bg: '#dcfce7', color: '#16a34a' },
    cancelled: { bg: '#fef2f2', color: '#dc2626' },
};

const InventoryPage: React.FC = () => {
    const { t } = useTranslation();
    const [inventories, setInventories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [completeOpen, setCompleteOpen] = useState(false);
    const [applyAdjustments, setApplyAdjustments] = useState(false);
    const [itemSearch, setItemSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemPage, setItemPage] = useState(0);
    const [itemRowsPerPage, setItemRowsPerPage] = useState(10);

    const loadInventories = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await InventoryAPI.index({ page: pageNum });
            const result = res.data?.data;
            if (result && result.data) {
                setInventories(result.data);
                setTotalPages(result.last_page);
                setPage(result.current_page);
            } else {
                setInventories(Array.isArray(result) ? result : []);
                setTotalPages(1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadInventories(page); }, [loadInventories, page]);

    const loadDetail = useCallback(async (id: number) => {
        setDetailLoading(true);
        try {
            const res = await InventoryAPI.show(id);
            setSelectedInventory(res.data?.data);
            setItemPage(0); // Reset item page when switching inventory
        } catch (e) {
            console.error(e);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            await InventoryAPI.store({ name: newName, notes: newNotes || undefined });
            setCreateOpen(false);
            setNewName('');
            setNewNotes('');
            Toast.success(t('inventory.title') + ' créé');
            loadInventories();
        } catch (e: any) {
            Toast.error(e?.message || 'Error');
        }
    };

    const handleStart = async (id: number) => {
        try {
            await InventoryAPI.start(id);
            Toast.success(t('inventory.start'));
            if (selectedInventory?.id === id) loadDetail(id);
            loadInventories();
        } catch (e: any) {
            Toast.error(e?.message || 'Error');
        }
    };

    const handleComplete = async () => {
        if (!selectedInventory) return;
        try {
            await InventoryAPI.complete(selectedInventory.id, applyAdjustments);
            setCompleteOpen(false);
            Toast.success(t('inventory.completed'));
            loadDetail(selectedInventory.id);
            loadInventories();
        } catch (e: any) {
            Toast.error(e?.message || 'Error');
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await InventoryAPI.cancel(id);
            Toast.success(t('inventory.cancelled'));
            if (selectedInventory?.id === id) loadDetail(id);
            loadInventories();
        } catch (e: any) {
            Toast.error(e?.message || 'Error');
        }
    };

    const handleUpdateItem = async (itemId: number, countedQty: number, note?: string) => {
        if (!selectedInventory) return;
        try {
            await InventoryAPI.updateItem(selectedInventory.id, itemId, {
                counted_quantity: countedQty,
                note,
            });
            loadDetail(selectedInventory.id);
        } catch (e: any) {
            Toast.error(e?.message || 'Error');
        }
    };

    const cardStyle = {
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
    };

    // Detail view
    if (selectedInventory) {
        const inv = selectedInventory;
        const progress = inv.progress || { total: 0, counted: 0, percent: 0 };
        const statusStyle = statusColors[inv.status] || statusColors.draft;

        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <IconButton onClick={() => setSelectedInventory(null)} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                        <TbArrowBack size={20} />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{inv.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{inv.reference}</Typography>
                    </Box>
                    <Chip label={t(`inventory.${inv.status === 'in_progress' ? 'inProgress' : inv.status}`)}
                        sx={{ fontWeight: 800, bgcolor: statusStyle.bg, color: statusStyle.color, borderRadius: '8px', px: 1 }} />
                    <Box sx={{ flex: 1 }} />
                    {inv.status === 'draft' && (
                        <Button variant="contained" startIcon={<TbPlayerPlay />} onClick={() => handleStart(inv.id)}
                            sx={{ borderRadius: '12px', textTransform: 'none', bgcolor: '#4f46e5', fontWeight: 700, px: 3, boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.2)' }}>
                            {t('inventory.start')}
                        </Button>
                    )}
                    {inv.status === 'in_progress' && (
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button variant="outlined" color="error" startIcon={<TbX />}
                                onClick={() => handleCancel(inv.id)}
                                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}>
                                {t('inventory.cancel')}
                            </Button>
                            <Button variant="contained" color="success" startIcon={<TbCheck />}
                                onClick={() => setCompleteOpen(true)}
                                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, boxShadow: '0 4px 6px -1px rgb(22 163 74 / 0.2)' }}>
                                {t('inventory.complete')}
                            </Button>
                        </Box>
                    )}
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ borderRadius: '24px', p: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #f1f5f9' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('inventory.progress')}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#4f46e5' }}>
                                    {progress.counted} / {progress.total}
                                </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress.percent}
                                sx={{ height: 12, borderRadius: 6, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#4f46e5', borderRadius: 6 } }} />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                                    {progress.percent}% {t('inventory.completedShort', 'complété')}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: '24px', p: 3, height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>{t('inventory.createdBy')}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569' }}>
                                    {inv.user?.first_name?.[0]}{inv.user?.last_name?.[0]}
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{inv.user?.first_name} {inv.user?.last_name}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                {detailLoading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Items filter */}
                <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('common.search')}
                        value={itemSearch}
                        onChange={e => setItemSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <TbSearch size={18} style={{ marginRight: 8, color: '#64748b' }} />,
                            sx: { borderRadius: '12px', bgcolor: 'white', width: 300 }
                        }}
                    />
                </Box>

                {/* Items table */}
                <Card sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #f1f5f9' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748b', py: 2, pl: 3 }}>{t('reports.product')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="right">{t('inventory.expectedQty')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="right">{t('inventory.countedQty')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="right">{t('inventory.difference')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="left">{t('inventory.notes')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="center">Status</TableCell>
                                    {inv.status === 'in_progress' && (
                                        <TableCell sx={{ fontWeight: 800, color: '#64748b', pr: 3 }} align="center">Action</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(inv.items || [])
                                    .filter((item: any) => 
                                        item.product?.name?.toLowerCase().includes(itemSearch.toLowerCase()) || 
                                        item.product?.internal_reference?.toLowerCase().includes(itemSearch.toLowerCase()) ||
                                        item.product?.subcategories?.some((s: any) => s.label.toLowerCase().includes(itemSearch.toLowerCase()))
                                    )
                                    .slice(itemPage * itemRowsPerPage, itemPage * itemRowsPerPage + itemRowsPerPage)
                                    .map((item: any) => (
                                        <InventoryItemRow key={item.id} item={item} editable={inv.status === 'in_progress'}
                                            onSave={(qty, note) => handleUpdateItem(item.id, qty, note)} />
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={(inv.items || []).filter((item: any) => 
                            item.product?.name?.toLowerCase().includes(itemSearch.toLowerCase()) || 
                            item.product?.internal_reference?.toLowerCase().includes(itemSearch.toLowerCase())
                        ).length}
                        rowsPerPage={itemRowsPerPage}
                        page={itemPage}
                        onPageChange={(_, newPage) => setItemPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setItemRowsPerPage(parseInt(e.target.value, 10));
                            setItemPage(0);
                        }}
                    />
                </Card>

                {/* Complete dialog */}
                <Dialog open={completeOpen} onClose={() => setCompleteOpen(false)} maxWidth="sm" fullWidth
                    PaperProps={{ sx: { borderRadius: '20px' } }}>
                    <DialogTitle sx={{ fontWeight: 700 }}>{t('inventory.confirmComplete')}</DialogTitle>
                    <DialogContent>
                        <FormControlLabel
                            control={<Switch checked={applyAdjustments} onChange={(_, v) => setApplyAdjustments(v)} color="primary" />}
                            label={
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('inventory.applyAdjustments')}</Typography>
                                    <Typography variant="caption" color="text.secondary">{t('inventory.applyAdjustmentsDesc')}</Typography>
                                </Box>
                            }
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setCompleteOpen(false)} sx={{ borderRadius: '12px', textTransform: 'none' }}>
                            {t('inventory.cancel')}
                        </Button>
                        <Button variant="contained" color="success" onClick={handleComplete}
                            sx={{ borderRadius: '12px', textTransform: 'none' }}>
                            {t('inventory.complete')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    // List view
    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumd  parent={t('inventory.title')} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" startIcon={<TbPlus />} onClick={() => setCreateOpen(true)}
                    sx={{ fontWeight: 700, '&:hover': { bgcolor: '#4338ca' } }}>
                    {t('inventory.create')}
                </Button>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

            <Grid container spacing={3}>
                {inventories.map((inv: any) => {
                    const statusStyle = statusColors[inv.status] || statusColors.draft;
                    return (
                        <Grid item xs={12} md={6} lg={4} key={inv.id}>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card sx={cardStyle} onClick={() => loadDetail(inv.id)}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(79,70,229,0.1)' }}>
                                                <TbClipboardList size={22} color="#4f46e5" />
                                            </Box>
                                            <Chip size="small"
                                                label={t(`inventory.${inv.status === 'in_progress' ? 'inProgress' : inv.status}`)}
                                                sx={{ fontWeight: 700, bgcolor: statusStyle.bg, color: statusStyle.color, borderRadius: '8px' }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{inv.name}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                            {inv.reference}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {inv.items_count ?? 0} {t('reports.product')}(s)
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(inv.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    );
                })}
            </Grid>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={(_, p) => setPage(pageNum => {
                            loadInventories(p);
                            return p;
                        })} 
                        color="primary" 
                    />
                </Box>
            )}

            {!loading && inventories.length === 0 && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: '16px' }}>{t('inventory.noItems')}</Alert>
            )}

            {/* Create dialog */}
            <Dialog 
                open={createOpen} 
                onClose={() => setCreateOpen(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px' } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {t('inventory.create')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField 
                            fullWidth 
                            label={t('inventory.name')}
                            placeholder={t('inventory.namePlaceholder', 'ex: Inventaire Mensuel')}
                            value={newName}
                            variant="outlined"
                            onChange={e => setNewName(e.target.value)} 
                            sx={{ mb: 3 }}
                        />
                        <Grid item xs={12}>
                            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                {t('inventory.notes')}
                            </Typography>
                            <textarea
                                value={newNotes}
                                onChange={e => setNewNotes(e.target.value)}
                                placeholder={t('inventory.notesPlaceholder', 'Observations...')}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(0, 0, 0, 0.23)',
                                    backgroundColor: 'white',
                                    fontFamily: 'inherit',
                                    fontSize: '0.9375rem',
                                    resize: 'vertical',
                                    minHeight: '100px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#4f46e5';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.23)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setCreateOpen(false)} 
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleCreate} 
                        disabled={!newName.trim()}
                        sx={{ 
                            textTransform: 'none', 
                            bgcolor: '#4f46e5', 
                            fontWeight: 700,
                        }}
                    >
                        {t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// Inline editable row for inventory items
const InventoryItemRow: React.FC<{
    item: any;
    editable: boolean;
    onSave: (qty: number, note?: string) => void;
}> = ({ item, editable, onSave }) => {
    const { t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const [qty, setQty] = useState(item.counted_quantity ?? '');
    const [note, setNote] = useState(item.note ?? '');

    const diff = item.difference;
    const diffColor = diff > 0 ? '#059669' : diff < 0 ? '#dc2626' : '#64748b';

    return (
        <TableRow sx={{ 
            bgcolor: item.is_counted ? 'transparent' : 'rgba(251,191,36,0.04)',
            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.02)' },
            transition: 'background-color 0.2s'
        }}>
            <TableCell sx={{ py: 2, pl: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '12px', 
                        bgcolor: '#f8fafc', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        {item.product?.thumbnail ? (
                            <img src={item.product.thumbnail.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <TbPackage size={24} />
                        )}
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2, mb: 0.5 }}>
                            {item.product?.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            {item.product?.internal_reference && (
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, bgcolor: '#f1f5f9', px: 1, py: 0.3, borderRadius: '6px', fontSize: '0.65rem' }}>
                                    {item.product.internal_reference}
                                </Typography>
                            )}
                            {item.product?.unit?.abbreviation && (
                                <Typography variant="caption" sx={{ color: '#4f46e5', fontWeight: 800, fontSize: '0.7rem' }}>
                                    {item.product.unit.abbreviation}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {parseFloat(item.expected_quantity).toFixed(item.product?.unit?.allows_decimal ? 3 : 0)}
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>THÉORIQUE</Typography>
                </Box>
            </TableCell>
            <TableCell align="right">
                {editing ? (
                    <TextField 
                        size="small" 
                        type="number" 
                        value={qty} 
                        onChange={e => setQty(e.target.value)}
                        variant="standard"
                        InputProps={{
                            sx: {
                                width: 80,
                                fontWeight: 700,
                            }
                        }}
                        autoFocus 
                    />
                ) : (
                    <Typography sx={{ fontWeight: 700, color: item.is_counted ? '#1e293b' : '#94a3b8' }}>
                        {item.is_counted ? parseFloat(item.counted_quantity).toFixed(item.product?.unit?.allows_decimal ? 3 : 0) : '—'}
                    </Typography>
                )}
            </TableCell>
            <TableCell align="right">
                {item.is_counted ? (
                    <Typography sx={{ fontWeight: 700, color: diffColor }}>
                        {diff > 0 ? '+' : ''}{parseFloat(diff).toFixed(item.product?.unit?.allows_decimal ? 3 : 0)}
                    </Typography>
                ) : '—'}
            </TableCell>
            <TableCell align="left">
                {editing ? (
                    <textarea 
                        value={note} 
                        onChange={e => setNote(e.target.value)}
                        placeholder="..."
                        rows={2}
                        style={{
                            width: '200px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(0, 0, 0, 0.15)',
                            backgroundColor: '#f8fafc',
                            fontFamily: 'inherit',
                            fontSize: '0.8rem',
                            resize: 'vertical',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)'}
                    />
                ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: 200, display: 'block', fontWeight: 500 }}>
                        {item.note || ''}
                    </Typography>
                )}
            </TableCell>
            <TableCell align="center">
                <Chip size="small" label={item.is_counted ? '✓' : '—'}
                    sx={{ fontWeight: 700, bgcolor: item.is_counted ? '#dcfce7' : '#f1f5f9', color: item.is_counted ? '#16a34a' : '#94a3b8', borderRadius: '8px' }} />
            </TableCell>
            <TableCell align="center" sx={{ pr: 3 }}>
                {editing ? (
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton size="small" color="primary" sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)' }} onClick={() => {
                            onSave(parseFloat(qty) || 0, note || undefined);
                            setEditing(false);
                        }}>
                            <TbCheck size={18} />
                        </IconButton>
                        <IconButton size="small" sx={{ bgcolor: 'rgba(100, 116, 139, 0.1)' }} onClick={() => setEditing(false)}>
                            <TbX size={18} />
                        </IconButton>
                    </Box>
                ) : (
                    <Tooltip title={t('common.edit')}>
                        <IconButton size="small" onClick={() => setEditing(true)} sx={{ color: '#4f46e5', bgcolor: 'rgba(79, 70, 229, 0.05)' }}>
                            <TbEdit size={18} />
                        </IconButton>
                    </Tooltip>
                )}
            </TableCell>
        </TableRow>
    );
};

export default InventoryPage;
