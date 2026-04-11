import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks';
import Breadcrumd from '@/Components/Breadcrumd';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { useAppContext } from '@/contexts/appContext';
import CategoryAPI from '@/Data/Api/Category';
import { ICategoryPayload, ICategory } from '@/Data/Interfaces/Category';
import { IApiResponseBase } from '@/Data/Utilities/axiosInstance';
import { useTranslation } from 'react-i18next';import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    IconButton,
    Typography,
    Chip,
    Alert,
    Stack,
    CircularProgress,
    Fade,
    Grid,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Category as CategoryIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';

interface SubCategory {
    label: string;
    description?: string;
}

interface CategoryFormValues extends ICategoryPayload {
    label: string;
    description: string;
    sub_categories: SubCategory[];
}


const UpdateCategory = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const context = useAppContext();
    const { id } = useAppSelector((state) => state.navigaton);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<CategoryFormValues | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);    
    const validationSchema = Yup.object({
        label: Yup.string()
            .required(t('category.categoryNameRequired'))
            .max(50, t('category.max50Characters')),
        description: Yup.string()
            .max(300, t('category.max300Characters')),
        sub_categories: Yup.array()
            .of(
                Yup.object({
                    label: Yup.string()
                        .required(t('category.subCategoryNameRequired'))
                        .max(50, t('category.max50Characters')),
                    description: Yup.string()
                        .max(300, t('category.max300Characters')),
                })
            )
            .min(1, t('category.atLeastOneSubCategory')),
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setIsLoading(true);
                const { data }: IApiResponseBase<ICategory> = await CategoryAPI.show(id);
                setCategory({
                    label: data.label,
                    description: data.description,
                    sub_categories: data.sub_categories.map((sub: SubCategory) => ({
                        label: sub.label,
                        description: sub.description
                    }))
                });
            } catch (err) {
                console.error('Failed to fetch category:', err);
                setError(t('category.fetchError'));
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCategory();
        }
    }, [id]);

    const handleSubmit = async (values: CategoryFormValues) => {
        try {
            setIsSubmitting(true);
            await CategoryAPI.update(id, values);
            context.togglePageLoading(true);
            dispatch(setActivePage({ page: Pages.CATEGORY }));
        } catch (error: any) {
            console.error('Failed to update category:', error);
            setError(t('category.updateError'));
            if (error.response?.data) {
                formik.setErrors(error.response.data);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formik = useFormik<CategoryFormValues>({
        initialValues: category || {
            label: '',
            description: '',
            sub_categories: [{ label: '', description: '' }],
        },
        validationSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    if (isLoading || !category) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Fade in={true}>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1', mb: 2 }} />
                        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                            {t('category.loadingCategory')}
                        </Typography>
                    </Box>
                </Fade>
            </Box>
        );
    }

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent={t('menu.ADMINISTRATION')} url={Pages.CATEGORY} _child={id} />

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-glass)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: 'var(--shadow-lg)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                                {t('category.updateCategory')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={() => dispatch(setActivePage({ page: Pages.CATEGORY }))}
                                        sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >
                                        {t('common.back')}
                                    </Button>
                                </Box>

                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={5}>
                                            <TextField
                                                fullWidth
                                                label={t('category.categoryName')}
                                                placeholder={t('category.categoryNamePlaceholder')}
                                                {...formik.getFieldProps('label')}
                                                error={formik.touched.label && Boolean(formik.errors.label)}
                                                helperText={formik.touched.label && formik.errors.label}
                                                InputProps={{
                                                    sx: { borderRadius: '16px', bgcolor: 'var(--input-bg)', fontWeight: 700, '& fieldset': { borderColor: 'var(--input-border)' } },
                                                    startAdornment: <InputAdornment position="start"><CategoryIcon sx={{ color: '#6366f1' }} /></InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={7}>
                                            <TextField
                                                fullWidth
                                                label={t('category.globalDescription')}
                                                placeholder={t('category.globalDescriptionPlaceholder')}
                                                {...formik.getFieldProps('description')}
                                                error={formik.touched.description && Boolean(formik.errors.description)}
                                                helperText={formik.touched.description && formik.errors.description}
                                                InputProps={{
                                                    sx: { borderRadius: '16px', bgcolor: 'var(--input-bg)', fontWeight: 500, '& fieldset': { borderColor: 'var(--input-border)' } },
                                                    startAdornment: <InputAdornment position="start"><DescriptionIcon sx={{ color: '#94a3b8' }} /></InputAdornment>
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                                                        {t('category.subCategories')}
                                                    </Typography>
                                                    <Chip
                                                        label={`${formik.values.sub_categories.length} ${t('common.items')}`}
                                                        size="small"
                                                        sx={{ fontWeight: 700, bgcolor: '#6366f1', color: 'white', borderRadius: '8px' }}
                                                    />
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => formik.setFieldValue('sub_categories', [
                                                        ...formik.values.sub_categories,
                                                        { label: '', description: '' }
                                                    ])}
                                                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                                                >
                                                    {t('common.add')}
                                                </Button>
                                            </Box>

                                            <Stack spacing={2}>
                                                <AnimatePresence mode="popLayout">
                                                    {formik.values.sub_categories.map((_, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Box sx={{
                                                                p: 3,
                                                                borderRadius: '16px',
                                                                border: '1px solid var(--border-color)',
                                                                bgcolor: 'var(--bg-secondary)',
                                                                position: 'relative'
                                                            }}>
                                                                {formik.values.sub_categories.length > 1 && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => {
                                                                            const newSubCategories = formik.values.sub_categories.filter((_, i) => i !== index);
                                                                            formik.setFieldValue('sub_categories', newSubCategories);
                                                                        }}
                                                                        sx={{ position: 'absolute', top: 8, right: 8, color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                                <Grid container spacing={3} sx={{ mt: 0 }}>
                                                                    <Grid item xs={12} md={5}>
                                                                        <TextField
                                                                            fullWidth
                                                                            label={`${t('category.subCategoryName')} ${index + 1}`}
                                                                            placeholder={t('category.subCategoryNamePlaceholder')}
                                                                            {...formik.getFieldProps(`sub_categories.${index}.label`)}
                                                                            error={formik.touched.sub_categories?.[index]?.label && Boolean((formik.errors.sub_categories?.[index] as any)?.label)}
                                                                            helperText={formik.touched.sub_categories?.[index]?.label && (formik.errors.sub_categories?.[index] as any)?.label}
                                                                            InputProps={{
                                                                                sx: { borderRadius: '12px', bgcolor: 'var(--input-bg)', '& fieldset': { borderColor: 'var(--input-border)' } }
                                                                            }}
                                                                            size="small"
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} md={7}>
                                                                        <TextField
                                                                            fullWidth
                                                                            label={t('category.specificDescription')}
                                                                            placeholder={t('category.specificDescriptionPlaceholder')}
                                                                            {...formik.getFieldProps(`sub_categories.${index}.description`)}
                                                                            error={formik.touched.sub_categories?.[index]?.description && Boolean((formik.errors.sub_categories?.[index] as any)?.description)}
                                                                            helperText={formik.touched.sub_categories?.[index]?.description && (formik.errors.sub_categories?.[index] as any)?.description}
                                                                            InputProps={{
                                                                                sx: { borderRadius: '12px', bgcolor: 'var(--input-bg)', '& fieldset': { borderColor: 'var(--input-border)' } }
                                                                            }}
                                                                            size="small"
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                    {error && (
                                        <Fade in={true}>
                                            <Alert severity="error" sx={{ mt: 4, borderRadius: '12px', fontWeight: 600 }}>
                                                {error}
                                            </Alert>
                                        </Fade>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                            onClick={() => formik.handleSubmit()}
                                            disabled={isSubmitting || !formik.isValid || !formik.dirty}
                                            sx={{
                                                borderRadius: '15px',
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                }
                                            }}
                                        >
                                            {t('category.updateCategory')}
                                        </Button>
                                    </Box>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default UpdateCategory;
