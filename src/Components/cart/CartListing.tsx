import React from 'react';
import { useAppDispatch } from "@/hooks";
import { clearCart, ICartState } from "Data/Slices/dashboard/seller/cartSlice.ts";
import { Box, Card, CardContent, Typography, Button, Divider, Alert, Paper, Chip } from "@mui/material";
import { ShoppingCart, Delete, ArrowForward, Receipt } from '@mui/icons-material';
import Item from "Components/cart/Item.tsx";
import Toast from "Data/Utilities/Toast.ts";
import { FormikProps } from "formik";
import { FormValues } from "Components/cart/MultiStepFormCart.tsx";
import UtilMethods from "Data/Utilities/UtilMethods.ts";

const styles = {
    tableContainer: {
        border: '1px solid #dee2e6',
        borderRadius: '0.25rem',
        maxHeight: '400px',
        overflowY: 'auto' as const,
    },
    table: {
        marginBottom: 0,
    },
    tableHeadTh: {
        borderTop: 'none',
    },
    stickyTop: {
        zIndex: 1020,
        position: 'sticky' as const,
        top: 0,
        backgroundColor: 'white',
    },
};

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
        } catch (error) {
            Toast.error(error.message());
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
        <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            <div className="container">
                <div className='row'>
                    <div className='col-xs-12 col-md-8'>
                        {/* Header avec badge */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <ShoppingCart sx={{ fontSize: 32, color: '#1976d2' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    Panier
                                </Typography>
                                {cart.items.length > 0 && (
                                    <Chip 
                                        label={`${cart.totalQuantity} article${cart.totalQuantity > 1 ? 's' : ''}`}
                                        color="primary"
                                        size="small"
                                    />
                                )}
                            </Box>
                            {cart.items.length > 0 && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={handleClearCart}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Vider le panier
                                </Button>
                            )}
                        </Box>

                        {cart.totalQuantity > 0 ? (
                            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    <table className='table table-hover' style={{ marginBottom: 0 }}>
                                        <thead style={{ 
                                            position: 'sticky',
                                            top: 0,
                                            backgroundColor: '#f8f9fa',
                                            zIndex: 10,
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            <tr>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>N°</th>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Produit</th>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Quantité</th>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Prix Unit.</th>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Total</th>
                                                <th style={{ padding: '16px', fontWeight: 600 }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.items?.map((_item, index) => (
                                                <Item key={index} item={_item} index={index} />
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            </Paper>
                        ) : (
                            <Alert 
                                severity="info" 
                                icon={<ShoppingCart />}
                                sx={{ 
                                    borderRadius: 3,
                                    py: 4,
                                    fontSize: '1.1rem'
                                }}
                            >
                                Votre panier est vide. Retournez à la boutique pour ajouter des articles.
                            </Alert>
                        )}
                    </div>

                    {cart.items.length > 0 && (
                        <div className='col-xs-12 col-md-4'>
                            <Card 
                                elevation={3}
                                sx={{ 
                                    borderRadius: 3,
                                    position: 'sticky',
                                    top: 20,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <Receipt sx={{ fontSize: 28 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            Résumé
                                        </Typography>
                                    </Box>

                                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 2, mb: 2 }}>
                                        <SummaryRow label="Sous-total" value={cart.totalPrice} />
                                        <SummaryRow label="Taxes" value={0} />
                                        <SummaryRow label="Frais de livraison" value={0} />
                                    </Box>

                                    <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.3)' }} />

                                    <Box sx={{ 
                                        backgroundColor: 'rgba(255,255,255,0.25)', 
                                        borderRadius: 2, 
                                        p: 2,
                                        mb: 3
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                TOTAL À PAYER
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {UtilMethods.formatNumber(cart.totalPrice)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForward />}
                                        onClick={handleProceedToCheckout}
                                        sx={{
                                            backgroundColor: 'white',
                                            color: '#667eea',
                                            fontWeight: 'bold',
                                            py: 1.5,
                                            borderRadius: 2,
                                            '&:hover': {
                                                backgroundColor: '#f0f0f0',
                                                transform: 'scale(1.02)'
                                            },
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Procéder au paiement
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </Box>
    );
};

export default CartListing;

const SummaryRow = ({ label, value }: { label: string; value: number }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body1">{label}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {UtilMethods.formatNumber(value)}
            </Typography>
        </Box>
    );
};