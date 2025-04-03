import React from 'react';
import { useFormikContext } from 'formik';
import { IProductPayload } from 'Interfaces';
import { Tooltip } from '@mui/material';

const ProductDetails: React.FC = () => {
    const { values, handleChange, touched, errors } = useFormikContext<IProductPayload>();

    const renderFormField = (
        label: string,
        name: string,
        icon: string,
        tooltip?: string,
        type: string = "text",
        col: string = "col-md-6 col-lg-4"
    ) => (
        <div className={`${col} mb-3`}>
            <div className="form-group">
                <Tooltip title={tooltip || label} arrow placement="top">
                    <label htmlFor={name} className="d-flex align-items-center gap-2 mb-2">
                        <i className={`ti ti-${icon} text-primary`}></i>
                        {label}
                    </label>
                </Tooltip>
                {type === "textarea" ? (
                    <textarea
                        id={name}
                        name={name}
                        className={`form-control ${touched.product_details?.[name.split('.')[2]] && errors.product_details?.[name.split('.')[2]] ? 'is-invalid' : ''}`}
                        onChange={handleChange}
                        value={values.product_details[name.split('.')[2]] || ''}
                        rows={4}
                    />
                ) : (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        className={`form-control ${touched.product_details?.[name.split('.')[2]] && errors.product_details?.[name.split('.')[2]] ? 'is-invalid' : ''}`}
                        onChange={handleChange}
                        value={values.product_details[name.split('.')[2]] || ''}
                    />
                )}
                {touched.product_details?.[name.split('.')[2]] && errors.product_details?.[name.split('.')[2]] && (
                    <div className="invalid-feedback d-flex align-items-center">
                        <i className="ti ti-alert-circle me-2"></i>
                        <span>{errors.product_details[name.split('.')[2]]}</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="product-details-form">
            {/* Basic Information */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light border-0">
                    <h6 className="mb-0 d-flex align-items-center">
                        <i className="ti ti-info-circle me-2 text-primary"></i>
                        Basic Information
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        {renderFormField(
                            "Brand",
                            "product_details.brand",
                            "building-store",
                            "Enter the product's brand name"
                        )}
                        {renderFormField(
                            "Model",
                            "product_details.model",
                            "tag",
                            "Enter the product's model name/number"
                        )}
                    </div>
                </div>
            </div>

            {/* Physical Properties */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light border-0">
                    <h6 className="mb-0 d-flex align-items-center">
                        <i className="ti ti-ruler me-2 text-primary"></i>
                        Physical Properties
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        {renderFormField(
                            "Size",
                            "product_details.size",
                            "ruler-2",
                            "Product size"
                        )}
                        {renderFormField(
                            "Dimensions",
                            "product_details.dimensions",
                            "ruler-2",
                            "Product dimensions"
                        )}
                        {renderFormField(
                            "Length",
                            "product_details.length",
                            "ruler-2",
                            "Product length"
                        )}
                        {renderFormField(
                            "Width",
                            "product_details.width",
                            "ruler-2",
                            "Product width"
                        )}
                        {renderFormField(
                            "Height",
                            "product_details.height",
                            "ruler-2",
                            "Product height"
                        )}
                        {renderFormField(
                            "Thickness",
                            "product_details.thickness",
                            "ruler-2",
                            "Product thickness"
                        )}
                        {renderFormField(
                            "Diameter",
                            "product_details.diameter",
                            "circle",
                            "Product diameter"
                        )}
                        {renderFormField(
                            "Weight",
                            "product_details.weight",
                            "weight",
                            "Product weight"
                        )}
                        {renderFormField(
                            "Color",
                            "product_details.color",
                            "palette",
                            "Product color"
                        )}
                        {renderFormField(
                            "Material",
                            "product_details.material",
                            "box",
                            "Main material"
                        )}
                        {renderFormField(
                            "Finish",
                            "product_details.finish",
                            "brush",
                            "Surface finish"
                        )}
                        {renderFormField(
                            "Shape",
                            "product_details.shape",
                            "shape",
                            "Product shape"
                        )}
                        {renderFormField(
                            "Pattern",
                            "product_details.pattern",
                            "artboard",
                            "Product pattern"
                        )}
                        {renderFormField(
                            "Texture",
                            "product_details.texture",
                            "grain",
                            "Surface texture"
                        )}
                    </div>
                </div>
            </div>

            {/* Technical Specifications */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light border-0">
                    <h6 className="mb-0 d-flex align-items-center">
                        <i className="ti ti-settings me-2 text-primary"></i>
                        Technical Specifications
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        {renderFormField(
                            "Power",
                            "product_details.power",
                            "bolt",
                            "Power rating"
                        )}
                        {renderFormField(
                            "Voltage",
                            "product_details.voltage",
                            "bolt",
                            "Voltage specification"
                        )}
                        {renderFormField(
                            "Voltage Rating",
                            "product_details.voltage_rating",
                            "bolt",
                            "Voltage rating"
                        )}
                        {renderFormField(
                            "Current Rating",
                            "product_details.current_rating",
                            "bolt",
                            "Current rating"
                        )}
                        {renderFormField(
                            "Capacity",
                            "product_details.capacity",
                            "box",
                            "Capacity"
                        )}
                        {renderFormField(
                            "Capacity (Volume)",
                            "product_details.capacity_volume",
                            "box",
                            "Volume capacity"
                        )}
                        {renderFormField(
                            "Capacity (Weight)",
                            "product_details.capacity_weight",
                            "weight",
                            "Weight capacity"
                        )}
                        {renderFormField(
                            "Flow Rate",
                            "product_details.flow_rate",
                            "arrows-right-left",
                            "Flow rate"
                        )}
                        {renderFormField(
                            "Pressure",
                            "product_details.pressure",
                            "gauge",
                            "Pressure rating"
                        )}
                        {renderFormField(
                            "Temperature",
                            "product_details.temperature",
                            "temperature",
                            "Temperature rating"
                        )}
                        {renderFormField(
                            "Gauge",
                            "product_details.gauge",
                            "ruler",
                            "Gauge specification"
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Details */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-light border-0">
                    <h6 className="mb-0 d-flex align-items-center">
                        <i className="ti ti-list-details me-2 text-primary"></i>
                        Additional Details
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        {renderFormField(
                            "Quality Class",
                            "product_details.quality_class",
                            "star",
                            "Product quality classification"
                        )}
                        {renderFormField(
                            "Grade",
                            "product_details.grade",
                            "star",
                            "Product grade"
                        )}
                        {renderFormField(
                            "Style",
                            "product_details.style",
                            "brush",
                            "Product style"
                        )}
                        {renderFormField(
                            "Usage",
                            "product_details.usage",
                            "tool",
                            "Product usage"
                        )}
                        {renderFormField(
                            "Features",
                            "product_details.features",
                            "list-check",
                            "Product features",
                            "textarea"
                        )}
                        {renderFormField(
                            "Application",
                            "product_details.application",
                            "apps",
                            "Product application"
                        )}
                        {renderFormField(
                            "Compatibility",
                            "product_details.compatibility",
                            "puzzle",
                            "Product compatibility"
                        )}
                        {renderFormField(
                            "Warranty",
                            "product_details.warranty",
                            "shield-check",
                            "Warranty information"
                        )}
                        {renderFormField(
                            "Notes",
                            "product_details.notes",
                            "notes",
                            "Additional notes",
                            "textarea"
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
