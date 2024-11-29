import React, {useState, useEffect, useCallback} from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import { Multiselect } from 'multiselect-react-dropdown';
import SupplyAPI from "Data/Api/Suppliers.ts";
import {ISupply} from "Data/Interfaces/Supply.ts";
import { IProductPayload } from 'Interfaces';

interface Supplier extends  ISupply{}

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
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


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <div className="row">
            <div className="col-12 mx-auto">
                <div className="row">
                    <AnimatePresence>
                        <FieldArray name="suppliers">
                            {({ remove, push }) => (
                                <div className="col-12 mb-3">
                                    <div className='row'>
                                        <div className="col-12 mb-3">
                                            <div className="form-group">
                                                <label>Choose Suppliers or create a new one</label>
                                                <Multiselect
                                                    options={suppliers ?? []}
                                                    selectedValues={selectedSuppliers ?? []}
                                                    onSelect={handleSupplierSelect}
                                                    onRemove={handleSupplierSelect}
                                                    displayValue="name"
                                                    loading={loading}
                                                />
                                            </div>
                                        </div>
                                        <motion.button
                                            className='btn col-3 btn-success ms-3 btn-add d-flex justify-content-center align-items-center'
                                            type="button"
                                            onClick={() => push({name: '', contact_info: ''})}
                                            variants={buttonVariants}
                                            style={{
                                                borderRadius: "12px",
                                                width: '100px',
                                                height: '100px'
                                            }}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            <i className='ti ti-plus text-white' style={{transform: "scale(2)"}}></i>
                                        </motion.button>
                                        {values.suppliers.map((supplier: Supplier, index: number) => (
                                            <motion.div
                                                className='col-4'
                                                key={index}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={itemVariants}
                                            >
                                                <div className="position-relative p-2 my-2 border border-1 rounded-2">
                                                    <div className="mx-auto">
                                                        <div key={index} className="form-group">
                                                            <label htmlFor={`suppliers[${index}].name`}>Supplier
                                                                Name</label>
                                                            <input
                                                                type="text"
                                                                name={`suppliers[${index}].name`}
                                                                className="form-control"
                                                                onChange={handleChange}
                                                                value={supplier.name}
                                                            />
                                                            <label htmlFor={`suppliers[${index}].contact_info`}>Contact
                                                                Info</label>
                                                            <input
                                                                type="text"
                                                                name={`suppliers[${index}].contact_info`}
                                                                className="form-control"
                                                                onChange={handleChange}
                                                                value={supplier.contact_info}
                                                            />
                                                            <span
                                                                onClick={() => remove(index)}
                                                                className='wrapper-btn p-1 d-flex justify-content-center align-items-center bg-danger text-white'
                                                                style={{
                                                                    position: 'absolute',
                                                                    right: '4px',
                                                                    top: '4px',
                                                                    borderRadius: '50%',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <i className='ti ti-x text-white'></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
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
