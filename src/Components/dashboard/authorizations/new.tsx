import { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
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
import '@/styles/forms.scss';

interface FormValues {
    role: number | string;
}

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

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
                errors.role = 'Role field is required.';
            }
            return errors;
        },
    });

    return (
        <motion.div 
            className="container form-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Breadcrumd parent="Authorizations" />
            <div className="form-card">
                <div className="card-title">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => dispatch(setActivePage({ page: Pages.HABILITATION }))}
                    >
                        <i className="ti ti-arrow-left"></i>
                        Back
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="menu">
                                    <i className="ti ti-menu-2"></i>
                                    Menu
                                    <span className="required-star">*</span>
                                </label>
                                <Tooltip title="Select a menu" arrow placement="top">
                                    <div>
                                        {menus ? (
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
                                                options={menus}
                                                onChange={(_, item) => setMenu(item)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        error={!menu}
                                                        size="small"
                                                        className="form-control"
                                                        placeholder="Search menu..."
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control"
                                                disabled
                                                placeholder="Loading menus..."
                                            />
                                        )}
                                        {!menu && (
                                            <div className="error-feedback">
                                                <i className="ti ti-alert-circle"></i>
                                                <span>Menu field is required.</span>
                                            </div>
                                        )}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="role">
                                    <i className="ti ti-shield"></i>
                                    Role
                                    <span className="required-star">*</span>
                                </label>
                                <Tooltip title="Select a role" arrow placement="top">
                                    <div>
                                        {roles ? (
                                            <select
                                                className="form-select"
                                                id="role"
                                                name="role"
                                                onChange={formik.handleChange}
                                                value={formik.values.role}
                                            >
                                                <option value="">Select Role</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control"
                                                disabled
                                                placeholder="Loading roles..."
                                            />
                                        )}
                                        {formik.touched.role && formik.errors.role && (
                                            <div className="error-feedback">
                                                <i className="ti ti-alert-circle"></i>
                                                <span>{formik.errors.role}</span>
                                            </div>
                                        )}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="permissions">
                                    <i className="ti ti-lock"></i>
                                    Permissions
                                    <span className="required-star">*</span>
                                </label>
                                <Tooltip title="Select permissions" arrow placement="top">
                                    <div>
                                        {permissions ? (
                                            <>
                                                <Multiselect
                                                    options={permissions}
                                                    selectedValues={_permissions}
                                                    onSelect={(e) => set_Permissions(e)}
                                                    onRemove={(e) => set_Permissions(e)}
                                                    displayValue="label"
                                                    showCheckbox
                                                    placeholder="Select permissions"
                                                    style={{
                                                        chips: { background: '#4318FF' },
                                                        searchBox: { 
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            padding: '8px'
                                                        }
                                                    }}
                                                />
                                                {(!_permissions || _permissions.length <= 0) && (
                                                    <div className="error-feedback">
                                                        <i className="ti ti-alert-circle"></i>
                                                        <span>Select at least one permission.</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control"
                                                disabled
                                                placeholder="Loading permissions..."
                                            />
                                        )}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !menu || !_permissions || _permissions.length <= 0}
                        >
                            <i className="ti ti-device-floppy"></i>
                            {isLoading ? 'Saving...' : 'Save Authorization'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => dispatch(setActivePage({ page: Pages.HABILITATION }))}
                        >
                            <i className="ti ti-x"></i>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default NewAuthorization;