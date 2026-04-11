import React, { useLayoutEffect } from 'react';
import MultiStepForm from "Components/dashboard/products/formSteps";
import Breadcrumd from "@/Components/Breadcrumd";
import { motion } from "framer-motion";
import { setActivePage } from "@/Data/Slices/NavigationSlice";
import { Pages } from "@/Data/Objects/state";
import { useAppDispatch } from "@/hooks";
import { useAppContext } from "@/contexts/appContext";
import { Box, Card, CardContent, Button, Typography, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ProductCreate: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const context = useAppContext();

    useLayoutEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent={t('menu.ARTICLE')} url={Pages.ARTICLE} />

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            boxShadow: 'var(--shadow-lg)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                                {t('product.newProduct')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={() => dispatch(setActivePage({ page: Pages.ARTICLE }))}
                                        sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >
                                        {t('product.back')}
                                    </Button>
                                </Box>

                                <Box>
                                    <MultiStepForm />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default ProductCreate;
