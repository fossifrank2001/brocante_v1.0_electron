import { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
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
import '@/styles/forms.scss';

interface FormValues {
    role_id: number | string;
    status: string;
    code: string;
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
        } catch (error) {
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
        } catch (e) {
            console.log(e.message);
        }
    }, []);

    useEffect(() => {
        (async () => await getUsers(qUser))();
    }, [qUser, getUsers]);

    const getRoles = useCallback(async (_qRole: string) => {
        try {
            const { data: _roles }: IApiResponsePaginated<IRole> = await RoleAPI.index(_qRole);
            setRoles(_roles.data);
        } catch (e) {
            console.log(e.message);
        }
    }, []);

    useEffect(() => {
        (async () => await getRoles(qRole))();
    }, [qRole, getRoles]);

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};

            if (!values.role_id) {
                errors.role_id = 'Role field is required.';
            }

            if (!values.status) {
                errors.status = 'Status field is required.';
            }

            if (!values.code) {
                errors.code = 'Code field is required.';
            } else if (!/^[A-Z0-9_@./*]{5,}$/.test(values.code)) {
                errors.code = 'Invalid code.';
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
            <Breadcrumd parent="Access" />
            <div className='form-card'>
                <div className='card-title'>
                    <button 
                        className='btn btn-secondary'
                        onClick={() => dispatch(setActivePage({ page: Pages.ACCESS }))}
                    >
                        <i className='ti ti-arrow-left'></i>
                        Back
                    </button>
                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="user">
                                    <i className="ti ti-user"></i>
                                    User
                                    <span className="required-star">*</span>
                                </label>
                                <Tooltip title="Select a user" arrow placement="top">
                                    <div>
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
                                                    error={!user}
                                                    size="small"
                                                    className="form-control"
                                                    placeholder="Search user..."
                                                />
                                            )}
                                        />
                                        {!user && (
                                            <div className="error-feedback">
                                                <i className="ti ti-alert-circle"></i>
                                                <span>User field is required.</span>
                                            </div>
                                        )}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="role_id">
                                    <i className="ti ti-shield"></i>
                                    Role
                                    <span className="required-star">*</span>
                                </label>
                                <Tooltip title="Select a role" arrow placement="top">
                                    <select
                                        className="form-select"
                                        id="role_id"
                                        name="role_id"
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            const role = roles?.find(role => role.id === parseInt(e.target.value));
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
                                        value={formik.values.role_id}
                                    >
                                        <option value="">Select Role</option>
                                        {roles?.map(role => (
                                            <option key={role.id} value={role.id}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </Tooltip>
                                {formik.touched.role_id && formik.errors.role_id && (
                                    <div className="error-feedback">
                                        <i className="ti ti-alert-circle"></i>
                                        <span>{formik.errors.role_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="status">
                                    <i className="ti ti-toggle-right"></i>
                                    Status
                                    <span className="required-star">*</span>
                                </label>
                                <Tooltip title="Select access status" arrow placement="top">
                                    <select
                                        className="form-select"
                                        id="status"
                                        name="status"
                                        onChange={formik.handleChange}
                                        value={formik.values.status}
                                    >
                                        <option value="">Select status</option>
                                        <option value={Constants.STATUS_ACCESS.ACTIVE}>Active</option>
                                        <option value={Constants.STATUS_ACCESS.INACTIVE}>Inactive</option>
                                    </select>
                                </Tooltip>
                                {formik.touched.status && formik.errors.status && (
                                    <div className="error-feedback">
                                        <i className="ti ti-alert-circle"></i>
                                        <span>{formik.errors.status}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isAdminCode !== Constants.ROLES.ADMIN && (
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="code">
                                        <i className="ti ti-code"></i>
                                        Code
                                        <span className="required-star">*</span>
                                    </label>
                                    <Tooltip title="Enter access code (uppercase letters, numbers and special characters only)" arrow placement="top">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="code"
                                            name="code"
                                            placeholder="Enter access code"
                                            onChange={formik.handleChange}
                                            value={formik.values.code}
                                        />
                                    </Tooltip>
                                    {formik.touched.code && formik.errors.code && (
                                        <div className="error-feedback">
                                            <i className="ti ti-alert-circle"></i>
                                            <span>{formik.errors.code}</span>
                                        </div>
                                    )}
                                    <div className="help-text">
                                        <i className="ti ti-info-circle"></i>
                                        Code must be at least 5 characters long and contain only uppercase letters, numbers, and special characters (_@./*)
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !user}
                        >
                            <i className="ti ti-device-floppy"></i>
                            {isLoading ? 'Saving...' : 'Save Access'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => dispatch(setActivePage({ page: Pages.ACCESS }))}
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

export default NewAccess;