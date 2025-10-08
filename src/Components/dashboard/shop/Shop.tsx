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
import { Alert, AlertTitle, Typography } from '@mui/material';

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

    const handleRefreshFilters = async () => {
        await getCategories();
    };

    const handleRefreshProducts = async () => {
        await getProducts();
    };

    return (
        <div className="" style={{width: '90%', margin: 'auto'}}>
            <div className="position-relative overflow-hidden">
                <div className="shop-part d-flex w-100" style={{height:'fit-content!important'}}>
                    {loadingFilter ? <LoaderFilter /> : (
                        <ShopFilters
                            categories={categories}
                            selectedSubCategories={selectedSubCategories}
                            onSubCategoryChange={handleSubCategoryChange}
                            onPriceChange={handlePriceChange}
                            selectedPriceRange={priceRange}
                            onResetFilters={handleResetFilters}
                            onStatusChange={handleStatusChange}
                            selectedStatus={_status}
                        />
                    )}
                    <div className="card-body pb-0 pt-2" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: "rgba(208,208,208,0.28)",
                        marginLeft:"300px",
                        height:"100vh"
                    }}>
                        <div className="d-flex justify-content-between mb-3 px-2">
                            <button
                                onClick={handleRefreshFilters}
                                disabled={loadingFilter}
                                className="btn btn-primary d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-refresh"></i>
                                <span className='ms-2'>Refresh Filters</span>
                            </button>
                            <button
                                onClick={handleRefreshProducts}
                                disabled={loadingFilter}
                                className="btn btn-primary d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-refresh"></i>
                                <span className='ms-2'>Refresh Products</span>
                            </button>
                        </div>
                        {error && (
                            <Alert severity="error" style={{width: '95%', margin: 'auto'}}>
                                <AlertTitle>Error</AlertTitle>
                                {error}
                            </Alert>
                        )}
                        {loadingProducts ? (
                            <div className='row px-2'>
                                {Array.from({length: 8}).map((_, index) => <LoaderArticle key={index}/>)}
                            </div>
                        ) : products.length > 0 ? (
                            <div>
                                <ProductList products={products}/>
                            </div>
                        ) : (
                            <Alert severity="warning" style={{width: '95%', margin: '10px auto'}}>
                                <AlertTitle>No Products Found.</AlertTitle>
                                <Typography>
                                    No products match your current filters. Try adjusting your search or filter criteria.
                                </Typography>
                            </Alert>
                        )}
                        {paginationData && (
                            <PaginationComponent
                                paginationData={paginationData}
                                onPageChange={handlePageChange}
                                onPerPageChange={handlePerPageChange}
                                perPage={perPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopComponent;