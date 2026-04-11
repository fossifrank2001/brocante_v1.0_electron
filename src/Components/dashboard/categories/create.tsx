import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '@/hooks';
import Breadcrumd from '@/Components/Breadcrumd';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { useAppContext } from '@/contexts/appContext';
import CategoryAPI from '@/Data/Api/Category';
import { ICategoryPayload } from '@/Data/Interfaces/Category';
import { useTranslation } from 'react-i18next';
import {
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

const initialValues: CategoryFormValues = {
    label: '',
    description: '',
    sub_categories: [{ label: '', description: '' }],
};


const NewCategory = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const context = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: CategoryFormValues) => {
        try {
            setIsLoading(true);
            await CategoryAPI.create(values);
            context.togglePageLoading(true);
            dispatch(setActivePage({ page: Pages.CATEGORY }));
        } catch (error) {
            setError(t('category.createError'));
            console.error('Failed to create category:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
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

    const formik = useFormik<CategoryFormValues>({
        initialValues,
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent={t('menu.ADMINISTRATION')} url={Pages.CATEGORY} />

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
                                                {t('category.newCategory')}
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

                                            <Grid container gap={2}>
                                                <AnimatePresence mode="popLayout">
                                                    {formik.values.sub_categories.map((_, index) => (
                                                        <Grid items xs={12} md={3} sx={{
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
                                                            <Stack spacing={2}>
                                                                <Box>
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
                                                                </Box>
                                                                <Box>
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
                                                                </Box>
                                                            </Stack>
                                                        </Grid>
                                                    ))}
                                                </AnimatePresence>
                                            </Grid>
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
                                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                            onClick={() => formik.handleSubmit()}
                                            disabled={isLoading || !formik.isValid || !formik.dirty}
                                            sx={{
                                                borderRadius: '15px',
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                }
                                            }}
                                        >
                                            {t('category.createCategory')}
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

export default NewCategory;
