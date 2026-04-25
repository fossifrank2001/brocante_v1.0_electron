import { useState } from 'react';
import { useFormik } from 'formik';
import { useAppContext } from "@/contexts/appContext";
import { Pages } from 'Data/Objects/state';
import { Link, FormControlLabel, Checkbox } from '@mui/material';
import { setActivePage } from 'Data/Slices/NavigationSlice';
import { useAppDispatch } from '@/hooks';
import { motion } from 'framer-motion';
import "Styles/auth.less";
import Logo from '@/Components/common/Logo';
import ConnectionSettingsDialog from './ConnectionSettingsDialog';
import { IconButton, Tooltip, Box } from '@mui/material';
import { SettingsInputAntenna } from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { FlagEN, FlagFR } from '@/Components/common/LanguageFlags';

interface FormValues {
    login: string;
    password: string;
    rememberMe?: boolean;
}

export default function LoginComponent() {
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const dispatch = useAppDispatch();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    };

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
                errors.login = t('auth.loginRequired');
            } else if (!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.login) || /^6[0-9]{8}$/i.test(values.login))) {
                errors.login = t('auth.invalidLogin');
            }
            if (!values.password) {
                errors.password = t('auth.passwordRequired');
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
                <div className="auth-card" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 16, right: 16 }}>
                        <Tooltip title={t('auth.networkConfig')}>
                            <IconButton onClick={() => setShowSettings(true)} sx={{ color: '#64748b', '&:hover': { color: '#4f46e5', bgcolor: '#e0e7ff' } }}>
                                <SettingsInputAntenna />
                            </IconButton>
                        </Tooltip>
                    </div>

                    <div className="auth-header" onClick={() => {
                        context.togglePageLoading(true)
                        dispatch(setActivePage({ page: Pages.HOME }))
                    }}>
                        <Logo
                            showVersion={true}
                            animate={true}
                            imageSize={150}
                            fontSize="2rem"
                        />
                    </div>

                    <form onSubmit={formik.handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="login" className="form-label">
                                {t('auth.login')} <span className="required">*</span>
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
                                    placeholder={t('auth.loginPlaceholder')}
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
                                {t('auth.password')} <span className="required">*</span>
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
                                    placeholder={t('auth.passwordPlaceholder')}
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
                                    label={t('auth.rememberMe')}
                                />
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => {
                                        context.togglePageLoading(true)
                                        dispatch(setActivePage({ page: Pages.FORGOT_PAGE }))
                                    }}
                                    sx={{ textDecoration: 'none', bgcolor:'inherit', boxShadow: 'none',
                                        '&:hover': {
                                            bgcolor:'inherit', boxShadow: 'none'
                                        }
                                    }}
                                >
                                    {t('auth.forgotPassword')}
                                </Link>
                            </div>
                        </div>

                        <div className="form-group">
                            <motion.button
                                type="submit"
                                className="btn btn-primary w-100 py-3"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-grow spinner-grow-sm"></span>
                                        <span>{t('auth.signingIn')}</span>
                                    </>
                                ) : (
                                    t('auth.signIn')
                                )}
                            </motion.button>
                        </div>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('en')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 14px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    background: i18n.language === 'en' ? 'var(--primary-color)' : '#f1f5f9',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: i18n.language === 'en' ? '#fff' : '#64748b',
                                    transition: 'all 0.2s ease',
                                    boxShadow: i18n.language === 'en' ? '0 2px 8px rgba(79, 70, 229, 0.35)' : '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                            >
                                <FlagEN size={18} />
                                English
                            </button>
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('fr')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 14px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    background: i18n.language === 'fr' ? 'var(--primary-color)' : '#f1f5f9',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: i18n.language === 'fr' ? '#fff' : '#64748b',
                                    transition: 'all 0.2s ease',
                                    boxShadow: i18n.language === 'fr' ? '0 2px 8px rgba(79, 70, 229, 0.35)' : '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                            >
                                <FlagFR size={18} />
                                Français
                            </button>
                        </Box>
                    </form>
                    <ConnectionSettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
                </div>
            </motion.div>
        </div>
    );
}