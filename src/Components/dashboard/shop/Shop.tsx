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
import { Alert, AlertTitle, Typography, Box, IconButton, Drawer, Chip, Badge, Tooltip } from '@mui/material';
import { FilterList, Refresh, ViewModule, ViewList } from '@mui/icons-material';

const ShopComponent: React.FC<{ searchTerm: string, onResetFilter: () => void }> = ({ searchTerm, onResetFilter }) => {
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    const handleRefreshProducts = async () => {
        await getProducts();
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--body-bg)' }}>
            {/* Toolbar */}
            <Box sx={{
                px: 3, py: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                position: 'sticky',
                top: 0,
                zIndex: 900
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}>
                        <IconButton
                            onClick={toggleFilters}
                            size="medium"
                            sx={{
                                bgcolor: showFilters ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                color: showFilters ? '#4f46e5' : '#64748b',
                                border: '1px solid',
                                borderColor: showFilters ? 'rgba(79, 70, 229, 0.2)' : 'rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.15)' }
                            }}
                        >
                            <Badge badgeContent={getActiveFiltersCount()} color="error">
                                <FilterList />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {products.length} <span style={{ color: '#64748b', fontWeight: 500 }}>produits trouvés</span>
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedSubCategories.length > 0 && (
                            <Chip
                                label={`${selectedSubCategories.length} Catégories`}
                                size="small"
                                variant="outlined"
                                onDelete={() => setSelectedSubCategories([])}
                                sx={{ borderRadius: '8px', fontWeight: 600, color: '#4f46e5', borderColor: 'rgba(79, 70, 229, 0.3)' }}
                            />
                        )}
                        {priceRange && (
                            <Chip
                                label={`Prix: ${priceRange.replace('_', '-')}`}
                                size="small"
                                variant="outlined"
                                onDelete={() => setPriceRange('')}
                                sx={{ borderRadius: '8px', fontWeight: 600, color: '#0891b2', borderColor: 'rgba(8, 145, 178, 0.3)' }}
                            />
                        )}
                        {_status && (
                            <Chip
                                label={`Statut: ${_status}`}
                                size="small"
                                variant="outlined"
                                onDelete={() => setStatus('')}
                                sx={{ borderRadius: '8px', fontWeight: 600, color: '#059669', borderColor: 'rgba(5, 150, 105, 0.3)' }}
                            />
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Tooltip title="Rafraîchir les produits">
                        <IconButton
                            size="small"
                            onClick={handleRefreshProducts}
                            disabled={loadingProducts}
                            sx={{ border: '1px solid rgba(0,0,0,0.05)' }}
                        >
                            <Refresh fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{
                        display: 'flex',
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        p: 0.5,
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.02)'
                    }}>
                        <IconButton
                            size="small"
                            onClick={() => setViewMode('grid')}
                            sx={{
                                borderRadius: '8px',
                                bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
                                color: viewMode === 'grid' ? '#4f46e5' : '#64748b',
                                boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                '&:hover': { bgcolor: viewMode === 'grid' ? 'white' : 'rgba(0,0,0,0.05)' }
                            }}
                        >
                            <ViewModule fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setViewMode('list')}
                            sx={{
                                borderRadius: '8px',
                                bgcolor: viewMode === 'list' ? 'white' : 'transparent',
                                color: viewMode === 'list' ? '#4f46e5' : '#64748b',
                                boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                '&:hover': { bgcolor: viewMode === 'list' ? 'white' : 'rgba(0,0,0,0.05)' }
                            }}
                        >
                            <ViewList fontSize="small" />
                        </IconButton>
                    </Box>
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
                        transition: 'width 0.3s ease',
                        '& .MuiDrawer-paper': {
                            width: 320,
                            boxSizing: 'border-box',
                            position: 'relative',
                            height: '100%',
                            borderRight: '1px solid rgba(0,0,0,0.05)',
                            backgroundColor: '#fff',
                            boxShadow: '4px 0 12px rgba(0,0,0,0.02)'
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

                {/* Products Area */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <AlertTitle sx={{ fontWeight: 700 }}>Erreur</AlertTitle>
                            {error}
                        </Alert>
                    )}

                    {loadingProducts ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 3 }}>
                            {Array.from({ length: 8 }).map((_, i) => <LoaderArticle key={i} />)}
                        </Box>
                    ) : products.length > 0 ? (
                        <ProductList products={products} showFilters={showFilters} />
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 12, color: '#94a3b8' }}>
                            <Box sx={{ fontSize: '4rem', mb: 2, opacity: 0.5 }}>🔍</Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>Aucun produit trouvé</Typography>
                            <Typography variant="body1">Ajustez vos filtres ou essayez une autre recherche.</Typography>
                        </Box>
                    )}

                    {paginationData && (
                        <Box sx={{ mt: 5, pb: 4 }}>
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