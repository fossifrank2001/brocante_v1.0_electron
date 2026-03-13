import { useLayoutEffect } from 'react'
import { Box } from '@mui/material';
import { useAppContext } from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import DashboardComponent from '@/Components/dashboard/DashboardComponent.js';

export default function Dashboard() {
    const context = useAppContext();

    useLayoutEffect(() => {
        context.togglePageLoading()
        document.title = constants.APP_NAME + ' .:. Dashboard'
    }, [context]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <DashboardComponent />
        </Box>
    );
}