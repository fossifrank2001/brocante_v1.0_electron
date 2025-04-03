import React, {useState, useEffect, useCallback} from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import { Multiselect } from 'multiselect-react-dropdown';
import SupplyAPI from "Data/Api/Suppliers.ts";
import {ISupply} from "Data/Interfaces/Supply.ts";
import { IProductPayload } from 'Interfaces';
import { Tooltip } from '@mui/material';
import './SupplierInfo.scss';

interface Supplier extends  ISupply{}

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    exit: { 
        opacity: 0, 
        y: 20,
        transition: {
            duration: 0.2
        }
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

interface ISupplyInfoProps {
    suppliersRecord: ISupply[]
}

const SupplierInfo: React.FC <ISupplyInfoProps> = ({suppliersRecord}) => {
    const { values, handleChange, setFieldValue } = useFormikContext<IProductPayload>();
    const [loading, setLoading] = useState(false);

    const [_qSupply] = useState('');
    const [suppliers, setSuppliers] = useState<ISupply[] | null>(null);
    const [selectedSuppliers, setSelectedSupplier] = useState<ISupply[] | null>(null);

    const handleSupplierSelect = (selectedList: ISupply[]) => {
        const newWrapperList = selectedList.map(_supply => ({
            name: _supply.name,
            contact_info: _supply.contact_info
        }));

        setFieldValue('suppliers', newWrapperList);
        setSelectedSupplier(selectedList);
    };

    const getSuppliers = useCallback(async (_q:string)=>{
        try {
            setLoading(true)
            const {data: __suppliers} = await SupplyAPI.index();
            setSuppliers(__suppliers as ISupply[] | null);
            if(suppliersRecord){
                setSelectedSupplier(suppliersRecord)
            }
        }catch (e){
            console.error('Error adding new supplier: ', e);
        }finally {
            setLoading(false)
        }
    }, [suppliersRecord])

    useEffect(() => {
        getSuppliers(_qSupply)
    }, [getSuppliers, _qSupply, suppliersRecord]);

    return (
        <div className="supplier-info">
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light border-0">
                    <h6 className="mb-0 d-flex align-items-center">
                        <i className="ti ti-users me-2 text-primary"></i>
                        Supplier Management
                    </h6>
                </div>
                <div className="card-body">
                    <AnimatePresence>
                        <FieldArray name="suppliers">
                            {({ remove, push }) => (
                                <div>
                                    <div className="row mb-4">
                                        <div className="col-md-9">
                                            <div className="form-group">
                                                <label className="d-flex align-items-center gap-2 mb-2">
                                                    <i className="ti ti-search text-primary"></i>
                                                    Select Existing Suppliers
                                                </label>
                                                <Multiselect
                                                    options={suppliers ?? []}
                                                    selectedValues={selectedSuppliers ?? []}
                                                    onSelect={handleSupplierSelect}
                                                    onRemove={handleSupplierSelect}
                                                    displayValue="name"
                                                    loading={loading}
                                                    placeholder="Search and select suppliers..."
                                                    style={{
                                                        chips: { background: '#4318FF' },
                                                        searchBox: { 
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            padding: '8px'
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3 d-flex align-items-end">
                                            <Tooltip title="Add New Supplier" arrow placement="top">
                                                <motion.button
                                                    className='btn btn-primary w-100'
                                                    type="button"
                                                    onClick={() => push({name: '', contact_info: ''})}
                                                    variants={buttonVariants}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                >
                                                    <i className='ti ti-plus me-2'></i>
                                                    New Supplier
                                                </motion.button>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <motion.div 
                                        className="row g-3"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {values.suppliers.map((supplier: Supplier, index: number) => (
                                            <motion.div
                                                className='col-md-6 col-lg-4'
                                                key={index}
                                                variants={itemVariants}
                                                layout
                                            >
                                                <div className="card h-100 border position-relative supplier-card">
                                                    <div className="card-body">
                                                        <Tooltip title="Remove Supplier" arrow placement="top">
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className='btn btn-icon btn-sm btn-danger position-absolute top-0 end-0 m-2'
                                                                style={{ borderRadius: '50%' }}
                                                            >
                                                                <i className='ti ti-x'></i>
                                                            </button>
                                                        </Tooltip>

                                                        <div className="form-group mb-3">
                                                            <label className="d-flex align-items-center gap-2 text-muted mb-2">
                                                                <i className="ti ti-building-store text-primary"></i>
                                                                Supplier Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name={`suppliers[${index}].name`}
                                                                className="form-control"
                                                                onChange={handleChange}
                                                                value={supplier.name}
                                                                placeholder="Enter supplier name"
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="d-flex align-items-center gap-2 text-muted mb-2">
                                                                <i className="ti ti-phone text-primary"></i>
                                                                Contact Info
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name={`suppliers[${index}].contact_info`}
                                                                className="form-control"
                                                                onChange={handleChange}
                                                                value={supplier.contact_info}
                                                                placeholder="Enter contact information"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}
                        </FieldArray>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SupplierInfo;
