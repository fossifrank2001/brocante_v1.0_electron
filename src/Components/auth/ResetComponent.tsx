import React, { useState, useRef } from 'react';
import { useFormik } from "formik";
import { useAppContext } from "../../contexts/appContext";
import { IResetPayload } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { motion } from 'framer-motion';
import "Styles/auth.less";
import { setActivePage } from "Data/Slices/NavigationSlice.ts";
import { Pages } from "Data/Objects/state.ts";
import Logo from '@/Components/common/Logo';
import { useTranslation } from "react-i18next";
import { Link } from '@mui/material';

interface FormValues {
    password: string;
    password_confirmation: string;
    code?: string;
}

export default function ResetComponent() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [digitValues, setDigitValues] = useState(['', '', '', '', '']);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [resendTimer, ] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [, setAlert] = useState<{ type: 'success' | 'error' | null; message: string | null }>({ type: null, message: null });
    const digitRefs = useRef<HTMLInputElement[]>([]);
    const dispatch = useAppDispatch();
    const appContext = useAppContext();    
    const {reset_token} = useAppSelector(state => state.forgot);


    const initialValues: FormValues = {
        password: '',
        password_confirmation: ''
    };

    const attemptReset = async (payload: IResetPayload) => {
        const { resetAsync } = await import('Data/Slices/auth/resetSlice');
        return dispatch(resetAsync(payload));
    }

    const handleSubmit = async (values: FormValues) => {
        try {
            const token = digitValues.join('');
            if (token.length !== 5) {
                setCodeError(t('auth.codeIncomplete'));
                return;
            }
            
            appContext.togglePageLoading(true);
            setIsLoading(true);
            await attemptReset({ ...values, token });
        } catch (e) {
            console.error('Error during password reset:', e);
            setAlert({
                type: 'error',
                message: t('auth.resetFailed')
            });
        } finally {
            setIsLoading(false);
            appContext.togglePageLoading(false);
        }
    }

    const handleBackToLogin = () => {
        appContext.togglePageLoading(true);
        dispatch(setActivePage({ page: Pages.LOGIN }));
        setTimeout(() => {
            appContext.togglePageLoading(false);
        }, 500);
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (index < digitRefs.current.length - 1) {
                digitRefs.current[index + 1].focus();
            }
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (index > 0) {
                digitRefs.current[index - 1].focus();
            }
        } else if (event.key === 'Backspace') {
            const newDigitValues = [...digitValues];
            if (!newDigitValues[index] && index > 0) {
                newDigitValues[index - 1] = '';
                setDigitValues(newDigitValues);
                digitRefs.current[index - 1].focus();
            } else {
                newDigitValues[index] = '';
                setDigitValues(newDigitValues);
            }
        }
    };

    const handleDigitChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.slice(-1);
        if (/^\d?$/.test(value)) {
            const newDigitValues = [...digitValues];
            newDigitValues[index] = value;
            setDigitValues(newDigitValues);
            setCodeError(null);

            if (value && index < digitValues.length - 1) {
                digitRefs.current[index + 1].focus();
            }
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text').trim();
        const digits = pasteData.replace(/[^0-9]/g, '').slice(0, 5);
        
        if (digits.length > 0) {
            const newDigitValues = Array(5).fill('');
            [...digits].forEach((digit, i) => {
                if (i < 5) newDigitValues[i] = digit;
            });
            setDigitValues(newDigitValues);
            setCodeError(null);
            
            const focusIndex = Math.min(digits.length, 4);
            digitRefs.current[focusIndex].focus();
        }
    };

    const handleResendToken = async () => {
        if (resendTimer > 0) return;
        
        try {
            setIsLoading(true);
            const { forgotAsync } = await import('Data/Slices/auth/forgotSlice');
            await dispatch(forgotAsync({ username: appContext.username }));
            
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            const errors: Partial<FormValues> = {};
            
            if (!values.password) {
                errors.password = t('auth.passwordRequired');
            } else if (values.password.length < 8) {
                errors.password = t('auth.passwordMinLength');
            }

            if (!values.password_confirmation) {
                errors.password_confirmation = t('auth.passwordConfirmRequired');
            } else if (values.password !== values.password_confirmation) {
                errors.password_confirmation = t('auth.passwordsDoNotMatch');
            }

            const token = digitValues.join('');
            if (!token || token.length !== 5) {
                setCodeError(t('auth.codeIncomplete'));
            } else {
                setCodeError(null);
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
                        appContext.togglePageLoading(true);
                        dispatch(setActivePage({ page: Pages.HOME }));
                        setTimeout(() => {
                            appContext.togglePageLoading(false);
                        }, 500);
                    }}>
                        <Logo
                            showVersion={true}
                            animate={true}
                            imageSize={150}
                            fontSize="2rem"
                        />
                    </div>

                    <div className="auth-content">
                        {reset_token !== "" && (
                            <motion.div 
                                className={`alert alert-info`}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <i className={`ti ti-check`}></i>
                                <span>{reset_token}</span>
                            </motion.div>
                        )}

                        <motion.div 
                            className="auth-title"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h4>{t('auth.resetPassword')}</h4>
                            <p>{t('auth.resetPasswordDescription')}</p>
                        </motion.div>

                        <form onSubmit={formik.handleSubmit} className="auth-form">
                            <motion.div 
                                className="form-group d-flex align-items-center justify-content-center flex-column"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label>{t('auth.securityCode')} <span className="required">*</span></label>
                                <div className="input-group ">
                                    <div className="otp-container w-100">
                                        <div className="otp-inputs">
                                            {digitValues.map((value, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => digitRefs.current[index] = el!}
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={1}
                                                    value={value}
                                                    onChange={(e) => handleDigitChange(index, e)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    onPaste={index === 0 ? handlePaste : undefined}
                                                    disabled={isLoading}
                                                />
                                            ))}
                                        </div>
                                        <div className="resend-token">
                                            {resendTimer > 0 ? (
                                                <span className="timer">{t('auth.resendCodeIn', {seconds: resendTimer})}</span>
                                            ) : (
                                                <button 
                                                    type="button" 
                                                    onClick={handleResendToken}
                                                    disabled={isLoading || resendTimer > 0}
                                                >
                                                    <i className="ti ti-refresh"></i>
                                                    {t('auth.resendCode')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {codeError && (
                                    <motion.div 
                                        className="error-message"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <i className="ti ti-alert-circle"></i>
                                        <span>{codeError}</span>
                                    </motion.div>
                                )}
                            </motion.div>

                            <motion.div 
                                className="form-group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label htmlFor="password">{t('auth.newPassword')} <span className="required">*</span></label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="ti ti-lock"></i>
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${formik.errors.password && formik.touched.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        name="password"
                                        placeholder={t('auth.newPasswordPlaceholder')}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                                    </button>
                                </div>
                                {formik.errors.password && formik.touched.password && (
                                    <motion.div 
                                        className="error-message"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <i className="ti ti-alert-circle"></i>
                                        <span>{formik.errors.password}</span>
                                    </motion.div>
                                )}
                            </motion.div>

                            <motion.div 
                                className="form-group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label htmlFor="password_confirmation">{t('auth.confirmPassword')} <span className="required">*</span></label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="ti ti-lock"></i>
                                    </span>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`form-control ${formik.errors.password_confirmation && formik.touched.password_confirmation ? 'is-invalid' : ''}`}
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        placeholder={t('auth.confirmPasswordPlaceholder')}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password_confirmation}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <i className={`ti ti-eye${showConfirmPassword ? '-off' : ''}`}></i>
                                    </button>
                                </div>
                                {formik.errors.password_confirmation && formik.touched.password_confirmation && (
                                    <motion.div 
                                        className="error-message"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <i className="ti ti-alert-circle"></i>
                                        <span>{formik.errors.password_confirmation}</span>
                                    </motion.div>
                                )}
                            </motion.div>

                            <motion.div 
                                className="form-actions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <motion.button
                                    type="submit"
                                    className="btn btn-primary w-100 py-3"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isLoading || !formik.isValid || !formik.dirty}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-grow spinner-grow-sm"></span>
                                            <span>{t('auth.resettingPassword')}</span>
                                        </>
                                    ) : (
                                        t('auth.resetPassword')
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
                                        sx={{ textDecoration: 'none', bgcolor:'inherit', boxShadow: 'none',
                                            '&:hover': {
                                                bgcolor:'inherit', boxShadow: 'none'
                                            }
                                        }}
                                    >
                                        <i className="ti ti-arrow-left"></i>
                                        <span>{t('auth.backToLogin')}</span>
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