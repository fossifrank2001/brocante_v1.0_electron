import Breadcrumd from '@/Components/Breadcrumd';
import { IMenu, IRole } from '@/Data/Interfaces';
import { useAppDispatch } from '@/hooks';
import { Autocomplete, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react'
import { useAppContext } from '@/contexts/appContext';
import { useFormik } from 'formik';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import RoleAPI from '@/Data/Api/Role';
import { IPermission } from '@/Data/Interfaces/Permission';
import AuthorizationAPI from '@/Data/Api/Authorizations';
import MenuAPI from '@/Data/Api/Menu';
import Multiselect from "multiselect-react-dropdown"
import Toast from '@/Data/Utilities/Toast';


interface FormValues{
    role: number | string;
  }

const NewAuthorization = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch()

    const [qPermission, setqPermission] = useState('');
    const [_permissions, set_Permissions] = useState<IPermission[] | null>(null);
    const [permissions, setPermissions] = useState<IPermission[] | null>(null);

    const [qRole] = useState('');
    const [roles, setRoles] = useState<IRole[] | null>(null);

    const [qMenu, setqMenu] = useState('');
    const [menus, setMenus] = useState<IMenu[] | null>(null);
    const [menu, setMenu] = useState<IMenu | null>(null);


    const initialValues: FormValues = {
        role: '',
    };
    const context = useAppContext();

    const handleSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const datas = {
                ...values,
                menu: menu.id,
                permissions: _permissions.map(__perm => __perm.id)
            }
            const {message} = await AuthorizationAPI.create(datas);
            Toast.success(message)
            context.togglePageLoading(true)
            dispatch(setActivePage({page: Pages.HABILITATION}))
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    };

    const getPermissions = useCallback(async (_qPerm) => {
        try {
            setPermissions([])
            const {data: permissions_} = await AuthorizationAPI.permissions(_qPerm)
            setPermissions(permissions_.data)
        } catch (error) {
            console.error(error)
        }
    }, [])

    useEffect(() => {
        getPermissions(qPermission)
    }, [qPermission, getPermissions])
    
    //--------------------------------------------
    const getRoles = useCallback(async (_qRole) => {
        try {
            const {data: _roles} = await RoleAPI.index(_qRole)
            setRoles(_roles.data)
        } catch (error) {
            console.error(error)
        }
    }, [])
    
    useEffect(() => {
        getRoles(qRole)
    }, [qRole, getRoles])
    
    //--------------------------------------------
    const getMenus = useCallback(async (_qMenu) => {
        try {
            const {data: _menus} = await MenuAPI.menus(_qMenu)
            setMenus(_menus.data)
        } catch (error) {
            console.error(error)
        }
    }, [])
    useEffect(() => {
        getMenus(qMenu)
    }, [qMenu, getMenus])

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
    <div className="container">
        <Breadcrumd parent="Authorizations"/>
        <div className='card'>
            <div className='card-header'>
                <button className='btn d-flex align-items-center btn-outline-dark' onClick={() => {
                    dispatch(setActivePage({page: Pages.HABILITATION}))
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
                                    <label htmlFor="menu" className="form-label">Menu <span className="text-danger">*</span></label>            
                                    {menus? <Autocomplete
                                        disablePortal
                                        id="menu"
                                        onInputChange={(_, newInputValue) => {
                                            setqPermission(newInputValue)
                                            setqMenu(newInputValue)
                                        }}
                                        value={menu}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        getOptionLabel={(val :IMenu) => `${val.label || ''}`}
                                        options={menus ?? []}
                                        onChange={(_, item) => {
                                            setMenu(item)
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
                                                        error={!menu}
                                                    />
                                                </div>
                                                {!menu &&
                                                    <div className='text fs-10 text-danger d-flex align-items-center'>
                                                        <i className='ti ti-alert-circle me-2'></i>
                                                        <span>Menu field is required.</span>
                                                    </div>
                                                }
                                            </>
                                        )}
                                    />:
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="last_name"
                                            name='last_name'
                                            disabled
                                        />
                                    </div>

                                }
                                </div>
                                <div className="col-6 mb-3">
                                    <label htmlFor="role" className="form-label">Role <span className="text-danger">*</span></label>
                                    {roles? <>
                                        <div className="input-group">
                                            <select
                                                className="form-select"
                                                id="role"
                                                name='role'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.role}
                                                style={{ ...formik.errors.role && { borderColor: "var(--bs-danger)" } }}
                                            >
                                                <option value="" label="Select Role" />
                                                {roles?.map(role => <option key={role.id} value={role.id} label={role.label} />)}
                                            </select>
                                        </div>
                                        {formik.errors.role &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.role}</span>
                                            </div>
                                        }
                                    </>
                                    :
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="last_name"
                                            name='last_name'
                                            disabled
                                        />
                                    </div>}
                                </div>
                                
                                <div className="col-6 mb-3">    
                                    <label htmlFor="permissions" className="form-label">Permissions <span className="text-danger">*</span></label>    
                                    {permissions?
                                        <>
                                            <Multiselect
                                                options={permissions}
                                                selectedValues={_permissions}
                                                onSelect={(e) => set_Permissions(e)}
                                                onRemove={(e) => set_Permissions(e)}
                                                displayValue="label"
                                                style={{
                                                    heigh: '36.8px', 
                                                    borderRadius:'4px!important',
                                                    "& .search-wrapper.searchWrapper": {
                                                        borderRadius: '6px',
                                                        height: '38.6PX',
                                                        paddingLeft: '12px'
                                                    }
                                                }}      
                                                showCheckbox
                                                placeholder="Select permissions"
                                            />
                                            {_permissions?.length <=0 &&
                                                <div className='text fs-10 text-danger d-flex align-items-center'>
                                                    <i className='ti ti-alert-circle me-2'></i>
                                                    <span>Select at least one permissions.</span>
                                                </div>
                                            }
                                        </>
                                        :
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="last_name"
                                                name='last_name'
                                                disabled
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                            {!isLoading ? <button type='submit' className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2">ADD AUTHORIZATION</button> :
                                <button className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2" type="button" disabled>
                                    <span className="spinner-grow spinner-grow-sm ms-4" role="status" aria-hidden="true"></span>
                                    ADD AUTHORIZATION...
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

export default NewAuthorization