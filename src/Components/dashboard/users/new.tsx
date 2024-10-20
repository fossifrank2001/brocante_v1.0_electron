import Breadcrumd from '@/Components/Breadcrumd';
import { useAppDispatch } from '@/hooks';
import {useState } from 'react'
import { useAppContext } from '@/contexts/appContext';
import { useFormik } from 'formik';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { IUsersPayload } from '@/Data/Interfaces/Users';
import UserAPI from "Data/Api/Users";
import { IUser } from 'Interfaces';


interface FormValues extends Partial<IUser>{
    last_name: string;
    first_name: string;
    email: string;
    phone: string;
    gender: string;
}

const NewUser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch()

    const initialValues: FormValues = {
        last_name: '',
        first_name: '',
        email: '',
        phone: '',
        gender: ''
    };
    const context = useAppContext();

    const handleSubmit = async (values: IUsersPayload) => {
        setIsLoading(true);
        try {
            await UserAPI.create(values);
            context.togglePageLoading(true)
            dispatch(setActivePage({page: Pages.ACCOUNT}))
        } catch (e) {
            console.error(e.message)
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};
            if (!values.last_name) {
                errors.last_name = 'Last name field is required.';
            }

            if (!values.phone) {
                errors.phone = 'Phone field is required.';
            }else if (!/^6[0-9]{8}$/i.test(values.phone)) {
                errors.phone = 'Wrong phone number address';
            }

            if (values.email && !(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.email))) {
                errors.email = 'Wrong email address';
            }
            
            if (!values.gender) {
                errors.gender = 'Gender field is required.';
            }


            return errors;
        },
    });

  return (
    <div className="container">
        <Breadcrumd parent="Users"/>
        <div className='card'>
            <div className='card-header'>
                <button className='btn d-flex align-items-center btn-outline-dark' onClick={() => {
                    dispatch(setActivePage({page: Pages.ACCOUNT}))
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
                                    <label htmlFor="last_name" className="form-label">Last name <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="last_name"
                                            name='last_name'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.last_name}
                                            style={{ ...formik.errors.last_name && { borderColor: "var(--bs-danger)" } }}
                                        />
                                    </div>
                                    {formik.errors.last_name &&
                                        <div className='text fs-10 text-danger d-flex align-items-center'>
                                            <i className='ti ti-alert-circle me-2'></i>
                                            <span>{formik.errors.last_name}</span>
                                        </div>
                                    }
                                </div>
                                <div className="col-6 mb-3">
                                    <label htmlFor="first_name" className="form-label">First name</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="first_name"
                                            name='first_name'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.first_name}
                                        />
                                    </div>
                                </div>
                                <div className="col-6 mb-3">
                                    <label htmlFor="email" className="form-label">EmaiL</label>
                                    <div className="input-group">
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name='email'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.email}
                                            style={{ ...formik.errors.email && { borderColor: "var(--bs-danger)" } }}
                                        />
                                    </div>
                                    {formik.errors.email &&
                                        <div className='text fs-10 text-danger d-flex align-items-center'>
                                            <i className='ti ti-alert-circle me-2'></i>
                                            <span>{formik.errors.email}</span>
                                        </div>
                                    }
                                </div>
                                <div className="col-6 mb-3 ">
                                    <div className="row justify-content-between align-items-start">
                                        <div className="col-6">
                                            <label htmlFor="phone" className="form-label">Phone <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="phone"
                                                    name='phone'
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.phone}
                                                    style={{ ...formik.errors.phone && { borderColor: "var(--bs-danger)" } }}
                                                />
                                            </div>
                                            {formik.errors.phone &&
                                                <div className='text fs-10 text-danger d-flex align-items-center'>
                                                    <i className='ti ti-alert-circle me-2'></i>
                                                    <span>{formik.errors.phone}</span>
                                                </div>
                                            }
                                        </div>
                                        <div className="col-6">
                                            <label htmlFor="gender" className="form-label">Gender <span className="text-danger">*</span></label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-select"
                                                        id="gender"
                                                        name='gender'
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.gender}
                                                        style={{ ...formik.errors.gender && { borderColor: "var(--bs-danger)" } }}
                                                    >
                                                        <option value="" label="Select gender" />
                                                        <option value="male" label="Male" />
                                                        <option value="female" label="Female" />
                                                    </select>
                                                </div>
                                                {formik.errors.gender &&
                                                    <div className='text fs-10 text-danger d-flex align-items-center'>
                                                        <i className='ti ti-alert-circle me-2'></i>
                                                        <span>{formik.errors.gender}</span>
                                                    </div>
                                                }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!isLoading ? <button type='submit' className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2">ADD USER</button> :
                                <button className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2" type="button" disabled>
                                    <span className="spinner-grow spinner-grow-sm ms-4" role="status" aria-hidden="true"></span>
                                    ADD USER...
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

export default NewUser