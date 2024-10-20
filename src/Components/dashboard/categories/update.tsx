import React, {useEffect, useState} from 'react';
import { useFormik, FormikErrors, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {useAppDispatch, useAppSelector} from '@/hooks';
import Breadcrumd from '@/Components/Breadcrumd';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import { useAppContext } from '@/contexts/appContext';
import CategoryAPI from '@/Data/Api/Category';
import { ICategory, ICategoryPayload, SubCategory } from '@/Data/Interfaces/Category';
import { IApiResponseBase } from 'Data/Utilities/axiosInstance.ts';

interface CategoryFormValues extends ICategoryPayload{
}

const UpdateCategory: React.FC = () => {
  const dispatch = useAppDispatch()
  const context = useAppContext();
  const {currentPage, id } = useAppSelector((state) => state.navigaton);

  const [initialValues, setInitialValues] = useState<CategoryFormValues>({
    label: '',
    description: '',
    sub_categories: [{ label: '', description: '' }],
  });

  useEffect(() => {
    (async () => {
      try {
        const {data}:IApiResponseBase<ICategory> = await CategoryAPI.show(id);
        setInitialValues({
          label: data.label,
          description: data.description,
          sub_categories: data.sub_categories.map((subCategory: SubCategory) => ({ ...subCategory })),
        });
      } catch (error) {
        console.error('Error while getting categories :', error);
      }
    })()

  }, [id]);

  const handleSubmit = async (values: CategoryFormValues, { setSubmitting, resetForm }: FormikHelpers<CategoryFormValues>    ) => {
    try {
      await CategoryAPI.update(id, values);
      resetForm();
      context.togglePageLoading(true)
      dispatch(setActivePage({page: Pages.CATEGORY}))
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik<CategoryFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      label: Yup.string().required('Category label is required').max(50, 'Max length is 50 characters'),
      description: Yup.string(),
      sub_categories: Yup.array().of(
          Yup.object({
            label: Yup.string().required('Sub-category label is required').max(50, 'Max length is 50 characters'),
            description: Yup.string().max(300, 'Max length is 300 characters'),
          })
      ).min(1, 'At least one sub-category is required'),
    }),
    onSubmit: async (values, _formProps) => handleSubmit(values, _formProps)
  });

  return (
      <div className="container">
        <Breadcrumd parent="Categories" url={currentPage} _child={id} />
        <div className='card'>
          <div className='card-header'>
            <button className='btn d-flex align-items-center btn-outline-dark' onClick={() => {
              dispatch(setActivePage({page: Pages.CATEGORY}))
            }}>
              <i className='ti ti-arrow-left'></i>
              <span className='ms-1'>BACK</span>
            </button>
          </div>
          <div className='card-body'>
            <form onSubmit={formik.handleSubmit}>
              <div className="row">
                <div className="col-10 mx-auto">
                  <div className="row gap-10">
                    <div className="col-6 mb-3">
                      <label htmlFor="label" className="form-label">Label <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            id="label"
                            name='label'
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.label}
                            style={{ ...formik.errors.label && { borderColor: "var(--bs-danger)" } }}
                        />
                      </div>
                      {formik.touched.label && formik.errors.label &&
                          <div className='text fs-10 text-danger d-flex align-items-center'>
                            <i className='ti ti-alert-circle me-2'></i>
                            <span>{formik.errors.label}</span>
                          </div>
                      }
                    </div>
                    <div className="col-6 mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            id="description"
                            name='description'
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            style={{ ...formik.errors.description && { borderColor: "var(--bs-danger)" } }}
                        />
                      </div>
                      {formik.touched.description && formik.errors.description  &&
                          <div className='text fs-10 text-danger d-flex align-items-center'>
                            <i className='ti ti-alert-circle me-2'></i>
                            <span>{formik.errors.description}</span>
                          </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-10 mx-auto">
                  <div className='d-flex align-items-center mb-2'>
                    <h6>Sub categories</h6>
                    <button
                        className='btn btn-success ms-3'
                        type="button"
                        onClick={() => formik.setFieldValue('sub_categories', [...formik.values.sub_categories, { label: '', description: '' }])}
                    >
                      <i className='ti ti-plus text-white'></i>
                      <span className='ms-1  text-white'>Add</span>
                    </button>
                  </div>
                  <div className="row">
                    {formik.values.sub_categories.map((_, index) => (
                        <div className='col-3'>
                          <div key={index} className="sub-category card position-relative">
                            <div className="mx-auto p-3">
                              <label htmlFor={`sub_categories.${index}.label`} className="form-label">Label_{index + 1} <span className="text-danger">*</span></label>
                              <input
                                  id={`sub_categories.${index}.label`}
                                  style={{ ...(formik.touched.sub_categories && formik.touched.sub_categories[index] && formik.touched.sub_categories[index].label && formik.errors.sub_categories && formik.errors.sub_categories[index] && (formik.errors.sub_categories as FormikErrors<SubCategory>)[index].label) && { borderColor: "var(--bs-danger)" } }}
                                  type="text"
                                  name={`sub_categories.${index}.label`}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  value={formik.values.sub_categories[index]?.label || ''}
                                  className={(formik.touched.sub_categories && formik.touched.sub_categories[index] && formik.touched.sub_categories[index].label && formik.errors.sub_categories && formik.errors.sub_categories[index] && (formik.errors.sub_categories as FormikErrors<SubCategory>)[index].label) ? 'input-error form-control' : 'form-control'}
                              />
                              {formik.touched.sub_categories && formik.touched.sub_categories[index] && formik.touched.sub_categories[index].label && formik.errors.sub_categories && formik.errors.sub_categories[index] && (formik.errors.sub_categories as FormikErrors<SubCategory>)[index].label ? (
                                  <div className='text fs-1 text-danger d-flex align-items-center'>
                                    <i className='ti ti-alert-circle me-2'></i>
                                    <span>{(formik.errors.sub_categories as FormikErrors<SubCategory>)[index].label}</span>
                                  </div>
                              ) : null}
                            </div>
                            <span
                                onClick={() => formik.setFieldValue('sub_categories', formik.values.sub_categories.filter((_, i) => i !== index))}
                                className='wrapper-btn p-1 d-flex justify-content-center align-items-center bg-danger text-white'
                                style={{
                                  position:'absolute',
                                  right: '4px',
                                  top:'4px',
                                  borderRadius: '50%',
                                  cursor:'pointer'
                                }}
                            >
                                                <i className='ti ti-x text-white'></i>
                                            </span>
                          </div>
                        </div>
                    ))}
                  </div>

                  {!formik.isSubmitting ? <button type='submit' className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2">UPDATE</button> :
                      <button className="btn btn-primary ms-auto py-8 fs-4 mb-4 rounded-2" type="button" disabled>
                        <span className="spinner-grow spinner-grow-sm ms-4" role="status" aria-hidden="true"></span>
                        <span className="ms-8 me-4">Loading...</span>
                      </button>
                  }
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default UpdateCategory;

