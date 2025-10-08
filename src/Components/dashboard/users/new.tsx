import { useState } from 'react';
import { useFormik } from 'formik';
import { TextField, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import Breadcrumd from '@/Components/Breadcrumd';
import { useAppDispatch } from '@/hooks';
import { useAppContext } from '@/contexts/appContext';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { IUsersPayload } from '@/Data/Interfaces/Users';
import UserAPI from "Data/Api/Users";
import { IUser } from 'Interfaces';
import '@/styles/forms.scss';

interface FormValues extends Partial<IUser> {
    last_name: string;
    first_name: string;
    email: string;
    phone: string;
    gender: string;
}

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

const NewUser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const context = useAppContext();

    const initialValues: FormValues = {
        last_name: '',
        first_name: '',
        email: '',
        phone: '',
        gender: ''
    };

    const handleSubmit = async (values: IUsersPayload) => {
        setIsLoading(true);
        try {
            await UserAPI.create(values);
            context.togglePageLoading(true);
            dispatch(setActivePage({ page: Pages.ACCOUNT }));
        } catch (e) {
            console.error(e.message);
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
            } else if (!/^6[0-9]{8}$/i.test(values.phone)) {
                errors.phone = 'Invalid phone number format (e.g. 612345678)';
            }

            if (values.email && !(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.email))) {
                errors.email = 'Invalid email address format';
            }
            
            if (!values.gender) {
                errors.gender = 'Gender field is required.';
            }

            return errors;
        },
    });

    return (
        <motion.div 
            className="container form-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Breadcrumd parent="Users" />
            <div className="form-card">
                <div className="card-title">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                    >
                        <i className="ti ti-arrow-left"></i>
                        Back
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="py-2" htmlFor="last_name">
                                <i className="ti ti-user"></i>
                                Last Name
                                <span className="required-star">*</span>
                            </label>
                            <Tooltip title="Enter user's last name" arrow placement="top">
                                <div>
                                    <TextField
                                        fullWidth
                                        id="last_name"
                                        name="last_name"
                                        variant="outlined"
                                        size="small"
                                        value={formik.values.last_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                                        placeholder="Enter last name"
                                        className="form-control"
                                    />
                                    {formik.touched.last_name && formik.errors.last_name && (
                                        <div className="error-feedback">
                                            <i className="ti ti-alert-circle"></i>
                                            <span>{formik.errors.last_name}</span>
                                        </div>
                                    )}
                                </div>
                            </Tooltip>
                        </div>

                        <div className="col-md-6">
                            <label className="py-2" htmlFor="first_name">
                                <i className="ti ti-user"></i>
                                First Name
                            </label>
                            <Tooltip title="Enter user's first name" arrow placement="top">
                                <div>
                                    <TextField
                                        fullWidth
                                        id="first_name"
                                        name="first_name"
                                        variant="outlined"
                                        size="small"
                                        value={formik.values.first_name}
                                        onChange={formik.handleChange}
                                        placeholder="Enter first name"
                                        className="form-control"
                                    />
                                </div>
                            </Tooltip>
                        </div>

                        <div className="col-md-6">
                            <label className="py-2" htmlFor="email">
                                <i className="ti ti-mail"></i>
                                Email
                            </label>
                            <Tooltip title="Enter user's email address" arrow placement="top">
                                <div>
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        type="email"
                                        variant="outlined"
                                        size="small"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                        placeholder="Enter email address"
                                        className="form-control"
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="error-feedback">
                                            <i className="ti ti-alert-circle"></i>
                                            <span>{formik.errors.email}</span>
                                        </div>
                                    )}
                                </div>
                            </Tooltip>
                        </div>

                        <div className="col-md-3">
                            <label className="py-2" htmlFor="phone">
                                <i className="ti ti-phone"></i>
                                Phone
                                <span className="required-star">*</span>
                            </label>
                            <Tooltip title="Enter user's phone number (format: 612345678)" arrow placement="top">
                                <div>
                                    <TextField
                                        fullWidth
                                        id="phone"
                                        name="phone"
                                        variant="outlined"
                                        size="small"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                                        placeholder="612345678"
                                        className="form-control"
                                    />
                                    {formik.touched.phone && formik.errors.phone && (
                                        <div className="error-feedback">
                                            <i className="ti ti-alert-circle"></i>
                                            <span>{formik.errors.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </Tooltip>
                        </div>

                        <div className="col-md-3">
                            <label className="py-2" htmlFor="gender">
                                <i className="ti ti-gender-bigender"></i>
                                Gender
                                <span className="required-star">*</span>
                            </label>
                            <Tooltip title="Select user's gender" arrow placement="top">
                                <div>
                                    <select
                                        className={`form-select ${formik.touched.gender && formik.errors.gender ? 'is-invalid' : ''}`}
                                        id="gender"
                                        name="gender"
                                        value={formik.values.gender}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    {formik.touched.gender && formik.errors.gender && (
                                        <div className="error-feedback">
                                            <i className="ti ti-alert-circle"></i>
                                            <span>{formik.errors.gender}</span>
                                        </div>
                                    )}
                                </div>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !formik.isValid || !formik.dirty}
                        >
                            <i className="ti ti-device-floppy"></i>
                            {isLoading ? 'Creating...' : 'Create User'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => dispatch(setActivePage({ page: Pages.ACCOUNT }))}
                        >
                            <i className="ti ti-x"></i>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default NewUser;