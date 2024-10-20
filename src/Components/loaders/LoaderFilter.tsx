import "../../assets/css/skeletons/article.less"
const LoaderFilter = () => {
    return (
        <div className="card shop-filters flex-shrink-0 border-end d-none d-lg-block" style={{width:'300px'}}>
            <h6 className="my-3 mx-4">Filter by Category</h6>
            <ul className="list-group pt-2 border-bottom rounded-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <li key={index} className="list-group-item border-0 p-0 mx-4 mb-2">
                        <div className="d-flex align-items-center gap-2 p-3 rounded-1 bg-light cursor-pointer">
                            <span className="skeleton-text skeleton-button"></span>
                        </div>
                        {Array.from({ length: 2 }).map((_, subIndex) => (
                            <div key={subIndex} className="form-check d-flex align-items-center my-1">
                                <div className="skeleton-checkbox"></div>
                                <label className="form-check-label ms-1 skeleton-text skeleton-text-short"></label>
                            </div>
                        ))}
                    </li>
                ))}
            </ul>
            <div className="by-pricing border-bottom rounded-0">
                <h6 className="mt-4 mb-3 mx-4 fw-semibold">By Pricing</h6>
                <div className="pb-4 px-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="form-check py-2 mb-0 d-flex">
                            <div className="skeleton-radio"></div>
                            <label className="form-check-label ms-1 d-flex align-items-center ps-2 skeleton-text skeleton-text-short"></label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4">
                <button className="btn btn-primary w-100 skeleton-button" disabled>Reset Filters</button>
            </div>
        </div>
    );
};

export default LoaderFilter;
