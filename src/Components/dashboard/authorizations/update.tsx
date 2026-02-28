import Breadcrumd from '@/Components/Breadcrumd';
import { IMenu, IRole } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Autocomplete, TextField, Box, Grid, Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useState } from 'react'
import { useAppContext } from '@/contexts/appContext';
import { useFormik } from 'formik';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import RoleAPI from '@/Data/Api/Role';
import { IPermission } from '@/Data/Interfaces/Permission';
import AuthorizationAPI from '@/Data/Api/Authorizations';
import MenuAPI from '@/Data/Api/Menu';
import Toast from '@/Data/Utilities/Toast';
import { IHabilitation } from "Data/Interfaces/Habilitation";
import { ArrowBack, Menu as MenuIcon, Shield, Lock, Save } from '@mui/icons-material';
import { motion } from 'framer-motion';

const UpdateAuthorization = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch()

    const [qPermission, setqPermission] = useState('');
    const [permission, setPermission] = useState<IPermission | null>(null);
    const [permissions, setPermissions] = useState<IPermission[] | null>(null);

    const [qRole, setqRole] = useState('');
    const [roles, setRoles] = useState<IRole[] | null>(null);
    const [role, setRole] = useState<IRole | null>(null);

    const [qMenu, setqMenu] = useState('');
    const [menus, setMenus] = useState<IMenu[] | null>(null);
    const [menu, setMenu] = useState<IMenu | null>(null);

    const [record, setRecord] = useState<IHabilitation | null>(null);
    const { currentPage, id } = useAppSelector((state) => state.navigaton);

    const context = useAppContext();

    const getRecord = useCallback(
        async () => {
            try {
                const { data } = await AuthorizationAPI.show(id)
                console.log(data)
                setRecord(data)
                setMenu(data.menu)
                setRole(data.role)
                setPermission(data.permission)
            } catch (e) {
                console.error(e);
            }
        },
        [id],
    );

    useEffect(() => {
        getRecord()
    }, [getRecord, id]);

    useEffect(() => {
        if (record) {
            setMenu(record.menu);
            setRole(record.role);
            setPermission(record.permission);
        }
    }, [record]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const datas = {
                menu: menu?.id,
                role: role?.id,
                permission: permission?.id,
            }
            const { message } = await AuthorizationAPI.update(id, datas);
            Toast.success(message)
            context.togglePageLoading(true)
            dispatch(setActivePage({ page: Pages.HABILITATION }))
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    };

    const getPermissions = useCallback(async (_qPerm) => {
        try {
            setPermissions([])
            const { data: permissions_ } = await AuthorizationAPI.permissions(_qPerm)
            setPermissions(permissions_.data)
        } catch (error) {
            console.error(error)
        }
    }, [])
    useEffect(() => {
        getPermissions(qPermission)
    }, [qPermission, getPermissions])

    const getRoles = useCallback(async (_qRole) => {
        try {
            const { data: _roles } = await RoleAPI.index(_qRole)
            setRoles(_roles.data)
        } catch (error) {
            console.error(error)
        }
    }, [])
    useEffect(() => {
        getRoles(qRole)
    }, [qRole, getRoles])

    const getMenus = useCallback(async (_qMenu) => {
        try {
            const { data: _menus } = await MenuAPI.menus(_qMenu)
            setMenus(_menus.data)
        } catch (error) {
            console.error(error)
        }
    }, [])
    useEffect(() => {
        getMenus(qMenu)
    }, [qMenu, getMenus])

    const formik = useFormik({
        initialValues: {
            menu: null,
            role: null,
            permission: null
        },
        enableReinitialize: true,
        onSubmit: handleSubmit,
        validate: () => { },
    });

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent="Administration" url={Pages.HABILITATION} _child={id} />

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
                                                Mettre à jour l'Authorisation
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

                                {record ? (
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
                                                        setqPermission(newInputValue)
                                                        setqMenu(newInputValue)
                                                    }}
                                                    value={menu}
                                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                                    getOptionLabel={(val: IMenu) => `${val.label || ''}`}
                                                    options={menus || []}
                                                    onChange={(_, item) => setMenu(item)}
                                                    renderInput={params => (
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
                                                <Autocomplete
                                                    disablePortal
                                                    id="role"
                                                    onInputChange={(_, newInputValue) => {
                                                        setqRole(newInputValue)
                                                        setqMenu(newInputValue)
                                                    }}
                                                    value={role}
                                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                                    getOptionLabel={(val: IRole) => `${val.label || ''}`}
                                                    options={roles || []}
                                                    onChange={(_, item) => setRole(item)}
                                                    renderInput={params => (
                                                        <TextField
                                                            {...params}
                                                            error={!role}
                                                            placeholder="Sélectionner un rôle"
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } }
                                                            }}
                                                        />
                                                    )}
                                                />
                                                {!role && (
                                                    <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, mt: 0.5, display: 'block' }}>
                                                        Le rôle est requis.
                                                    </Typography>
                                                )}
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Lock sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                    <Typography sx={{ fontWeight: 700, color: '#475569' }}>Permission <span style={{ color: '#ef4444' }}>*</span></Typography>
                                                </Box>
                                                <Autocomplete
                                                    disablePortal
                                                    id="permission"
                                                    onInputChange={(_, newInputValue) => {
                                                        setqPermission(newInputValue)
                                                        setqMenu(newInputValue)
                                                    }}
                                                    value={permission}
                                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                                    getOptionLabel={(val: IPermission) => `${val.label || ''}`}
                                                    options={permissions || []}
                                                    onChange={(_, item) => setPermission(item)}
                                                    renderInput={params => (
                                                        <TextField
                                                            {...params}
                                                            error={!permission}
                                                            placeholder="Sélectionner une permission"
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 600, '& fieldset': { borderColor: '#e2e8f0' } }
                                                            }}
                                                        />
                                                    )}
                                                />
                                                {!permission && (
                                                    <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, mt: 0.5, display: 'block' }}>
                                                        La permission est requise.
                                                    </Typography>
                                                )}
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                                            <Button
                                                variant="contained"
                                                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                                onClick={() => handleSubmit()}
                                                disabled={isLoading || !menu || !role || !permission}
                                                sx={{
                                                    borderRadius: '15px',
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                                    }
                                                }}
                                            >
                                                Mettre à jour
                                            </Button>
                                        </Box>
                                    </form>
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    )
}

export default UpdateAuthorization;
