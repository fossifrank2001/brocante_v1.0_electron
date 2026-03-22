import React from 'react';
import { useAppDispatch } from "@/hooks";
import { addToCart, CartItem, decreaseQuantity, removeFromCart } from "Data/Slices/dashboard/seller/cartSlice.ts";
import { IconButton, Typography, Box, Tooltip, Zoom } from "@mui/material";
import { Add, Remove, Delete, Inventory2 } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Toast from "Data/Utilities/Toast.ts";
import UtilMethods from '@/Data/Utilities/UtilMethods';

const Item: React.FC<{ item: CartItem | never; index: number }> = ({ item, index }) => {
    const dispatch = useAppDispatch()

    const handleRemoveItemFromCart = () => {
        dispatch(removeFromCart(item?.product.id))
        Toast.success('Article retiré du panier.')
    }

    const handleDecreaseQuantity = () => {
        dispatch(decreaseQuantity(item?.product))
    }

    const handleIncreaseQuantity = () => {
        dispatch(addToCart({ ...item.product }))
    }

    const isLowStock = item?.product?.quantity <= 5;

    return (
        <motion.tr
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{
                borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                transition: 'background-color 0.2s'
            }}
        >
            <td style={{ padding: '24px 20px', verticalAlign: 'middle' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)',
                        position: 'relative'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#6366f1' }}>
                            {item.product.name.charAt(0)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5, lineHeight: 1.2 }}>
                            {item.product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Inventory2 sx={{ fontSize: 14, color: isLowStock ? '#ef4444' : '#64748b' }} />
                            <Typography variant="caption" sx={{
                                color: isLowStock ? '#ef4444' : '#64748b',
                                fontWeight: 700,
                            }}>
                                {isLowStock ? `Stock critique: ${item?.product?.quantity}` : `Stock disponible: ${item?.product?.quantity}`}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </td>
            <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: 'rgba(241, 245, 249, 0.8)',
                    p: 0.75,
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.03)'
                }}>
                    <IconButton
                        size="small"
                        onClick={handleDecreaseQuantity}
                        sx={{
                            bgcolor: '#fff',
                            width: 28,
                            height: 28,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            '&:hover': { bgcolor: '#fff', transform: 'scale(1.1)', color: '#ef4444' },
                            transition: 'all 0.2s'
                        }}
                    >
                        <Remove fontSize="small" sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Typography sx={{ minWidth: 22, textAlign: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                        {item?.product?.allowsDecimal ? Number(item?.quantity || 0).toFixed(2) : (item?.quantity || 0)}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={handleIncreaseQuantity}
                        disabled={item?.product?.quantity < item.quantity}
                        sx={{
                            bgcolor: '#fff',
                            width: 28,
                            height: 28,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            '&:hover': { bgcolor: '#fff', transform: 'scale(1.1)', color: '#10b981' },
                            transition: 'all 0.2s'
                        }}
                    >
                        <Add fontSize="small" sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
            </td>
            <td style={{ padding: '20px', verticalAlign: 'middle', textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                    {UtilMethods.formatNumber(item?.product?.price ?? 0)}
                </Typography>
            </td>
            <td style={{ padding: '20px', verticalAlign: 'middle', textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#6366f1' }}>
                    {UtilMethods.formatNumber(item?.subtotal ?? 0)}
                </Typography>
            </td>
            <td style={{ padding: '20px', verticalAlign: 'middle', textAlign: 'right' }}>
                <Tooltip title="Retirer" arrow TransitionComponent={Zoom}>
                    <IconButton
                        size="small"
                        onClick={handleRemoveItemFromCart}
                        sx={{
                            color: '#94a3b8',
                            bgcolor: 'rgba(239, 68, 68, 0.02)',
                            '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)', transform: 'rotate(8deg)' },
                            transition: 'all 0.2s'
                        }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Tooltip>
            </td>
        </motion.tr>
    );
};

export default Item;
