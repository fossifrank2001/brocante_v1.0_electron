import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Grid,
    Zoom,
    CircularProgress,
    Fade
} from '@mui/material';
import {
    Close,
    Person,
    Phone,
    Save,
    PersonAdd,
    Edit
} from '@mui/icons-material';
import { IPerson } from 'Interfaces';
import CustomerAPI from '@/Data/Api/Customer';
import { useTranslation } from 'react-i18next';

interface CustomerFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer?: IPerson | null;
}

export default function CustomerForm({ open, onClose, onSuccess, customer }: CustomerFormProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<IPerson>>({
        firstname: '',
        lastname: '',
        phone: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEdit = !!customer;

    useEffect(() => {
        if (customer) {
            setFormData({
                firstname: customer.firstname || '',
                lastname: customer.lastname || '',
                phone: customer.phone || ''
            });
        } else {
            setFormData({
                firstname: '',
                lastname: '',
                phone: ''
            });
        }
        setErrors({});
    }, [customer, open]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstname) newErrors.firstname = t('customer.firstnameRequired');
        if (!formData.lastname) newErrors.lastname = t('customer.lastnameRequired');
        if (!formData.phone) newErrors.phone = t('customer.phoneRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        console.log('Submit - isEdit:', isEdit, 'customer?.id:', customer?.id, 'customer:', customer, 'formData:', formData);

        setIsLoading(true);
        try {
            if (isEdit && customer?.id && typeof customer.id === 'number' && customer.id > 0) {
                console.log('Updating customer with ID:', customer.id);
                await CustomerAPI.update(customer.id, formData as IPerson);
            } else {
                console.log('Creating new customer - isEdit:', isEdit, 'customer?.id:', customer?.id);
                await CustomerAPI.create(formData as IPerson);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            TransitionComponent={Zoom}
            PaperProps={{
                sx: {
                    borderRadius: '28px',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.2)',
                    overflow: 'visible'
                }
            }}
        >
            <Box sx={{ position: 'absolute', right: -12, top: -12, zIndex: 1 }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        bgcolor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                >
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            <DialogTitle sx={{ p: 4, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '16px',
                        background: isEdit
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                            : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px -6px rgba(139, 92, 246, 0.4)',
                    }}>
                        {isEdit ? <Edit sx={{ fontSize: 26 }} /> : <PersonAdd sx={{ fontSize: 26 }} />}
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                            {isEdit ? t('customer.editCustomer') : t('customer.newCustomer')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                            {isEdit ? t('customer.updateDetails') : t('customer.saveNewCustomer')}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: 2 }}>
                <Fade in={true} timeout={500}>
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={t('customer.firstname')}
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                error={!!errors.firstname}
                                helperText={errors.firstname}
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.5)', fontWeight: 600 },
                                    startAdornment: <Person sx={{ color: '#94a3b8', mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={t('customer.lastname')}
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                error={!!errors.lastname}
                                helperText={errors.lastname}
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.5)', fontWeight: 600 }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={t('customer.phone')}
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                error={!!errors.phone}
                                helperText={errors.phone}
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.5)', fontWeight: 600 },
                                    startAdornment: <Phone sx={{ color: '#0ea5e9', mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                    </Grid>
                </Fade>
            </DialogContent>

            <DialogActions sx={{ p: 4, pt: 0 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    sx={{
                        borderRadius: '14px',
                        py: 1.8,
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '1rem',
                        background: isEdit
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                            : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                        boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)',
                        '&:hover': {
                            background: isEdit
                                ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                                : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 12px 24px -5px rgba(139, 92, 246, 0.5)'
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    {isEdit ? t('customer.saveChanges') : t('customer.createCustomer')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
