import {useState} from 'react'
import logo from "../../assets/images/logos/dark-logo.svg";
import {useFormik} from "formik";
import {useAppContext} from "../../contexts/appContext";
import { Link } from '@mui/material';
import { IForgotPayload } from '@/Data/Interfaces';
import { Pages } from '@/Data/Objects/state';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { useAppDispatch } from '@/hooks';
import { motion } from 'framer-motion';
import "Styles/auth.less"


interface FormValues {
    username: string;
}

export default function ForgotComponent() {
    const [isLoading, setIsLoading] =  useState(false);
    const dispatch = useAppDispatch();
    const initialValues : FormValues = {username : ''} 

    const context = useAppContext()
    
    const attemptForgot = async (payload: IForgotPayload) => {
        const { forgotAsync } = await import('Data/Slices/auth/forgotSlice');
        await dispatch(forgotAsync(payload));
    }

    const handleSubmit = async (values: IForgotPayload) => {
        try {
            setIsLoading(true)
            await attemptForgot(values)
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

            if (!values.username) {
                errors.username = 'Login field is required.'
            }else if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.username) || /^6[0-9]{8}$/i.test(values.username))){
                errors.username = 'Wrong email address or phone number.'
            }
            return errors
        }
    });

    return <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
                data-sidebar-position="fixed" data-header-position="fixed">
        <div
            className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center"  style={{backgroundColor: "rgba(208,208,208,0.28)!important"}}>
            <div className="d-flex align-items-center justify-content-center w-100">
                <div className="row justify-content-center w-100">
                    <div className="col-md-8 col-lg-6 col-xxl-3">
                        <div className="card mb-0">
                            <div className="card-body">
                                <Link href="#" className="text-nowrap logo-img text-center d-block py-3 w-100">
                                    <img src={logo} width="180" alt="" />
                                </Link>
                                <div className="fw-lighter fs-9 text-center">Please enter the email address or phone number associated with your account and We will notify you a code to reset your password.</div>
                                <form onSubmit={formik.handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Login <span
                                            className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="username"
                                                name='username'
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.username}
                                                style={{...formik.errors.username && {borderColor: "var(--bs-danger)"}}}
                                            />
                                        </div>
                                        {formik.errors.username &&
                                            <div className='text fs-10 text-danger d-flex align-items-center'>
                                                <i className='ti ti-alert-circle me-2'></i>
                                                <span>{formik.errors.username}</span>
                                            </div>
                                        }
                                    </div>
                                    {!isLoading ? <motion.button
                                        type='submit'
                                        className="btn btn-primary w-100 py-8 fs-4 mb-2 rounded-2"
                                        whileTap={{ scale: 0.9 }}  // Add the click animation effect
                                    >
                                            Forgot password
                                    </motion.button>
                                        :
                                        <button className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2" type="button" disabled>
                                        <span className="spinner-grow spinner-grow-sm ms-4" role="status"
                                                  aria-hidden="true"></span>
                                            Forgot password...
                                        </button>
                                    }
                                    <Link href="#"  onClick={() => {
                                        context.togglePageLoading(true)
                                        dispatch(setActivePage({page: Pages.LOGIN}))
                                    }} className="text text-primary text-decoration-underline d-flex align-items-center"><i className='ti ti-arrow-back me-2'></i> <span>Back to login</span></Link>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
