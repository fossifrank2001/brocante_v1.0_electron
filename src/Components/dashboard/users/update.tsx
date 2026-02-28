import { useEffect, useLayoutEffect, useState } from 'react';
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
    Paper,
    CircularProgress,
    InputAdornment,
    FormHelperText
} from '@mui/material';
import {
    ArrowBack,
    Person,
    Wc,
    Mail,
    Phone,
    Save,
    AutoAwesome
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Breadcrumd from '@/Components/Breadcrumd';
import UserAPI from '@/Data/Api/Users';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { useAppContext } from '@/contexts/appContext';
import { IUser } from 'Interfaces';
import ThumbnailDropzone from "Components/ThumbnailDropzone.tsx";
import constants from "Data/Utilities/constants.ts";
import { IImage } from "Data/Interfaces/Image.ts";
import Toast from '@/Data/Utilities/Toast';

interface FormValues {
    last_name: string;
    first_name: string;
    email: string;
    phone: string;
    gender: string;
}

const validationSchema = Yup.object({
    last_name: Yup.string()
        .required('Le nom est requis')
        .max(50, 'Maximum 50 caractères'),
    first_name: Yup.string()
        .max(50, 'Maximum 50 caractères'),
    email: Yup.string()
        .email('Email invalide')
        .required("L'email est requis"),
    phone: Yup.string()
        .required('Le téléphone est requis')
        .matches(/^6[0-9]{8}$/i, 'Format de téléphone invalide (ex: 690000000)'),
    gender: Yup.string()
        .required('Le genre est requis'),
});

const UpdateUser = () => {
    const { id } = useAppSelector((state) => state.navigaton);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [record, setRecord] = useState<IUser | null>(null);
    const [image, setImage] = useState<IImage | null>(null);
    const dispatch = useAppDispatch();
    const context = useAppContext();

    useLayoutEffect(() => {
        context.togglePageLoading();
    }, [context]);

    const handleUploadSuccess = (uploadedImagePath: IImage) => {
        setImage(uploadedImagePath);
        Toast.success('Photo de profil mise à jour');
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsDataLoading(true);
                const { data: response } = await UserAPI.show(id);
                setRecord(response);
                setImage(response.thumbnail);
            } catch (error) {
                console.error("Failed to fetch user", error);
                Toast.error("Impossible de charger les données de l'utilisateur");
            } finally {
                setIsDataLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            await UserAPI.update(id, values);
            context.togglePageLoading(true);
            Toast.success('Compte mis à jour avec succès');
            dispatch(setActivePage({ page: Pages.ACCOUNT }));
        } catch (error: any) {
            console.error("Failed to update user", error);
            Toast.error(error?.message || "Échec de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik<FormValues>({
        initialValues: {
            last_name: record?.last_name || '',
            first_name: record?.first_name || '',
            email: record?.email || '',
            phone: record?.phone || '',
            gender: record?.gender || ''
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: handleSubmit,
    });

    if (isDataLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Administration" url={Pages.ACCOUNT} _child={id} />

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
                                                Modifier le Compte
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBack />}
                                        onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                                        sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >
                                        Retour
                                    </Button>
                                </Box>

                                <Grid container spacing={5}>
                                    {/* Left Column: Form */}
                                    <Grid item xs={12} lg={8}>
                                        <form onSubmit={formik.handleSubmit}>
                                            <Grid container spacing={3.5}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Nom"
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
                                                        label="Prénom"
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
                                                        <InputLabel id="gender-label">Genre</InputLabel>
                                                        <Select
                                                            labelId="gender-label"
                                                            label="Genre"
                                                            {...formik.getFieldProps('gender')}
                                                            sx={{ borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } }}
                                                            startAdornment={<InputAdornment position="start"><Wc sx={{ color: '#94a3b8', mr: 1 }} /></InputAdornment>}
                                                        >
                                                            <MenuItem value="male">Masculin</MenuItem>
                                                            <MenuItem value="female">Féminin</MenuItem>
                                                        </Select>
                                                        {formik.touched.gender && formik.errors.gender && (
                                                            <FormHelperText>{formik.errors.gender}</FormHelperText>
                                                        )}
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} md={8}>
                                                    <TextField
                                                        fullWidth
                                                        label="Email"
                                                        {...formik.getFieldProps('email')}
                                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                                        helperText={formik.touched.email && formik.errors.email}
                                                        InputProps={{
                                                            sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } },
                                                            startAdornment: <InputAdornment position="start"><Mail sx={{ color: '#94a3b8' }} /></InputAdornment>
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Téléphone"
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
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                    }
                                                }}
                                            >
                                                Mettre à jour le Compte
                                            </Button>
                                        </Box>
                                    </Grid>

                                    {/* Right Column: Profile Picture */}
                                    <Grid item xs={12} lg={4}>
                                        <Paper elevation={0} sx={{
                                            p: 4,
                                            borderRadius: '24px',
                                            backgroundColor: 'rgba(248, 250, 252, 0.6)',
                                            border: '1px solid rgba(226, 232, 240, 0.8)',
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
                                                    imageable_id: record?.id,
                                                    imageable_type: 'User'
                                                }}
                                            />

                                            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(226, 232, 240, 0.8)', width: '100%' }}>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                    <AutoAwesome sx={{ fontSize: 14 }} />
                                                    Utilisez une photo nette
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default UpdateUser;
