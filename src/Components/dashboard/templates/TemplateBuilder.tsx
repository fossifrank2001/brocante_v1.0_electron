import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, TextField, Grid, IconButton, Paper,
    Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert,
    CircularProgress, Tooltip, Divider, Card, CardContent, CardActions
} from '@mui/material';
import {
    TbPlus, TbTrash, TbEdit, TbGripVertical, TbChevronLeft,
    TbTemplate, TbListDetails, TbCheck, TbX, TbCopy
} from 'react-icons/tb';
import ProductTemplateAPI from 'Data/Api/ProductTemplate';
import CategoryAPI from 'Data/Api/Category';
import { IProductTemplate, ITemplateField, IProductTemplatePayload } from 'Data/Interfaces/ProductTemplate';
import { ICategory } from 'Data/Interfaces/Category';
import Toast from '@/Data/Utilities/Toast';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/hooks';
import { setActivePage } from 'Data/Slices/NavigationSlice';
import { Pages } from 'Data/Objects/state';
import Breadcrumd from "Components/Breadcrumd";

interface FieldFormData {
    id?: number;
    name: string;
    field_type: string;
    options: string[];
    unit: string;
    is_required: boolean;
    placeholder: string;
    default_value: string;
    sort_order: number;
}

const emptyField = (): FieldFormData => ({
    name: '',
    field_type: 'text',
    options: [],
    unit: '',
    is_required: false,
    placeholder: '',
    default_value: '',
    sort_order: 0,
});

