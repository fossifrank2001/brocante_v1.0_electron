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

const ProductCreate: React.FC = () => {
    const dispatch = useAppDispatch();
    const context = useAppContext();

    useLayoutEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Articles" url={Pages.ARTICLE} />

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                                Nouvel Article
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={() => dispatch(setActivePage({ page: Pages.ARTICLE }))}
                                        sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >
                                        Retour
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
