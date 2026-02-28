import { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
    Autocomplete, TextField, Box, Button, Typography,
    CircularProgress, Card, CardContent, Grid, MenuItem, Select,
    FormControl, FormHelperText, Tooltip
} from '@mui/material';
import {
    ArrowBack, Save, Person, Shield, ToggleOn , Code,
    Info, EditAttributes
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Breadcrumd from '@/Components/Breadcrumd';
import UserAPI from '@/Data/Api/Users';
import { IAccess, IRole, IUser } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useAppContext } from '@/contexts/appContext';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import AccessAPI from '@/Data/Api/Access';
import RoleAPI from '@/Data/Api/Role';
import Constants from '@/Data/Utilities/constants';

interface FormValues {
    role_id: number | string;
    status: string;
    code: string;
}

const UpdateAccess = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const [isLoading, setIsLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<FormValues>({
        role_id: '',
        status: '',
        code: ''
    });
    const [qUser, setqUser] = useState('');
    const [users, setUsers] = useState<IUser[] | null>(null);
    const [user, setUser] = useState<IUser | null>(null);
    const [access, setAccess] = useState<IAccess | null>(null);

    const [isSest, setIsSest] = useState(false);

    const [qRole] = useState('');
    const [roles, setRoles] = useState<IRole[] | null>(null);
    const dispatch = useAppDispatch();
    const context = useAppContext();

    useEffect(() => {
        const fetchAccess = async () => { 
            try {
                setIsSest(true);
                const { data: response } = await AccessAPI.show(id);
                setInitialValues({
                    role_id: response.role_id,
                    status: response.status,
                    code: response.code,
                });
                setUser(response.user);
                setAccess(response);
            } catch (error) {
                console.error("Failed to fetch access", error);
            } finally {
                setIsSest(false);
            }
        };

        if (id) {
            fetchAccess();
        }
    }, [id]);

    const handleSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const datas = {
                ...values,
                user_id: user?.id
            };
            await AccessAPI.update(id, datas);
            context.togglePageLoading(true);
            dispatch(setActivePage({ page: Pages.ACCESS }));
        } catch (e: any) {
            console.error(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getUsers = useCallback(async (_qUser: string) => {
        try {
            const { data: _users } = await UserAPI.index(_qUser);
            setUsers(_users.data);
        } catch (e: any) {
            console.error(e.message);
        }
    }, []);

    useEffect(() => {
        getUsers(qUser);
    }, [qUser, getUsers]);

    const getRoles = useCallback(async (_qRole: string) => {
        try {
            const { data: _roles } = await RoleAPI.index(_qRole);
            setRoles(_roles.data);
        } catch (e: any) {
            console.error(e.message);
        }
    }, []);

    useEffect(() => {
        getRoles(qRole);
    }, [qRole, getRoles]);

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};

            if (!values.role_id) {
                errors.role_id = 'Le rôle est requis.';
            }

            if (!values.status) {
                errors.status = 'Le statut est requis.';
            }

            return errors;
        },
    });

    if (isSest) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Accès" url={currentPage} _child={id} />

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
                                                Modification d'Accès
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ArrowBack />}
                                            onClick={() => dispatch(setActivePage({ page: Pages.ACCESS }))}
                                            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                        >
                                            Retour
                                        </Button>
                                    </Box>
                                </Box>
                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={3.5}>
                                        <Grid item xs={12}>
                                            <Tooltip title="Recherchez et modifiez l'utilisateur si nécessaire" arrow placement="top">
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                         Utilisateur Cible <span style={{ color: '#ef4444' }}>*</span>
                                                    </Typography>

                                                    <Autocomplete
                                                        disablePortal
                                                        id="user"
                                                        onInputChange={(_, newInputValue) => setqUser(newInputValue)}
                                                        value={user ?? users?.find(u => u.id === access?.user_id) ?? null}
                                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                                        getOptionLabel={(val: IUser) => `${val.last_name || ''} ${val.first_name || ''}`}
                                                        options={users ?? []}
                                                        onChange={(_, item) => setUser(item)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                error={!user && formik.submitCount > 0}
                                                                helperText={(!user && formik.submitCount > 0) ? "Veuillez sélectionner un utilisateur." : ""}
                                                                placeholder="Rechercher un utilisateur..."
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    sx: { borderRadius: '12px', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Tooltip>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                Rôle Attribué <span style={{ color: '#ef4444' }}>*</span>
                                            </Typography>
                                            <FormControl fullWidth error={formik.touched.role_id && Boolean(formik.errors.role_id)}>
                                                <Select
                                                    id="role_id"
                                                    name="role_id"
                                                    displayEmpty
                                                    value={formik.values.role_id}
                                                    onChange={formik.handleChange}
                                                    sx={{ borderRadius: '12px', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }}
                                                >
                                                    <MenuItem value="" disabled>Sélectionner un rôle</MenuItem>
                                                    {roles?.map(role => (
                                                        <MenuItem key={role.id} value={role.id}>{role.label}</MenuItem>
                                                    ))}
                                                </Select>
                                                {formik.touched.role_id && formik.errors.role_id && (
                                                    <FormHelperText>{formik.errors.role_id}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ToggleOn fontSize="small" sx={{ color: '#10b981' }} /> Statut de l'Accès <span style={{ color: '#ef4444' }}>*</span>
                                            </Typography>
                                            <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                                                <Select
                                                    id="status"
                                                    name="status"
                                                    displayEmpty
                                                    value={formik.values.status}
                                                    onChange={formik.handleChange}
                                                    sx={{ borderRadius: '12px', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }}
                                                >
                                                    <MenuItem value="" disabled>Sélectionner le statut</MenuItem>
                                                    <MenuItem value={Constants.STATUS_ACCESS.ACTIVE}>Actif</MenuItem>
                                                    <MenuItem value={Constants.STATUS_ACCESS.INACTIVE}>Inactif</MenuItem>
                                                </Select>
                                                {formik.touched.status && formik.errors.status && (
                                                    <FormHelperText>{formik.errors.status}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(241, 245, 249, 0.5)', border: '1px solid #e2e8f0' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    Code d'Accès <span style={{ color: '#ef4444' }}>*</span>
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    id="code"
                                                    name="code"
                                                    disabled={true}
                                                    value={formik.values.code}
                                                    InputProps={{
                                                        sx: { borderRadius: '12px', bgcolor: '#f1f5f9', color: '#64748b' }
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                                                    <Info sx={{ fontSize: 16, color: '#94a3b8' }} />
                                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                                        Le code d'accès ne peut pas être modifié après la création.
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </form>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                        onClick={() => formik.handleSubmit()}
                                        disabled={isLoading}
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
                                        Mettre à jour l'Accès
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

export default UpdateAccess;