const TemplateBuilder: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const FIELD_TYPES = [
        { value: 'text', label: t('template.text') },
        { value: 'number', label: t('template.number') },
        { value: 'select', label: t('template.select') },
        { value: 'boolean', label: t('template.boolean') },
        { value: 'date', label: t('template.date') },
    ];
    const [templates, setTemplates] = useState<IProductTemplate[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<IProductTemplate | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formSubCategoryId, setFormSubCategoryId] = useState<number | ''>('');
    const [formIsDefault, setFormIsDefault] = useState(true);
    const [formFields, setFormFields] = useState<FieldFormData[]>([emptyField()]);
    const [saving, setSaving] = useState(false);
    const [optionInput, setOptionInput] = useState<Record<number, string>>({});
    const [deleteDialog, setDeleteDialog] = useState<IProductTemplate | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [templatesRes, categoriesRes] = await Promise.all([
                ProductTemplateAPI.index(),
                CategoryAPI.indexAll(),
            ]);
            setTemplates(templatesRes.data || []);
            setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        } catch (error) {
            Toast.error(t('template.loadError'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const allSubCategories = categories.flatMap(cat =>
        (cat.sub_categories || []).map(sub => ({
            ...sub,
            categoryLabel: cat.label,
        }))
    );

    const resetForm = () => {
        setFormName('');
        setFormDescription('');
        setFormSubCategoryId('');
        setFormIsDefault(true);
        setFormFields([emptyField()]);
        setEditingTemplate(null);
        setEditing(false);
        setOptionInput({});
    };

    const startEdit = (template: IProductTemplate) => {
        setEditingTemplate(template);
        setFormName(template.name);
        setFormDescription(template.description || '');
        setFormSubCategoryId(template.sub_category_id || '');
        setFormIsDefault(template.is_default);
        setFormFields(template.fields.map(f => ({
            id: f.id,
            name: f.name,
            field_type: f.field_type,
            options: f.options || [],
            unit: f.unit || '',
            is_required: f.is_required,
            placeholder: f.placeholder || '',
            default_value: f.default_value || '',
            sort_order: f.sort_order,
        })));
        setEditing(true);
    };

    const duplicateTemplate = (template: IProductTemplate) => {
        setEditingTemplate(null);
        setFormName(template.name + ' (' + t('template.copy') + ')');
        setFormDescription(template.description || '');
        setFormSubCategoryId(template.sub_category_id || '');
        setFormIsDefault(false);
        setFormFields(template.fields.map((f, i) => ({
            name: f.name,
            field_type: f.field_type,
            options: f.options || [],
            unit: f.unit || '',
            is_required: f.is_required,
            placeholder: f.placeholder || '',
            default_value: f.default_value || '',
            sort_order: i,
        })));
        setEditing(true);
    };

    const addField = () => {
        setFormFields([...formFields, { ...emptyField(), sort_order: formFields.length }]);
    };

    const removeField = (index: number) => {
        if (formFields.length <= 1) return;
        setFormFields(formFields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, key: keyof FieldFormData, value: any) => {
        const updated = [...formFields];
        (updated[index] as any)[key] = value;
        setFormFields(updated);
    };

    const addOption = (fieldIndex: number) => {
        const val = (optionInput[fieldIndex] || '').trim();
        if (!val) return;
        const updated = [...formFields];
        updated[fieldIndex].options = [...updated[fieldIndex].options, val];
        setFormFields(updated);
        setOptionInput({ ...optionInput, [fieldIndex]: '' });
    };

    const removeOption = (fieldIndex: number, optIndex: number) => {
        const updated = [...formFields];
        updated[fieldIndex].options = updated[fieldIndex].options.filter((_, i) => i !== optIndex);
        setFormFields(updated);
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === formFields.length - 1)) return;
        const updated = [...formFields];
        const target = direction === 'up' ? index - 1 : index + 1;
        [updated[index], updated[target]] = [updated[target], updated[index]];
        setFormFields(updated);
    };

    const handleSave = async () => {
        if (!formName.trim()) { Toast.error(t('template.nameRequired')); return; }
        if (formFields.some(f => !f.name.trim())) { Toast.error(t('template.allFieldsNeedName')); return; }
        if (formFields.some(f => f.field_type === 'select' && f.options.length === 0)) {
            Toast.error(t('template.selectNeedsOptions'));
            return;
        }

        setSaving(true);
        try {
            const payload: IProductTemplatePayload = {
                name: formName.trim(),
                description: formDescription.trim() || null,
                sub_category_id: formSubCategoryId || null,
                is_default: formIsDefault,
                fields: formFields.map((f, i) => ({
                    ...(f.id ? { id: f.id } : {}),
                    name: f.name,
                    field_key: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                    field_type: f.field_type as any,
                    options: f.field_type === 'select' ? f.options : null,
                    unit: f.unit || null,
                    is_required: f.is_required,
                    placeholder: f.placeholder || null,
                    default_value: f.default_value || null,
                    sort_order: i,
                })),
            };

            if (editingTemplate) {
                await ProductTemplateAPI.update(editingTemplate.id, payload);
                Toast.success(t('template.updated'));
            } else {
                await ProductTemplateAPI.store(payload);
                Toast.success(t('template.created'));
            }

            resetForm();
            loadData();
        } catch (error: any) {
            Toast.error(error?.message || t('template.saveError'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog) return;
        try {
            await ProductTemplateAPI.destroy(deleteDialog.id);
            Toast.success(t('template.deleted'));
            setDeleteDialog(null);
            loadData();
        } catch (error: any) {
            Toast.error(error?.message || t('template.deleteError'));
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (editing) {
        return (
            <Box sx={{ p: 3 }}>
                <Breadcrumd
                    parent={t('navigation.productTemplates')}
                    url={Pages.PRODUCT_TEMPLATES}
                    _child={editingTemplate ? t('template.editTemplate') : t('template.newTemplate')}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 2 }}>
                    <IconButton onClick={resetForm}><TbChevronLeft size={24} /></IconButton>
                    <TbTemplate size={28} color="#4f46e5" />
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {editingTemplate ? t('template.editTemplate') : t('template.newTemplate')}
                    </Typography>
                </Box>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t('template.generalInfo')}</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label={t('template.templateName')} value={formName}
                                onChange={e => setFormName(e.target.value)} required
                                placeholder={t('template.templateNamePlaceholder')}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{t('template.associatedSubcategory')}</InputLabel>
                                <Select value={formSubCategoryId} label={t('template.associatedSubcategory')}
                                    onChange={e => setFormSubCategoryId(e.target.value as any)}
                                >
                                    <MenuItem value="">{t('template.noSubcategoryGeneric')}</MenuItem>
                                    {allSubCategories.map(sub => (
                                        <MenuItem key={sub.id} value={sub.id}>
                                            {sub.categoryLabel} → {sub.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField fullWidth label={t('common.description')} value={formDescription}
                                onChange={e => setFormDescription(e.target.value)} multiline rows={2}
                            />
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel
                                control={<Switch checked={formIsDefault} onChange={e => setFormIsDefault(e.target.checked)} color="primary" />}
                                label={t('template.defaultTemplateForSubcategory')}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {t('template.formFields')} ({formFields.length})
                        </Typography>
                        <Button startIcon={<TbPlus />} onClick={addField} variant="outlined"
                            sx={{ textTransform: 'none', fontWeight: 700 }}>
                            {t('template.addField')}
                        </Button>
                    </Box>

                    {formFields.map((field, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <TbGripVertical size={20} color="#94a3b8" style={{ cursor: 'grab' }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#4f46e5' }}>
                                    {t('template.field')} #{index + 1}
                                </Typography>
                                <Box sx={{ flex: 1 }} />
                                <IconButton size="small" onClick={() => moveField(index, 'up')} disabled={index === 0}>▲</IconButton>
                                <IconButton size="small" onClick={() => moveField(index, 'down')} disabled={index === formFields.length - 1}>▼</IconButton>
                                <IconButton size="small" color="error" onClick={() => removeField(index)} disabled={formFields.length <= 1}>
                                    <TbTrash size={18} />
                                </IconButton>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth size="small" label={t('template.fieldName')} value={field.name}
                                        onChange={e => updateField(index, 'name', e.target.value)} required
                                        placeholder={t('template.fieldNamePlaceholder')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>{t('common.type')}</InputLabel>
                                        <Select value={field.field_type} label="Type"
                                            onChange={e => updateField(index, 'field_type', e.target.value)}
                                        >
                                            {FIELD_TYPES.map(ft => (
                                                <MenuItem key={ft.value} value={ft.value}>{ft.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <TextField fullWidth size="small" label={t('common.unit')} value={field.unit}
                                        onChange={e => updateField(index, 'unit', e.target.value)}
                                        placeholder={t('template.unitPlaceholder')}
                                        disabled={field.field_type !== 'number'}
                                    />
                                </Grid>
                                <Grid item xs={6} md={1.5}>
                                    <FormControlLabel
                                        control={<Switch size="small" checked={field.is_required}
                                            onChange={e => updateField(index, 'is_required', e.target.checked)} />}
                                        label={<Typography variant="caption">{t('common.required')}</Typography>}
                                    />
                                </Grid>
                                <Grid item xs={6} md={1.5}>
                                    <TextField fullWidth size="small" label={t('common.placeholder')} value={field.placeholder}
                                        onChange={e => updateField(index, 'placeholder', e.target.value)}
                                    />
                                </Grid>

                                {field.field_type === 'select' && (
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                            {field.options.map((opt, oi) => (
                                                <Chip key={oi} label={opt} size="small" onDelete={() => removeOption(index, oi)} />
                                            ))}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField size="small" placeholder={t('template.addOptionPlaceholder')}
                                                value={optionInput[index] || ''}
                                                onChange={e => setOptionInput({ ...optionInput, [index]: e.target.value })}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(index); } }}
                                                sx={{ flex: 1 }}
                                            />
                                            <Button size="small" variant="outlined" onClick={() => addOption(index)}
                                                sx={{ textTransform: 'none' }}>
                                                {t('common.add')}
                                            </Button>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    ))}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={resetForm} sx={{ textTransform: 'none', fontWeight: 700 }}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <TbCheck size={20} />}
                        sx={{
                            px: 4, textTransform: 'none', fontWeight: 700,
                            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                        }}>
                        {editingTemplate ? t('common.update') : t('template.createTemplate')}
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumd
                parent={t('navigation.productTemplates')}
            />

            <Alert severity="info" sx={{ mb: 1 }}>
                {t('template.infoMessage')}
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 2  , mt: 1 }}>
                <Button variant="contained" startIcon={<TbPlus size={20} />} onClick={() => setEditing(true)}
                    sx={{
                        px: 3, textTransform: 'none', fontWeight: 700,
                        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                    }}>
                    {t('template.newTemplateButton')}
                </Button>
            </Box>

            {templates.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <TbListDetails size={48} color="#94a3b8" />
                    <Typography variant="h6" sx={{ mt: 2, color: '#64748b' }}>{t('template.noTemplates')}</Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                        {t('template.createFirstTemplate')}
                    </Typography>
                    <Button variant="contained" startIcon={<TbPlus />} onClick={() => setEditing(true)}
                        sx={{ textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}>
                        {t('template.createTemplate')}
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {templates.map(template => (
                        <Grid item xs={12} md={6} lg={4} key={template.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.08)' } }}>
                                <CardContent sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                            {template.name}
                                        </Typography>
                                        {template.is_default && (
                                            <Chip label={t('template.default')} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                        )}
                                    </Box>
                                    {template.sub_category && (
                                        <Chip label={template.sub_category.label} size="small" color="default" variant="outlined"
                                            sx={{ mb: 1, fontSize: '0.7rem' }} />
                                    )}
                                    {template.description && (
                                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontSize: '0.8rem' }}>
                                            {template.description}
                                        </Typography>
                                    )}
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#4f46e5' }}>
                                        {template.fields.length} {template.fields.length > 1 ? t('template.fields') : t('template.field')}
                                    </Typography>
                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {template.fields.slice(0, 5).map(f => (
                                            <Chip key={f.id} label={f.name} size="small" variant="outlined"
                                                sx={{ fontSize: '0.65rem', height: 22 }} />
                                        ))}
                                        {template.fields.length > 5 && (
                                            <Chip label={`+${template.fields.length - 5}`} size="small" color="default" variant="outlined"
                                                sx={{ fontSize: '0.65rem', height: 22 }} />
                                        )}
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                                    <Tooltip title={t('common.edit')}>
                                        <IconButton size="small" onClick={() => startEdit(template)}>
                                            <TbEdit size={18} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('template.duplicate')}>
                                        <IconButton size="small" onClick={() => duplicateTemplate(template)}>
                                            <TbCopy size={18} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('common.delete')}>
                                        <IconButton size="small" color="error" onClick={() => setDeleteDialog(template)}>
                                            <TbTrash size={18} />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>{t('template.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('template.deleteConfirm')} <strong>{deleteDialog?.name}</strong> ?
                        {t('template.deleteWarning')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)} sx={{ textTransform: 'none' }}>{t('common.cancel')}</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" sx={{ textTransform: 'none' }}>
                        {t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TemplateBuilder;
