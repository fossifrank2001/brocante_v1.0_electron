import Breadcrumd from '@/Components/Breadcrumd';
import { IMenu, IRole } from '@/Data/Interfaces';
import {useAppDispatch, useAppSelector} from '@/hooks';
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
import Toast from '@/Data/Utilities/Toast';
import {IHabilitation} from "Data/Interfaces/Habilitation.ts";



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

    const  getRecord = useCallback(
        async () => {
            try {
                const {data} = await AuthorizationAPI.show(id)
                console.log(data)
                setRecord(data)
                setMenu(data.menu)
                setRole(data.role)
                setPermission(data.permission)
            }catch (e) {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleSubmit = async (_) => {
        setIsLoading(true);
        try {
            const datas = {
                menu: menu.id,
                role: role.id,
                permission: permission.id,
            }
            const {message} = await AuthorizationAPI.update(id, datas);
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
            const {data: _roles} = await MenuAPI.menus(_qMenu)
            setMenus(_roles.data)
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
        validate: () =>{},
    });

    return (
        <div className="container">
            <Breadcrumd parent="Authorizations" url={currentPage} _child={id} />
            <div className='card'>
                <div className='card-header'>
                    <button className='btn d-flex align-items-center btn-outline-dark' onClick={() => {
                        dispatch(setActivePage({page: Pages.HABILITATION}))
                    }}>
                        <i className='ti ti-arrow-left'></i>
                        <span className='ms-1'>BACK</span>
                    </button>
                </div>
                {record ? <div className='card-body'>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="row">
                            <div className="col-10 mx-auto">
                                <div className="row gap-10">
                                    <div className="col-6 mb-3">
                                        <label htmlFor="menu" className="form-label">Menu <span
                                            className="text-danger">*</span></label>
                                        {menus ? <Autocomplete
                                                disablePortal
                                                id="menu"
                                                onInputChange={(_, newInputValue) => {
                                                    setqPermission(newInputValue)
                                                    setqMenu(newInputValue)
                                                }}
                                                defaultValue={menu}
                                                value={menu ?? menu}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                getOptionLabel={(val: IMenu) => `${val.label || ''}`}
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
                                                                id="menu"
                                                                name='menu'
                                                                size='small'
                                                                style={{
                                                                    borderRadius: '8px!important',
                                                                }}
                                                                error={!menu}
                                                            />
                                                        </div>
                                                        {!menu &&
                                                            <div
                                                                className='text fs-10 text-danger d-flex align-items-center'>
                                                                <i className='ti ti-alert-circle me-2'></i>
                                                                <span>Menu field is required.</span>
                                                            </div>
                                                        }
                                                    </>
                                                )}
                                            /> :
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="menu"
                                                    name='menu'
                                                    disabled
                                                />
                                            </div>

                                        }
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label htmlFor="menu" className="form-label">Role <span
                                            className="text-danger">*</span></label>
                                        {roles ? <>
                                                <Autocomplete
                                                    disablePortal
                                                    id="menu"
                                                    onInputChange={(_, newInputValue) => {
                                                        setqRole(newInputValue)
                                                        setqMenu(newInputValue)
                                                    }}
                                                    defaultValue={role}
                                                    value={role}
                                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                                    getOptionLabel={(val: IRole) => `${val.label || ''}`}
                                                    options={roles ?? []}
                                                    onChange={(_, item) => {
                                                        setRole(item)
                                                    }}
                                                    renderInput={params => (
                                                        <>
                                                            <div className="input-group">
                                                                <TextField
                                                                    {...params}
                                                                    type="text"
                                                                    className="form-select"
                                                                    id="role"
                                                                    name='role'
                                                                    size='small'
                                                                    style={{
                                                                        borderRadius: '8px!important',
                                                                    }}
                                                                    error={!role}
                                                                />
                                                            </div>
                                                            {!role &&
                                                                <div
                                                                    className='text fs-10 text-danger d-flex align-items-center'>
                                                                    <i className='ti ti-alert-circle me-2'></i>
                                                                    <span>Role field is required.</span>
                                                                </div>
                                                            }
                                                        </>
                                                    )}
                                                />
                                            </> :
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="role"
                                                    name='role'
                                                    disabled
                                                />
                                            </div>

                                        }
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label htmlFor="menu" className="form-label">Permission <span
                                            className="text-danger">*</span></label>
                                        {permissions ? <Autocomplete
                                                disablePortal
                                                id="menu"
                                                onInputChange={(_, newInputValue) => {
                                                    setqPermission(newInputValue)
                                                    setqMenu(newInputValue)
                                                }}
                                                defaultValue={permission}
                                                value={permission ?? permission}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                getOptionLabel={(val: IPermission) => `${val.label || ''}`}
                                                options={permissions ?? []}
                                                onChange={(_, item) => {
                                                    setPermission(item)
                                                }}
                                                renderInput={params => (
                                                    <>
                                                        <div className="input-group">
                                                            <TextField
                                                                {...params}
                                                                type="text"
                                                                className="form-select"
                                                                id="permission"
                                                                name='permission'
                                                                size='small'
                                                                style={{
                                                                    borderRadius: '8px!important',
                                                                }}
                                                                error={!permission}
                                                            />
                                                        </div>
                                                        {!permission &&
                                                            <div
                                                                className='text fs-10 text-danger d-flex align-items-center'>
                                                                <i className='ti ti-alert-circle me-2'></i>
                                                                <span>Permission field is required.</span>
                                                            </div>
                                                        }
                                                    </>
                                                )}
                                            /> :
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
                                {!isLoading ? <button type='submit'
                                                      className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2">UPDATE
                                        </button> :
                                    <button className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2" type="button"
                                            disabled>
                                        <span className="spinner-grow spinner-grow-sm ms-4" role="status"
                                              aria-hidden="true"></span>
                                        UPDATE...
                                    </button>
                                }
                            </div>
                        </div>
                    </form>
                </div>
                    :
                    <div>Loading...</div>
                }
            </div>
        </div>

    )
}

export default UpdateAuthorization;
