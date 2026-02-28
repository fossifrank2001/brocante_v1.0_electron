import React, { useState } from 'react';
import { ICategory } from "Data/Interfaces/Category.ts";
import { ISubCategory } from "Data/Interfaces/Supply.ts";
import ProductAPI from "Data/Api/Product.ts";
import { 
    Box, 
    Typography, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails,
    FormControlLabel,
    Checkbox,
    Radio,
    RadioGroup,
    Button,
    Divider,
    Badge,
    IconButton
} from '@mui/material';
import { 
    ExpandMore, 
    Category as CategoryIcon, 
    AttachMoney, 
    Inventory,
    FilterAlt,
    Close
} from '@mui/icons-material';

interface ShopFiltersProps {
    categories: ICategory[];
    selectedSubCategories: ISubCategory[];
    selectedPriceRange: string;
    onSubCategoryChange: (subCategories: ISubCategory[]) => void;
    onPriceChange: (priceRange: string) => void;
    onStatusChange: (priceRange: string) => void;
    selectedStatus: string;
    onResetFilters: () => void;
    onClose?: () => void;
}

const ShopFilters: React.FC<ShopFiltersProps> = ({
     categories,
     selectedSubCategories,
     selectedPriceRange,
     onSubCategoryChange,
     onPriceChange,
     onStatusChange,
     selectedStatus,
     onResetFilters,
     onClose
 }) => {
    const [expandedCategory, setExpandedCategory] = useState<number | false>(categories.length > 0 ? categories[0].id : false);

    const handleExpandAll = () => {
        if (categories.length > 0) setExpandedCategory(categories[0].id);
    };

    const handleCollapseAll = () => {
        setExpandedCategory(false);
    };

    const handleSubCategorySelect = (subCategory: ISubCategory) => {
        const isSelected = selectedSubCategories.some(sc => sc.id === subCategory.id);
        if (isSelected) {
            onSubCategoryChange(selectedSubCategories.filter(sc => sc.id !== subCategory.id));
        } else {
            onSubCategoryChange([...selectedSubCategories, subCategory]);
        }
    };

    const handleCategoryExpand = (categoryId: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedCategory(isExpanded ? categoryId : false);
    };

    const getCategorySelectedCount = (category: ICategory) => {
        return category.sub_categories.filter(sc => 
            selectedSubCategories.some(selected => selected.id === sc.id)
        ).length;
    };

    const handleSelectAllInCategory = (category: ICategory) => {
        const subCategories = category.sub_categories as ISubCategory[];
        const toAdd = subCategories.filter(sc => !selectedSubCategories.some(sel => sel.id === sc.id));
        if (toAdd.length === 0) return;
        onSubCategoryChange([...selectedSubCategories, ...toAdd]);
    };

    const handleUnselectAllInCategory = (category: ICategory) => {
        const subCategories = category.sub_categories as ISubCategory[];
        const ids = new Set(subCategories.map(sc => sc.id));
        onSubCategoryChange(selectedSubCategories.filter(sel => !ids.has(sel.id)));
    };

    const handlePriceSelect = (priceRange: string) => {
        onPriceChange(priceRange);
    };

    const handleStatusSelect = (_status: string) => {
        onStatusChange(_status)
    }

    const priceRanges = [
        { value: '', label: 'Tous les prix' },
        { value: '0_500', label: '0 - 500 FCFA' },
        { value: '500_2500', label: '500 - 2,500 FCFA' },
        { value: 'over_2500', label: 'Plus de 2,500 FCFA' }
    ];

    const statuses = [
        { value: '', label: 'Tous' },
        { value: ProductAPI.STOCK, label: 'En stock' },
        { value: ProductAPI.OUT_OF_STOCK, label: 'Rupture de stock' }
    ];

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'white'
        }}>
            {/* Header */}
            <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterAlt color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Filtres
                    </Typography>
                </Box>
                {onClose && (
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                )}
            </Box>

            {/* Filtres scrollables */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                {/* Catégories */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CategoryIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Catégories
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button size="small" variant="outlined" onClick={handleExpandAll} sx={{ borderRadius: 2, textTransform: 'none' }}>
                            Déplier
                        </Button>
                        <Button size="small" variant="outlined" onClick={handleCollapseAll} sx={{ borderRadius: 2, textTransform: 'none' }}>
                            Replier
                        </Button>
                    </Box>
                    {categories.map((category) => {
                        const selectedCount = getCategorySelectedCount(category);
                        return (
                            <Accordion 
                                key={category.id}
                                expanded={expandedCategory === category.id}
                                onChange={handleCategoryExpand(category.id)}
                                sx={{ 
                                    mb: 1,
                                    '&:before': { display: 'none' },
                                    boxShadow: 'none',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px !important'
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    sx={{
                                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' },
                                        borderRadius: '8px'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                        <Typography sx={{ flex: 1 }}>{category.label}</Typography>
                                        {selectedCount > 0 && (
                                            <Badge badgeContent={selectedCount} color="primary" />
                                        )}
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ pt: 0 }}>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => handleSelectAllInCategory(category)}
                                            sx={{ textTransform: 'none', px: 0.5 }}
                                        >
                                            Tout cocher
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => handleUnselectAllInCategory(category)}
                                            sx={{ textTransform: 'none', px: 0.5 }}
                                        >
                                            Tout décocher
                                        </Button>
                                    </Box>
                                    {category.sub_categories.map(subCategory => (
                                        <FormControlLabel
                                            key={subCategory.id}
                                            control={
                                                <Checkbox
                                                    checked={selectedSubCategories.some(sc => sc.id === subCategory.id)}
                                                    onChange={() => handleSubCategorySelect(subCategory)}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant="body2">{subCategory.label}</Typography>}
                                            sx={{ display: 'flex', ml: 0, mb: 0.5 }}
                                        />
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Statut */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Inventory color="primary" fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Statut
                        </Typography>
                    </Box>
                    <RadioGroup value={selectedStatus} onChange={(e) => handleStatusSelect(e.target.value)}>
                        {statuses.map(status => (
                            <FormControlLabel
                                key={status.value}
                                value={status.value}
                                control={<Radio size="small" />}
                                label={<Typography variant="body2">{status.label}</Typography>}
                                sx={{ ml: 0 }}
                            />
                        ))}
                    </RadioGroup>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Prix */}
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AttachMoney color="primary" fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Prix
                        </Typography>
                    </Box>
                    <RadioGroup value={selectedPriceRange} onChange={(e) => handlePriceSelect(e.target.value)}>
                        {priceRanges.map(range => (
                            <FormControlLabel
                                key={range.value}
                                value={range.value}
                                control={<Radio size="small" />}
                                label={<Typography variant="body2">{range.label}</Typography>}
                                sx={{ ml: 0 }}
                            />
                        ))}
                    </RadioGroup>
                </Box>
            </Box>

            {/* Footer avec bouton reset */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button
                    onClick={onResetFilters}
                    variant="outlined"
                    fullWidth
                    startIcon={<FilterAlt />}
                    sx={{ borderRadius: 2 }}
                >
                    Réinitialiser les filtres
                </Button>
            </Box>
        </Box>
    );
};

export default ShopFilters;
