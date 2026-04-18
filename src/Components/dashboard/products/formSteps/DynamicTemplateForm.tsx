import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, TextField, Select, MenuItem, FormControl,
    InputLabel, Switch, FormControlLabel, InputAdornment, Chip, Alert,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Divider,
    Tooltip, Fade
} from '@mui/material';
import { 
    TbTemplate, 
    TbChevronDown, 
    TbInfoCircle, 
    TbLayoutGrid, 
    TbFileDescription,
    TbAbacus,
    TbListSearch,
    TbCalendar,
    TbToggleRight
} from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import ProductTemplateAPI from 'Data/Api/ProductTemplate';
import { IProductTemplate, ITemplateField } from 'Data/Interfaces/ProductTemplate';
import { useAppContext } from "@/contexts/appContext";

interface SubCategoryTemplates {
    subCategoryId: number;
    subCategoryName: string;
    templates: IProductTemplate[];
    selectedTemplateId: number | null;
}

interface DynamicTemplateFormProps {
    subCategories: Array<{ id: number; label: string }>;
    templateId: number | null; // Deprecated
    templateValues: Record<string, any>;
    onTemplateChange: (templateId: number | null) => void; // Deprecated
    onValuesChange: (values: Record<string, any>) => void;
}

const DynamicTemplateForm: React.FC<DynamicTemplateFormProps> = ({
    subCategories,
    templateValues,
    onValuesChange,
}) => {
    const { t } = useTranslation();
    const context = useAppContext();
    const [subCategoryTemplates, setSubCategoryTemplates] = useState<SubCategoryTemplates[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [expandedAccordions, setExpandedAccordions] = useState<Set<number>>(new Set());

    const subCategoryIds = subCategories.map(s => s.id);

    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'text': return <TbFileDescription size={20} />;
            case 'number': return <TbAbacus size={20} />;
            case 'select': return <TbListSearch size={20} />;
            case 'date': return <TbCalendar size={20} />;
            case 'boolean': return <TbToggleRight size={20} />;
            default: return <TbInfoCircle size={20} />;
        }
    };

    // Load templates for ALL selected subcategories
    useEffect(() => {
        const loadTemplates = async () => {
            if (!subCategories || subCategories.length === 0) {
                setSubCategoryTemplates([]);
                return;
            }

            setLoading(true);
            try {
                // Load templates for each subcategory in parallel
                const promises = subCategories.map(async (subCat) => {
                    const response = await ProductTemplateAPI.index(subCat.id);
                    const loadedTemplates = response.data || [];
                    
                    // Auto-select default template
                    const defaultTemplate = loadedTemplates.find(t => t.is_default) || loadedTemplates[0];
                    
                    return {
                        subCategoryId: subCat.id,
                        subCategoryName: subCat.label,
                        templates: loadedTemplates,
                        selectedTemplateId: defaultTemplate?.id || null
                    };
                });

                const results = await Promise.all(promises);
                setSubCategoryTemplates(results.filter(r => r.templates.length > 0));
                
                // Auto-expand all accordions so user doesn't forget to fill fields
                if (results.length > 0) {
                    setExpandedAccordions(new Set(results.map(r => r.subCategoryId)));
                }

                // Initialize default values for all templates
                const defaults: Record<string, any> = {};
                results.forEach(({ templates, selectedTemplateId }) => {
                    const template = templates.find(t => t.id === selectedTemplateId);
                    if (template) {
                        template.fields.forEach(field => {
                            const fieldKey = `${template.id}_${field.field_key}`;
                            if (field.default_value && !templateValues[fieldKey]) {
                                defaults[fieldKey] = field.default_value;
                            }
                        });
                    }
                });
                
                // Update the main template_id (first one selected)
                const firstSelected = results.find(r => r.selectedTemplateId !== null);
                onTemplateChange(firstSelected ? firstSelected.selectedTemplateId : null);

                if (Object.keys(defaults).length > 0) {
                    onValuesChange({ ...templateValues, ...defaults });
                }
            } catch (error) {
                console.error('Failed to load templates:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, [subCategoryIds.join(',')]);

    const handleTemplateSelect = (subCategoryId: number, id: number | '') => {
        const updatedTemplates = subCategoryTemplates.map(sct => 
            sct.subCategoryId === subCategoryId 
                ? { ...sct, selectedTemplateId: id === '' ? null : id as number }
                : sct
        );
        setSubCategoryTemplates(updatedTemplates);

        // Update the main template_id (first one selected)
        const firstSelected = updatedTemplates.find(sct => sct.selectedTemplateId !== null);
        onTemplateChange(firstSelected ? firstSelected.selectedTemplateId : null);

        // Update template values
        const subCat = subCategoryTemplates.find(sct => sct.subCategoryId === subCategoryId);
        if (!subCat) return;

        const template = subCat.templates.find(t => t.id === id);
        if (!template) {
            // Remove all values for this subcategory's templates
            const newValues = { ...templateValues };
            subCat.templates.forEach(t => {
                t.fields.forEach(f => {
                    delete newValues[`${t.id}_${f.field_key}`];
                });
            });
            onValuesChange(newValues);
            return;
        }

        // Add defaults for new template
        const newValues: Record<string, any> = { ...templateValues };
        template.fields.forEach(field => {
            const fieldKey = `${template.id}_${field.field_key}`;
            if (newValues[fieldKey] === undefined && field.default_value) {
                newValues[fieldKey] = field.default_value;
            }
        });
        onValuesChange(newValues);
    };

    const handleAccordionToggle = (subCategoryId: number) => {
        setExpandedAccordions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subCategoryId)) {
                newSet.delete(subCategoryId);
            } else {
                newSet.add(subCategoryId);
            }
            return newSet;
        });
    };

    const handleFieldChange = (templateId: number, fieldKey: string, value: any) => {
        const fullKey = `${templateId}_${fieldKey}`;
        const updated = { ...templateValues, [fullKey]: value };
        onValuesChange(updated);

        // Clear error for this field
        if (errors[fullKey]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[fullKey];
                return next;
            });
        }
    };

    const renderField = (templateId: number, field: ITemplateField) => {
        const fullKey = `${templateId}_${field.field_key}`;
        const value = templateValues[fullKey] ?? '';
        const hasError = !!errors[fullKey];

        switch (field.field_type) {
            case 'text':
                return (
                    <TextField
                        fullWidth
                        label={field.is_required ? `${field.name} *` : field.name}
                        value={value}
                        onChange={e => handleFieldChange(templateId, field.field_key, e.target.value)}
                        required={field.is_required}
                        placeholder={field.placeholder || ''}
                        error={hasError}
                        helperText={hasError ? errors[fullKey] : ''}
                        variant="outlined"
                        InputLabelProps={{
                            sx: field.is_required ? { '& .MuiFormLabel-asterisk': { display: 'none' } } : {}
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box sx={{ color: '#64748b', display: 'flex' }}>
                                        {getFieldIcon('text')}
                                    </Box>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: '14px',
                                bgcolor: 'var(--input-bg)',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'var(--bg-secondary)' }
                            }
                        }}
                    />
                );

            case 'number':
                return (
                    <TextField
                        fullWidth
                        label={field.is_required ? `${field.name} *` : field.name}
                        type="number"
                        value={value}
                        onChange={e => handleFieldChange(templateId, field.field_key, e.target.value)}
                        required={field.is_required}
                        placeholder={field.placeholder || ''}
                        error={hasError}
                        helperText={hasError ? errors[fullKey] : ''}
                        variant="outlined"
                        InputLabelProps={{
                            sx: field.is_required ? { '& .MuiFormLabel-asterisk': { display: 'none' } } : {}
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box sx={{ color: '#64748b', display: 'flex' }}>
                                        {getFieldIcon('number')}
                                    </Box>
                                </InputAdornment>
                            ),
                            endAdornment: field.unit ? (
                                <InputAdornment position="end">
                                    <Chip 
                                        label={field.unit} 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: 'rgba(79, 70, 229, 0.1)', 
                                            color: '#4f46e5', 
                                            fontWeight: 700,
                                            height: 24,
                                            borderRadius: '8px'
                                        }} 
                                    />
                                </InputAdornment>
                            ) : undefined,
                            sx: { 
                                borderRadius: '14px', 
                                bgcolor: 'var(--input-bg)',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'var(--bg-secondary)' }
                            }
                        }}
                    />
                );

            case 'select':
                return (
                    <FormControl fullWidth error={hasError} required={field.is_required}>
                        <InputLabel sx={{ ml: 4 }}>{field.name}</InputLabel>
                        <Select
                            value={value}
                            label={field.name}
                            onChange={e => handleFieldChange(templateId, field.field_key, e.target.value)}
                            required={field.is_required}
                            startAdornment={
                                <InputAdornment position="start" sx={{ mr: 1 }}>
                                    <Box sx={{ color: '#64748b', display: 'flex' }}>
                                        {getFieldIcon('select')}
                                    </Box>
                                </InputAdornment>
                            }
                            sx={{ 
                                borderRadius: '14px', 
                                bgcolor: 'var(--input-bg)',
                                '& .MuiSelect-select': { pl: 0 },
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'var(--bg-secondary)' }
                            }}
                        >
                            <MenuItem value="">
                                <em>-- {t('common.select')} --</em>
                            </MenuItem>
                            {(field.options || []).map((opt, i) => (
                                <MenuItem key={i} value={opt}>{opt}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case 'boolean':
                return (
                    <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '14px', 
                        bgcolor: 'var(--input-bg)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'var(--bg-secondary)', borderColor: 'rgba(79, 70, 229, 0.2)' }
                    }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={value === true || value === 'true'}
                                    onChange={e => handleFieldChange(templateId, field.field_key, e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ color: '#64748b', display: 'flex' }}>
                                        {getFieldIcon('boolean')}
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                        {field.is_required ? `${field.name} *` : field.name}
                                    </Typography>
                                </Box>
                            }
                            sx={{ ml: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                        />
                    </Box>
                );

            case 'date':
                return (
                    <TextField
                        fullWidth
                        label={field.is_required ? `${field.name} *` : field.name}
                        type="date"
                        value={value}
                        onChange={e => handleFieldChange(templateId, field.field_key, e.target.value)}
                        required={field.is_required}
                        error={hasError}
                        helperText={hasError ? errors[fullKey] : ''}
                        variant="outlined"
                        InputLabelProps={{ shrink: true, sx: field.is_required ? { '& .MuiFormLabel-asterisk': { display: 'none' } } : {} }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box sx={{ color: '#64748b', display: 'flex' }}>
                                        {getFieldIcon('date')}
                                    </Box>
                                </InputAdornment>
                            ),
                            sx: { 
                                borderRadius: '14px', 
                                bgcolor: 'var(--input-bg)',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'var(--bg-secondary)' }
                            }
                        }}
                    />
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (subCategoryTemplates.length === 0 && subCategoryIds.length > 0) {
        return (
            <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                {t('template.noTemplateDefinedForSubcategory')}
            </Alert>
        );
    }

    if (subCategoryTemplates.length === 0) {
        return null;
    }

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 4,
                    p: 2.5,
                }}>
                    <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '14px', 
                        bgcolor: 'rgba(79, 70, 229, 0.1)', 
                        color: '#4f46e5', 
                        display: 'flex',
                    }}>
                        <TbTemplate size={24} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                            {t('product.templates')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TbInfoCircle size={14} />
                            {t('product.multipleTemplatesInfo')}
                        </Typography>
                    </Box>
                </Box>
            </motion.div>

            <AnimatePresence>
                {subCategoryTemplates.map((subCat, index) => {
                    const selectedTemplate = subCat.templates.find(t => t.id === subCat.selectedTemplateId);
                    
                    return (
                        <motion.div
                            key={subCat.subCategoryId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Accordion
                                expanded={expandedAccordions.has(subCat.subCategoryId)}
                                onChange={() => handleAccordionToggle(subCat.subCategoryId)}
                                sx={{
                                    mb: 3,
                                    overflow: 'hidden',
                                    '&:before': { display: 'none' },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: 'none'
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={
                                        <Box sx={{ 
                                            p: 0.5, 
                                            bgcolor: expandedAccordions.has(subCat.subCategoryId) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                            color: expandedAccordions.has(subCat.subCategoryId) ? '#4f46e5' : '#64748b',
                                            transition: 'all 0.2s'
                                        }}>
                                            <TbChevronDown size={20} />
                                        </Box>
                                    }
                                    sx={{
                                        px: 3,
                                        '&.Mui-expanded': { minHeight: 64 },
                                        '& .MuiAccordionSummary-content': { my: 2 }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                        <Box sx={{ 
                                            p: 1, 
                                            borderRadius: '10px', 
                                            bgcolor: 'var(--bg-secondary)', 
                                            color: '#64748b',
                                            display: 'flex'
                                        }}>
                                            <TbLayoutGrid size={18} />
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {subCat.subCategoryName}
                                        </Typography>
                                        <Box sx={{ ml: 'auto', mr: 2, display: 'flex', gap: 1 }}>
                                            {selectedTemplate && (
                                                <Fade in={true}>
                                                    <Chip 
                                                        label={selectedTemplate.name} 
                                                        size="small" 
                                                        icon={<TbTemplate size={14} />}
                                                        sx={{ 
                                                            bgcolor: 'rgba(79, 70, 229, 0.1)', 
                                                            color: '#4f46e5', 
                                                            fontWeight: 700,
                                                            borderRadius: '8px',
                                                            px: 0.5
                                                        }} 
                                                    />
                                                </Fade>
                                            )}
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 3, pb: 4, pt: 0 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Divider sx={{ mb: 4, opacity: 0.6 }} />
                                        
                                        {subCat.templates.length > 1 && (
                                            <Box sx={{ mb: 4 }}>
                                                <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {t('template.chooseTemplate')}
                                                </Typography>
                                                <FormControl fullWidth>
                                                    <Select
                                                        value={subCat.selectedTemplateId || ''}
                                                        onChange={e => handleTemplateSelect(subCat.subCategoryId, e.target.value as any)}
                                                        sx={{ 
                                                            borderRadius: '14px', 
                                                            bgcolor: 'var(--input-bg)',
                                                            fontWeight: 600,
                                                            '& .MuiSelect-select': { py: 1.5 }
                                                        }}
                                                        startAdornment={
                                                            <InputAdornment position="start" sx={{ ml: 1 }}>
                                                                <TbTemplate size={20} color="#4f46e5" />
                                                            </InputAdornment>
                                                        }
                                                    >
                                                        <MenuItem value="" sx={{ fontWeight: 500 }}>{t('template.noTemplate')}</MenuItem>
                                                        {subCat.templates.map(_t => (
                                                            <MenuItem key={_t.id} value={_t.id} sx={{ fontWeight: 600 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                                    {_t.name}
                                                                    {_t.is_default && (
                                                                        <Chip 
                                                                            label={t('common.default')} 
                                                                            size="small" 
                                                                            variant="outlined"
                                                                            sx={{ 
                                                                                height: 20, 
                                                                                fontSize: '0.65rem', 
                                                                                fontWeight: 800,
                                                                                borderColor: 'rgba(79, 70, 229, 0.3)',
                                                                                color: '#4f46e5',
                                                                                ml: 'auto'
                                                                            }} 
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        )}

                                        {selectedTemplate && selectedTemplate.fields.length > 0 && (
                                            <Box>
                                                {selectedTemplate.description && (
                                                    <Box sx={{ 
                                                        mb: 4, 
                                                        p: 2, 
                                                        borderRadius: '12px', 
                                                        bgcolor: 'var(--bg-secondary)', 
                                                        display: 'flex',
                                                        gap: 1.5
                                                    }}>
                                                        <TbInfoCircle size={20} color="#4f46e5" style={{ marginTop: 2 }} />
                                                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, lineHeight: 1.6 }}>
                                                            {selectedTemplate.description}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                <Grid container spacing={3}>
                                                    {selectedTemplate.fields.map(field => (
                                                        <Grid item xs={12} md={field.field_type === 'boolean' ? 6 : 6} lg={field.field_type === 'boolean' ? 4 : 6} key={field.id || field.field_key}>
                                                            {renderField(selectedTemplate.id, field)}
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Box>
                                        )}
                                    </motion.div>
                                </AccordionDetails>
                            </Accordion>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </Box>
    );
};

export default DynamicTemplateForm;
