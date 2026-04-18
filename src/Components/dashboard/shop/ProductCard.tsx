import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/hooks";
import { addToCart } from "Data/Slices/dashboard/seller/cartSlice.ts";
import noImage from "../../../assets/images/products/no_image.png";
import UtilMethods from 'Data/Utilities/UtilMethods';
import Constants from "Data/Utilities/constants.ts";
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip, Zoom, useTheme } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
    id: number
    imageUrl: string;
    name: string;
    price: number;
    stock_quantity: number;
    oldPrice?: number;
    status?: string;
    columnClass?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, imageUrl, name, price, oldPrice, stock_quantity, status, columnClass = 'col-6 col-md-4 col-lg-3 col-xxl-3' }) => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { t } = useTranslation();
    const isDarkMode = theme.palette.mode === 'dark';
    const [maxHasReach, setMaxHasReach] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    let counter = 0;

    const handleAddToCart = () => {
        counter++;
        const productToAdd = {
            id,
            imageUrl,
            name,
            price,
            oldPrice,
            quantity: stock_quantity
        };

        setMaxHasReach(counter === stock_quantity);
        dispatch(addToCart(productToAdd));
    };

    const isOutOfStock = stock_quantity <= 0 || maxHasReach;
    const hasDiscount = typeof oldPrice === 'number' && oldPrice > price;
    const discountPercent = hasDiscount ? Math.round(((oldPrice as number) - price) / (oldPrice as number) * 100) : 0;

    return (
        <motion.div
            className={columnClass}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }} 
            style={{padding: '4px'}}
        >
            <motion.div
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ height: '100%' }}
            >
                <Card
                    elevation={isHovered ? (isDarkMode ? 16 : 12) : (isDarkMode ? 4 : 1)}
                    sx={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        border: isHovered 
                            ? `2px solid ${isDarkMode ? '#6366f1' : 'rgba(79, 70, 229, 0.3)'}` 
                            : `1px solid ${isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.08)'}`,
                        position: 'relative',
                        bgcolor: isDarkMode 
                            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)' 
                            : '#ffffff',
                        boxShadow: isDarkMode 
                            ? (isHovered 
                                ? '0 20px 40px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.2)' 
                                : '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.1)')
                            : (isHovered ? '0 20px 40px rgba(0, 0, 0, 0.12)' : '0 2px 12px rgba(0, 0, 0, 0.06)')
                    }}
                >
                    {/* Image Area */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', height: '180px' }}>
                        <motion.img
                            src={
                                imageUrl 
                                    ? (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') 
                                        ? imageUrl 
                                        : Constants.URL + '/' + imageUrl)
                                    : noImage as never
                            }
                            alt={name}
                            animate={{ scale: isHovered ? 1.05 : 1 }}
                            transition={{ duration: 0.6 }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                filter: isOutOfStock ? 'grayscale(0.8)' : 'none'
                            }}
                        />

                        {/* Status chip */}
                        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                            <Chip
                                label={isOutOfStock ? t('shop.outOfStock', 'Épuisé') : status}
                                size="small"
                                sx={{
                                    bgcolor: isOutOfStock 
                                        ? (isDarkMode ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.95)')
                                        : (isDarkMode ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 0.95)'),
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    backdropFilter: 'blur(8px)',
                                    border: isDarkMode 
                                        ? `2px solid ${isOutOfStock ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)'}`
                                        : `1px solid ${isOutOfStock ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    boxShadow: isDarkMode 
                                        ? (isOutOfStock ? '0 4px 12px rgba(239, 68, 68, 0.5)' : '0 4px 12px rgba(16, 185, 129, 0.4)')
                                        : (isOutOfStock ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.25)'),
                                    px: 0.5,
                                    height: 24
                                }}
                            />
                        </Box>

                        {/* Discount badge */}
                        {hasDiscount && !isOutOfStock && (
                            <Box sx={{
                                position: 'absolute', top: 12, right: 12,
                                bgcolor: isDarkMode ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#ef4444',
                                color: '#fff',
                                borderRadius: '10px', px: 1.2, py: 0.6,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontSize: '0.8rem',
                                boxShadow: isDarkMode 
                                    ? '0 4px 16px rgba(239, 68, 68, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.3)' 
                                    : '0 4px 12px rgba(239, 68, 68, 0.35)',
                                border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.5)' : 'none',
                                textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                            }}>
                                -{discountPercent}%
                            </Box>
                        )}

                        {/* Overlay Actions on Hover */}
                        <AnimatePresence>
                            {isHovered && !isOutOfStock && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="position-absolute d-flex align-items-center justify-content-center"
                                    style={{
                                        inset: 0,
                                        background: 'rgba(79, 70, 229, 0.15)',
                                        backdropFilter: 'blur(2px)'
                                    }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => { e.preventDefault(); handleAddToCart(); }}
                                        className="btn btn-primary rounded-pill px-3 py-2 d-flex align-items-center shadow-lg"
                                        style={{ backgroundColor: '#4f46e5', border: 'none' }}
                                    >
                                        <ShoppingCart className="me-2" sx={{ fontSize: '1.2rem' }} />
                                        <span className="fw-bold">Ajouter</span>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>

                    {/* Info Area */}
                    <CardContent sx={{ flexGrow: 1, p: 2.5, '&:last-child': { pb: 2.5 }, bgcolor: isDarkMode ? 'transparent' : 'inherit' }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                mb: 1.5,
                                color: isDarkMode ? '#f1f5f9' : '#1e293b',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4,
                                minHeight: 44,
                                fontSize: '0.95rem',
                                textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                            }}
                            title={name}
                        >
                            {name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2, p: 1.5, borderRadius: '12px', bgcolor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.04)' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 900, 
                                color: isDarkMode ? '#a5b4fc' : '#4f46e5', 
                                fontSize: '1.15rem',
                                textShadow: isDarkMode ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'
                            }}>
                                {UtilMethods.formatNumber(price)}
                            </Typography>
                            {hasDiscount && (
                                <Typography variant="caption" sx={{ 
                                    color: isDarkMode ? '#94a3b8' : '#64748b', 
                                    textDecoration: 'line-through', 
                                    fontWeight: 600,
                                    fontSize: '0.85rem'
                                }}>
                                    {UtilMethods.formatNumber(oldPrice as number)}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 1, borderTop: `1px solid ${isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0,0,0,0.05)'}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Box sx={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    bgcolor: stock_quantity > 5 
                                        ? (isDarkMode ? '#34d399' : '#10b981')
                                        : stock_quantity > 0 
                                            ? (isDarkMode ? '#fbbf24' : '#f59e0b') 
                                            : (isDarkMode ? '#f87171' : '#ef4444'),
                                    boxShadow: isDarkMode 
                                        ? `0 0 10px ${stock_quantity > 5 ? 'rgba(52, 211, 153, 0.8)' : stock_quantity > 0 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(248, 113, 113, 0.8)'}`
                                        : `0 0 6px ${stock_quantity > 5 ? 'rgba(16, 185, 129, 0.4)' : stock_quantity > 0 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                                    border: isDarkMode ? '2px solid rgba(255,255,255,0.2)' : 'none'
                                }} />
                                <Typography
                                    variant="caption"
                                    sx={{ 
                                        color: isDarkMode ? '#cbd5e1' : '#64748b', 
                                        fontWeight: 700, 
                                        fontSize: '0.8rem',
                                        letterSpacing: '0.3px'
                                    }}
                                >
                                    {t('shop.stock', 'Stock')}: {Math.max(0, stock_quantity)}
                                </Typography>
                            </Box>

                            {!isHovered && (
                                <Tooltip title={isOutOfStock ? 'Indisponible' : 'Ajouter au panier'} TransitionComponent={Zoom}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.preventDefault(); if (!isOutOfStock) handleAddToCart(); }}
                                            disabled={isOutOfStock}
                                            sx={{
                                                color: isDarkMode ? '#818cf8' : '#4f46e5',
                                                bgcolor: isDarkMode ? 'rgba(129, 140, 248, 0.15)' : 'rgba(79, 70, 229, 0.05)',
                                                '&:hover': { 
                                                    bgcolor: isDarkMode ? 'rgba(129, 140, 248, 0.25)' : 'rgba(79, 70, 229, 0.1)' 
                                                }
                                            }}
                                        >
                                            <ShoppingCart fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default ProductCard;
