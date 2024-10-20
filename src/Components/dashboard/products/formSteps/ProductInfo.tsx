import React, { useCallback, useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { Multiselect } from 'multiselect-react-dropdown';
import { ICategory, SubCategory } from 'Data/Interfaces/Category';
import CategoryAPI from 'Data/Api/Category';
import { IProductPayload } from 'Interfaces';

interface IProductInfoProps{
    categoryRecord?: ICategory | null
}
const ProductInfo: React.FC<IProductInfoProps> = ({categoryRecord}) => {
    const [categories, setCategories] = useState<ICategory[] | null>(null);
    const [category, setCategory] = useState<ICategory | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { values, handleChange, setFieldValue, touched, errors } = useFormikContext<IProductPayload>();

    const getCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data: _categories } = await CategoryAPI.index();
            setCategories(_categories.data);

            if (categoryRecord){
                const selectedCategory = _categories.data?.find(category => category.id === categoryRecord?.id) || null;
                setCategory(selectedCategory);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [categoryRecord]);

    useEffect(() => {
        getCategories();
    }, [getCategories, categoryRecord]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    return (
        <div className="row">
            <div className="col-12 mx-auto">
                <div className="row gap-10">
                    <div className="col-6 mb-3">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.name}
                            />
                            {touched.name && errors.name && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-6 mb-3">
                        <div className="row gap-10">
                            <div className="col-6 mb-3">
                                <div className="form-group">
                                    <label htmlFor="stock_quantity">Stock Quantity</label>
                                    <input
                                        id="stock_quantity"
                                        name="stock_quantity"
                                        type="number"
                                        className="form-control"
                                        onChange={handleChange}
                                        value={values.stock_quantity}
                                    />
                                    {touched.stock_quantity && errors.stock_quantity && (
                                        <div className="text fs-10 text-danger d-flex align-items-center">
                                            <i className="ti ti-alert-circle me-2"></i>
                                            <span>{errors.stock_quantity}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-6 mb-3">
                                <div className="form-group">
                                    <label htmlFor="price">Price</label>
                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        className="form-control"
                                        onChange={handleChange}
                                        value={values.price}
                                    />
                                    {touched.price && errors.price && (
                                        <div className="text fs-10 text-danger d-flex align-items-center">
                                            <i className="ti ti-alert-circle me-2"></i>
                                            <span>{errors.price}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <div className="input-group">
                                <select
                                  className="form-select"
                                  disabled={isLoading}
                                  id="category"
                                  name="category"
                                  value={values.category || ''}
                                  onChange={(e) => {
                                      const selectedCategoryId = e.target.value;
                                      handleChange(e);
                                      const selectedCategory = categories?.find(category => String(category.id) === selectedCategoryId) || null;

                                      if (selectedCategory === null || selectedCategoryId === '') {
                                          setCategory(null);
                                          setFieldValue('subcategory_ids', []);
                                      } else {
                                          setCategory(selectedCategory);
                                      }
                                  }}
                                >
                                    <option value="" label="Select a Category" />
                                    {categories?.map(_category => (
                                      <option key={_category.id} value={_category.id.toString()} label={_category.label} />
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-8 mb-3">
                        <label htmlFor="subcategory_ids">Sub Categories</label>
                        <Multiselect
                          options={category?.sub_categories || []}
                          selectedValues={values.subcategory_ids}
                          onSelect={(selectedList: SubCategory[]) => setFieldValue('subcategory_ids', selectedList)}
                          onRemove={(selectedList: SubCategory[]) => setFieldValue('subcategory_ids', selectedList)}
                          displayValue="label"
                          className=""
                          disable={!category}
                        />
                        {touched.subcategory_ids && errors.subcategory_ids && (
                          <div className="text fs-10 text-danger d-flex align-items-center">
                              <i className="ti ti-alert-circle me-2"></i>
                              <span>
                                    {Array.isArray(errors.subcategory_ids)
                                      ? errors.subcategory_ids.map(error => error.label || 'Error').join(', ')
                                      : errors.subcategory_ids}
                              </span>
                          </div>
                        )}

                    </div>
                    <div className="col-12 mb-3">
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-control"
                                onChange={handleChange}
                                value={values.description}
                                style={{resize:'none', minHeight:'100px'}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;
