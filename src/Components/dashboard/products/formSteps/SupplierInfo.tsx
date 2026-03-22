import React, { useState, useEffect, useCallback } from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import { Multiselect } from 'multiselect-react-dropdown';
import SupplyAPI from "Data/Api/Suppliers.ts";
import { ISupply } from "Data/Interfaces/Supply.ts";
import { IProductPayload } from 'Data/Interfaces/Product';
import { Box, Typography, Button, TextField, Card, IconButton, Tooltip, Grid, InputAdornment } from '@mui/material';
import { TbUsers, TbSearch, TbTrash, TbBuildingStore, TbPhone, TbUserPlus } from 'react-icons/tb';
import './SupplierInfo.scss';

interface Supplier extends ISupply { }

interface ISupplyInfoProps {
    suppliersRecord: ISupply[]
}

const SupplierInfo: React.FC<ISupplyInfoProps> = ({ suppliersRecord }) => {
    const { values, handleChange, setFieldValue, handleBlur } = useFormikContext<IProductPayload>();
    const [loading, setLoading] = useState(false);
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

    const getSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const { data: __suppliers } = await SupplyAPI.index();
            const allSuppliers = __suppliers as ISupply[] | null;
            setSuppliers(allSuppliers);
            if (suppliersRecord && allSuppliers) {
                const preselected = allSuppliers.filter(s => 
                    suppliersRecord.some(rs => rs.id === s.id)
                );
                setSelectedSupplier(preselected);
            }
        } catch (e) {
            console.error('Error fetching suppliers: ', e);
        } finally {
            setLoading(false);
        }
    }, [suppliersRecord]);

    useEffect(() => {
        getSuppliers();
    }, [getSuppliers, suppliersRecord]);

    return (
        <Box className="supplier-info-modern">
            <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                        <TbUsers size={24} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Gestion des Fournisseurs</Typography>
                </Box>

                <FieldArray name="suppliers">
                    {({ remove, push }) => (
                        <Box>
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={8}>
                                    <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                            <TbSearch size={18} color="#4f46e5" />
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Fournisseurs Existants
                                            </Typography>
                                        </Box>
                                        <Multiselect
                                            options={suppliers ?? []}
                                            selectedValues={selectedSuppliers ?? []}
                                            onSelect={handleSupplierSelect}
                                            onRemove={handleSupplierSelect}
                                            displayValue="name"
                                            loading={loading}
                                            placeholder="Rechercher un fournisseur..."
                                            style={{
                                                chips: { background: '#4f46e5', borderRadius: '8px', fontWeight: 600 },
                                                searchBox: { border: 'none', background: 'transparent', padding: '0' },
                                                inputField: { color: '#1e293b' }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'stretch' }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => push({ name: '', contact_info: '' })}
                                        startIcon={<TbUserPlus size={22} />}
                                        sx={{
                                            borderRadius: '16px',
                                            borderStyle: 'dashed',
                                            borderWidth: '2px',
                                            fontWeight: 800,
                                            color: '#4f46e5',
                                            borderColor: '#cbd5e1',
                                            textTransform: 'none',
                                            '&:hover': { borderWidth: '2px', borderColor: '#4f46e5', bgcolor: 'rgba(79, 70, 229, 0.05)' }
                                        }}
                                    >
                                        Nouveau Fournisseur
                                    </Button>
                                </Grid>
                            </Grid>

                            <Box sx={{ flexGrow: 1 }}>
                                <Grid container spacing={3}>
                                    <AnimatePresence mode="popLayout">
                                        {(values.suppliers || []).map((supplier: Supplier, index: number) => (
                                            <Grid item xs={12} md={6} lg={4} key={index}>
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                                >
                                                    <Card sx={{
                                                        p: 3,
                                                        borderRadius: '20px',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                                        position: 'relative',
                                                        overflow: 'visible',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            borderColor: '#4f46e5',
                                                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.1)',
                                                            transform: 'translateY(-4px)'
                                                        }
                                                    }}>
                                                        <Tooltip title="Retirer" arrow>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => remove(index)}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: -12,
                                                                    right: -12,
                                                                    bgcolor: '#fff',
                                                                    color: '#ef4444',
                                                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                                                    border: '1px solid #fee2e2',
                                                                    '&:hover': { bgcolor: '#ef4444', color: '#fff' }
                                                                }}
                                                            >
                                                                <TbTrash size={18} />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                                            <TextField
                                                                fullWidth
                                                                label="Nom du Fournisseur"
                                                                name={`suppliers[${index}].name`}
                                                                value={supplier.name}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                placeholder="ex: Global Furniture Co."
                                                                variant="outlined"
                                                                size="small"
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <TbBuildingStore size={18} color="#64748b" />
                                                                        </InputAdornment>
                                                                    ),
                                                                    sx: { borderRadius: '12px' }
                                                                }}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Contact Info"
                                                                name={`suppliers[${index}].contact_info`}
                                                                value={supplier.contact_info}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                placeholder="Email, téléphone, etc."
                                                                variant="outlined"
                                                                size="small"
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <TbPhone size={18} color="#64748b" />
                                                                        </InputAdornment>
                                                                    ),
                                                                    sx: { borderRadius: '12px' }
                                                                }}
                                                            />
                                                        </Box>
                                                    </Card>
                                                </motion.div>
                                            </Grid>
                                        ))}
                                    </AnimatePresence>
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </FieldArray>
            </Box>
        </Box>
    );
};

export default SupplierInfo;
