import Breadcrumd from '@/Components/Breadcrumd';
import UserAPI from '@/Data/Api/Users';
import { IRole, IUser } from '@/Data/Interfaces';
import { useAppDispatch } from '@/hooks';
import { Autocomplete,TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react'
import { useAppContext } from '@/contexts/appContext';
import { useFormik } from 'formik';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import AccessAPI from '@/Data/Api/Access';
import RoleAPI from '@/Data/Api/Role';
import Constants from '@/Data/Utilities/constants';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { addAccessToAuthUser } from '@/Data/Slices/auth/userSlice';


interface FormValues {
    role_id: number | string;
    status: string;
    code: string;
  }

const NewAccess = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch()
    const [qUser, setqUser] = useState('');
    const [users, setUsers] = useState<IUser[] | null>(null);
    const [user, setUser] = useState<IUser | null>(null);

    const [qRole, _] = useState('');
    const [roles, setRoles] = useState<IRole[] | null>(null);

    const [isAdminCode, setIsAdminCode] = useState<string | null>(null)


    const initialValues: FormValues = {
        role_id: '',
        status: '',
        code: ''
    };
    const context = useAppContext();

    const handleSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const datas = {
                ...values,
                user_id: user.id
            }
            const {data} = await AccessAPI.create(datas);
            context.togglePageLoading(true)
            
            console.log(data)
            if(UtilMethods.isAuth(user.id)){
                dispatch(addAccessToAuthUser(data))
            }
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
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            let errors: Partial<FormValues> = {};

            if (!values.role_id) {
                errors.role_id = 'Role field is required.';
            }
            
            if (!values.status) {
                errors.status = 'Status field is required.';
            }
            
            if (!values.code) {
                errors.code = 'Code field is required.';
            }else if (!/^[A-Z0-9_@./*]{5,}$/.test(values.code)) {
                errors.code = 'Invalid code.';
            }


            return errors;
        },
    });

  return (
    <div className="container">
        <Breadcrumd parent="Access"/>
        <div className='card'>
            <div className='card-header'>
                <button className='btn d-flex align-items-center btn-outline-dark' onClick={() => {
                    dispatch(setActivePage({page: Pages.ACCESS}))
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
                                    <Autocomplete
                                        disablePortal
                                        id="user"
                                        onInputChange={(_, newInputValue) => {
                                            setqUser(newInputValue)
                                        }}
                                        value={user}
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
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label htmlFor="role_id" className="form-label">Role <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <select
                                            className="form-select"
                                            id="role_id"
                                            name='role_id'
                                            onChange={(e) => {
                                                formik.handleChange(e)
                                                const role = roles.find(role => role.id === parseInt(e.target.value))

                                                if(role !== undefined){
                                                    if(role.code === Constants.ROLES.ADMIN){
                                                        formik.setFieldValue('code', 'ADMINS')
                                                    }else{
                                                        formik.setFieldValue('code', '')
                                                    }
                                                    setIsAdminCode(role.code)
                                                }else{
                                                    setIsAdminCode('')
                                                }
                                            }}
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
                                {(isAdminCode !== Constants.ROLES.ADMIN) && <div className="col-6 mb-3">
                                    <label htmlFor="code" className="form-label">Code <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="code"
                                            name='code'
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
                                </div>}
                            </div>
                            {!isLoading ? <button type='submit' className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2">ADD ACCESS</button> :
                                <button className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2" type="button" disabled>
                                    <span className="spinner-grow spinner-grow-sm ms-4" role="status" aria-hidden="true"></span>
                                    ADD ACCESS...
                                </button>
                            }
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

  )
}

export default NewAccess