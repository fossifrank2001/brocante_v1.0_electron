import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField,
    Card,
    CardContent,
    Button,
    Box,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    InputAdornment,
    FormHelperText
} from '@mui/material';
import {
    ArrowBack,
    Person,
    Mail,
    Phone,
    Wc,
    Save
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Breadcrumd from '@/Components/Breadcrumd';
import { useAppDispatch } from '@/hooks';
import { useAppContext } from '@/contexts/appContext';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import UserAPI from "Data/Api/Users";
import Toast from '@/Data/Utilities/Toast';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/config';

interface FormValues {
    last_name: string;
    first_name: string;
    email: string;
    phone: string;
    gender: string;
}

const validationSchema = Yup.object({
    last_name: Yup.string()
        .required(i18n.t('validation.required'))
        .max(50, i18n.t('validation.maxLength', { max: 50 })),
    first_name: Yup.string()
        .max(50, i18n.t('validation.maxLength', { max: 50 })),
    email: Yup.string()
        .email(i18n.t('validation.invalidEmail'))
        .required(i18n.t('validation.required')),
    phone: Yup.string()
        .required(i18n.t('validation.required'))
        .matches(/^6[0-9]{8}$/i, i18n.t('validation.invalidPhone')),
    gender: Yup.string()
        .required(i18n.t('validation.required')),
});

const NewUser = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const context = useAppContext();

    const handleSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            await UserAPI.create(values);
            context.togglePageLoading(true);
            Toast.success(t('user.accountCreated'));
            dispatch(setActivePage({ page: Pages.ACCOUNT }));
        } catch (error: any) {
            console.error('Failed to create user:', error);
            Toast.error(error?.message || t('user.accountCreationFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik<FormValues>({
        initialValues: {
            last_name: '',
            first_name: '',
            email: '',
            phone: '',
            gender: ''
        },
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Administration" url={Pages.ACCOUNT} />

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
                                                {t('user.newAccount')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBack />}
                                        onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                                        sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >
                                        {t('common.back')}
                                    </Button>
                                </Box>

                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={3.5}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label={t('user.lastName')}
                                                {...formik.getFieldProps('last_name')}
                                                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                                                helperText={formik.touched.last_name && formik.errors.last_name}
                                                InputProps={{
                                                    sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 700, '& fieldset': { borderColor: '#e2e8f0' } },
                                                    startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94a3b8' }} /></InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label={t('user.firstName')}
                                                {...formik.getFieldProps('first_name')}
                                                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                                                helperText={formik.touched.first_name && formik.errors.first_name}
                                                InputProps={{
                                                    sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } },
                                                    startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94a3b8', opacity: 0.5 }} /></InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
                                                <InputLabel id="gender-label">{t('user.gender')}</InputLabel>
                                                <Select
                                                    labelId="gender-label"
                                                    label={t('user.gender')}
                                                    {...formik.getFieldProps('gender')}
                                                    sx={{ borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } }}
                                                    startAdornment={<InputAdornment position="start"><Wc sx={{ color: '#94a3b8', mr: 1 }} /></InputAdornment>}
                                                >
                                                    <MenuItem value="male">{t('user.male')}</MenuItem>
                                                    <MenuItem value="female">{t('user.female')}</MenuItem>
                                                </Select>
                                                {formik.touched.gender && formik.errors.gender && (
                                                    <FormHelperText>{formik.errors.gender}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                label={t('user.email')}
                                                type="email"
                                                {...formik.getFieldProps('email')}
                                                error={formik.touched.email && Boolean(formik.errors.email)}
                                                helperText={formik.touched.email && formik.errors.email}
                                                InputProps={{
                                                    sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } },
                                                    startAdornment: <InputAdornment position="start"><Mail sx={{ color: '#94a3b8' }} /></InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                label={t('user.phone')}
                                                {...formik.getFieldProps('phone')}
                                                error={formik.touched.phone && Boolean(formik.errors.phone)}
                                                helperText={formik.touched.phone && formik.errors.phone}
                                                InputProps={{
                                                    sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } },
                                                    startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#94a3b8' }} /></InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </form>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
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
                                        {t('user.createAccount')}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default NewUser;