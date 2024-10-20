import React from 'react';
import { useFormikContext } from 'formik';
import { IProductPayload } from 'Interfaces';

const ProductDetails: React.FC = () => {
    const { values, handleChange, touched, errors } = useFormikContext<IProductPayload>();

    return (
        <div className="row">
            <div className="col-12 mx-auto">
                <div className="row gap-10">
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.size">Size</label>
                            <input
                                id="product_details.size"
                                name="product_details.size"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.size}
                            />
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.quality_class">Quality Class</label>
                            <input
                                id="product_details.quality_class"
                                name="product_details.quality_class"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.quality_class}
                            />
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.material">Material</label>
                            <input
                                id="product_details.material"
                                name="product_details.material"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.material}
                            />
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.color">Color</label>
                            <input
                                id="product_details.color"
                                name="product_details.color"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.color}
                            />
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.brand">Brand</label>
                            <input
                                id="product_details.brand"
                                name="product_details.brand"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.brand}
                            />
                            {touched.product_details?.brand && errors.product_details?.brand && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.brand}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.model">Model</label>
                            <input
                                id="product_details.model"
                                name="product_details.model"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.model}
                            />
                            {touched.product_details?.model && errors.product_details?.model && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.model}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.weight">Weight</label>
                            <input
                                id="product_details.weight"
                                name="product_details.weight"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.weight}
                            />
                            {touched.product_details?.weight && errors.product_details?.weight && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.weight}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.height">Height</label>
                            <input
                                id="product_details.height"
                                name="product_details.height"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.height}
                            />
                            {touched.product_details?.height && errors.product_details?.height && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.height}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.dimensions">Dimensions</label>
                            <input
                                id="product_details.dimensions"
                                name="product_details.dimensions"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.dimensions}
                            />
                            {touched.product_details?.dimensions && errors.product_details?.dimensions && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.dimensions}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.power">Power</label>
                            <input
                                id="product_details.power"
                                name="product_details.power"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.power}
                            />
                            {touched.product_details?.power && errors.product_details?.power && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.power}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.voltage">Voltage</label>
                            <input
                                id="product_details.voltage"
                                name="product_details.voltage"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.voltage}
                            />
                            {touched.product_details?.voltage && errors.product_details?.voltage && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.voltage}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.capacity">Capacity</label>
                            <input
                                id="product_details.capacity"
                                name="product_details.capacity"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.capacity}
                            />
                            {touched.product_details?.capacity && errors.product_details?.capacity && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.capacity}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.pressure">Pressure</label>
                            <input
                                id="product_details.pressure"
                                name="product_details.pressure"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.pressure}
                            />
                            {touched.product_details?.pressure && errors.product_details?.pressure && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.pressure}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.temperature">Temperature</label>
                            <input
                                id="product_details.temperature"
                                name="product_details.temperature"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.temperature}
                            />
                            {touched.product_details?.temperature && errors.product_details?.temperature && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.temperature}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.usage">Usage</label>
                            <input
                                id="product_details.usage"
                                name="product_details.usage"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.usage}
                            />
                            {touched.product_details?.usage && errors.product_details?.usage && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.usage}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.features">Features</label>
                            <textarea
                                id="product_details.features"
                                name="product_details.features"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.features}
                            />
                            {touched.product_details?.features && errors.product_details?.features && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.features}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.notes">Notes</label>
                            <textarea
                                id="product_details.notes"
                                name="product_details.notes"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.notes}
                            />
                            {touched.product_details?.notes && errors.product_details?.notes && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.warranty">Warranty</label>
                            <input
                                id="product_details.warranty"
                                name="product_details.warranty"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.warranty}
                            />
                            {touched.product_details?.warranty && errors.product_details?.warranty && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.warranty}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.compatibility">Compatibility</label>
                            <input
                                id="product_details.compatibility"
                                name="product_details.compatibility"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.compatibility}
                            />
                            {touched.product_details?.compatibility && errors.product_details?.compatibility && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.compatibility}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.finish">Finish</label>
                            <input
                                id="product_details.finish"
                                name="product_details.finish"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.finish}
                            />
                            {touched.product_details?.finish && errors.product_details?.finish && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.finish}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.shape">Shape</label>
                            <input
                                id="product_details.shape"
                                name="product_details.shape"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.shape}
                            />
                            {touched.product_details?.shape && errors.product_details?.shape && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.shape}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.style">Style</label>
                            <input
                                id="product_details.style"
                                name="product_details.style"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.style}
                            />
                            {touched.product_details?.style && errors.product_details?.style && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.style}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.pattern">Pattern</label>
                            <input
                                id="product_details.pattern"
                                name="product_details.pattern"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.pattern}
                            />
                            {touched.product_details?.pattern && errors.product_details?.pattern && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.pattern}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.grade">Grade</label>
                            <input
                                id="product_details.grade"
                                name="product_details.grade"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.grade}
                            />
                            {touched.product_details?.grade && errors.product_details?.grade && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.grade}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-4 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.texture">Texture</label>
                            <input
                                id="product_details.texture"
                                name="product_details.texture"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.texture}
                            />
                            {touched.product_details?.texture && errors.product_details?.texture && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.texture}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.application">Application</label>
                            <input
                                id="product_details.application"
                                name="product_details.application"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.application}
                            />
                            {touched.product_details?.application && errors.product_details?.application && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.application}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.gauge">Gauge</label>
                            <input
                                id="product_details.gauge"
                                name="product_details.gauge"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.gauge}
                            />
                            {touched.product_details?.gauge && errors.product_details?.gauge && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.gauge}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.diameter">Diameter</label>
                            <input
                                id="product_details.diameter"
                                name="product_details.diameter"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.diameter}
                            />
                            {touched.product_details?.diameter && errors.product_details?.diameter && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.diameter}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.length">Length</label>
                            <input
                                id="product_details.length"
                                name="product_details.length"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.length}
                            />
                            {touched.product_details?.length && errors.product_details?.length && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.length}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.width">Width</label>
                            <input
                                id="product_details.width"
                                name="product_details.width"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.width}
                            />
                            {touched.product_details?.width && errors.product_details?.width && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.width}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.thickness">Thickness</label>
                            <input
                                id="product_details.thickness"
                                name="product_details.thickness"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.thickness}
                            />
                            {touched.product_details?.thickness && errors.product_details?.thickness && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.thickness}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.capacity_volume">Capacity (Volume)</label>
                            <input
                                id="product_details.capacity_volume"
                                name="product_details.capacity_volume"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.capacity_volume}
                            />
                            {touched.product_details?.capacity_volume && errors.product_details?.capacity_volume && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.capacity_volume}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.capacity_weight">Capacity (Weight)</label>
                            <input
                                id="product_details.capacity_weight"
                                name="product_details.capacity_weight"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.capacity_weight}
                            />
                            {touched.product_details?.capacity_weight && errors.product_details?.capacity_weight && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.capacity_weight}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-3 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.flow_rate">Flow Rate</label>
                            <input
                                id="product_details.flow_rate"
                                name="product_details.flow_rate"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.flow_rate}
                            />
                            {touched.product_details?.flow_rate && errors.product_details?.flow_rate && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.flow_rate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.voltage_rating">Voltage Rating</label>
                            <input
                                id="product_details.voltage_rating"
                                name="product_details.voltage_rating"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.voltage_rating}
                            />
                            {touched.product_details?.voltage_rating && errors.product_details?.voltage_rating && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.voltage_rating}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-2 mb-3">
                        <div className="form-group">
                            <label htmlFor="product_details.current_rating">Current Rating</label>
                            <input
                                id="product_details.current_rating"
                                name="product_details.current_rating"
                                type="text"
                                className="form-control"
                                onChange={handleChange}
                                value={values.product_details.current_rating}
                            />
                            {touched.product_details?.current_rating && errors.product_details?.current_rating && (
                                <div className="text fs-10 text-danger d-flex align-items-center">
                                    <i className="ti ti-alert-circle me-2"></i>
                                    <span>{errors.product_details.current_rating}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
