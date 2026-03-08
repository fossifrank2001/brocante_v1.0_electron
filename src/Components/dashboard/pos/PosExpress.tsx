import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Typography, TextField, InputAdornment, Chip, IconButton,
    Badge, Tooltip, CircularProgress, Button
} from '@mui/material';
import {
    Search, ShoppingCart, Add, Remove, Delete, Payment,
    Refresh, ClearAll, PointOfSale
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { addToCart, addToCartWithQuantity, removeFromCart, decreaseQuantity, clearCart, CartItem } from '@/Data/Slices/dashboard/seller/cartSlice';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import ProductAPI from '@/Data/Api/Product';
import CategoryAPI from '@/Data/Api/Category';
import { IProduct } from '@/Data/Interfaces/Supply';
import { ICategory } from '@/Data/Interfaces/Category';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Constants from '@/Data/Utilities/constants';
import noImage from '@/assets/images/products/no_image.png';
import Toast from '@/Data/Utilities/Toast';
import QuantityDialog from './QuantityDialog';

const POS_PER_PAGE = 50;

const PosExpress: React.FC = () => {
    const dispatch = useAppDispatch();
    const cart = useAppSelector((state) => state.cart);
    const { currentSession } = useAppSelector((state) => state.cashSession);

    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingCats, setLoadingCats] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

    // Load categories once
    useEffect(() => {
        (async () => {
            try {
                setLoadingCats(true);
                const { data: result } = await CategoryAPI.index();
                setCategories(result.data);
            } catch (e) { console.error(e); }
            finally { setLoadingCats(false); }
        })();
    }, []);

    // Load products with debounce
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const subCats = selectedCategoryId
                ? categories.find(c => c.id === selectedCategoryId)
                    ?.sub_categories?.map(sc => sc.id).join(',') || ''
                : '';
            const { data: res } = await ProductAPI.index(searchTerm, 1, subCats, '', 'stock', POS_PER_PAGE);
            if ('data' in res && Array.isArray(res.data)) {
                setProducts(res.data);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [searchTerm, selectedCategoryId, categories]);

    useEffect(() => {
        const t = setTimeout(() => loadProducts(), 350);
        return () => clearTimeout(t);
    }, [loadProducts]);

    // Auto-focus search
    useEffect(() => { searchRef.current?.focus(); }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F3 → Focus search
            if (e.key === 'F3') {
                e.preventDefault();
                searchRef.current?.focus();
                searchRef.current?.select();
            }
            // F9 → Open cash session modal (handled by CashSessionBar)
            // F12 → Pay / Go to checkout
            if (e.key === 'F12') {
                e.preventDefault();
                handleGoToCheckout();
            }
            // ESC → Clear search & reset category
            if (e.key === 'Escape') {
                e.preventDefault();
                if (searchTerm) {
                    setSearchTerm('');
                } else if (selectedCategoryId) {
                    setSelectedCategoryId(null);
                }
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchTerm, selectedCategoryId, cart.items.length, currentSession]);

    const handleAddProduct = (product: IProduct) => {
        if (product.stock_quantity <= 0) {
            Toast.error('Produit en rupture de stock');
            return;
        }

        // For variable-unit products, show quantity dialog
        if (product.unit?.allows_decimal) {
            setSelectedProduct(product);
            setQuantityDialogOpen(true);
            return;
        }

        // For regular products, add 1 unit directly
        dispatch(addToCart({
            id: product.id,
            imageUrl: product.thumbnail?.path || '',
            name: product.name,
            price: product.price,
            quantity: product.stock_quantity,
            unitAbbreviation: product.unit?.abbreviation || 'pce',
            allowsDecimal: product.unit?.allows_decimal || false,
            pricePerUnit: product.price_per_unit,
        }));
    };

    const handleConfirmQuantity = (quantity: number) => {
        if (!selectedProduct) return;
        dispatch(addToCartWithQuantity({
            product: {
                id: selectedProduct.id,
                imageUrl: selectedProduct.thumbnail?.path || '',
                name: selectedProduct.name,
                price: selectedProduct.price,
                quantity: selectedProduct.stock_quantity,
                unitAbbreviation: selectedProduct.unit?.abbreviation || 'pce',
                allowsDecimal: selectedProduct.unit?.allows_decimal || false,
                pricePerUnit: selectedProduct.price_per_unit,
            },
            qty: quantity,
        }));
    };

    const handleGoToCheckout = () => {
        if (!currentSession) {
            Toast.error('Veuillez ouvrir une session de caisse.', 3000, 'top-center');
            return;
        }
        if (cart.items.length === 0) {
            Toast.error('Le panier est vide.');
            return;
        }
        dispatch(setActivePage({ page: Pages.CART_PAGE }));
    };

    return (
        <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
            {/* LEFT: Products */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid rgba(0,0,0,0.08)' }}>
                {/* Search + Filters bar */}
                <Box sx={{ p: 2, pb: 1.5, bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <TextField
                        inputRef={searchRef}
                        fullWidth size="small"
                        placeholder="Rechercher un produit... (nom, ref, code-barres)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#6366f1' }} /></InputAdornment>,
                            sx: { borderRadius: '12px', bgcolor: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }
                        }}
                    />
                    {/* Category chips */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 2 } }}>
                        <Chip
                            label="Tous"
                            size="small"
                            onClick={() => setSelectedCategoryId(null)}
                            sx={{
                                fontWeight: 700, borderRadius: '10px', px: 1,
                                bgcolor: !selectedCategoryId ? '#6366f1' : 'rgba(0,0,0,0.04)',
                                color: !selectedCategoryId ? '#fff' : '#475569',
                                '&:hover': { bgcolor: !selectedCategoryId ? '#4f46e5' : 'rgba(0,0,0,0.08)' }
                            }}
                        />
                        {categories.map(cat => (
                            <Chip
                                key={cat.id} label={cat.label} size="small"
                                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                                sx={{
                                    fontWeight: 600, borderRadius: '10px', px: 0.5, whiteSpace: 'nowrap',
                                    bgcolor: selectedCategoryId === cat.id ? '#6366f1' : 'rgba(0,0,0,0.04)',
                                    color: selectedCategoryId === cat.id ? '#fff' : '#475569',
                                    '&:hover': { bgcolor: selectedCategoryId === cat.id ? '#4f46e5' : 'rgba(0,0,0,0.08)' }
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Product Grid */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f8fafc' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress sx={{ color: '#6366f1' }} />
                        </Box>
                    ) : products.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                            <Search sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748b' }}>Aucun produit</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5 }}>
                            {products.map(product => (
                                <PosProductCard key={product.id} product={product} onAdd={handleAddProduct} />
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Bottom status + shortcuts */}
                <Box sx={{ px: 2, py: 0.75, bgcolor: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                            {products.length} produit{products.length > 1 ? 's' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            {[
                                { key: 'F3', label: 'Recherche' },
                                { key: 'F12', label: 'Payer' },
                                { key: 'ESC', label: 'Effacer' },
                            ].map(s => (
                                <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ px: 0.8, py: 0.1, bgcolor: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', fontFamily: 'monospace' }}>{s.key}</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{s.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={loadProducts} disabled={loading}>
                        <Refresh fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* RIGHT: Cart Sidebar */}
            <Box sx={{ width: 360, minWidth: 360, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                {/* Cart header */}
                <Box sx={{ p: 2, pb: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PointOfSale sx={{ color: '#6366f1', fontSize: 22 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
                                Panier
                            </Typography>
                            <Badge badgeContent={cart.totalQuantity} color="primary" sx={{ ml: 0.5 }} />
                        </Box>
                        {cart.items.length > 0 && (
                            <Tooltip title="Vider le panier">
                                <IconButton size="small" onClick={() => dispatch(clearCart())} sx={{ color: '#ef4444' }}>
                                    <ClearAll fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                {/* Cart items */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                    {cart.items.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6, color: '#cbd5e1' }}>
                            <ShoppingCart sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#94a3b8' }}>Panier vide</Typography>
                            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Cliquez sur un produit pour l'ajouter</Typography>
                        </Box>
                    ) : (
                        <AnimatePresence>
                            {cart.items.map((item) => (
                                <PosCartItem key={item.product.id} item={item} />
                            ))}
                        </AnimatePresence>
                    )}
                </Box>

                {/* Cart footer / totals */}
                <Box sx={{ borderTop: '2px solid rgba(0,0,0,0.08)', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Articles</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{cart.totalQuantity}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Total</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#6366f1' }}>
                            {UtilMethods.formatNumber(cart.totalPrice)}
                        </Typography>
                    </Box>
                    <Button
                        fullWidth variant="contained" size="large"
                        startIcon={<Payment />}
                        onClick={handleGoToCheckout}
                        disabled={cart.items.length === 0}
                        sx={{
                            bgcolor: '#6366f1', fontWeight: 800, fontSize: '1rem', py: 1.5,
                            borderRadius: '14px', textTransform: 'none',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                            '&:hover': { bgcolor: '#4f46e5' },
                            '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                        }}
                    >
                        Payer ({UtilMethods.formatNumber(cart.totalPrice)})
                    </Button>
                </Box>
            </Box>

            <QuantityDialog
                open={quantityDialogOpen}
                product={selectedProduct}
                onClose={() => setQuantityDialogOpen(false)}
                onConfirm={handleConfirmQuantity}
            />
        </Box>
    );
};

/* ─── Compact Product Card for POS Grid ─── */
const PosProductCard: React.FC<{ product: IProduct; onAdd: (p: IProduct) => void }> = ({ product, onAdd }) => {
    const outOfStock = product.stock_quantity <= 0;
    return (
        <motion.div
            whileHover={{ scale: outOfStock ? 1 : 1.03 }}
            whileTap={{ scale: outOfStock ? 1 : 0.97 }}
            onClick={() => !outOfStock && onAdd(product)}
            style={{ cursor: outOfStock ? 'not-allowed' : 'pointer' }}
        >
            <Box sx={{
                bgcolor: '#fff', borderRadius: '14px', overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.06)',
                opacity: outOfStock ? 0.5 : 1,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: outOfStock ? 'none' : '0 4px 16px rgba(99,102,241,0.15)' }
            }}>
                <Box sx={{ height: 100, overflow: 'hidden', position: 'relative' }}>
                    <img
                        src={product.thumbnail?.path ? Constants.URL + '/' + product.thumbnail.path : noImage}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: outOfStock ? 'grayscale(1)' : 'none' }}
                    />
                    {outOfStock && (
                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Rupture</Typography>
                        </Box>
                    )}
                    <Box sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', borderRadius: '6px', px: 0.7, py: 0.2 }}>
                        <Typography sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>{product?.stock_quantity ?? 0}</Typography>
                    </Box>
                </Box>
                <Box sx={{ p: 1, pt: 0.8 }}>
                    <Typography sx={{
                        fontWeight: 700, fontSize: '0.78rem', color: '#1e293b', lineHeight: 1.2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.3 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#6366f1' }}>
                            {UtilMethods.formatNumber(product.price_per_unit ?? product.price)}
                        </Typography>
                        {product.unit && product.unit.abbreviation !== 'pce' && (
                            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                                /{product.unit.abbreviation}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
};

/* ─── Compact Cart Item ─── */
const PosCartItem: React.FC<{ item: CartItem }> = ({ item }) => {
    const dispatch = useAppDispatch();
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
        >
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 1,
                borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: '#f1f5f9' }, transition: 'all 0.15s'
            }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: '10px', bgcolor: '#e0e7ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Typography sx={{ fontWeight: 900, color: '#6366f1', fontSize: '0.8rem' }}>
                        {item.product.name.charAt(0)}
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#6366f1' }}>
                            {UtilMethods.formatNumber(item?.subtotal ?? 0)}
                        </Typography>
                        {item?.product?.unitAbbreviation && item?.product?.unitAbbreviation !== 'pce' && (
                            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                                ({item?.quantity ?? 0} {item?.product?.unitAbbreviation})
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => dispatch(decreaseQuantity(item.product))}
                        sx={{ width: 26, height: 26, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.08)', '&:hover': { color: '#ef4444' } }}>
                        <Remove sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography sx={{ minWidth: 22, textAlign: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                        {item?.product?.allowsDecimal ? Number(item?.quantity || 0).toFixed(2) : (item?.quantity || 0)}
                    </Typography>
                    <IconButton size="small" onClick={() => dispatch(addToCart({ ...item.product }))}
                        disabled={item.product.quantity <= 0}
                        sx={{ width: 26, height: 26, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.08)', '&:hover': { color: '#10b981' } }}>
                        <Add sx={{ fontSize: 14 }} />
                    </IconButton>
                </Box>
                <IconButton size="small" onClick={() => dispatch(removeFromCart(item.product.id))}
                    sx={{ width: 24, height: 24, color: '#cbd5e1', '&:hover': { color: '#ef4444' } }}>
                    <Delete sx={{ fontSize: 14 }} />
                </IconButton>
            </Box>
        </motion.div>
    );
};

export default PosExpress;
