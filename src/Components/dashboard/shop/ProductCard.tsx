import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/hooks";
import { addToCart } from "Data/Slices/dashboard/seller/cartSlice.ts";
import noImage from "../../../assets/images/products/no_image.png";
import UtilMethods from 'Data/Utilities/UtilMethods';
import Constants from "Data/Utilities/constants.ts";
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip, Zoom } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

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
                    elevation={isHovered ? 12 : 1}
                    sx={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        border: isHovered ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(0, 0, 0, 0.05)',
                        position: 'relative'
                    }}
                >
                    {/* Image Area */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', height: '180px' }}>
                        <motion.img
                            src={imageUrl ? Constants.URL + '/' + imageUrl : noImage as never}
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
                                label={isOutOfStock ? "Épuisé" : status}
                                size="small"
                                sx={{
                                    bgcolor: isOutOfStock ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            />
                        </Box>

                        {/* Discount badge */}
                        {hasDiscount && !isOutOfStock && (
                            <Box sx={{
                                position: 'absolute', top: 12, right: 12,
                                bgcolor: '#ef4444', color: '#fff',
                                borderRadius: '12px', px: 1, py: 0.5,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: '0.75rem',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
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
                    <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                color: '#1e293b',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.3,
                                minHeight: 42,
                                fontSize: '0.95rem'
                            }}
                            title={name}
                        >
                            {name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.1rem' }}>
                                {UtilMethods.formatNumber(price)}
                            </Typography>
                            {hasDiscount && (
                                <Typography variant="caption" sx={{ color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>
                                    {UtilMethods.formatNumber(oldPrice as number)}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    bgcolor: stock_quantity > 5 ? '#10b981' : stock_quantity > 0 ? '#f59e0b' : '#ef4444'
                                }} />
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}
                                >
                                    Stock: {Math.max(0, stock_quantity)}
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
                                                color: '#4f46e5',
                                                bgcolor: 'rgba(79, 70, 229, 0.05)',
                                                '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' }
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
