import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '@/hooks';
import Breadcrumd from '@/Components/Breadcrumd';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { useAppContext } from '@/contexts/appContext';
import CategoryAPI from '@/Data/Api/Category';
import { ICategoryPayload } from '@/Data/Interfaces/Category';
import '@/Styles/forms.scss';

interface SubCategory {
    label: string;
    description?: string;
}

interface CategoryFormValues extends ICategoryPayload {
    label: string;
    description: string;
    sub_categories: SubCategory[];
}

const initialValues: CategoryFormValues = {
    label: '',
    description: '',
    sub_categories: [{ label: '', description: '' }],
};

const validationSchema = Yup.object({
    label: Yup.string()
        .required('Category name is required')
        .max(50, 'Maximum 50 characters'),
    description: Yup.string()
        .max(300, 'Maximum 300 characters'),
    sub_categories: Yup.array()
        .of(
            Yup.object({
                label: Yup.string()
                    .required('Sub-category name is required')
                    .max(50, 'Maximum 50 characters'),
                description: Yup.string()
                    .max(300, 'Maximum 300 characters'),
            })
        )
        .min(1, 'At least one sub-category is required'),
});

const NewCategory = () => {
    const dispatch = useAppDispatch();
    const context = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: CategoryFormValues) => {
        try {
            setIsLoading(true);
            await CategoryAPI.create(values);
            context.togglePageLoading(true);
            dispatch(setActivePage({ page: Pages.CATEGORY }));
        } catch (error) {
            setError('Failed to create category');
            console.error('Failed to create category:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik<CategoryFormValues>({
        initialValues,
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <div className="container">
            <Breadcrumd parent="Categories" url={Pages.CATEGORY} />
            
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">New Category</h5>
                    <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => dispatch(setActivePage({ page: Pages.CATEGORY }))}
                    >
                        <i className="ti ti-arrow-left me-1"></i>
                        Back
                    </button>
                </div>

                <div className="card-body">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">
                                        Category Name
                                        <span className="text-danger ms-1">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="ti ti-tag"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className={`form-control ${formik.touched.label && formik.errors.label ? 'is-invalid' : ''}`}
                                            placeholder="e.g. Electronics"
                                            {...formik.getFieldProps('label')}
                                        />
                                    </div>
                                    {formik.touched.label && formik.errors.label && (
                                        <div className="invalid-feedback d-block">
                                            <i className="ti ti-alert-circle me-1"></i>
                                            {formik.errors.label}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Description</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="ti ti-notes"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                            placeholder="Category description"
                                            {...formik.getFieldProps('description')}
                                        />
                                    </div>
                                    {formik.touched.description && formik.errors.description && (
                                        <div className="invalid-feedback d-block">
                                            <i className="ti ti-alert-circle me-1"></i>
                                            {formik.errors.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">
                                    <i className="ti ti-list me-2"></i>
                                    Sub-Categories
                                </h6>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => formik.setFieldValue('sub_categories', [
                                        ...formik.values.sub_categories,
                                        { label: '', description: '' }
                                    ])}
                                >
                                    <i className="ti ti-plus me-1"></i>
                                    Add
                                </button>
                            </div>

                            <div className="sub-categories-container">
                                <AnimatePresence>
                                    {formik.values.sub_categories.map((_, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="card sub-category-card mb-3"
                                        >
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h6 className="mb-0">Sub-category #{index + 1}</h6>
                                                    {formik.values.sub_categories.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => {
                                                                const newSubCategories = formik.values.sub_categories.filter((_, i) => i !== index);
                                                                formik.setFieldValue('sub_categories', newSubCategories);
                                                            }}
                                                        >
                                                            <i className="ti ti-trash"></i>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                Name
                                                                <span className="text-danger ms-1">*</span>
                                                            </label>
                                                            <div className="input-group">
                                                                <span className="input-group-text">
                                                                    <i className="ti ti-tag"></i>
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    className={`form-control ${
                                                                        formik.touched.sub_categories?.[index]?.label && 
                                                                        (formik.errors.sub_categories?.[index] as SubCategory)?.label ? 'is-invalid' : ''
                                                                    }`}
                                                                    placeholder="e.g. Smartphones"
                                                                    {...formik.getFieldProps(`sub_categories.${index}.label`)}
                                                                />
                                                            </div>
                                                            {formik.touched.sub_categories?.[index]?.label &&
                                                             (formik.errors.sub_categories?.[index] as SubCategory)?.label && (
                                                                <div className="invalid-feedback d-block">
                                                                    <i className="ti ti-alert-circle me-1"></i>
                                                                    {(formik.errors.sub_categories?.[index] as SubCategory)?.label}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Description</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text">
                                                                    <i className="ti ti-notes"></i>
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    className={`form-control ${
                                                                        formik.touched.sub_categories?.[index]?.description && 
                                                                        (formik.errors.sub_categories?.[index] as SubCategory)?.description ? 'is-invalid' : ''
                                                                    }`}
                                                                    placeholder="Sub-category description"
                                                                    {...formik.getFieldProps(`sub_categories.${index}.description`)}
                                                                />
                                                            </div>
                                                            {formik.touched.sub_categories?.[index]?.description && 
                                                             (formik.errors.sub_categories?.[index] as SubCategory)?.description && (
                                                                <div className="invalid-feedback d-block">
                                                                    <i className="ti ti-alert-circle me-1"></i>
                                                                    {(formik.errors.sub_categories?.[index] as SubCategory)?.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="card-footer bg-transparent border-0 d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={() => dispatch(setActivePage({ page: Pages.CATEGORY }))}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary d-flex align-items-center"
                                disabled={isLoading || !formik.isValid || !formik.dirty}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="ti ti-device-floppy me-2"></i>
                                        Create Category
                                    </>
                                )}
                            </button>
                            {error && (
                                <div className="text-danger mt-2">
                                    <i className="ti ti-alert-circle me-1"></i>
                                    {error}
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewCategory;
