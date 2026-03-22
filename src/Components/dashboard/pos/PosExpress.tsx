import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Typography, TextField, InputAdornment, Chip, IconButton,
    Tooltip, CircularProgress, Button, Paper, FormControl, InputLabel,
    Select, MenuItem, Checkbox, ListItemText, OutlinedInput
} from '@mui/material';
import {
    Search, ShoppingCart, Add, Remove, Delete, Payment,
    Refresh, PointOfSale, Category, FilterList
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { addToCart, addToCartWithQuantity, decreaseQuantity, clearCart, CartItem } from '@/Data/Slices/dashboard/seller/cartSlice';
import ProductAPI from '@/Data/Api/Product';
import CategoryAPI from '@/Data/Api/Category';
import { IProduct } from '@/Data/Interfaces/Supply';
import { ICategory } from '@/Data/Interfaces/Category';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import Constants from '@/Data/Utilities/constants';
import noImage from '@/assets/images/products/no_image.png';
import Toast from '@/Data/Utilities/Toast';
import QuantityDialog from './QuantityDialog';
import PosCheckoutDrawer from './PosCheckoutDrawer';

const POS_PER_PAGE = 50;

const PosExpress: React.FC = () => {
    const dispatch = useAppDispatch();
    const cart = useAppSelector((state) => state.cart);
    const { currentSession } = useAppSelector((state) => state.cashSession);

    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
    const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Load categories once
    useEffect(() => {
        (async () => {
            try {
                const { data: result } = await CategoryAPI.indexAll();
                setCategories(result);
            } catch (e) { console.error(e); }
        })();
    }, []);

    // Load products with debounce
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            
            // Get all sub-categories for all selected main categories
            let subCategoryIdsToFilter: number[] = [];
            
            if (selectedCategoryIds.length > 0) {
                selectedCategoryIds.forEach(catId => {
                    const cat:any = categories.find((c:any) => c.id === catId);
                    if (cat) {
                        const subCats = (cat.sub_categories ?? cat.subCategories ?? []);
                        if (Array.isArray(subCats)) {
                            subCategoryIdsToFilter.push(...subCats.map((sc: any) => sc.id));
                        }
                    }
                });
            }

            const subCats = subCategoryIdsToFilter.length > 0
                ? subCategoryIdsToFilter.join(',')
                : '';
            const { data: res } = await ProductAPI.index(searchTerm, 1, subCats, '', 'stock', POS_PER_PAGE);
            if ('data' in res && Array.isArray(res.data)) {
                setProducts(res.data);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [searchTerm, selectedCategoryIds, categories]);

    useEffect(() => {
        const t = setTimeout(() => loadProducts(), 350);
        return () => clearTimeout(t);
    }, [loadProducts]);

    // Remove the reset effect since we handle multiple categories now
    /*
    useEffect(() => {
        setSelectedSubCategoryIds([]);
    }, [selectedCategoryId]);
    */

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
                } else if (selectedCategoryIds.length > 0) {
                    setSelectedCategoryIds([]);
                }
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchTerm, selectedCategoryIds, cart.items.length, currentSession]);

    const handleAddProduct = (product: IProduct) => {
        if (product.stock_quantity <= 0) {
            Toast.error('Produit en rupture de stock');
            return;
        }

        if (product.unit?.allows_decimal) {
            setSelectedProduct(product);
            setQuantityDialogOpen(true);
            return;
        }

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
        setCheckoutDrawerOpen(true);
    };

    const handleSearchKeyPress = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            e.preventDefault();
            try {
                setIsScanning(true);
                const { data: res }: any = await ProductAPI.findByReference(searchTerm.trim());
                if (res && res.data) {
                    handleAddProduct(res.data);
                    setSearchTerm('');
                    Toast.success(`${res.data.name} ajouté au panier`);
                }
            } catch (err: unknown) {
                console.error(err);
                if ((err as any).response?.status === 404) {
                    // Do nothing, maybe it's a partial text search
                } else {
                    Toast.error('Erreur lors de la recherche du code');
                }
            } finally {
                setIsScanning(false);
            }
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {/* Search + Filters bar - GLASSMORPHISM */}
                <Box sx={{
                    p: 2, pb: 1.5,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)',
                    zIndex: 10
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            inputRef={searchRef}
                            sx={{ flex: 3 }}
                            size="small"
                            placeholder="Rechercher ou scanner... (F3)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {isScanning ? <CircularProgress size={20} /> : <Search sx={{ color: '#6366f1' }} />}
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    border: '1px solid rgba(79, 70, 229, 0.1)',
                                    transition: 'all 0.3s',
                                    '&.Mui-focused': {
                                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
                                        borderColor: '#6366f1'
                                    }
                                }
                            }}
                        />

                        <FormControl sx={{ flex: 2 }} size="small">
                            <InputLabel id="category-filter-label" sx={{ fontWeight: 700, color: '#64748b' }}>Filtrer par catégories</InputLabel>
                            <Select
                                labelId="category-filter-label"
                                multiple
                                value={selectedCategoryIds}
                                onChange={(e) => setSelectedCategoryIds(typeof e.target.value === 'string' ? [] : (e.target.value as number[]))}
                                input={<OutlinedInput label="Filtrer par catégories" sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 700 }} />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((id) => (
                                            <Chip 
                                                key={id} 
                                                label={categories.find(c => c.id === id)?.label} 
                                                size="small" 
                                                sx={{ height: 24, borderRadius: '8px', bgcolor: '#6366f1', color: 'white', fontWeight: 800 }}
                                            />
                                        ))}
                                    </Box>
                                )}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <FilterList sx={{ color: '#6366f1' }} />
                                    </InputAdornment>
                                }
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id} sx={{ fontWeight: 600 }}>
                                        <Checkbox checked={selectedCategoryIds.indexOf(cat.id) > -1} />
                                        <ListItemText primary={cat.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {/* Product Grid */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, md: 3 } }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress sx={{ color: '#6366f1' }} size={48} thickness={4} />
                        </Box>
                    ) : products.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: '50%', mb: 2 }}>
                                <Category sx={{ fontSize: 64, opacity: 0.3 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#64748b' }}>Aucun produit trouvé</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
                            <AnimatePresence>
                                {products.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.02 }}
                                    >
                                        <PosProductCard product={product} onAdd={handleAddProduct} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </Box>
                    )}
                </Box>

                {/* Bottom status + shortcuts - GLASSMORPHISM */}
                <Box sx={{
                    px: 3, py: 1.5,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 -10px 30px -10px rgba(0,0,0,0.05)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 800 }}>
                            {products.length} résultat{products.length > 1 ? 's' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {[
                                { key: 'F3', label: 'Recherche' },
                                { key: 'F12', label: 'Payer' },
                                { key: 'ESC', label: 'Effacer' },
                            ].map(s => (
                                <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Box sx={{
                                        px: 1, py: 0.2,
                                        background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        boxShadow: '0 2px 0 #cbd5e1'
                                    }}>
                                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#475569', fontFamily: 'monospace' }}>{s.key}</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{s.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={loadProducts} disabled={loading} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Refresh fontSize="small" sx={{ color: '#6366f1' }} />
                    </IconButton>
                </Box>
            </Box>

            <Paper elevation={0} sx={{
                width: 380, minWidth: 380,
                display: 'flex', flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.6)',
                zIndex: 20,
                boxShadow: '-10px 0 40px rgba(0,0,0,0.03)'
            }}>
                <Box sx={{ p: 3, pb: 2, borderBottom: '1px dashed rgba(0,0,0,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                                <PointOfSale sx={{ color: '#fff', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#1e293b', lineHeight: 1 }}>
                                    Ticket
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                    Session active
                                </Typography>
                            </Box>
                        </Box>
                        {cart.items.length > 0 && (
                            <Tooltip title="Vider le panier (Corbeille)">
                                <IconButton size="small" onClick={() => dispatch(clearCart())} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    {cart.items.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 10, color: '#cbd5e1' }}>
                            <Box sx={{ p: 3, bgcolor: 'rgba(241, 245, 249, 0.5)', borderRadius: '50%', width: 100, height: 100, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShoppingCart sx={{ fontSize: 48, opacity: 0.5 }} />
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#94a3b8' }}>Ticket vierge</Typography>
                            <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>Prêt pour l'encaissement</Typography>
                        </Box>
                    ) : (
                        <AnimatePresence>
                            {cart.items.map((item) => (
                                <PosCartItem key={item.product.id} item={item} />
                            ))}
                        </AnimatePresence>
                    )}
                </Box>
                <Box sx={{ p: 3, pt: 2, background: 'rgba(248, 250, 252, 0.5)', borderTop: '1px solid rgba(255, 255, 255, 0.8)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>Articles au total</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>{cart.totalQuantity}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>Total</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#4f46e5', letterSpacing: '-0.03em' }}>
                                {UtilMethods.formatNumber(cart.totalPrice)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>TTC Inclus</Typography>
                        </Box>
                    </Box>
                    <Button
                        fullWidth variant="contained" size="large"
                        startIcon={<Payment />}
                        onClick={handleGoToCheckout}
                        disabled={cart.items.length === 0}
                        sx={{
                            background: cart.items.length === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            fontWeight: 900, fontSize: '1.1rem', py: 2,
                            borderRadius: '16px', textTransform: 'uppercase', letterSpacing: '1px',
                            boxShadow: cart.items.length === 0 ? 'none' : '0 10px 20px -5px rgba(16, 185, 129, 0.5)',
                            transition: 'all 0.3s',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: cart.items.length === 0 ? 'none' : '0 15px 25px -5px rgba(16, 185, 129, 0.6)' },
                            '&.Mui-disabled': { color: '#94a3b8' }
                        }}
                    >
                        Payer (F12)
                    </Button>
                </Box>
            </Paper>

            <QuantityDialog
                open={quantityDialogOpen}
                product={selectedProduct}
                onClose={() => setQuantityDialogOpen(false)}
                onConfirm={handleConfirmQuantity}
            />

            <PosCheckoutDrawer
                open={checkoutDrawerOpen}
                onClose={() => setCheckoutDrawerOpen(false)}
            />
        </Box>
    );
};

/* ─── Compact Product Card for POS Grid - PREMIUM ─── */
const PosProductCard: React.FC<{ product: IProduct; onAdd: (p: IProduct) => void }> = ({ product, onAdd }) => {
    const outOfStock = product.stock_quantity <= 0;
    const thumbnail = product.thumbnail?.path ? `${Constants.URL}/${product.thumbnail.path}` : noImage;

    return (
        <motion.div
            whileHover={outOfStock ? {} : { y: -6, scale: 1.02 }}
            whileTap={outOfStock ? {} : { scale: 0.96 }}
            onClick={() => !outOfStock && onAdd(product)}
            style={{ height: '100%', cursor: outOfStock ? 'not-allowed' : 'pointer' }}
        >
            <Paper
                elevation={0}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    bgcolor: 'white',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&:hover': {
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                        borderColor: 'transparent',
                        '& .add-icon': { opacity: 1, transform: 'scale(1)' }
                    }
                }}
            >
                {/* Image Container */}
                <Box sx={{
                    position: 'relative',
                    height: 150,
                    bgcolor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    p: 2
                }}>
                    <img
                        src={thumbnail}
                        alt={product.name}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            filter: outOfStock ? 'grayscale(1) opacity(0.5)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    />

                    {/* Stock Status Label */}
                    <Box sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 2
                    }}>
                        <Chip
                            label={outOfStock ? 'Épuisé' : `Stock: ${product.unit?.allows_decimal ? Number(product.stock_quantity).toFixed(3) : Number(product.stock_quantity).toFixed(0)}`}
                            size="small"
                            sx={{
                                height: 22,
                                fontSize: '0.65rem',
                                fontWeight: 900,
                                bgcolor: outOfStock ? '#fee2e2' : '#dcfce7',
                                color: outOfStock ? '#ef4444' : '#10b981',
                                border: '1px solid',
                                borderColor: outOfStock ? '#fecaca' : '#bbf7d0',
                                textTransform: 'uppercase',
                                '& .MuiChip-label': { px: 1 }
                            }}
                        />
                    </Box>

                    {/* Floating Add Icon on Hover */}
                    {!outOfStock && (
                        <Box className="add-icon" sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(99, 102, 241, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transform: 'scale(0.8)',
                            transition: 'all 0.3s ease',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                bgcolor: '#6366f1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)',
                                border: '3px solid white'
                            }}>
                                <Add sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Info Area */}
                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{
                        fontSize: '0.5rem',
                        fontWeight: 800,
                        color: '#64748b',
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px'
                    }}>
                        {product.internal_reference || 'REF-0000'}
                    </Typography>

                    <Typography sx={{
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: '#1e293b',
                        lineHeight: 1.3,
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                        {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography sx={{ fontWeight: 900, fontSize: '.9rem', color: '#4f46e5' }}>
                                {UtilMethods.formatNumber(product.price)}
                            </Typography>
                            {product.unit && (
                                <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                                    / {product.unit.abbreviation}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </motion.div>
    );
};

/* ─── Compact Cart Item - PREMIUM ─── */
const PosCartItem: React.FC<{ item: CartItem }> = ({ item }) => {
    const dispatch = useAppDispatch();
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
        >
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 1.5,
                borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(79, 70, 229, 0.1)',
                boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)',
                position: 'relative', overflow: 'hidden',
                '&:hover': { borderColor: '#6366f1', boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.15)' }, transition: 'all 0.2s'
            }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #6366f1, #4338ca)' }} />

                <Box sx={{
                    width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Typography sx={{ fontWeight: 900, color: '#4f46e5', fontSize: '1rem' }}>
                        {item.product.name.charAt(0)}
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#6366f1' }}>
                            {UtilMethods.formatNumber(item?.subtotal ?? 0)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                            ({item?.product?.allowsDecimal ? Number(item?.quantity || 0).toFixed(3) : (item?.quantity || 0)} {item?.product?.unitAbbreviation || 'pce'})
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, bgcolor: '#f8fafc', borderRadius: '10px', p: 0.5, border: '1px solid #e2e8f0' }}>
                    <IconButton size="small" onClick={() => dispatch(decreaseQuantity({ id: item.product.id, price: item.product.price }))}
                        sx={{ width: 24, height: 24, bgcolor: 'white', border: '1px solid rgba(0,0,0,0.05)', '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}>
                        <Remove sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#1e293b' }}>
                        {item?.product?.allowsDecimal ? Number(item?.quantity || 0).toFixed(3) : (item?.quantity || 0)}
                    </Typography>
                    <IconButton size="small" onClick={() => dispatch(addToCart({ ...item.product }))}
                        disabled={item.product.quantity <= 0}
                        sx={{ width: 24, height: 24, bgcolor: 'white', border: '1px solid rgba(0,0,0,0.05)', '&:hover': { color: '#10b981', bgcolor: '#dcfce7' } }}>
                        <Add sx={{ fontSize: 14 }} />
                    </IconButton>
                </Box>
            </Box>
        </motion.div>
    );
};

export default PosExpress;
