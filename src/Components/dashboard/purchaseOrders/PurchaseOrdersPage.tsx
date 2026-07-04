import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Autocomplete, CircularProgress, Tooltip, Stack, Divider
} from '@mui/material';
import {
    Add, Refresh, Delete, Edit, CheckCircle, Cancel, LocalShipping,
    ShoppingCart, ArrowBack
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Breadcrumd from '@/Components/Breadcrumd';
import PurchaseOrderAPI, { IPurchaseOrder, IPurchaseOrderItem, IPurchaseOrderPayload } from '@/Data/Api/PurchaseOrder';
import SupplyAPI from '@/Data/Api/Suppliers';
import ProductAPI from '@/Data/Api/Product';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Toast from '@/Data/Utilities/Toast';
import CustomAlert from '@/Components/CustomAlert';

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: 'Brouillon' },
    pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', label: 'En attente' },
    received: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Reçu' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Annulé' },
};

const PurchaseOrdersPage: React.FC = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<IPurchaseOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<IPurchaseOrder | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [inProgress, setInProgress] = useState(false);

    // Form state
    const [formSupplier, setFormSupplier] = useState<any>(null);
    const [formExpectedDate, setFormExpectedDate] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formItems, setFormItems] = useState<IPurchaseOrderItem[]>([
        { product_name: '', quantity: 1, unit_cost: 0, total: 0, product_id: null },
    ]);
    const [isEditing, setIsEditing] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await PurchaseOrderAPI.index({ per_page: 50 });
            setOrders(res.data?.data || []);
        } catch (e) {
            console.error('Error fetching purchase orders:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSuppliers = useCallback(async () => {
        try {
            const res = await SupplyAPI.index('', true);
            setSuppliers((res.data as any)?.data || res.data || []);
        } catch (e) { console.error(e); }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await ProductAPI.index('', 1, '', '', '', 100);
            setProducts(res.data?.data || []);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchOrders(); fetchSuppliers(); fetchProducts(); }, [fetchOrders, fetchSuppliers, fetchProducts]);

    const resetForm = () => {
        setFormSupplier(null);
        setFormExpectedDate('');
        setFormNotes('');
        setFormItems([{ product_name: '', quantity: 1, unit_cost: 0, total: 0, product_id: null }]);
        setIsEditing(false);
        setSelectedOrder(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setOpenForm(true);
    };

    const handleOpenEdit = (order: IPurchaseOrder) => {
        setSelectedOrder(order);
        setIsEditing(true);
        setFormSupplier(order.supplier ? suppliers.find(s => s.id === order.supplier_id) : null);
        setFormExpectedDate(order.expected_date || '');
        setFormNotes(order.notes || '');
        setFormItems(order.items?.map(i => ({ ...i, total: i.total || i.quantity * i.unit_cost })) || []);
        setOpenForm(true);
    };

    const handleAddItem = () => {
        setFormItems([...formItems, { product_name: '', quantity: 1, unit_cost: 0, total: 0, product_id: null }]);
    };

    const handleRemoveItem = (index: number) => {
        setFormItems(formItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof IPurchaseOrderItem, value: any) => {
        const updated = [...formItems];
        (updated[index] as any)[field] = value;
        updated[index].total = round(updated[index].quantity * updated[index].unit_cost);
        setFormItems(updated);
    };

    const handleProductSelect = (index: number, product: any) => {
        const updated = [...formItems];
        if (product) {
            updated[index].product_id = product.id;
            updated[index].product_name = product.name;
            updated[index].unit_cost = product.cost_price || 0;
            updated[index].total = round(updated[index].quantity * updated[index].unit_cost);
        } else {
            updated[index].product_id = null;
        }
        setFormItems(updated);
    };

    const round = (n: number) => Math.round(n * 100) / 100;

    const formTotal = formItems.reduce((sum, i) => sum + (i.total || 0), 0);

    const handleSubmit = async () => {
        if (formItems.length === 0 || formItems.some(i => !i.product_name || i.quantity <= 0)) {
            Toast.error('Veuillez ajouter au moins un article valide');
            return;
        }
        setInProgress(true);
        try {
            const payload: IPurchaseOrderPayload = {
                supplier_id: formSupplier?.id || null,
                expected_date: formExpectedDate || null,
                notes: formNotes || null,
                items: formItems.map(i => ({
                    product_id: i.product_id,
                    product_name: i.product_name,
                    quantity: i.quantity,
                    unit_cost: i.unit_cost,
                    total: i.total,
                })),
            };
            if (isEditing && selectedOrder?.id) {
                await PurchaseOrderAPI.update(selectedOrder.id, payload);
                Toast.success('Commande mise à jour');
            } else {
                await PurchaseOrderAPI.create(payload);
                Toast.success('Commande créée');
            }
            setOpenForm(false);
            resetForm();
            fetchOrders();
        } catch (e: any) {
            Toast.error(e?.response?.data?.message || 'Erreur');
        } finally {
            setInProgress(false);
        }
    };

    const handleReceive = async (order: IPurchaseOrder) => {
        if (!order.id) return;
        setInProgress(true);
        try {
            await PurchaseOrderAPI.receive(order.id);
            Toast.success('Commande reçue — stock mis à jour');
            fetchOrders();
        } catch (e: any) {
            Toast.error(e?.response?.data?.message || 'Erreur');
        } finally {
            setInProgress(false);
        }
    };

    const handleCancel = async (order: IPurchaseOrder) => {
        if (!order.id) return;
        setInProgress(true);
        try {
            await PurchaseOrderAPI.cancel(order.id);
            Toast.success('Commande annulée');
            fetchOrders();
        } catch (e: any) {
            Toast.error(e?.response?.data?.message || 'Erreur');
        } finally {
            setInProgress(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setInProgress(true);
        try {
            await PurchaseOrderAPI.delete(deleteId);
            Toast.success('Commande supprimée');
            fetchOrders();
        } catch (e: any) {
            Toast.error(e?.response?.data?.message || 'Erreur');
        } finally {
            setInProgress(false);
            setOpenDeleteAlert(false);
        }
    };

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent={t('purchaseOrders.title', "Commandes d'achat")} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>
                        {t('purchaseOrders.title', "Commandes d'achat")}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchOrders}
                            sx={{ borderRadius: '12px', textTransform: 'none' }}>
                            {t('common.refresh')}
                        </Button>
                        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}
                            sx={{ borderRadius: '12px', textTransform: 'none', bgcolor: '#4f46e5' }}>
                            {t('purchaseOrders.new', 'Nouvelle commande')}
                        </Button>
                    </Stack>
                </Box>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '16px' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Fournisseur</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date prévue</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Statut</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center"><Typography color="text.secondary">Aucune commande</Typography></TableCell></TableRow>
                            ) : orders.map((order) => {
                                const st = statusConfig[order.status] || statusConfig.draft;
                                return (
                                    <TableRow key={order.id} hover>
                                        <TableCell><Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{order.po_code}</Typography></TableCell>
                                        <TableCell>{order.supplier?.name || 'N/A'}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>{UtilMethods.formatNumber(order.total_amount)}</TableCell>
                                        <TableCell><Typography variant="caption" color="text.secondary">{order.expected_date || '-'}</Typography></TableCell>
                                        <TableCell align="center"><Chip label={st.label} size="small" sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700 }} /></TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <Tooltip title="Détails">
                                                    <IconButton size="small" onClick={() => { setSelectedOrder(order); setOpenDetail(true); }} sx={{ color: '#6366f1' }}>
                                                        <ShoppingCart sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                {order.status === 'pending' && (
                                                    <>
                                                        <Tooltip title="Modifier">
                                                            <IconButton size="small" onClick={() => handleOpenEdit(order)} sx={{ color: '#6366f1' }}>
                                                                <Edit sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Recevoir">
                                                            <IconButton size="small" onClick={() => handleReceive(order)} disabled={inProgress} sx={{ color: '#10b981' }}>
                                                                <CheckCircle sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Annuler">
                                                            <IconButton size="small" onClick={() => handleCancel(order)} disabled={inProgress} sx={{ color: '#f59e0b' }}>
                                                                <Cancel sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {order.status !== 'received' && (
                                                    <Tooltip title="Supprimer">
                                                        <IconButton size="small" onClick={() => { setDeleteId(order.id!); setOpenDeleteAlert(true); }} sx={{ color: '#ef4444' }}>
                                                            <Delete sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </motion.div>

            {/* Create/Edit Dialog */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {isEditing ? 'Modifier la commande' : "Nouvelle commande d'achat"}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={suppliers}
                                getOptionLabel={(s) => s.name || ''}
                                value={formSupplier}
                                onChange={(_, v) => setFormSupplier(v)}
                                renderInput={(params) => <TextField {...params} label="Fournisseur" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField type="date" label="Date de réception prévue" size="small" fullWidth
                                value={formExpectedDate} onChange={e => setFormExpectedDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Notes" size="small" fullWidth multiline rows={2}
                                value={formNotes} onChange={e => setFormNotes(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Articles</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
                                    <TableCell>Produit</TableCell>
                                    <TableCell align="right">Qté</TableCell>
                                    <TableCell align="right">Coût unit.</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formItems.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <Autocomplete
                                                options={products}
                                                getOptionLabel={(p) => p.name || ''}
                                                value={products.find(p => p.id === item.product_id) || null}
                                                onChange={(_, v) => handleProductSelect(idx, v)}
                                                renderInput={(params) => (
                                                    <TextField {...params} placeholder="Produit" size="small"
                                                        value={item.product_name}
                                                        onChange={e => handleItemChange(idx, 'product_name', e.target.value)}
                                                        sx={{ minWidth: 200 }} />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ width: 80 }}>
                                            <TextField type="number" size="small" value={item.quantity}
                                                onChange={e => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 70 }} />
                                        </TableCell>
                                        <TableCell align="right" sx={{ width: 100 }}>
                                            <TextField type="number" size="small" value={item.unit_cost}
                                                onChange={e => handleItemChange(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                sx={{ width: 90 }} />
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, width: 100 }}>
                                            {UtilMethods.formatNumber(item.total || 0)}
                                        </TableCell>
                                        <TableCell sx={{ width: 50 }}>
                                            {formItems.length > 1 && (
                                                <IconButton size="small" onClick={() => handleRemoveItem(idx)} sx={{ color: '#ef4444' }}>
                                                    <Delete sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button startIcon={<Add />} onClick={handleAddItem} sx={{ mt: 1, textTransform: 'none' }}>
                        Ajouter un article
                    </Button>
                    <Box sx={{ textAlign: 'right', mt: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#4f46e5' }}>
                            Total: {UtilMethods.formatNumber(formTotal)}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenForm(false)} sx={{ borderRadius: '12px', textTransform: 'none' }}>Annuler</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={inProgress}
                        sx={{ borderRadius: '12px', textTransform: 'none', bgcolor: '#4f46e5' }}>
                        {inProgress ? <CircularProgress size={20} color="inherit" /> : isEditing ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
                {selectedOrder && (
                    <>
                        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {selectedOrder.po_code}
                            <Chip label={statusConfig[selectedOrder.status]?.label} size="small"
                                sx={{ bgcolor: statusConfig[selectedOrder.status]?.bg, color: statusConfig[selectedOrder.status]?.color, fontWeight: 700 }} />
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Fournisseur</Typography><Typography fontWeight={700}>{selectedOrder.supplier?.name || 'N/A'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Date prévue</Typography><Typography fontWeight={700}>{selectedOrder.expected_date || '-'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Total</Typography><Typography fontWeight={700} color="#4f46e5">{UtilMethods.formatNumber(selectedOrder.total_amount)}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Date création</Typography><Typography fontWeight={700}>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('fr-FR') : '-'}</Typography></Grid>
                                {selectedOrder.notes && <Grid item xs={12}><Typography variant="caption" color="text.secondary">Notes</Typography><Typography>{selectedOrder.notes}</Typography></Grid>}
                            </Grid>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                                <Table size="small">
                                    <TableHead><TableRow sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Produit</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Qté</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Coût unit.</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                                    </TableRow></TableHead>
                                    <TableBody>
                                        {selectedOrder.items?.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.product_name}</TableCell>
                                                <TableCell align="right">{item.quantity}</TableCell>
                                                <TableCell align="right">{UtilMethods.formatNumber(item.unit_cost)}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{UtilMethods.formatNumber(item.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </DialogContent>
                        <DialogActions><Button onClick={() => setOpenDetail(false)} sx={{ borderRadius: '12px', textTransform: 'none' }}>Fermer</Button></DialogActions>
                    </>
                )}
            </Dialog>

            <CustomAlert
                openDetailModal={openDeleteAlert}
                content={{ style: 'ti ti-info-circle text text-danger', icon: 'Suppression', message: 'Confirmer la suppression de cette commande ?' }}
                onHandleDelete={handleDelete}
                onHandleOpenDetail={() => setOpenDeleteAlert(false)}
                inProgress={inProgress}
            />
        </Box>
    );
};

export default PurchaseOrdersPage;
