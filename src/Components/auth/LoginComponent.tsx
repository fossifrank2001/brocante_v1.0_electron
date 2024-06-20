import { useState } from 'react';
import { useFormik } from 'formik';
import { useAppContext } from "@/contexts/appContext";
import {ILoginPayload } from 'Data/Interfaces';
import { Pages} from 'Data/Objects/state';
import { Link } from '@mui/material';
import logo from "@/assets/images/logos/dark-logo.svg";
import { setActivePage } from 'Data/Slices/NavigationSlice';
import { useAppDispatch } from '@/hooks';
import { motion } from 'framer-motion';
interface FormValues {
    login: string;
    password: string;
}

const LoginComponent: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    const initialValues: FormValues = {
        login: '',
        password: ''
    };
    const context = useAppContext();

    const handleSubmit = async (values: ILoginPayload) => {
        setIsLoading(true);
        try {
            const { loginAsync } = await import('Data/Slices/auth/userSlice');
            await dispatch(loginAsync(values));
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            let errors: Partial<FormValues> = {};
            if (!values.login) {
                errors.login = 'Login field is required.';
            } else if (!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.login) || /^6[0-9]{8}$/i.test(values.login))) {
                errors.login = 'Wrong email address or phone number.';
            }
            if (!values.password) {
                errors.password = 'Password field is required.';
            }
            return errors;
        },
    });

    return (
        <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
            data-sidebar-position="fixed" data-header-position="fixed">
            <div className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center">
                <div className="d-flex align-items-center justify-content-center w-100">
                    <div className="row justify-content-center w-100">
                        <div className="col-md-8 col-lg-6 col-xxl-3">
                            <div className="card mb-0" style={{
                                border: "2px solid lightgray",
                                borderRadius: "20PX"
                            }}>
                                <div className="card-body">
                                    <Link href="#" className="text-nowrap logo-img text-center d-block py-3 w-100">
                                        <img src={logo} width="180" alt="" />
                                    </Link>
                                    <form onSubmit={formik.handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="login" className="form-label">Login <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="login"
                                                    name='login'
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.login}
                                                    style={{ ...formik.errors.login && { borderColor: "var(--bs-danger)" } }}
                                                />
                                            </div>
                                            {formik.errors.login &&
                                                <div className='text fs-10 text-danger d-flex align-items-center'>
                                                    <i className='ti ti-alert-circle me-2'></i>
                                                    <span>{formik.errors.login}</span>
                                                </div>
                                            }
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="password" className="form-label">Password <span className="text-danger">*</span></label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                name='password'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.password}
                                                style={{ ...formik.errors.password && { borderColor: "var(--bs-danger)" } }}
                                            />
                                            {formik.errors.password &&
                                                <div className='text fs-10 text-danger d-flex align-items-center'>
                                                    <i className='ti ti-alert-circle me-2'></i>
                                                    <span>{formik.errors.password}</span>
                                                </div>
                                            }
                                        </div>
                                        <div className="d-flex align-items-center justify-content-end mb-4">
                                            <Link className="text-primary fw-bold" href="#" onClick={() => {
                                                context.togglePageLoading(true);
                                                dispatch(setActivePage({page: Pages.FORGOT_PAGE}));
                                            }}>Forgot Password ?</Link>
                                        </div>
                                        {!isLoading ?
                                            <motion.button
                                                type='submit'
                                                className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2"
                                                whileTap={{scale: 0.9}}  // Add the click animation effect
                                            >
                                                Sign In
                                            </motion.button>
                                            :
                                            <button className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2"
                                                    type="button" disabled>
                                            <span className="spinner-grow spinner-grow-sm ms-4" role="status"
                                                  aria-hidden="true"></span>
                                                Sign In...
                                            </button>
                                        }
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;