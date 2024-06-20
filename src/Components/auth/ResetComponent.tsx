import {useState} from 'react'
import logo from "../../assets/images/logos/dark-logo.svg";
import {useFormik} from "formik";
import {useAppContext} from "../../contexts/appContext";
import { Alert, Link } from '@mui/material';
import { IResetPayload } from '@/Data/Interfaces';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { motion } from 'framer-motion';

interface FormValues {
    password: string;
    password_confirmation: string;
}

export default function ResetComponent() {
    const [isLoading, setIsLoading] =  useState(false);
    const [digitValues, setDigitValues] = useState(['', '', '', '', '']);
    const initialValues : FormValues = {
        password : '',
        password_confirmation : ''
    }
    const dispatch = useAppDispatch();
    const {reset_token: resetToken, username:usernameToResendToken} = useAppSelector((state) => state.forgot)
    const context = useAppContext()

    const handleSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true)
            const token = digitValues.join('');
            // Ajoutez le token aux valeurs soumises
            const datas : IResetPayload  = { ...values, token };
             const { resetAsync } = await import('Data/Slices/auth/resetSlice');
             await dispatch(resetAsync(datas));
            //localStorage.removeItem('reset_token')
        }catch (e) {
        }finally {
            setIsLoading(false)
        }
    }

    const formik = useFormik({
        initialValues,
        onSubmit: handleSubmit,
        validate: (values: FormValues) => {
            let errors: Partial<FormValues> = {};

            if (!values.password) {
                errors.password = 'Password field is required.'
            }else if(!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(values.password)){
                errors.password = 'Invalid password.'
            }

            if (!values.password_confirmation || values.password_confirmation !== values.password) {
                errors.password_confirmation = 'Password confirm should match with password.'
            }

            return errors
        }
    });

    const handleResentToken = async () => {
        try {
            context.togglePageLoading(true)
            const { resendTokenAsync } = await import('Data/Slices/auth/resendTokenSlice');
            await dispatch(resendTokenAsync({username: usernameToResendToken ?? ''}));
            //setResetToken(data.reset_token)
            //localStorage.setItem('reset_token', data.reset_token)
            //Toast.success(message);
        }catch (e) {
        }
    }

    return <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
                data-sidebar-position="fixed" data-header-position="fixed">
        <div
            className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center">
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
                                        <label htmlFor="exampleInputEmail1" className="form-label fw-semibold">Type your 6 digits security code</label>
                                        <div className="d-flex align-items-center justify-content-between">
                                            {digitValues.map((value, index) => (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    className="form-control"
                                                    placeholder=""
                                                    maxLength={1}
                                                    value={value}
                                                    onChange={(e) => {
                                                        const newDigitValues = [...digitValues];
                                                        newDigitValues[index] = e.target.value;
                                                        setDigitValues(newDigitValues);
                                                    }}
                                                    style={{textAlign:"center" ,margin: '2px'}}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <label htmlFor="password" className="form-label">Password <span
                                            className="text-danger">*</span></label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name='password'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.password}
                                            style={{...formik.errors.password && {borderColor: "var(--bs-danger)"}}}
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
                                            style={{...formik.errors.password_confirmation && {borderColor: "var(--bs-danger)"}}}
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
                                            whileTap={{scale: 0.9}}  // Add the click animation effect
                                        >
                                            Verify my account
                                        </motion.button>
                                        :
                                        <button className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2" type="button"
                                                disabled>
                                            <span className="spinner-grow spinner-grow-sm ms-4" role="status"
                                                  aria-hidden="true"></span>
                                            Verify my account...
                                        </button>
                                    }
                                    <div className='d-flex'>
                                        Didn't get the code?
                                        <Link href='#'  onClick={handleResentToken} className="text text-primary text-decoration-underline d-flex align-items-center"><span>Resent</span></Link>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
