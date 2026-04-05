import React from 'react';
import { Grid, Box } from '@mui/material';
import { StatCard } from './StatCard';
import InventoryIcon from '@mui/icons-material/Inventory';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { ProductStats } from "Data/Interfaces/dashboard";
import { Pages } from '@/Data/Objects/state';
import { useTranslation } from 'react-i18next';

type ProductsStatsProps = {
    stats: ProductStats;
};

export const ProductsStats: React.FC<ProductsStatsProps> = ({ stats }) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ py: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('stats.totalProducts')}
                        value={stats.total}
                        icon={<InventoryIcon />}
                        color="primary"
                        viewMorePath={Pages.ARTICLE}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('stats.inStock')}
                        value={stats.status.stock || 0}
                        icon={<InventoryIcon />}
                        color="success"
                        viewMorePath={Pages.ARTICLE}
                        viewMoreParams={{ type: 'status', value: 'stock' }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('stats.outOfStock')}
                        value={stats.status.out_of_stock || 0}
                        icon={<RemoveShoppingCartIcon />}
                        color="error"
                        viewMorePath={Pages.ARTICLE}
                        viewMoreParams={{ type: 'status', value: 'out_of_stock' }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};
