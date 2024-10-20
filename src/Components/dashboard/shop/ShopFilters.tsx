import React from 'react';
import { ICategory } from "Data/Interfaces/Category.ts";
import { ISubCategory } from "Data/Interfaces/Supply.ts";
import ProductAPI from "Data/Api/Product.ts";
import UtilMethods from 'Data/Utilities/UtilMethods';

interface ShopFiltersProps {
    categories: ICategory[];
    selectedSubCategories: ISubCategory[];
    selectedPriceRange: string;
    onSubCategoryChange: (subCategories: ISubCategory[]) => void;
    onPriceChange: (priceRange: string) => void;
    onStatusChange: (priceRange: string) => void;
    selectedStatus: string;
    onResetFilters: () => void;
}

const ShopFilters: React.FC<ShopFiltersProps> = ({
     categories,
     selectedSubCategories,
     selectedPriceRange,
     onSubCategoryChange,
     onPriceChange,
     onStatusChange,
     selectedStatus,
     onResetFilters
 }) => {

    const handleSubCategorySelect = (subCategory: ISubCategory) => {
        const isSelected = selectedSubCategories.some(sc => sc.id === subCategory.id);
        if (isSelected) {
            onSubCategoryChange(selectedSubCategories.filter(sc => sc.id !== subCategory.id));
        } else {
            onSubCategoryChange([...selectedSubCategories, subCategory]);
        }
    };

    const handlePriceSelect = (priceRange: string) => {
        onPriceChange(priceRange);
    };

    const handleStatusSelect = (_status: string) => {
        onStatusChange(_status)
    }

    // Function to randomly select an icon for each category
    const getRandomIcon = (randomIndex : number) => {
        const icons = ['ti ti-layout-bottombar-inactive', 'ti ti-shovel-pitchforks',
            'ti ti-car-turbine', 'ti ti-solar-electricity'
        ];
        return icons[randomIndex];
    };

    return (
        <div className="card shop-filters flex-shrink-0 border-end d-none d-lg-block" style={{
            height: 'calc(100vh - 74px)',
            position: 'fixed'
        }}>
            <div className="wrapper-filter-section" style={{
                height: '88%',
                backgroundColor: 'white',
                overflowY: 'auto'
            }}>
                <div className="by-categories border-bottom rounded-0">
                    <h6 className="my-3 mx-4 d-flex align-items-center">
                        <i className="ti ti-category"></i>
                        <span className="ms-1 fw-semibold">Filter by Category</span>
                    </h6>
                    <ul className="list-group pt-2 border-bottom rounded-0" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {categories.map((category, index) => (
                            <li key={category.id} className="list-group-item border-0 p-0 mx-4 mb-2">
                                <div
                                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-1 bg-light cursor-pointer">
                                    <i className={`${getRandomIcon(index)} fs-5 text-primary`}></i>
                                    <span className="text-dark">{category.label}</span>
                                </div>
                                {category.sub_categories.map(subCategory => (
                                    <div key={subCategory.id} className="form-check ms-4 mt-2 mb-1">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`subCategory-${subCategory.id}`}
                                            checked={selectedSubCategories.some(sc => sc.id === subCategory.id)}
                                            onChange={() => handleSubCategorySelect(subCategory)}
                                        />
                                        <label className="form-check-label ms-2" htmlFor={`subCategory-${subCategory.id}`}>
                                            {subCategory.label}
                                        </label>
                                    </div>
                                ))}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="by-status border-bottom rounded-0">
                    <h6 className="mt-4 mb-3 mx-4 fw-semibold">
                        <i className="ti ti-car-turbine"></i>
                        <span className="ms-1 fw-semibold">By Status</span>
                    </h6>
                    <div className="pb-4 px-4">
                        {['', ProductAPI.STOCK, ProductAPI.OUT_OF_STOCK].map(status => (
                            <div key={status} className="form-check py-2 mb-0">
                                <input
                                    className="form-check-input p-2"
                                    type="radio"
                                    name="statusRadios"
                                    id={status || 'status-all'}
                                    value={selectedStatus}
                                    checked={selectedStatus === status}
                                    onChange={() => handleStatusSelect(status)}
                                />
                                <label className="form-check-label d-flex align-items-center ps-2"
                                       htmlFor={status || 'status-all'}>
                                    {status ?
                                        UtilMethods.capitalizeFirstLetter(status) :
                                        'All'
                                    }
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="by-pricing border-bottom rounded-0">
                    <h6 className="mt-4 mb-3 mx-4 fw-semibold">
                        <i className="ti ti-discount-check"></i>
                        <span className="ms-1 fw-semibold">By Pricing</span>
                    </h6>
                    <div className="pb-4 px-4">
                        {['', '0_500', '500_2500', 'over_2500'].map(priceRange => (
                            <div key={priceRange} className="form-check py-2 mb-0">
                                <input
                                    className="form-check-input p-2"
                                    type="radio"
                                    name="priceRadios"
                                    id={priceRange || 'all'}
                                    value={priceRange}
                                    checked={selectedPriceRange === priceRange}
                                    onChange={() => handlePriceSelect(priceRange)}
                                />
                                <label className="form-check-label d-flex align-items-center ps-2" htmlFor={priceRange || 'all'}>
                                    {priceRange ?
                                        priceRange.replace('_', '-') :
                                        'All'
                                    }
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4" style={{
                backgroundColor: 'white',
            }}>
                <button
                    onClick={onResetFilters}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                >
                    <i className='ti ti-refresh'></i>
                    <span className='ms-2'>Reset Filters</span>
                </button>
            </div>
        </div>
    );
};

export default ShopFilters;
