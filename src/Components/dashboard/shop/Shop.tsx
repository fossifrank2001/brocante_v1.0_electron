import React, { useEffect, useState } from 'react';
import Breadcrumd from 'Components/Breadcrumd.tsx';
import ShopFilters from 'Components/dashboard/shop/ShopFilters.tsx';
import ProductList from 'Components/dashboard/shop/ProductList.tsx';
import PaginationComponent from "Components/Pagination.tsx";
import { IProduct, ISubCategory } from "Data/Interfaces/Supply.ts";
import { IPaginationData } from "Interfaces";
import ProductAPI from "Data/Api/Product.ts";
import { ICategory } from "Data/Interfaces/Category.ts";
import CategoryAPI from "Data/Api/Category.ts";

const ShopComponent: React.FC = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [paginationData, setPaginationData] = useState<IPaginationData | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState<ISubCategory[]>([]);
    const [priceRange, setPriceRange] = useState<string>('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedSubCategories, priceRange]);

    useEffect(() => {
        (async () => {
            try {
                const { data: result } = await CategoryAPI.index();
                setCategories(result.data);
            } catch (e) {
                console.error('SHOP PAGE: error related to categories loading' + e);
            }
        })();
    }, []);

    const fetchData = async (page: number = 1) => {
        try {
            const subCategoryIds = selectedSubCategories.map(sc => sc.id).join(',');
            const { data: _products } = await ProductAPI.index(searchTerm, page, subCategoryIds, priceRange);
            setProducts(_products.data);
            delete _products.data;
            setPaginationData(_products);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handlePageChange = async (page: number) => {
        try {
            await fetchData(page);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSubCategoryChange = (subCategories: ISubCategory[]) => {
        setSelectedSubCategories(subCategories);
    };

    const handlePriceChange = (priceRange: string) => {
        setPriceRange(priceRange);
    };

    const handleResetFilters = () => {
        setSelectedSubCategories([]);
        setPriceRange('');
    };

    return (
        <div className="container">
            <Breadcrumd parent="Shop" />
            <div className="position-relative overflow-hidden">
                <div className="shop-part d-flex w-100">
                    <ShopFilters
                        categories={categories}
                        selectedSubCategories={selectedSubCategories}
                        onSubCategoryChange={handleSubCategoryChange}
                        onPriceChange={handlePriceChange}
                        selectedPriceRange={priceRange}
                        onResetFilters={handleResetFilters}
                    />
                    <div className="card-body p-4 pb-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center gap-6 mb-4">
                            <a
                                className="btn btn-primary d-lg-none d-flex"
                                data-bs-toggle="offcanvas"
                                href="#filtercategory"
                                role="button"
                                aria-controls="filtercategory"
                            >
                                <i className="ti ti-menu-2 fs-6"></i>
                            </a>
                            <h5 className="fs-5 mb-0 d-none d-lg-block">Products</h5>
                            <form className="position-relative">
                                <input
                                    type="text"
                                    className="form-control search-chat py-2 ps-5"
                                    id="text-srh"
                                    placeholder="Search Product"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 text-dark ms-3"></i>
                            </form>
                        </div>
                        <ProductList products={products} />
                        {paginationData && (
                            <PaginationComponent paginationData={paginationData} onPageChange={handlePageChange} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopComponent;
