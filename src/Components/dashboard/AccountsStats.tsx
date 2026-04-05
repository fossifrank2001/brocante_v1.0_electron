import React from 'react';
import { Grid, Box } from '@mui/material';
import { StatCard } from './StatCard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import {AccountStats} from "Data/Interfaces/dashboard.ts";
import { Pages } from '@/Data/Objects/state';
import { useTranslation } from 'react-i18next';

type AccountStatsProps = {
    stats: AccountStats;
};

export const AccountsStats: React.FC<AccountStatsProps> = ({ stats }) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ py: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('stats.totalAccounts')}
                        value={stats.accounts.total}
                        icon={<PeopleIcon />}
                        color="primary"
                        trend={2}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('stats.activeAccounts')}
                        value={stats.accounts.status.active}
                        subtitle={t('stats.currentlyActiveUsers')}
                        icon={<PersonIcon />}
                        color="success"
                        viewMorePath={Pages.ACCOUNT}
                        viewMoreParams={{ type: 'status', value: 'active' }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('stats.inactiveAccounts')}
                        value={stats.accounts.status.inactive}
                        subtitle={t('stats.currentlyInactiveUsers')}
                        icon={<BlockIcon />}
                        color="error"
                        viewMorePath={Pages.ACCOUNT}
                        viewMoreParams={{ type: 'status', value: 'inactive' }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};
