import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAppContext } from "@/contexts/appContext";
import { ILoginPayload } from 'Data/Interfaces';
import { Pages } from 'Data/Objects/state';
import { Link, FormControlLabel, Checkbox } from '@mui/material';
import { setActivePage } from 'Data/Slices/NavigationSlice';
import { useAppDispatch } from '@/hooks';
import { motion } from 'framer-motion';
import "Styles/auth.less"
import Logo from '@/Components/common/Logo';

interface FormValues {
    login: string;
    password: string;
    rememberMe?: boolean;
}

export default function LoginComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useAppDispatch();

    const initialValues: FormValues = {
        login: localStorage.getItem('rememberedLogin') || '',
        password: localStorage.getItem('rememberedPassword') || '',
        rememberMe: localStorage.getItem('rememberMe') === 'true'
    };

    const context = useAppContext();

    const handleSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (values.rememberMe) {
                localStorage.setItem('rememberedLogin', values.login);
                localStorage.setItem('rememberedPassword', values.password);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberedLogin');
                localStorage.removeItem('rememberedPassword');
                localStorage.removeItem('rememberMe');
            }

            const { loginAsync } = await import('Data/Slices/auth/userSlice');
            await dispatch(loginAsync({
                login: values.login,
                password: values.password
            }));
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-wrapper">
            <motion.div 
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-card">
                    <div className="auth-header" onClick={() => {
                        context.togglePageLoading(true)
                        dispatch(setActivePage({page: Pages.HOME}))
                    }}>
                        <Logo 
                            showVersion={true}
                            animate={true}
                            imageSize={40}
                            fontSize="2rem"
                        />
                    </div>
                    
                    <form onSubmit={formik.handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="login" className="form-label">
                                Login <span className="required">*</span>
                            </label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className={`form-control ${formik.touched.login && formik.errors.login ? 'is-invalid' : ''}`}
                                    id="login"
                                    name="login"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.login}
                                    disabled={isLoading}
                                    placeholder="Enter your email or phone"
                                />
                                <div className="input-icon">
                                    <i className="ti ti-mail"></i>
                                </div>
                            </div>
                            {formik.touched.login && formik.errors.login && (
                                <div className="error-message">
                                    <i className="ti ti-alert-circle"></i>
                                    <span>{formik.errors.login}</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password <span className="required">*</span>
                            </label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                    id="password"
                                    name="password"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.password}
                                    disabled={isLoading}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="btn btn-link password-toggle"
                                    onClick={togglePasswordVisibility}
                                >
                                    <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <div className="error-message">
                                    <i className="ti ti-alert-circle"></i>
                                    <span>{formik.errors.password}</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="d-flex justify-content-between align-items-center">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="rememberMe"
                                            checked={formik.values.rememberMe}
                                            onChange={formik.handleChange}
                                            color="primary"
                                        />
                                    }
                                    label="Remember me"
                                />
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => {
                                        context.togglePageLoading(true)
                                        dispatch(setActivePage({page: Pages.FORGOT_PAGE}))
                                    }}
                                    sx={{ textDecoration: 'none' }}
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <div className="form-group">
                            <motion.button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-grow spinner-grow-sm"></span>
                                            <span>Sending Instructions...</span>
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}