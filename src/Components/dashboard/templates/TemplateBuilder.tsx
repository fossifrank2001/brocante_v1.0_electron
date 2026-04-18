import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, TextField, Grid, IconButton, Paper,
    Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert,
    CircularProgress, Tooltip, Divider, Card, CardContent, CardActions,
    Fade, Zoom,
    Stack
} from '@mui/material';
import {
    TbPlus, TbTrash, TbEdit, TbGripVertical, TbChevronLeft,
    TbTemplate, TbListDetails, TbCheck, TbX, TbCopy,
    TbLayoutGrid, TbInfoCircle, TbChevronUp, TbChevronDown,
    TbArrowsSort, TbSettings
} from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
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
            <Box sx={{ p: { xs: 1, md: 3 } }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Breadcrumd
                        parent={t('navigation.productTemplates')}
                        url={Pages.PRODUCT_TEMPLATES}
                        _child={editingTemplate ? t('template.editTemplate') : t('template.newTemplate')}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton 
                                onClick={resetForm}
                                sx={{ 
                                    bgcolor: 'var(--bg-surface)', 
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-sm)',
                                    '&:hover': { bgcolor: 'var(--bg-secondary)' }
                                }}
                            >
                                <TbChevronLeft size={22} />
                            </IconButton>
                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', display: 'flex' }}>
                                <TbTemplate size={28} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                    {editingTemplate ? t('template.editTemplate') : t('template.newTemplate')}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    {editingTemplate ? `ID: #${editingTemplate.id}` : t('template.configDescription', 'Configurez les champs dynamiques de votre fiche')}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                onClick={resetForm} 
                                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, color: '#64748b' }}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleSave} 
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <TbCheck size={20} />}
                                sx={{
                                    borderRadius: '14px',
                                    px: 4,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
                                    '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)' }
                                }}
                            >
                                {editingTemplate ? t('common.update') : t('template.createTemplate')}
                            </Button>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Left Column: General Info */}
                        <Grid item xs={12} lg={4}>
                            <Paper sx={{ 
                                p: 3, 
                                borderRadius: '24px', 
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-surface)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <TbInfoCircle size={22} color="#4f46e5" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{t('template.generalInfo')}</Typography>
                                </Box>
                                
                                <Stack spacing={3}>
                                    <TextField 
                                        fullWidth 
                                        label={t('template.templateName')} 
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)} 
                                        required
                                        placeholder={t('template.templateNamePlaceholder')}
                                        variant="outlined"
                                        InputProps={{ borderRadius: '14px' } as any}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                                    />

                                    <FormControl fullWidth>
                                        <InputLabel>{t('template.associatedSubcategory')}</InputLabel>
                                        <Select 
                                            value={formSubCategoryId} 
                                            label={t('template.associatedSubcategory')}
                                            onChange={e => setFormSubCategoryId(e.target.value as any)}
                                            sx={{ borderRadius: '14px' }}
                                        >
                                            <MenuItem value="">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TbLayoutGrid size={18} />
                                                    {t('template.noSubcategoryGeneric')}
                                                </Box>
                                            </MenuItem>
                                            {allSubCategories.map(sub => (
                                                <MenuItem key={sub.id} value={sub.id}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        <span style={{ opacity: 0.5 }}>{sub.categoryLabel}</span> → {sub.label}
                                                    </Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Stack spacing={0.5}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            {t('common.description')}
                                        </Typography>
                                        <textarea
                                            value={formDescription}
                                            onChange={e => setFormDescription(e.target.value)}
                                            rows={3}
                                            placeholder={t('template.descriptionPlaceholder', 'Description de l\'usage de cette fiche...')}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '14px',
                                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                                backgroundColor: 'var(--input-bg, #f8fafc)',
                                                fontFamily: 'inherit',
                                                fontSize: '0.9375rem',
                                                resize: 'vertical',
                                                minHeight: '80px',
                                                outline: 'none',
                                                transition: 'border-color 0.2s, box-shadow 0.2s'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#4f46e5';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(0, 0, 0, 0.23)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </Stack>

                                    <Box sx={{ 
                                        p: 2, 
                                        borderRadius: '14px', 
                                        bgcolor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <FormControlLabel
                                            control={<Switch checked={formIsDefault} onChange={e => setFormIsDefault(e.target.checked)} color="primary" />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('template.defaultTemplateForSubcategory')}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b' }}>{t('template.defaultInfo', 'S\'appliquera automatiquement lors du choix de cette catégorie')}</Typography>
                                                </Box>
                                            }
                                            sx={{ ml: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                                        />
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* Right Column: Fields Builder */}
                        <Grid item xs={12} lg={8}>
                            <Paper sx={{ 
                                p: 3, 
                                borderRadius: '24px', 
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-surface)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <TbArrowsSort size={22} color="#4f46e5" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                            {t('template.formFields')} 
                                            <Chip label={formFields.length} size="small" sx={{ ml: 1, bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: 800 }} />
                                        </Typography>
                                    </Box>
                                    <Button 
                                        startIcon={<TbPlus />} 
                                        onClick={addField} 
                                        variant="outlined"
                                        sx={{ 
                                            borderRadius: '12px',
                                            textTransform: 'none', 
                                            fontWeight: 700,
                                            borderWidth: '2px',
                                            '&:hover': { borderWidth: '2px' }
                                        }}
                                    >
                                        {t('template.addField')}
                                    </Button>
                                </Box>

                                <Stack spacing={2}>
                                    <AnimatePresence>
                                        {formFields.map((field, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                            >
                                                <Paper 
                                                    variant="outlined" 
                                                    sx={{ 
                                                        p: 2.5, 
                                                        borderRadius: '18px', 
                                                        bgcolor: 'var(--bg-secondary)',
                                                        border: '1px solid var(--border-color)',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { 
                                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                                            borderColor: 'rgba(79, 70, 229, 0.3)'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                                        <Box sx={{ cursor: 'grab', color: '#94a3b8', display: 'flex' }}>
                                                            <TbGripVertical size={20} />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            {t('template.field')} #{index + 1}
                                                        </Typography>
                                                        
                                                        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                                                            <IconButton size="small" onClick={() => moveField(index, 'up')} disabled={index === 0} sx={{ bgcolor: 'white' }}>
                                                                <TbChevronUp size={18} />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => moveField(index, 'down')} disabled={index === formFields.length - 1} sx={{ bgcolor: 'white' }}>
                                                                <TbChevronDown size={18} />
                                                            </IconButton>
                                                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                                            <IconButton 
                                                                size="small" 
                                                                color="error" 
                                                                onClick={() => removeField(index)} 
                                                                disabled={formFields.length <= 1}
                                                                sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)' }}
                                                            >
                                                                <TbTrash size={18} />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>

                                                    <Grid container spacing={2.5}>
                                                        <Grid item xs={12} md={5}>
                                                            <TextField 
                                                                fullWidth 
                                                                size="small" 
                                                                label={t('template.fieldName')} 
                                                                value={field.name}
                                                                onChange={e => updateField(index, 'name', e.target.value)} 
                                                                required
                                                                placeholder={t('template.fieldNamePlaceholder')}
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white' } }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <FormControl fullWidth size="small">
                                                                <InputLabel>{t('common.type')}</InputLabel>
                                                                <Select 
                                                                    value={field.field_type} 
                                                                    label="Type"
                                                                    onChange={e => updateField(index, 'field_type', e.target.value)}
                                                                    sx={{ borderRadius: '10px', bgcolor: 'white' }}
                                                                >
                                                                    {FIELD_TYPES.map(ft => (
                                                                        <MenuItem key={ft.value} value={ft.value} sx={{ fontWeight: 600 }}>{ft.label}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={6} md={3}>
                                                            <TextField 
                                                                fullWidth 
                                                                size="small" 
                                                                label={t('common.unit')} 
                                                                value={field.unit}
                                                                onChange={e => updateField(index, 'unit', e.target.value)}
                                                                placeholder="ex: cm, kg..."
                                                                disabled={field.field_type !== 'number'}
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: field.field_type === 'number' ? 'white' : 'transparent' } }}
                                                            />
                                                        </Grid>
                                                        
                                                        <Grid item xs={6} md={3}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Switch 
                                                                        size="small" 
                                                                        checked={field.is_required}
                                                                        onChange={e => updateField(index, 'is_required', e.target.checked)} 
                                                                    />
                                                                }
                                                                label={<Typography variant="caption" sx={{ fontWeight: 700 }}>{t('common.required')}</Typography>}
                                                                sx={{ ml: 0, bgcolor: 'rgba(255,255,255,0.5)', px: 1.5, py: 0.5, borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                                            />
                                                        </Grid>
                                                        
                                                        <Grid item xs={12} md={9}>
                                                            <TextField 
                                                                fullWidth 
                                                                size="small" 
                                                                label={t('common.placeholder')} 
                                                                value={field.placeholder}
                                                                onChange={e => updateField(index, 'placeholder', e.target.value)}
                                                                placeholder={t('template.placeholderInfo', 'Texte d\'aide affiché dans le champ')}
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white' } }}
                                                            />
                                                        </Grid>

                                                        {field.field_type === 'select' && (
                                                            <Grid item xs={12}>
                                                                <Box sx={{ 
                                                                    p: 2, 
                                                                    borderRadius: '12px', 
                                                                    bgcolor: 'rgba(79, 70, 229, 0.03)',
                                                                    border: '1px dashed rgba(79, 70, 229, 0.3)'
                                                                }}>
                                                                    <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 700, color: '#4f46e5' }}>
                                                                        {t('template.optionsList', 'Options de la liste')}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                                        <AnimatePresence>
                                                                            {field.options.map((opt, oi) => (
                                                                                <motion.div
                                                                                    key={oi}
                                                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                                    exit={{ scale: 0.8, opacity: 0 }}
                                                                                >
                                                                                    <Chip 
                                                                                        label={opt} 
                                                                                        size="small" 
                                                                                        onDelete={() => removeOption(index, oi)}
                                                                                        sx={{ fontWeight: 600, bgcolor: 'white' }}
                                                                                    />
                                                                                </motion.div>
                                                                            ))}
                                                                        </AnimatePresence>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        <TextField 
                                                                            size="small" 
                                                                            placeholder={t('template.addOptionPlaceholder')}
                                                                            value={optionInput[index] || ''}
                                                                            onChange={e => setOptionInput({ ...optionInput, [index]: e.target.value })}
                                                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(index); } }}
                                                                            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
                                                                        />
                                                                        <Button 
                                                                            size="small" 
                                                                            variant="contained" 
                                                                            onClick={() => addOption(index)}
                                                                            sx={{ borderRadius: '8px', textTransform: 'none', px: 3, bgcolor: '#4f46e5' }}
                                                                        >
                                                                            {t('common.add')}
                                                                        </Button>
                                                                    </Box>
                                                                </Box>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Paper>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </Stack>
                                
                                <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
                                    <Button 
                                        startIcon={<TbPlus />} 
                                        onClick={addField} 
                                        variant="text"
                                        sx={{ 
                                            borderRadius: '12px',
                                            textTransform: 'none', 
                                            fontWeight: 700,
                                            color: '#4f46e5',
                                            px: 4
                                        }}
                                    >
                                        {t('template.addField')}
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </motion.div>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Breadcrumd parent={t('navigation.productTemplates')} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', display: 'flex' }}>
                            <TbTemplate size={28} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                {t('navigation.productTemplates')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                {t('template.listDescription', 'Gérez les fiches techniques pour vos catégories de produits')}
                            </Typography>
                        </Box>
                    </Box>

                    <Button 
                        variant="contained" 
                        startIcon={<TbPlus size={20} />} 
                        onClick={() => setEditing(true)}
                        sx={{
                            borderRadius: '14px',
                            px: 3,
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
                            '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)' }
                        }}
                    >
                        {t('template.newTemplateButton')}
                    </Button>
                </Box>

                <Alert 
                    severity="info" 
                    icon={<TbInfoCircle size={22} />}
                    sx={{ 
                        mb: 4, 
                        borderRadius: '16px', 
                        bgcolor: 'rgba(79, 70, 229, 0.05)', 
                        color: '#3730a3',
                        border: '1px solid rgba(79, 70, 229, 0.1)',
                        '& .MuiAlert-icon': { color: '#4f46e5' }
                    }}
                >
                    {t('template.infoMessage')}
                </Alert>

                {templates.length === 0 ? (
                    <Paper sx={{ 
                        p: 8, 
                        textAlign: 'center', 
                        borderRadius: '24px', 
                        border: '2px dashed var(--border-color)',
                        bgcolor: 'transparent'
                    }}>
                        <Box sx={{ p: 2, borderRadius: '20px', bgcolor: 'var(--bg-secondary)', display: 'inline-flex', mb: 2 }}>
                            <TbListDetails size={48} color="#94a3b8" />
                        </Box>
                        <Typography variant="h6" sx={{ mt: 2, color: 'var(--text-primary)', fontWeight: 800 }}>{t('template.noTemplates')}</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 4, maxWidth: 400, mx: 'auto' }}>
                            {t('template.createFirstTemplate')}
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<TbPlus />} 
                            onClick={() => setEditing(true)}
                            sx={{ 
                                borderRadius: '12px',
                                px: 4,
                                textTransform: 'none', 
                                fontWeight: 700, 
                                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' 
                            }}
                        >
                            {t('template.createTemplate')}
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        <AnimatePresence>
                            {templates.map((template, index) => (
                                <Grid item xs={12} md={6} lg={4} key={template.id}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Card sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            borderRadius: '24px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-surface)',
                                            boxShadow: 'var(--shadow-sm)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': { 
                                                transform: 'translateY(-5px)',
                                                boxShadow: 'var(--shadow-lg)',
                                                borderColor: 'rgba(79, 70, 229, 0.4)'
                                            } 
                                        }}>
                                            <CardContent sx={{ p: 3, flex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', display: 'flex' }}>
                                                        <TbTemplate size={20} />
                                                    </Box>
                                                    {template.is_default && (
                                                        <Chip 
                                                            label={t('template.default')} 
                                                            size="small" 
                                                            sx={{ 
                                                                bgcolor: 'rgba(16, 185, 129, 0.1)', 
                                                                color: '#10b981', 
                                                                fontWeight: 800, 
                                                                fontSize: '0.65rem',
                                                                borderRadius: '6px'
                                                            }} 
                                                        />
                                                    )}
                                                </Box>
                                                
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 1, lineHeight: 1.2 }}>
                                                    {template.name}
                                                </Typography>

                                                {template.sub_category ? (
                                                    <Chip 
                                                        label={template.sub_category.label} 
                                                        size="small" 
                                                        variant="outlined"
                                                        icon={<TbLayoutGrid size={14} />}
                                                        sx={{ mb: 2, fontWeight: 600, borderRadius: '8px' }} 
                                                    />
                                                ) : (
                                                    <Chip 
                                                        label={t('template.generic', 'Générique')} 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ mb: 2, fontWeight: 600, borderRadius: '8px', borderStyle: 'dashed' }} 
                                                    />
                                                )}

                                                {template.description && (
                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.85rem', lineClamp: 2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                                                        {template.description}
                                                    </Typography>
                                                )}

                                                <Divider sx={{ my: 2, opacity: 0.5 }} />
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {template.fields.length} {template.fields.length > 1 ? t('template.fields') : t('template.field')}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {template.fields.slice(0, 4).map(f => (
                                                        <Chip 
                                                            key={f.id} 
                                                            label={f.name} 
                                                            size="small" 
                                                            sx={{ fontSize: '0.7rem', height: 22, bgcolor: 'var(--bg-secondary)', fontWeight: 500 }} 
                                                        />
                                                    ))}
                                                    {template.fields.length > 4 && (
                                                        <Chip 
                                                            label={`+${template.fields.length - 4}`} 
                                                            size="small" 
                                                            sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700 }} 
                                                        />
                                                    )}
                                                </Box>
                                            </CardContent>
                                            
                                            <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
                                                <Tooltip title={t('common.edit')} arrow>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => startEdit(template)}
                                                        sx={{ bgcolor: 'rgba(79, 70, 229, 0.05)', color: '#4f46e5' }}
                                                    >
                                                        <TbEdit size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('template.duplicate')} arrow>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => duplicateTemplate(template)}
                                                        sx={{ bgcolor: 'rgba(79, 70, 229, 0.05)', color: '#4f46e5' }}
                                                    >
                                                        <TbCopy size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('common.delete')} arrow>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error" 
                                                        onClick={() => setDeleteDialog(template)}
                                                        sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)' }}
                                                    >
                                                        <TbTrash size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </AnimatePresence>
                    </Grid>
                )}

                <Dialog 
                    open={!!deleteDialog} 
                    onClose={() => setDeleteDialog(null)}
                    PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
                >
                    <DialogTitle sx={{ fontWeight: 800 }}>{t('template.deleteTitle')}</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ color: '#64748b' }}>
                            {t('template.deleteConfirm')} <strong style={{ color: 'var(--text-primary)' }}>{deleteDialog?.name}</strong> ?
                        </Typography>
                        <Box sx={{ mt: 2, p: 2, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TbInfoCircle size={16} />
                                {t('template.deleteWarning')}
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button 
                            onClick={() => setDeleteDialog(null)} 
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, color: '#64748b' }}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button 
                            onClick={handleDelete} 
                            color="error" 
                            variant="contained" 
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3 }}
                        >
                            {t('common.delete')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </motion.div>
        </Box>
    );
};

export default TemplateBuilder;
