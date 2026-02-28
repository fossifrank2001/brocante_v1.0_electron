import React from 'react';
import { useAppDispatch } from "@/hooks";
import { clearCart, ICartState } from "Data/Slices/dashboard/seller/cartSlice.ts";
import { Box, Typography, Button, Divider, Paper, Chip, Stack } from "@mui/material";
import { ShoppingCart, Delete, ArrowForward, Receipt } from '@mui/icons-material';
import Item from "Components/cart/Item.tsx";
import Toast from "Data/Utilities/Toast.ts";
import { FormikProps } from "formik";
import { FormValues } from "Components/cart/MultiStepFormCart.tsx";
import { motion, AnimatePresence } from 'framer-motion';
import UtilMethods from "Data/Utilities/UtilMethods.ts";



const CartListing: React.FC<{
    cart: ICartState | never;
    onHandleSetStep: (payload: number) => void;
    formik: FormikProps<FormValues>;
}> = ({ cart, onHandleSetStep, formik }) => {
    const dispatch = useAppDispatch();

    const handleClearCart = () => {
        try {
            onHandleSetStep(0);
            dispatch(clearCart());
            Toast.success('The cart has been cleared successfully.');
        } catch (error: any) {
            Toast.error(error?.message || "An unexpected error occurred");
        }
    };

    const handleProceedToCheckout = () => {
        formik.setFieldValue('items', cart.items);
        formik.setFieldValue('summarize', {
            totalPrice: cart.totalPrice,
            tax: 0,
            shippingPrice: 0,
        });

        formik.submitForm().then(() => {
            if (formik.isValid) {
                onHandleSetStep(1);
            }
        });
    };

    return (
        <Box sx={{
            p: { xs: 2, md: 4 },
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh'
        }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='row'
                >
                    <div className='col-xs-12 col-md-8'>
                        {/* Header Section */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                            p: 2,
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                    display: 'flex',
                                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                                }}>
                                    <ShoppingCart sx={{ fontSize: 24, color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
                                        Mon Panier
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Vérifiez vos articles avant de finaliser
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {cart.items.length > 0 && (
                                    <>
                                        <Chip
                                            label={`${cart.totalQuantity} article${cart.totalQuantity > 1 ? 's' : ''}`}
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                                color: '#4f46e5',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Button
                                            variant="text"
                                            color="error"
                                            size="small"
                                            startIcon={<Delete />}
                                            onClick={handleClearCart}
                                            sx={{
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)' }
                                            }}
                                        >
                                            Vider
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>

                        {cart.totalQuantity > 0 ? (
                            <Paper sx={{
                                borderRadius: '24px',
                                overflow: 'hidden',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)'
                            }}>
                                <Box sx={{ maxHeight: '600px', overflowY: 'auto', p: 1 }}>
                                    <table className='table table-hover' style={{ marginBottom: 0 }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '20px', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Article</th>
                                                <th style={{ padding: '20px', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Quantité</th>
                                                <th style={{ padding: '20px', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'right' }}>Prix U.</th>
                                                <th style={{ padding: '20px', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'right' }}>Total</th>
                                                <th style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence>
                                                {cart.items?.map((_item, index) => (
                                                    <Item key={_item.product.id} item={_item} index={index} />
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </Box>
                            </Paper>
                        ) : (
                            <Paper sx={{
                                textAlign: 'center',
                                py: 12,
                                borderRadius: '24px',
                                background: 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: '1px dashed rgba(0,0,0,0.1)'
                            }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    mb: 3
                                }}>
                                    <ShoppingCart sx={{ fontSize: 40, color: '#94a3b8' }} />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>
                                    Votre panier est vide
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                                    Parcourez notre catalogue pour ajouter des articles.
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => onHandleSetStep(0)}
                                    startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)' }} />}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        bgcolor: '#6366f1',
                                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    Retour à la boutique
                                </Button>
                            </Paper>
                        )}
                    </div>

                    {cart.items.length > 0 && (
                        <div className='col-xs-12 col-md-4'>
                            <Paper
                                sx={{
                                    borderRadius: '24px',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                                    p: 3,
                                    position: 'sticky',
                                    top: 24
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Receipt sx={{ color: '#6366f1' }} />
                                    Résumé
                                </Typography>

                                <Stack spacing={2} sx={{ mb: 4 }}>
                                    <SummaryRow label="Sous-total" value={cart.totalPrice} />
                                    <SummaryRow label="TVA (0%)" value={0} />
                                    <SummaryRow label="Frais de traitement" value={0} />

                                    <Divider sx={{ my: 1, opacity: 0.6 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                            Total
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#6366f1', letterSpacing: '-0.03em' }}>
                                            {UtilMethods.formatNumber(cart.totalPrice)}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', p: 2, borderRadius: '16px', mb: 4, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ArrowForward sx={{ fontSize: 14 }} />
                                        Paiement sécurisé garanti
                                    </Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleProceedToCheckout}
                                    sx={{
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
                                        py: 2,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        '&:hover': {
                                            boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.4)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Passer à la caisse
                                </Button>
                            </Paper>
                        </div>
                    )}
                </motion.div>
            </div>
        </Box>
    );
};

export default CartListing;

const SummaryRow = ({ label, value }: { label: string; value: number }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {UtilMethods.formatNumber(value)}
            </Typography>
        </Box>
    );
};