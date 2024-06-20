import Breadcrumd from '@/Components/Breadcrumd';
import UserAPI from '@/Data/Api/Users';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { useAppContext } from '@/contexts/appContext';
import Constants from '@/Data/Utilities/constants';
import { Autocomplete, TextField } from '@mui/material';
import { IAccess, IRole, IUser } from '@/Data/Interfaces';
import AccessAPI from '@/Data/Api/Access';
import RoleAPI from '@/Data/Api/Role';

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

    const [qRole, _] = useState('');
    const [roles, setRoles] = useState<IRole[] | null>(null);
    const dispatch = useAppDispatch();
    const context = useAppContext()

    useEffect(() => {
        const fetchAccess = async () => {
            try {
                setIsSest(true)
                const {data: response} = await AccessAPI.show(id);
                setInitialValues({
                    role_id: response.role_id,
                    status: response.status,
                    code: response.code,
                });
                setUser(response.user)
                setAccess(response)
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setIsSest(false)
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
                user_id: user.id
            }
            await AccessAPI.update(id, datas);
            context.togglePageLoading(true)
            dispatch(setActivePage({page: Pages.ACCESS}))
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const getUsers = useCallback(async (_qUser) => {
        try {
            const {data: _users} = await UserAPI.index(_qUser)
            setUsers(_users.data)
        } catch (error) {
            
        }
    }, [qUser])
    useEffect(() => {
        getUsers(qUser)
    }, [qUser, getUsers])
    
    const getRoles = useCallback(async (_qRole) => {
        try {
            const {data: _roles} = await RoleAPI.index(_qRole)
            setRoles(_roles.data)
        } catch (error) {
            
        }
    }, [qRole])
    useEffect(() => {
        getRoles(qRole)
    }, [qRole, getRoles])

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            let errors: Partial<FormValues> = {};

            if (!values.role_id) {
                errors.role_id = 'Role field is required.';
            }
            
            if (!values.status) {
                errors.status = 'Status field is required.';
            }


            return errors;
        },
    });

    return (
        <div className="container">
            <Breadcrumd parent="Accesses" url={currentPage} _child={id} />
            <div className='card'>
                <div className='card-header'>
                    <button className='btn d-flex align-items-center btn-outline-dark' onClick={() => {
                        dispatch(setActivePage({ page: Pages.ACCESS }));
                    }}>
                        <i className='ti ti-arrow-left'></i>
                        <span className='ms-1'>BACK</span>
                    </button>
                </div>
                <div className='card-body'>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="row">
                            <div className="col-10 mx-auto">
                                <div className="row gap-10">
                                    <div className="col-6 mb-3">
                                        <label htmlFor="role_id" className="form-label">User <span className="text-danger">*</span></label>            
                                        {!isSest && <Autocomplete
                                            disablePortal
                                            id="user"
                                            onInputChange={(_, newInputValue) => {
                                                setqUser(newInputValue)
                                            }}
                                            defaultValue={users?.find(user => user.id === access.user_id)}
                                            value={user ?? users?.find(user => user.id === access.user_id)}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            getOptionLabel={(val :IUser) => `${val.last_name || ''} ${val.first_name || ''}`}
                                            options={users ?? []}
                                            onChange={(_, item) => {
                                                setUser(item)
                                            }}
                                            renderInput={params => (
                                                <>
                                                    <div className="input-group">
                                                        <TextField
                                                            {...params}
                                                            type="text"
                                                            className="form-select"
                                                            id="user"
                                                            name='user'
                                                            size='small'
                                                            style={{
                                                                borderRadius: '8px!important', 
                                                            }}
                                                            error={!!!user}
                                                        />
                                                    </div>
                                                    {!user &&
                                                        <div className='text fs-10 text-danger d-flex align-items-center'>
                                                            <i className='ti ti-alert-circle me-2'></i>
                                                            <span>User field is required.</span>
                                                        </div>
                                                    }
                                                </>
                                            )}
                                        />}
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label htmlFor="role_id" className="form-label">Role <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <select
                                                className="form-select"
                                                id="role_id"
                                                name='role_id'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.role_id}
                                                style={{ ...formik.errors.role_id && { borderColor: "var(--bs-danger)" } }}
                                            >
                                                <option value="" label="Select Role" />
                                                {roles?.map(role => <option key={role.id} value={role.id} label={role.label} />)}
                                            </select>
                                        </div>
                                        {formik.errors.role_id &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.role_id}</span>
                                            </div>
                                        }
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label htmlFor="status" className="form-label">Status <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <select
                                                className="form-select"
                                                id="status"
                                                name='status'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.status}
                                                style={{ ...formik.errors.status && { borderColor: "var(--bs-danger)" } }}
                                            >
                                                <option value="" label="Select status" />
                                                <option value={Constants.STATUS_ACCESS.ACTIVE} label="Active" />
                                                <option value={Constants.STATUS_ACCESS.INACTIVE} label="Inactive" />
                                            </select>
                                        </div>
                                        {formik.errors.status &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.status}</span>
                                            </div>
                                        }
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label htmlFor="code" className="form-label">Code <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="code"
                                                name='code'
                                                disabled={true}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.code}
                                                style={{ ...formik.errors.code && { borderColor: "var(--bs-danger)" } }}
                                            />
                                        </div>
                                        {formik.errors.code &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.code}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                                {!isLoading ? (
                                    <button type='submit' className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2">UPDATE ACCESS</button>
                                ) : (
                                    <button className="btn btn-primary py-8 ms-auto fs-4 mb-4 rounded-2" type="button" disabled>
                                        <span className="spinner-grow spinner-grow-sm ms-4" role="status" aria-hidden="true"></span>
                                        UPDATE ACCESS...
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UpdateAccess;
