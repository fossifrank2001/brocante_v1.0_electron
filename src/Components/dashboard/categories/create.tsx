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
import { 
    Box, 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    IconButton, 
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Alert,
    Divider,
    Stack,
    Paper
} from '@mui/material';
import { 
    Add as AddIcon, 
    Delete as DeleteIcon, 
    Save as SaveIcon, 
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    Category as CategoryIcon,
    Label as LabelIcon
} from '@mui/icons-material';
import '@/Styles/forms.scss';

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

const validationSchema = Yup.object({
    label: Yup.string()
        .required('Category name is required')
        .max(50, 'Maximum 50 characters'),
    description: Yup.string()
        .max(300, 'Maximum 300 characters'),
    sub_categories: Yup.array()
        .of(
            Yup.object({
                label: Yup.string()
                    .required('Sub-category name is required')
                    .max(50, 'Maximum 50 characters'),
                description: Yup.string()
                    .max(300, 'Maximum 300 characters'),
            })
        )
        .min(1, 'At least one sub-category is required'),
});

const NewCategory = () => {
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
            setError('Failed to create category');
            console.error('Failed to create category:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik<CategoryFormValues>({
        initialValues,
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Breadcrumd parent="Categories" url={Pages.CATEGORY} />
            
            <Card elevation={3} sx={{ borderRadius: 2 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CategoryIcon color="primary" fontSize="large" />
                        <Typography variant="h5" fontWeight={600}>Nouvelle Catégorie</Typography>
                    </Box>
                    <Button 
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => dispatch(setActivePage({ page: Pages.CATEGORY }))}
                    >
                        Retour
                    </Button>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    <form onSubmit={formik.handleSubmit}>
                        <Stack spacing={3}>
                            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <LabelIcon color="primary" />
                                    Informations de la catégorie
                                </Typography>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Nom de la catégorie"
                                        placeholder="ex: Électronique"
                                        {...formik.getFieldProps('label')}
                                        error={formik.touched.label && Boolean(formik.errors.label)}
                                        helperText={formik.touched.label && formik.errors.label}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        placeholder="Description de la catégorie"
                                        {...formik.getFieldProps('description')}
                                        error={formik.touched.description && Boolean(formik.errors.description)}
                                        helperText={formik.touched.description && formik.errors.description}
                                    />
                                </Stack>
                            </Paper>

                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6">Sous-catégories</Typography>
                                        <Chip label={formik.values.sub_categories.length} color="primary" size="small" />
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => formik.setFieldValue('sub_categories', [
                                            ...formik.values.sub_categories,
                                            { label: '', description: '' }
                                        ])}
                                    >
                                        Ajouter
                                    </Button>
                                </Box>

                                <Stack spacing={2}>
                                    <AnimatePresence>
                                        {formik.values.sub_categories.map((_, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Accordion defaultExpanded sx={{ borderRadius: 2 }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                            <Chip label={`#${index + 1}`} size="small" color="primary" />
                                                            <Typography>
                                                                {formik.values.sub_categories[index].label || `Sous-catégorie ${index + 1}`}
                                                            </Typography>
                                                            {formik.values.sub_categories.length > 1 && (
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newSubCategories = formik.values.sub_categories.filter((_, i) => i !== index);
                                                                        formik.setFieldValue('sub_categories', newSubCategories);
                                                                    }}
                                                                    sx={{ ml: 'auto' }}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Stack spacing={2}>
                                                            <TextField
                                                                required
                                                                fullWidth
                                                                label="Nom"
                                                                placeholder="ex: Smartphones"
                                                                {...formik.getFieldProps(`sub_categories.${index}.label`)}
                                                                error={formik.touched.sub_categories?.[index]?.label && Boolean((formik.errors.sub_categories?.[index] as SubCategory)?.label)}
                                                                helperText={formik.touched.sub_categories?.[index]?.label && (formik.errors.sub_categories?.[index] as SubCategory)?.label}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Description"
                                                                placeholder="Description de la sous-catégorie"
                                                                multiline
                                                                rows={2}
                                                                {...formik.getFieldProps(`sub_categories.${index}.description`)}
                                                                error={formik.touched.sub_categories?.[index]?.description && Boolean((formik.errors.sub_categories?.[index] as SubCategory)?.description)}
                                                                helperText={formik.touched.sub_categories?.[index]?.description && (formik.errors.sub_categories?.[index] as SubCategory)?.description}
                                                            />
                                                        </Stack>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </Stack>
                            </Box>
                        </Stack>

                        <Divider sx={{ my: 3 }} />
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => dispatch(setActivePage({ page: Pages.CATEGORY }))}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={isLoading ? null : <SaveIcon />}
                                disabled={isLoading || !formik.isValid || !formik.dirty}
                            >
                                {isLoading ? 'Création...' : 'Créer la catégorie'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default NewCategory;
