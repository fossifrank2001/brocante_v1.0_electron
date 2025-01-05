import React from 'react';
import { Grid, Box } from '@mui/material';
import { StatCard } from './StatCard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import {AccountStats} from "Data/Interfaces/dashboard.ts";
import { Pages } from '@/Data/Objects/state';

type AccountStatsProps = {
    stats: AccountStats;
};

export const AccountsStats: React.FC<AccountStatsProps> = ({ stats }) => {
    return (
        <Box sx={{ py: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Total Accounts"
                        value={stats.accounts.total}
                        icon={<PeopleIcon />}
                        color="primary"
                        trend={2}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Active Accounts"
                        value={stats.accounts.status.active}
                        subtitle="Currently active users"
                        icon={<PersonIcon />}
                        color="success"
                        viewMorePath={Pages.ACCOUNT}
                        viewMoreParams={{ type: 'status', value: 'active' }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Inactive Accounts"
                        value={stats.accounts.status.inactive}
                        subtitle="Currently inactive users"
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
