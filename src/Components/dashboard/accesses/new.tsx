import { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
    Autocomplete, TextField, Tooltip, Box, Button, Typography,
    CircularProgress, Card, CardContent, Grid, MenuItem, Select,
    FormControl, InputLabel, FormHelperText
} from '@mui/material';
import {
    ArrowBack, Save, Person, Shield, ToggleOn, Code,
    Info, AdminPanelSettings
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Breadcrumd from '@/Components/Breadcrumd';
import UserAPI from '@/Data/Api/Users';
import { IAccess, IRole, IUser } from '@/Data/Interfaces';
import { useAppDispatch } from '@/hooks';
import { useAppContext } from '@/contexts/appContext';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import AccessAPI from '@/Data/Api/Access';
import RoleAPI from '@/Data/Api/Role';
import Constants from '@/Data/Utilities/constants';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { addAccessToAuthUser } from '@/Data/Slices/auth/userSlice';
import { IApiResponseBase, IApiResponsePaginated } from 'Data/Utilities/axiosInstance.ts';

interface FormValues {
    role_id: number | string;
    status: string;
    code: string;
}

const NewAccess = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const [qUser, setqUser] = useState('');
    const [users, setUsers] = useState<IUser[] | null>(null);
    const [user, setUser] = useState<IUser | null>(null);
    const [qRole] = useState('');
    const [roles, setRoles] = useState<IRole[] | null>(null);
    const [isAdminCode, setIsAdminCode] = useState<string | null>(null);
    const context = useAppContext();

    const initialValues: FormValues = {
        role_id: '',
        status: '',
        code: ''
    };

    const handleSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const datas = {
                ...values,
                user_id: user?.id
            };
            const { data }: IApiResponseBase<IAccess> = await AccessAPI.create(datas);
            context.togglePageLoading(true);

            if (user && UtilMethods.isAuth(user.id)) {
                dispatch(addAccessToAuthUser(data));
            }
            dispatch(setActivePage({ page: Pages.ACCESS }));
        } catch (error: any) {
            if (error.response) {
                console.error(error.response.data.message || "An error occurred");
            } else {
                console.error(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getUsers = useCallback(async (_qUser: string) => {
        try {
            const { data: _users }: IApiResponsePaginated<IUser> = await UserAPI.index(_qUser);
            setUsers(_users.data);
        } catch (e: any) {
            console.log(e.message);
        }
    }, []);

    useEffect(() => {
        getUsers(qUser);
    }, [qUser, getUsers]);

    const getRoles = useCallback(async (_qRole: string) => {
        try {
            const { data: _roles }: IApiResponsePaginated<IRole> = await RoleAPI.index(_qRole);
            setRoles(_roles.data);
        } catch (e: any) {
            console.log(e.message);
        }
    }, []);

    useEffect(() => {
        getRoles(qRole);
    }, [qRole, getRoles]);

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};

            if (!values.role_id) {
                errors.role_id = 'Le rôle est requis.';
            }

            if (!values.status) {
                errors.status = 'Le statut est requis.';
            }

            if (!values.code) {
                errors.code = 'Le code d\'accès est requis.';
            } else if (!/^[A-Z0-9_@./*]{5,}$/.test(values.code)) {
                errors.code = 'Code invalide (min 5 car. majuscules, chiffres, _@./*).';
            }

            return errors;
        },
    });

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Accès" />

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
                                                Nouvel Accès
                                            </Typography>
                                        </Box>
                                    </Box>
                                     <Button
                                        variant="outlined"
                                        startIcon={<ArrowBack />}
                                        onClick={() => dispatch(setActivePage({ page: Pages.ACCESS }))}
                                        sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >
                                        Retour
                                    </Button>
                                </Box>

                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={3.5}>
                                        <Grid item xs={12}>
                                            <Tooltip title="Recherchez et sélectionnez l'utilisateur" arrow placement="top">
                                                <Box>
                                                    <Autocomplete
                                                        disablePortal
                                                        id="user"
                                                        onInputChange={(_, newInputValue) => setqUser(newInputValue)}
                                                        value={user}
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
                                            <FormControl fullWidth error={formik.touched.role_id && Boolean(formik.errors.role_id)}>
                                                <Select
                                                    id="role_id"
                                                    name="role_id"
                                                    displayEmpty
                                                    value={formik.values.role_id}
                                                    onChange={(e) => {
                                                        formik.handleChange(e);
                                                        const role = roles?.find(role => role.id === Number(e.target.value));
                                                        if (role) {
                                                            if (role.code === Constants.ROLES.ADMIN) {
                                                                formik.setFieldValue('code', 'ADMINS');
                                                            } else {
                                                                formik.setFieldValue('code', '');
                                                            }
                                                            setIsAdminCode(role.code);
                                                        } else {
                                                            setIsAdminCode('');
                                                        }
                                                    }}
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

                                        {isAdminCode !== Constants.ROLES.ADMIN && (
                                            <Grid item xs={12}>
                                                <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(241, 245, 249, 0.5)', border: '1px dashed #cbd5e1' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Code fontSize="small" sx={{ color: '#f59e0b' }} /> Code d'Accès <span style={{ color: '#ef4444' }}>*</span>
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        id="code"
                                                        name="code"
                                                        placeholder="Saisir le code d'accès"
                                                        value={formik.values.code}
                                                        onChange={formik.handleChange}
                                                        error={formik.touched.code && Boolean(formik.errors.code)}
                                                        helperText={formik.touched.code && formik.errors.code}
                                                        InputProps={{
                                                            sx: { borderRadius: '12px', bgcolor: 'white' }
                                                        }}
                                                    />
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                                                        <Info sx={{ fontSize: 16, color: '#64748b' }} />
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                            5 caractères min. Lettres en majuscule, chiffres et caractères spéciaux (_@./*) uniquement.
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </form>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                        onClick={() => formik.handleSubmit()}
                                        disabled={isLoading || !user}
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
                                        Enregistrer l'Accès
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

export default NewAccess;