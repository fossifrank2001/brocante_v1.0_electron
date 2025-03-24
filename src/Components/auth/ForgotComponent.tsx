import {useState} from 'react'
import {useFormik} from "formik";
import {useAppContext} from "../../contexts/appContext";
import { Link } from '@mui/material';
import { IForgotPayload } from '@/Data/Interfaces';
import { Pages } from '@/Data/Objects/state';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { motion } from 'framer-motion';
import "Styles/auth.less"
import Logo from '@/Components/common/Logo';

interface FormValues {
    username: string;
}

export default function ForgotComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const {reset_token, username: _username} = useAppSelector(state => state.forgot);
    const dispatch = useAppDispatch();
    const initialValues: FormValues = { username: '' };
    const context = useAppContext();

    const attemptForgot = async (payload: IForgotPayload) => {
        const { forgotAsync } = await import('Data/Slices/auth/forgotSlice');
        return dispatch(forgotAsync(payload));
    }

    const handleSubmit = async (values: IForgotPayload) => {
        try {
            context.togglePageLoading(true);
            setIsLoading(true);
            const result = await attemptForgot(values);
                console.log("Result ::: ", result)
            if (reset_token !== "") {
                console.log(values.username)
                context.updateUsername(_username);
                dispatch(setActivePage({ page: Pages.RESET_PAGE }));
            }
        } catch (e) {
            console.error('Error during password reset request:', e);
        } finally {
            setIsLoading(false);
            context.togglePageLoading(false);
        }
    }

    const handleBackToLogin = () => {
        context.togglePageLoading(true);
        dispatch(setActivePage({ page: Pages.LOGIN }));
        setTimeout(() => {
            context.togglePageLoading(false);
        }, 500);
    };

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};
            if (!values.username) {
                errors.username = 'Login field is required.';
            } else if (!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.username) || /^6[0-9]{8}$/i.test(values.username))) {
                errors.username = 'Wrong email address or phone number.';
            }
            return errors;
        }
    });

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <motion.div 
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-header" onClick={() => {
                        context.togglePageLoading(true);
                        dispatch(setActivePage({ page: Pages.HOME }));
                        setTimeout(() => {
                            context.togglePageLoading(false);
                        }, 500);
                    }}>
                        <Logo
                            showVersion={true}
                            animate={true}
                            imageSize={40}
                            fontSize="2rem"
                        />
                    </div>

                    <div className="auth-content">
                        <motion.div 
                            className="auth-title"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h4>Password Reset</h4>
                            <p>Enter your email to receive reset instructions</p>
                        </motion.div>

                        <form onSubmit={formik.handleSubmit} className="auth-form">
                            <motion.div 
                                className="form-group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label htmlFor="username">Email or Phone <span className="required">*</span></label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="ti ti-mail"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className={`form-control ${formik.errors.username && formik.touched.username ? 'is-invalid' : ''}`}
                                        id="username"
                                        name="username"
                                        placeholder="Enter your email or phone"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.username}
                                        disabled={isLoading}
                                    />
                                </div>
                                {formik.errors.username && formik.touched.username && (
                                    <motion.div 
                                        className="error-message"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <i className="ti ti-alert-circle"></i>
                                        <span>{formik.errors.username}</span>
                                    </motion.div>
                                )}
                            </motion.div>

                            <motion.div 
                                className="form-actions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <motion.button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isLoading || !formik.isValid || !formik.dirty}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-grow spinner-grow-sm"></span>
                                            <span>Sending Instructions...</span>
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </motion.button>

                                <motion.div 
                                    className="back-to-login py-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link
                                        component="button"
                                        onClick={handleBackToLogin}
                                        className="btn-link"
                                        disabled={isLoading}
                                    >
                                        <i className="ti ti-arrow-left"></i>
                                        <span>Back to Login</span>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
