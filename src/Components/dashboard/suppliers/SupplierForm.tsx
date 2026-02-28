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
    Storefront,
    ContactPhone,
    Save,
    AddBusiness,
    Edit
} from '@mui/icons-material';
import { ISupply } from 'Interfaces';
import SupplyAPI from '@/Data/Api/Suppliers';

interface SupplierFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplier?: ISupply | null;
}

export default function SupplierForm({ open, onClose, onSuccess, supplier }: SupplierFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<ISupply>>({
        name: '',
        contact_info: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEdit = !!supplier;

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || '',
                contact_info: supplier.contact_info || ''
            });
        } else {
            setFormData({
                name: '',
                contact_info: ''
            });
        }
        setErrors({});
    }, [supplier, open]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Le nom du fournisseur est requis';
        if (!formData.contact_info) newErrors.contact_info = 'Les informations de contact sont requises';
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

        setIsLoading(true);
        try {
            if (isEdit && supplier?.id) {
                await SupplyAPI.update(supplier.id, formData);
            } else {
                await SupplyAPI.create(formData);
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
                        {isEdit ? <Edit sx={{ fontSize: 26 }} /> : <AddBusiness sx={{ fontSize: 26 }} />}
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                            {isEdit ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                            {isEdit ? 'Mettez à jour les détails du fournisseur' : 'Enregistrez un nouveau fournisseur'}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: 2 }}>
                <Fade in={true} timeout={500}>
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Nom de l'entreprise / Fournisseur"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.5)', fontWeight: 600 },
                                    startAdornment: <Storefront sx={{ color: '#94a3b8', mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Contact (Téléphone, Email, etc.)"
                                name="contact_info"
                                value={formData.contact_info}
                                onChange={handleChange}
                                error={!!errors.contact_info}
                                helperText={errors.contact_info}
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                InputProps={{
                                    sx: { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                                    startAdornment: <ContactPhone sx={{ color: '#0ea5e9', mr: 1.5, mb: 'auto', mt: 1, fontSize: 20 }} />
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
                    {isEdit ? 'Enregistrer les modifications' : 'Créer le fournisseur'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
