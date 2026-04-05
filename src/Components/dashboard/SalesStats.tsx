import React from 'react';
import {Box, Grid} from '@mui/material';
import {StatCard} from './StatCard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentsIcon from '@mui/icons-material/Payments';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import {Pages} from "Data/Objects/state.ts";
import UtilMethods from "Data/Utilities/UtilMethods.ts";
import {SaleStats} from "Data/Interfaces/dashboard.ts";
import { useTranslation } from 'react-i18next';

type SalesStatsProps = {
    stats: SaleStats;
};

export const SalesStats: React.FC<SalesStatsProps> = ({ stats }) => {
    const { t } = useTranslation();

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <PendingActionsIcon />;
            case 'paid':
                return <PaymentsIcon />;
            case 'partially_paid':
                return <PaymentsIcon />;
            case 'canceled':
                return <CancelIcon />;
            default:
                return <ShoppingCartIcon />;
        }
    };

    const getStatusColor = (status: string): 'primary' | 'success' | 'warning' | 'error' => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'paid':
                return 'success';
            case 'partially_paid':
                return 'primary';
            case 'canceled':
                return 'error';
            default:
                return 'primary';
        }
    };

    return (
        <Box sx={{ py: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <StatCard
                        title={t('stats.totalSales')}
                        value={stats.sales.total.count}
                        subtitle={<>
                            <div>
                                {t('stats.totalAmount')}: <strong>{UtilMethods.formatAmount(stats.sales.total.amount)}</strong>
                            </div>
                        </>}
                        icon={<ShoppingCartIcon />}
                        color="primary"
                        trend={5}
                    />
                </Grid>

                {Object.entries(stats.sales.status).map(([status, data]) => (
                    <Grid item xs={12} sm={6} md={3} key={status}>
                        <StatCard
                            title={t(`sales.status.${status}`)}
                            value={data.count ?? 0}
                            subtitle={<>
                                <div>
                                    {t('stats.amount')}: <strong>{UtilMethods.formatAmount(data.amount ?? 0)}</strong>
                                </div>
                            </>}
                            icon={getStatusIcon(status)}
                            color={getStatusColor(status)}
                            viewMorePath={Pages.SELL}
                            viewMoreParams={{ type: 'status', value: status.toLowerCase() }}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
