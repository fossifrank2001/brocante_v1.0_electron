import { useState, useEffect, useRef } from 'react';
import logo from "../../assets/images/logos/dark-logo.svg";
import { useFormik } from "formik";
import { useAppContext } from "../../contexts/appContext";
import { Alert, Link } from '@mui/material';
import { IResetPayload } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { motion } from 'framer-motion';
import "Styles/auth.less";

interface FormValues {
    password: string;
    password_confirmation: string;
}

export default function ResetComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const [digitValues, setDigitValues] = useState(['', '', '', '', '']);
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
            context.togglePageLoading(true);
            const { resendTokenAsync } = await import('Data/Slices/auth/resendTokenSlice');
            await dispatch(resendTokenAsync({ username: usernameToResendToken ?? '' }));
        } catch (e) {
            console.error(e);
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
            digitRefs.current[0].focus(); // Focus the first input field on page load
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

    // Handle paste event
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
        }
        event.preventDefault(); // Prevent the default paste behavior
    };

    return (
      <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
           data-sidebar-position="fixed" data-header-position="fixed" style={{ backgroundColor: "rgba(208,208,208,0.28)" }}>
          <div className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center"
               style={{ backgroundColor: "rgba(208,208,208,0.28)!important" }}>
              <div className="d-flex align-items-center justify-content-center w-100">
                  <div className="row justify-content-center w-100">
                      <div className="col-md-8 col-lg-6 col-xxl-3">
                          <div className="card mb-0">
                              <div className="card-body">
                                  <Link href="#" className="text-nowrap logo-img text-center d-block py-3 w-100">
                                      <img src={logo} width="180" alt="" />
                                  </Link>
                                  {resetToken !== '' && <div className="">
                                      <Alert severity="info">{resetToken}</Alert>
                                  </div>}
                                  <form onSubmit={formik.handleSubmit}>
                                      <div className="mb-2">
                                          <label htmlFor="exampleInputEmail1" className="form-label fw-semibold">Type your 5 digits security code</label>
                                          <div className="d-flex align-items-center justify-content-between">
                                              {digitValues.map((value, index) => (
                                                <input
                                                  key={index}
                                                  ref={(el) => digitRefs.current[index] = el!}
                                                  type="text"
                                                  className="form-control"
                                                  placeholder=""
                                                  maxLength={1}
                                                  value={value}
                                                  onChange={(e) => handleDigitChange(index, e)} // Gère la saisie
                                                  onKeyDown={(e) => handleKeyDown(index, e)} // Gère la navigation au clavier
                                                  onPaste={index === 0 ? handlePaste : undefined} // Handle paste event only for the first input
                                                  style={{ textAlign: "center", margin: '2px' }}
                                                />
                                              ))}
                                          </div>
                                      </div>

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
                                          {formik.errors.password &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.password}</span>
                                            </div>
                                          }
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
                                          {formik.errors.password_confirmation &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.password_confirmation}</span>
                                            </div>
                                          }
                                      </div>
                                      {!isLoading ? <motion.button
                                          type='submit'
                                          className="btn btn-primary w-100 py-8 fs-4 mb-2 rounded-2"
                                          whileTap={{ scale: 0.9 }}  // Add the click animation effect
                                        >
                                            Verify my account
                                        </motion.button>
                                        :
                                        <button className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2" type="button"
                                                disabled>
                                                <span className="spinner-border spinner-border-sm" role="status"
                                                      aria-hidden="true"></span>
                                            Please wait...
                                        </button>
                                      }
                                  </form>
                                  <div className="d-flex align-items-center justify-content-center">
                                      <p className="fs-4 mb-0 fw-bold">Didn't receive the email?</p>
                                      <motion.button className='btn btn-light-primary text-primary fw-semibold fs-4' whileTap={{ scale: 0.9 }} onClick={handleResentToken}>Resend</motion.button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
}
