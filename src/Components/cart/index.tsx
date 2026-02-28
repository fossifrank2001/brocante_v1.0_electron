import React from 'react';
import { useAppSelector } from "@/hooks";
import Breadcrumd from "Components/Breadcrumd.tsx";
import { ICartState } from "Data/Slices/dashboard/seller/cartSlice.ts";
import MultiStepFormCart from "Components/cart/MultiStepFormCart.tsx";
import { Box } from "@mui/material";

const CartComponent: React.FC = () => {
    const cart: ICartState = useAppSelector(state => state.cart);

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#f8fafc',
            pb: 4
        }}>
            <Box sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: 'rgba(248, 250, 252, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                mb: 3
            }}>
                <Box sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
                    <Breadcrumd parent="Boutique" for_dashboard={true} />
                </Box>
            </Box>

            <Box sx={{ px: { xs: 2, md: 4 } }}>
                <MultiStepFormCart cart={cart} />
            </Box>
        </Box>
    );
};

export default CartComponent;