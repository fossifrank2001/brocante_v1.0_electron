import { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Autocomplete, TextField, Tooltip, Box, Grid, Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import Breadcrumd from '@/Components/Breadcrumd';
import { IMenu, IRole } from '@/Data/Interfaces';
import { useAppDispatch } from '@/hooks';
import { useAppContext } from '@/contexts/appContext';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import RoleAPI from '@/Data/Api/Role';
import { IPermission } from '@/Data/Interfaces/Permission';
import AuthorizationAPI from '@/Data/Api/Authorizations';
import MenuAPI from '@/Data/Api/Menu';
import Multiselect from "multiselect-react-dropdown";
import Toast from '@/Data/Utilities/Toast';
import { ArrowBack, Menu as MenuIcon, Shield, Lock, Save } from '@mui/icons-material';

interface FormValues {
    role: number | string;
}

const NewAuthorization = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const [qPermission, setqPermission] = useState('');
    const [_permissions, set_Permissions] = useState<IPermission[] | null>(null);
    const [permissions, setPermissions] = useState<IPermission[] | null>(null);
    const [qRole] = useState('');
    const [roles, setRoles] = useState<IRole[] | null>(null);
    const [qMenu, setqMenu] = useState('');
    const [menus, setMenus] = useState<IMenu[] | null>(null);
    const [menu, setMenu] = useState<IMenu | null>(null);
    const context = useAppContext();

    const initialValues: FormValues = {
        role: '',
    };

    const handleSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const datas = {
                ...values,
                menu: menu?.id,
                permissions: _permissions?.map(__perm => __perm.id)
            };
            const { message } = await AuthorizationAPI.create(datas);
            Toast.success(message);
            context.togglePageLoading(true);
            dispatch(setActivePage({ page: Pages.HABILITATION }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPermissions = useCallback(async (_qPerm) => {
        try {
            setPermissions([]);
            const { data: permissions_ } = await AuthorizationAPI.permissions(_qPerm);
            setPermissions(permissions_.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        getPermissions(qPermission);
    }, [qPermission, getPermissions]);

    const getRoles = useCallback(async (_qRole) => {
        try {
            const { data: _roles } = await RoleAPI.index(_qRole);
            setRoles(_roles.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        getRoles(qRole);
    }, [qRole, getRoles]);

    const getMenus = useCallback(async (_qMenu) => {
        try {
            const { data: _menus } = await MenuAPI.menus(_qMenu);
            setMenus(_menus.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        getMenus(qMenu);
    }, [qMenu, getMenus]);

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};
            if (!values.role) {
                errors.role = 'Le champ rôle est requis.';
            }
            return errors;
        },
    });

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Administration" url={Pages.HABILITATION} />

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
                                                Nouvelle Authorisation
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBack />}
                                        onClick={() => dispatch(setActivePage({ page: Pages.HABILITATION }))}
                                        sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >
                                        Retour
                                    </Button>
                                </Box>

                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={3.5}>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <MenuIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                <Typography sx={{ fontWeight: 700, color: '#475569' }}>Menu <span style={{ color: '#ef4444' }}>*</span></Typography>
                                            </Box>
                                            <Autocomplete
                                                disablePortal
                                                id="menu"
                                                onInputChange={(_, newInputValue) => {
                                                    setqPermission(newInputValue);
                                                    setqMenu(newInputValue);
                                                }}
                                                value={menu}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                getOptionLabel={(val: IMenu) => val.label || ''}
                                                options={menus || []}
                                                onChange={(_, item) => setMenu(item)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        error={!menu}
                                                        placeholder="Chercher un menu..."
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {!menu && (
                                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, mt: 0.5, display: 'block' }}>
                                                    Le menu est requis.
                                                </Typography>
                                            )}
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Shield sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                <Typography sx={{ fontWeight: 700, color: '#475569' }}>Rôle <span style={{ color: '#ef4444' }}>*</span></Typography>
                                            </Box>
                                            <select
                                                className="form-select"
                                                id="role"
                                                name="role"
                                                onChange={formik.handleChange}
                                                value={formik.values.role}
                                                style={{
                                                    borderRadius: '16px',
                                                    padding: '14px 20px',
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    fontWeight: 600,
                                                    color: '#1e293b',
                                                    width: '100%'
                                                }}
                                            >
                                                <option value="">Sélectionner un rôle</option>
                                                {roles && roles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {formik.touched.role && formik.errors.role && (
                                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, mt: 0.5, display: 'block' }}>
                                                    {formik.errors.role}
                                                </Typography>
                                            )}
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Lock sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                <Typography sx={{ fontWeight: 700, color: '#475569' }}>Permissions <span style={{ color: '#ef4444' }}>*</span></Typography>
                                            </Box>
                                            <Multiselect
                                                options={permissions || []}
                                                selectedValues={_permissions}
                                                onSelect={(e) => set_Permissions(e)}
                                                onRemove={(e) => set_Permissions(e)}
                                                displayValue="label"
                                                showCheckbox
                                                placeholder="Sélectionner des permissions"
                                                style={{
                                                    chips: { background: '#6366f1' },
                                                    searchBox: {
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '16px',
                                                        padding: '14px 20px',
                                                        background: '#f8fafc',
                                                        fontWeight: 600,
                                                    }
                                                }}
                                            />
                                            {(!_permissions || _permissions.length <= 0) && (
                                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, mt: 0.5, display: 'block' }}>
                                                    Sélectionner au moins une permission.
                                                </Typography>
                                            )}
                                        </Grid>
                                    </Grid>
                                </form>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                        onClick={() => formik.handleSubmit()}
                                        disabled={isLoading || !menu || !_permissions || _permissions.length <= 0 || !formik.values.role}
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
                                        Enregistrer
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

export default NewAuthorization;