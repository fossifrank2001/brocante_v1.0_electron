import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import MultiStepForm from "Components/dashboard/products/formSteps";
import Breadcrumd from "@/Components/Breadcrumd";
import { motion } from "framer-motion";
import { setActivePage } from "@/Data/Slices/NavigationSlice";
import { Pages } from "@/Data/Objects/state";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useAppContext } from "@/contexts/appContext";
import { IProduct } from "Data/Interfaces/Supply";
import ProductAPI from "Data/Api/Product";
import ThumbnailDropzone from "Components/ThumbnailDropzone";
import { IImage } from "Data/Interfaces/Image";
import constants from "Data/Utilities/constants";
import Toast from '@/Data/Utilities/Toast';
import { Box, Card, CardContent, Button, Typography, Grid, CircularProgress, Paper, Fade } from '@mui/material';
import { ArrowBack as ArrowBackIcon, AutoAwesome } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ProductUpdate: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useAppSelector((state) => state.navigaton);
    const dispatch = useAppDispatch();
    const context = useAppContext();
    const [record, setRecord] = useState<IProduct | null>(null);
    const [image, setImage] = useState<IImage | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useLayoutEffect(() => {
        context.togglePageLoading();
    }, [context]);

    const handleUploadSuccess = (uploadedImagePath: IImage) => {
        setImage(uploadedImagePath);
        Toast.success(t('product.imageUpdated'));
    };

    const getRecord = useCallback(
        async () => {
            try {
                setIsDataLoading(true);
                const { data: __product } = await ProductAPI.show(id);
                setRecord(__product);
                setImage(__product.thumbnail);
            } catch (e) {
                console.error(e);
                Toast.error(t('product.fetchError'));
            } finally {
                setIsDataLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [id],
    );

    useEffect(() => {
        getRecord();
    }, [getRecord]);

    if (isDataLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Fade in={true}>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1', mb: 2 }} />
                        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                            {t('product.loadingArticle')}
                        </Typography>
                    </Box>
                </Fade>
            </Box>
        );
    }

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent={t('menu.ARTICLE')} url={Pages.ARTICLE} _child={id} />

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
                                                {t('product.editProduct')}
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

                                {record && (
                                    <Grid container spacing={5}>
                                        <Grid item xs={12} lg={8}>
                                            <MultiStepForm record={record} id={id} />
                                        </Grid>
                                        <Grid item xs={12} lg={4}>
                                            <Paper elevation={0} sx={{
                                                p: 4,
                                                borderRadius: '24px',
                                                backgroundColor: 'var(--bg-surface)',
                                                border: '1px solid var(--border-color)',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%'
                                            }}>
                                                <ThumbnailDropzone
                                                    onUploadSuccess={handleUploadSuccess}
                                                    existingImageUrl={image ? `${constants.URL}/${image.path}` : null}
                                                    existingImageId={image ? image.id : null}
                                                    imageable={{
                                                        imageable_id: record.id,
                                                        imageable_type: 'Product'
                                                    }}
                                                />

                                                <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(226, 232, 240, 0.8)', width: '100%' }}>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <AutoAwesome sx={{ fontSize: 14 }} />
                                                        {t('product.coverImagePreview')}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default ProductUpdate;
