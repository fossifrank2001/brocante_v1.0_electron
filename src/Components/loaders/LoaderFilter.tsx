import "../../assets/css/skeletons/article.less"

const LoaderFilter = () => {
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
                {/* Categories Section */}
                <div className="by-categories border-bottom rounded-0">
                    <h6 className="my-3 mx-4 d-flex align-items-center">
                        <i className="ti ti-category text-skeleton"></i>
                        <span className="ms-1 fw-semibold skeleton-text" style={{width: '120px'}}></span>
                    </h6>
                    <ul className="list-group pt-2 border-bottom rounded-0" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <li key={index} className="list-group-item border-0 p-0 mx-4 mb-2">
                                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-1 bg-light">
                                    <i className="fs-5 text-skeleton"></i>
                                    <span className="skeleton-text" style={{width: '100px'}}></span>
                                </div>
                                {Array.from({ length: 3 }).map((_, subIndex) => (
                                    <div key={subIndex} className="form-check ms-4 mt-2 mb-1">
                                        <div className="skeleton-checkbox"></div>
                                        <span className="ms-2 skeleton-text" style={{width: '80px'}}></span>
                                    </div>
                                ))}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Status Section */}
                <div className="by-status border-bottom rounded-0">
                    <h6 className="mt-4 mb-3 mx-4 d-flex align-items-center">
                        <i className="ti ti-car-turbine text-skeleton"></i>
                        <span className="ms-1 fw-semibold skeleton-text" style={{width: '80px'}}></span>
                    </h6>
                    <div className="pb-4 px-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="form-check mb-2">
                                <div className="skeleton-radio"></div>
                                <span className="ms-2 skeleton-text" style={{width: '90px'}}></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Range Section */}
                <div className="by-pricing border-bottom rounded-0">
                    <h6 className="mt-4 mb-3 mx-4 d-flex align-items-center">
                        <i className="ti ti-currency-euro text-skeleton"></i>
                        <span className="ms-1 fw-semibold skeleton-text" style={{width: '100px'}}></span>
                    </h6>
                    <div className="pb-4 px-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="form-check mb-2">
                                <div className="skeleton-radio"></div>
                                <span className="ms-2 skeleton-text" style={{width: '110px'}}></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reset Button */}
            <div className="p-4 mt-auto" style={{backgroundColor: 'white'}}>
                <div className="skeleton-button w-100"></div>
            </div>
        </div>
    );
};

export default LoaderFilter;
