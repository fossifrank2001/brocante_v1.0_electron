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

const ShopComponent: React.FC<{searchTerm: string}> = ({searchTerm}) => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [paginationData, setPaginationData] = useState<IPaginationData | null>(null);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState<ISubCategory[]>([]);
    const [priceRange, setPriceRange] = useState<string>('');
    const [_status, setStatus] = useState<string>('');
    const [loadingFilter, setLoadingFilter] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            getProducts();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedSubCategories, priceRange, _status]);

    const getCategories = useCallback(async () => {
        try {
            setLoadingFilter(true);
            const { data: result } = await CategoryAPI.index();
            setCategories(result.data);
        } catch (e) {
            console.error('SHOP PAGE: error related to categories loading', e);
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
            const subCategoryIds = selectedSubCategories.map(sc => sc.id).join(',');
            const { data: _products } = await ProductAPI.index(searchTerm, page, subCategoryIds, priceRange, _status);
            if ('data' in _products && Array.isArray(_products.data)) {
                setProducts(_products.data);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { data, ...paginationInfo } = _products;
                setPaginationData(paginationInfo as IPaginationData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingProducts(false);
        }
    }, [searchTerm, selectedSubCategories, priceRange, _status]);

    const handlePageChange = async (page: number) => {
        try {
            await getProducts(page);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
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
                      justifyContent: 'space-between',
                      backgroundColor: "rgba(208,208,208,0.28)",
                      marginLeft:"300px",
                      height:"100vh"
                  }}>
                      {loadingProducts ? (
                        <div className='row px-2'>
                            {Array.from({length: 8}).map((_, index) => <LoaderArticle key={index}/>)}
                        </div>
                      ) : (
                        <div>
                            <ProductList products={products}/>
                        </div>
                      )}
                      {paginationData && (
                        <PaginationComponent paginationData={paginationData} onPageChange={handlePageChange}/>
                      )}
                  </div>
              </div>
          </div>
      </div>
    );
};

export default ShopComponent;