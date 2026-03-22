import { useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, Paper, CircularProgress, Container } from '@mui/material';
import { ArrowBack, Print, Download, CheckCircle } from '@mui/icons-material';
import PageLoadingIndicator from "Components/PageLoadingIndicator";
import { useAppContext } from "@/contexts/appContext";
import { useAppDispatch, useAppSelector } from "@/hooks";
import constants from "Data/Utilities/constants";

import { setActivePage } from "Data/Slices/NavigationSlice";
import { Pages } from "Data/Objects/state";
import PrintDialog from "@/Components/dashboard/pos/PrintDialog";
import SellAPI from "@/Data/Api/Sell";
import { ISellWithDetails } from "@/Services/ReceiptTemplate";
import axiosInstance from '@/Data/Utilities/axiosInstance';

/**
 * @returns {JSX.Element}
 */
function SuccessSellPage(): JSX.Element {
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const navigation = useAppSelector(state => state.navigaton);
    const [isDownloading, setIsDownloading] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [sellData, setSellData] = useState<ISellWithDetails | null>(null);

    useLayoutEffect(() => {
        document.title = constants.APP_NAME + " .:. Transaction Réussie";
        context.togglePageLoading(false);
        // Load sell data for printing
        if (navigation.param?.number) {
            loadSellData(navigation.param.number);
        }
    }, [navigation.param?.number]);

    const loadSellData = async (sellId: string | number) => {
        try {
            const { data } = await SellAPI.show(sellId as unknown as number);
            setSellData(data as unknown as ISellWithDetails);
        } catch (error) {
            console.error('Failed to load sell data:', error);
        }
    };

    const handleDownloadPDF = () => {
        if (!sellData) return;
        setIsDownloading(true);
        try {
            const baseURL = axiosInstance.defaults.baseURL;
            const token = localStorage.getItem('token');
            const url = `${baseURL}/sells/${sellData.id}/pdf-receipt?token=${token}`;
            window.open(url, '_blank');
        } finally {
            setTimeout(() => setIsDownloading(false), 1000);
        }
    };

    const pageVariants = {
        initial: { opacity: 0, scale: 0.95 },
        in: { opacity: 1, scale: 1 },
        out: { opacity: 0, scale: 1.05 }
    };

    const pageTransition = {
        type: "spring",
        stiffness: 300,
        damping: 30
    };

    const displayCode = sellData?.sell_code || navigation.param?.code || 'Chargement...';

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
        }}>
            <PageLoadingIndicator visible={context.pageLoading} />

            <Container maxWidth="sm">
                <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 5 },
                            borderRadius: '16px',
                            textAlign: 'center',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                        >
                            <CheckCircle sx={{ fontSize: 72, color: '#10b981', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                                Paiement Réussi
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                La transaction a été enregistrée avec succès.
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ width: '100%' }}
                        >
                            <Box sx={{
                                py: 2,
                                px: 3,
                                bgcolor: '#f1f5f9',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    Ticket N°
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: '#0f172a', fontWeight: 700, fontFamily: 'monospace' }}>
                                    {displayCode}
                                </Typography>
                            </Box>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ width: '100%' }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        size="large"
                                        fullWidth
                                        disabled={!sellData}
                                        onClick={() => setPrintDialogOpen(true)}
                                        startIcon={<Print />}
                                        sx={{
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderColor: '#cbd5e1',
                                            color: '#475569'
                                        }}
                                    >
                                        Ticket Cash
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="large"
                                        fullWidth
                                        disabled={isDownloading || !sellData}
                                        onClick={handleDownloadPDF}
                                        startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
                                        sx={{
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Facture PDF
                                    </Button>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    onClick={() => {
                                        context.togglePageLoading(true);
                                        dispatch(setActivePage({ page: Pages.POS_EXPRESS }));
                                    }}
                                    startIcon={<ArrowBack />}
                                    sx={{
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    Fermer et retourner au POS
                                </Button>
                            </Box>
                        </motion.div>
                    </Paper>
                </motion.div>
            </Container>

            <PrintDialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)} sellData={sellData} />
        </Box>
    );
}

export default SuccessSellPage;