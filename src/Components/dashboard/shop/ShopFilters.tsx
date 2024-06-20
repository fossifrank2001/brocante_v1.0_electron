import React from 'react';
import { ICategory } from "Data/Interfaces/Category.ts";
import { ISubCategory } from "Data/Interfaces/Supply.ts";

interface ShopFiltersProps {
    categories: ICategory[];
    selectedSubCategories: ISubCategory[];
    selectedPriceRange: string;
    onSubCategoryChange: (subCategories: ISubCategory[]) => void;
    onPriceChange: (priceRange: string) => void;
    onResetFilters: () => void;
}

const ShopFilters: React.FC<ShopFiltersProps> = ({
         categories,
         selectedSubCategories,
         selectedPriceRange,
         onSubCategoryChange,
         onPriceChange,
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

    return (
        <div className="card shop-filters flex-shrink-0 border-end d-none d-lg-block">
            <ul className="list-group pt-2 border-bottom rounded-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <h6 className="my-3 mx-4">Filter by Category</h6>
                {categories.map(category => (
                    <li key={category.id} className="list-group-item border-0 p-0 mx-4 mb-2">
                        <a className="d-flex align-items-center gap-6 list-group-item-action text-dark px-3 py-6 rounded-1" href="#">
                            <i className="ti ti-circles fs-5"></i>{category.label}
                        </a>
                        {category.sub_categories.map(subCategory => (
                            <div key={subCategory.id} className="form-check ms-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`subCategory-${subCategory.id}`}
                                    checked={selectedSubCategories.some(sc => sc.id === subCategory.id)}
                                    onChange={() => handleSubCategorySelect(subCategory)}
                                />
                                <label className="form-check-label" htmlFor={`subCategory-${subCategory.id}`}>
                                    {subCategory.label}
                                </label>
                            </div>
                        ))}
                    </li>
                ))}
            </ul>
            <div className="by-pricing border-bottom rounded-0">
                <h6 className="mt-4 mb-3 mx-4 fw-semibold">By Pricing</h6>
                <div className="pb-4 px-4">
                    <div className="form-check py-2 mb-0">
                        <input
                            className="form-check-input p-2"
                            type="radio"
                            name="priceRadios"
                            id="all"
                            value=""
                            checked={selectedPriceRange === ''}
                            onChange={() => handlePriceSelect('')}
                        />
                        <label className="form-check-label d-flex align-items-center ps-2" htmlFor="all">
                            All
                        </label>
                    </div>
                    <div className="form-check py-2 mb-0">
                        <input
                            className="form-check-input p-2"
                            type="radio"
                            name="priceRadios"
                            id="0_500"
                            value="0_500"
                            checked={selectedPriceRange === '0_500'}
                            onChange={() => handlePriceSelect('0_500')}
                        />
                        <label className="form-check-label d-flex align-items-center ps-2" htmlFor="0_500">
                            0-500
                        </label>
                    </div>
                    <div className="form-check py-2 mb-0">
                        <input
                            className="form-check-input p-2"
                            type="radio"
                            name="priceRadios"
                            id="500_2500"
                            value="500_2500"
                            checked={selectedPriceRange === '500_2500'}
                            onChange={() => handlePriceSelect('500_2500')}
                        />
                        <label className="form-check-label d-flex align-items-center ps-2" htmlFor="500_2500">
                            500-2500
                        </label>
                    </div>
                    <div className="form-check py-2 mb-0">
                        <input
                            className="form-check-input p-2"
                            type="radio"
                            name="priceRadios"
                            id="over_2500"
                            value="over_2500"
                            checked={selectedPriceRange === 'over_2500'}
                            onChange={() => handlePriceSelect('over_2500')}
                        />
                        <label className="form-check-label d-flex align-items-center ps-2" htmlFor="over_2500">
                            over 2500
                        </label>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <button onClick={onResetFilters} className="btn btn-primary w-100">Reset Filters</button>
            </div>
        </div>
    );
};

export default ShopFilters;
