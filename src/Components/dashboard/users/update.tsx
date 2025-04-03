import { useEffect, useLayoutEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Skeleton, TextField, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import Breadcrumd from '@/Components/Breadcrumd';
import UserAPI from '@/Data/Api/Users';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { IUsersPayload } from '@/Data/Interfaces/Users';
import { useAppContext } from '@/contexts/appContext';
import { IUser } from 'Interfaces';
import ThumbnailDropzone from "Components/ThumbnailDropzone.tsx";
import constants from "Data/Utilities/constants.ts";
import { IImage } from "Data/Interfaces/Image.ts";
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

const UpdateUser = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const [isLoading, setIsLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<FormValues>({
        last_name: '',
        first_name: '',
        email: '',
        phone: '',
        gender: ''
    });
    const dispatch = useAppDispatch();
    const context = useAppContext();
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [record, setRecord] = useState<IUser | null>(null);
    const [image, setImage] = useState<IImage | null>(null);

    useLayoutEffect(() => {
        context.togglePageLoading();
    }, [context]);

    const handleUploadSuccess = (uploadedImagePath: IImage) => {
        setImage(uploadedImagePath);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsDataLoading(true);
                const { data: response } = await UserAPI.show(id);
                setRecord(response);
                setImage(response.thumbnail);
                setInitialValues({
                    last_name: response.last_name,
                    first_name: response.first_name,
                    email: response.email,
                    phone: response.phone,
                    gender: response.gender,
                });
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setIsDataLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleSubmit = async (values: IUsersPayload) => {
        setIsLoading(true);
        try {
            await UserAPI.update(id, values);
            context.togglePageLoading(true);
            dispatch(setActivePage({ page: Pages.ACCOUNT }));
        } catch (error) {
            console.error("Failed to update user", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
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

    if (isDataLoading) {
        return (
            <motion.div 
                className="container form-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Breadcrumd parent="Users" url={currentPage} _child={id} />
                <div className="form-card">
                    <div className="card-body">
                        <div className="row g-4">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="col-md-6">
                                    <Skeleton variant="text" width={100} height={20} className="mb-2" />
                                    <Skeleton variant="rectangular" height={40} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="container form-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Breadcrumd parent="Users" url={currentPage} _child={id} />
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

                <div className="row g-4">
                    <div className="col-md-8">
                        <form onSubmit={formik.handleSubmit}>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="last_name">
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
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="first_name">
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
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="email">
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
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label htmlFor="phone">
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
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label htmlFor="gender">
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
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading || !formik.isValid || !formik.dirty}
                                >
                                    <i className="ti ti-device-floppy"></i>
                                    {isLoading ? 'Updating...' : 'Update User'}
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

                    <div className="col-md-4">
                        <div className="form-group">
                            <label>
                                <i className="ti ti-photo"></i>
                                Profile Picture
                            </label>
                            <ThumbnailDropzone
                                onUploadSuccess={handleUploadSuccess}
                            existingImageUrl={image ? `${constants.URL}/${image.path}` : null}
                            existingImageId={image ? image.id : null}
                            imageable={{
                                imageable_id: record.id,
                                imageable_type: 'User'
                            }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UpdateUser;
