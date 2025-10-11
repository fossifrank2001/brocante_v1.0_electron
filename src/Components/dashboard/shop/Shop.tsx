import React, { useCallback, useEffect, useState } from 'react';
import ShopFilters from '@/Components/dashboard/shop/ShopFilters';
import ProductList from '@/Components/dashboard/shop/ProductList';
import PaginationComponent from "@/Components/Pagination";
import { IProduct, ISubCategory } from "@/Data/Interfaces/Supply";
import ProductAPI from "@/Data/Api/Product";
import { ICategory } from "@/Data/Interfaces/Category";
import CategoryAPI from "@/Data/Api/Category";
import LoaderFilter from "@/Components/loaders/LoaderFilter";
import LoaderArticle from "@/Components/loaders/LoaderArticle";
import { IPaginationData } from 'Interfaces';
import { Alert, AlertTitle, Typography, Box, IconButton, Drawer, Chip, Badge } from '@mui/material';
import { FilterList, Refresh, Close } from '@mui/icons-material';

const ShopComponent: React.FC<{searchTerm: string, onResetFilter: () => void}> = ({searchTerm, onResetFilter}) => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [paginationData, setPaginationData] = useState<IPaginationData | null>(null);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState<ISubCategory[]>([]);
    const [priceRange, setPriceRange] = useState<string>('');
    const [_status, setStatus] = useState<string>('');
    const [loadingFilter, setLoadingFilter] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [perPage, setPerPage] = useState<number>(10);
    const [showFilters, setShowFilters] = useState<boolean>(true);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            getProducts();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedSubCategories, priceRange, _status, perPage]);

    const getCategories = useCallback(async () => {
        try {
            setLoadingFilter(true);
            setError(null);
            const { data: result } = await CategoryAPI.index();
            setCategories(result.data);
            setPerPage(result.per_page);
        } catch (e) {
            console.error('SHOP PAGE: error related to categories loading', e);
            setError('Failed to load categories. Please try again.');
        } finally {
            setLoadingFilter(false);
        }
    }, []);

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    const getProducts = useCallback(async (page: number = 1) => {
        try {
            setLoadingProducts(true);
            setError(null);
            const subCategoryIds = selectedSubCategories.map(sc => sc.id).join(',');
            const { data: _products } = await ProductAPI.index(searchTerm, page, subCategoryIds, priceRange, _status, perPage);
            if ('data' in _products && Array.isArray(_products.data)) {
                setProducts(_products.data);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { data, ...paginationInfo } = _products;
                setPaginationData(paginationInfo as IPaginationData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoadingProducts(false);
        }
    }, [searchTerm, selectedSubCategories, priceRange, _status, perPage]);

    const handlePageChange = async (page: number) => {
        try {
            await getProducts(page);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load products. Please try again.');
        }
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
    };

    const handleSubCategoryChange = (subCategories: ISubCategory[]) => {
        setSelectedSubCategories(subCategories);
    };

    const handlePriceChange = (priceRange: string) => {
        setPriceRange(priceRange);
    };

    const handleStatusChange = (_status: string) => {
        setStatus(_status);
    };

    const handleResetFilters = () => {
        setSelectedSubCategories([]);
        setPriceRange('');
        setStatus('');
        setPerPage(10);
        onResetFilter();
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedSubCategories.length > 0) count++;
        if (priceRange) count++;
        if (_status) count++;
        return count;
    };

    const handleRefreshFilters = async () => {
        await getCategories();
    };

    const handleRefreshProducts = async () => {
        await getProducts();
    };

    return (
        <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header avec boutons et filtres actifs */}
            <Box sx={{ 
                p: 2, 
                backgroundColor: 'white', 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton 
                        onClick={toggleFilters}
                        color="primary"
                        sx={{ 
                            backgroundColor: showFilters ? 'primary.main' : 'transparent',
                            color: showFilters ? 'white' : 'primary.main',
                            '&:hover': {
                                backgroundColor: showFilters ? 'primary.dark' : 'rgba(25, 118, 210, 0.04)'
                            }
                        }}
                    >
                        <Badge badgeContent={getActiveFiltersCount()} color="error">
                            <FilterList />
                        </Badge>
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {products.length} produit{products.length > 1 ? 's' : ''}
                    </Typography>
                    {getActiveFiltersCount() > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {selectedSubCategories.length > 0 && (
                                <Chip 
                                    label={`${selectedSubCategories.length} catégorie(s)`} 
                                    size="small" 
                                    onDelete={() => setSelectedSubCategories([])}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {priceRange && (
                                <Chip 
                                    label={`Prix: ${priceRange.replace('_', '-')}`} 
                                    size="small" 
                                    onDelete={() => setPriceRange('')}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {_status && (
                                <Chip 
                                    label={`Statut: ${_status}`} 
                                    size="small" 
                                    onDelete={() => setStatus('')}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        onClick={handleRefreshFilters}
                        disabled={loadingFilter}
                        color="primary"
                        title="Rafraîchir les filtres"
                    >
                        <Refresh />
                    </IconButton>
                    <IconButton
                        onClick={handleRefreshProducts}
                        disabled={loadingProducts}
                        color="primary"
                        title="Rafraîchir les produits"
                    >
                        <Refresh />
                    </IconButton>
                </Box>
            </Box>

            {/* Contenu principal */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Drawer pour les filtres */}
                <Drawer
                    variant="persistent"
                    anchor="left"
                    open={showFilters}
                    sx={{
                        width: showFilters ? 320 : 0,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 320,
                            boxSizing: 'border-box',
                            position: 'relative',
                            height: '100%',
                            borderRight: '1px solid #e0e0e0'
                        },
                    }}
                >
                    {loadingFilter ? (
                        <LoaderFilter />
                    ) : (
                        <ShopFilters
                            categories={categories}
                            selectedSubCategories={selectedSubCategories}
                            onSubCategoryChange={handleSubCategoryChange}
                            onPriceChange={handlePriceChange}
                            selectedPriceRange={priceRange}
                            onResetFilters={handleResetFilters}
                            onStatusChange={handleStatusChange}
                            selectedStatus={_status}
                            onClose={toggleFilters}
                        />
                    )}
                </Drawer>

                {/* Zone des produits */}
                <Box sx={{ 
                    flex: 1, 
                    backgroundColor: '#f5f7fa',
                    overflowY: 'auto',
                    p: 3,
                    transition: 'margin 0.3s ease'
                }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            <AlertTitle>Erreur</AlertTitle>
                            {error}
                        </Alert>
                    )}
                    {loadingProducts ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 3 }}>
                            {Array.from({length: 8}).map((_, index) => <LoaderArticle key={index}/>)}
                        </Box>
                    ) : products.length > 0 ? (
                        <Box>
                            <ProductList products={products} showFilters={showFilters}/>
                        </Box>
                    ) : (
                        <Alert severity="warning" sx={{ mt: 3 }}>
                            <AlertTitle>Aucun produit trouvé</AlertTitle>
                            <Typography>
                                Aucun produit ne correspond à vos critères. Essayez d'ajuster vos filtres.
                            </Typography>
                        </Alert>
                    )}
                    {paginationData && (
                        <Box sx={{ mt: 3 }}>
                            <PaginationComponent
                                paginationData={paginationData}
                                onPageChange={handlePageChange}
                                onPerPageChange={handlePerPageChange}
                                perPage={perPage}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ShopComponent;