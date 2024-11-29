import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from "formik";
import { useAppContext } from "../../contexts/appContext";
import { Alert } from '@mui/material';
import { IResetPayload } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import logo from "../../../public/favicon.png"
import "Styles/auth.less";
import { setActivePage } from "Data/Slices/NavigationSlice.ts";
import { Pages } from "Data/Objects/state.ts";

interface FormValues {
    password: string;
    password_confirmation: string;
}

const LoadingOverlay = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="loading-overlay"
    >
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="loading-spinner"
        />
    </motion.div>
);

export default function ResetComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const [digitValues, setDigitValues] = useState(['', '', '', '', '']);
    const [showPasswordInputs, setShowPasswordInputs] = useState(false);
    const initialValues: FormValues = {
        password: '',
        password_confirmation: ''
    };

    const digitRefs = useRef<HTMLInputElement[]>([]);
    const dispatch = useAppDispatch();
    const { reset_token: resetToken, username: usernameToResendToken } = useAppSelector((state) => state.forgot);
    const context = useAppContext();

    const handleSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            const token = digitValues.join('');
            const datas: IResetPayload = { ...values, token };
            const { resetAsync } = await import('Data/Slices/auth/resetSlice');
            const { setFirstConnexionToFalse } = await import('Data/Slices/auth/userSlice');
            dispatch(setFirstConnexionToFalse());
            await dispatch(resetAsync(datas));
        } catch (e) {
            console.error(e);
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
                errors.password = 'Password field is required.';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(values.password)) {
                errors.password = 'Invalid password.';
            }

            if (!values.password_confirmation || values.password_confirmation !== values.password) {
                errors.password_confirmation = 'Password confirmation should match with password.';
            }

            return errors;
        }
    });

    const handleResentToken = async () => {
        try {
            setIsLoading(true);
            const { resendTokenAsync } = await import('Data/Slices/auth/resendTokenSlice');
            await dispatch(resendTokenAsync({ username: usernameToResendToken ?? '' }));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowRight' || event.key === 'Tab') {
            if (index < digitRefs.current.length - 1) {
                digitRefs.current[index + 1].focus();
            }
        } else if (event.key === 'ArrowLeft') {
            if (index > 0) {
                digitRefs.current[index - 1].focus();
            }
        }
    };

    useEffect(() => {
        if (digitRefs.current.length > 0) {
            digitRefs.current[0].focus();
        }
    }, []);

    const handleDigitChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (/^\d$/.test(value)) {
            const newDigitValues = [...digitValues];
            newDigitValues[index] = value;
            setDigitValues(newDigitValues);
            if (index < digitValues.length - 1) {
                digitRefs.current[index + 1].focus();
            } else {
                setShowPasswordInputs(true);
            }
        } else if (value === '') {
            const newDigitValues = [...digitValues];
            newDigitValues[index] = '';
            setDigitValues(newDigitValues);
            if (index > 0) {
                digitRefs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const pasteData = event.clipboardData.getData('text');
        if (/^\d{5}$/.test(pasteData)) {
            const newDigitValues = pasteData.split('');
            setDigitValues(newDigitValues);
            newDigitValues.forEach((value, index) => {
                if (digitRefs.current[index]) {
                    digitRefs.current[index].value = value;
                }
            });
            digitRefs.current[digitValues.length - 1]?.focus();
            setShowPasswordInputs(true);
        }
        event.preventDefault();
    };

    return (
        <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
             data-sidebar-position="fixed" data-header-position="fixed" style={{ backgroundColor: "rgba(208,208,208,0.28)" }}>
            <div className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center"
                 style={{ backgroundColor: "rgba(208,208,208,0.28)!important" }}>
                <div className="d-flex align-items-center justify-content-center w-100">
                    <div className="row justify-content-center w-100">
                        <div className="col-md-8 col-lg-6 col-xxl-3">
                            <motion.div
                                className="card mb-0"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="card-body">
                                    <div className="d-flex justify-content-center align-items-center py-3">
                                        <a className="navbar-brand d-flex align-items-center" href="#" onClick={() => {
                                            context.togglePageLoading(true)
                                            dispatch(setActivePage({page: Pages.HOME}))
                                        }}>
                                            <img src={logo} alt='logo' style={{
                                                width: '26px',
                                                height: '26px',
                                                objectFit: "cover",
                                                objectPosition: "center"
                                            }}/>
                                            <span className='ms-1 fs-6 fw-bolder'>Brocante<span
                                                className='bg-primary text-white py-1 px-2' style={{
                                                borderRadius: '10px',
                                                backgroundColor: '#007bff'
                                            }}>V1.0</span></span>
                                        </a>
                                    </div>
                                    {resetToken !== '' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Alert severity="info">{resetToken}</Alert>
                                        </motion.div>
                                    )}
                                    <form onSubmit={formik.handleSubmit}>
                                        <div className="mb-2">
                                            <label htmlFor="exampleInputEmail1" className="form-label fw-semibold">Type
                                                your 5 digits security code</label>
                                            <div className="d-flex align-items-center justify-content-between">
                                                {digitValues.map((value, index) => (
                                                    <motion.input
                                                        key={index}
                                                        ref={(el) => digitRefs.current[index] = el!}
                                                        type="text"
                                                        className="form-control"
                                                        placeholder=""
                                                        maxLength={1}
                                                        value={value}
                                                        onChange={(e) => handleDigitChange(index, e)}
                                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                                        onPaste={index === 0 ? handlePaste : undefined}
                                                        style={{ textAlign: "center", margin: '2px' }}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.2, delay: index * 0.1 }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {showPasswordInputs && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="mb-2">
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
                                                        {formik.errors.password && (
                                                            <motion.div
                                                                className='text fs-10 text-danger d-flex align-items-center'
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                            >
                                                                <i className='ti ti-alert-circle me-2'></i>
                                                                <span>{formik.errors.password}</span>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="password_confirmation" className="form-label">Password confirm<span
                                                            className="text-danger">*</span></label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="password_confirmation"
                                                            name='password_confirmation'
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.password_confirmation}
                                                            style={{ ...formik.errors.password_confirmation && { borderColor: "var(--bs-danger)" } }}
                                                        />
                                                        {formik.errors.password_confirmation && (
                                                            <motion.div
                                                                className='text fs-10 text-danger d-flex align-items-center'
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                            >
                                                                <i className='ti ti-alert-circle me-2'></i>
                                                                <span>{formik.errors.password_confirmation}</span>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {showPasswordInputs && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 20 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {!isLoading ? (
                                                        <motion.button
                                                            type='submit'
                                                            className="btn btn-primary w-100 py-8 fs-4 mb-2 rounded-2"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Verify my account
                                                        </motion.button>
                                                    ) : (
                                                        <button className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2" type="button" disabled>
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            Please wait...
                                                        </button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </form>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <p className="fs-4 mb-0 fw-bold">Didn't receive the email?</p>
                                        <motion.button
                                            className='btn btn-light-primary text-primary fw-semibold fs-4'
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleResentToken}
                                            disabled={isLoading}
                                        >
                                            Resend
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isLoading && <LoadingOverlay />}
            </AnimatePresence>
        </div>
    );
}