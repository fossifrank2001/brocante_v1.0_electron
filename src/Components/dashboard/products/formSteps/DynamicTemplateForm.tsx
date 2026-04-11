import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, TextField, Select, MenuItem, FormControl,
    InputLabel, Switch, FormControlLabel, InputAdornment, Chip, Alert,
    CircularProgress, Paper
} from '@mui/material';
import { TbTemplate, TbListDetails } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import ProductTemplateAPI from 'Data/Api/ProductTemplate';
import { IProductTemplate, ITemplateField } from 'Data/Interfaces/ProductTemplate';

interface DynamicTemplateFormProps {
    subCategoryIds: number[];
    templateId: number | null;
    templateValues: Record<string, any>;
    onTemplateChange: (templateId: number | null) => void;
    onValuesChange: (values: Record<string, any>) => void;
}

const DynamicTemplateForm: React.FC<DynamicTemplateFormProps> = ({
    subCategoryIds,
    templateId,
    templateValues,
    onTemplateChange,
    onValuesChange,
}) => {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState<IProductTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<IProductTemplate | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load templates when sub_category changes
    useEffect(() => {
        const loadTemplates = async () => {
            if (!subCategoryIds || subCategoryIds.length === 0) {
                setTemplates([]);
                return;
            }

            setLoading(true);
            try {
                // Load templates for the first selected subcategory
                const firstSubCatId = subCategoryIds[0];
                const response = await ProductTemplateAPI.index(firstSubCatId);
                const loadedTemplates = response.data || [];
                setTemplates(loadedTemplates);

                // Auto-select default template if none selected
                if (!templateId && loadedTemplates.length > 0) {
                    const defaultTemplate = loadedTemplates.find(t => t.is_default) || loadedTemplates[0];
                    setSelectedTemplate(defaultTemplate);
                    onTemplateChange(defaultTemplate.id);

                    // Initialize default values
                    const defaults: Record<string, any> = {};
                    defaultTemplate.fields.forEach(field => {
                        if (field.default_value) {
                            defaults[field.field_key] = field.default_value;
                        }
                    });
                    if (Object.keys(defaults).length > 0 && Object.keys(templateValues).length === 0) {
                        onValuesChange({ ...templateValues, ...defaults });
                    }
                }
            } catch (error) {
                console.error('Failed to load templates:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, [subCategoryIds.join(',')]);

    // Sync selected template when templateId changes
    useEffect(() => {
        if (templateId && templates.length > 0) {
            const found = templates.find(t => t.id === templateId);
            if (found) setSelectedTemplate(found);
        }
    }, [templateId, templates]);

    const handleTemplateSelect = (id: number | '') => {
        if (id === '') {
            setSelectedTemplate(null);
            onTemplateChange(null);
            onValuesChange({});
            return;
        }
        const template = templates.find(t => t.id === id);
        if (template) {
            setSelectedTemplate(template);
            onTemplateChange(template.id);
            // Keep existing values that match, add defaults for new ones
            const newValues: Record<string, any> = {};
            template.fields.forEach(field => {
                if (templateValues[field.field_key] !== undefined) {
                    newValues[field.field_key] = templateValues[field.field_key];
                } else if (field.default_value) {
                    newValues[field.field_key] = field.default_value;
                }
            });
            onValuesChange(newValues);
        }
    };

    const handleFieldChange = (fieldKey: string, value: any) => {
        const updated = { ...templateValues, [fieldKey]: value };
        onValuesChange(updated);

        // Clear error for this field
        if (errors[fieldKey]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[fieldKey];
                return next;
            });
        }
    };

    const renderField = (field: ITemplateField) => {
        const value = templateValues[field.field_key] ?? '';
        const hasError = !!errors[field.field_key];

        switch (field.field_type) {
            case 'text':
                return (
                    <TextField
                        fullWidth
                        label={field.name}
                        value={value}
                        onChange={e => handleFieldChange(field.field_key, e.target.value)}
                        required={field.is_required}
                        placeholder={field.placeholder || ''}
                        error={hasError}
                        helperText={hasError ? errors[field.field_key] : ''}
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                        }}
                    />
                );

            case 'number':
                return (
                    <TextField
                        fullWidth
                        label={field.name}
                        type="number"
                        value={value}
                        onChange={e => handleFieldChange(field.field_key, e.target.value)}
                        required={field.is_required}
                        placeholder={field.placeholder || ''}
                        error={hasError}
                        helperText={hasError ? errors[field.field_key] : ''}
                        variant="outlined"
                        InputProps={{
                            endAdornment: field.unit ? (
                                <InputAdornment position="end">
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                        {field.unit}
                                    </Typography>
                                </InputAdornment>
                            ) : undefined,
                            sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                        }}
                    />
                );

            case 'select':
                return (
                    <FormControl fullWidth error={hasError}>
                        <InputLabel>{field.name}</InputLabel>
                        <Select
                            value={value}
                            label={field.name}
                            onChange={e => handleFieldChange(field.field_key, e.target.value)}
                            required={field.is_required}
                            sx={{ borderRadius: '14px', bgcolor: 'var(--input-bg)' }}
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
                    <FormControlLabel
                        control={
                            <Switch
                                checked={value === true || value === 'true'}
                                onChange={e => handleFieldChange(field.field_key, e.target.checked)}
                                color="primary"
                            />
                        }
                        label={field.name}
                        sx={{ ml: 0 }}
                    />
                );

            case 'date':
                return (
                    <TextField
                        fullWidth
                        label={field.name}
                        type="date"
                        value={value}
                        onChange={e => handleFieldChange(field.field_key, e.target.value)}
                        required={field.is_required}
                        error={hasError}
                        helperText={hasError ? errors[field.field_key] : ''}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
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

    if (templates.length === 0 && subCategoryIds.length > 0) {
        return (
            <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                {t('template.noTemplateDefinedForSubcategory')}
            </Alert>
        );
    }

    if (templates.length === 0) {
        return null;
    }

    return (
        <Paper sx={{
            p: 3, borderRadius: '20px', bgcolor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)', mt: 2
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', display: 'flex' }}>
                    <TbTemplate size={22} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {t('product.template')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {t('product.dynamicFormInfo')}
                    </Typography>
                </Box>
            </Box>

            {templates.length > 1 && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>{t('template.chooseTemplate')}</InputLabel>
                    <Select
                        value={selectedTemplate?.id || ''}
                        label={t('template.chooseTemplate')}
                        onChange={e => handleTemplateSelect(e.target.value as any)}
                        sx={{ borderRadius: '14px', bgcolor: 'var(--input-bg)' }}
                    >
                        <MenuItem value="">{t('template.noTemplate')}</MenuItem>
                        {templates.map(_t => (
                            <MenuItem key={_t.id} value={_t.id}>
                                {_t.name}
                                {_t.is_default && (
                                    <Chip label={t('common.default')} size="small" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {selectedTemplate && selectedTemplate.fields.length > 0 && (
                <>
                    {selectedTemplate.description && (
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontStyle: 'italic' }}>
                            {selectedTemplate.description}
                        </Typography>
                    )}
                    <Grid container spacing={2.5}>
                        {selectedTemplate.fields.map(field => (
                            <Grid item xs={12} md={field.field_type === 'boolean' ? 4 : 6} key={field.id || field.field_key}>
                                {renderField(field)}
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Paper>
    );
};

export default DynamicTemplateForm;
