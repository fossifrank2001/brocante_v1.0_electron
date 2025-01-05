import "../../assets/css/skeletons/article.less"
const LoaderArticle = () => {
    return (
        <div className="col-sm-4 col-lg-3 col-xxl-3 p-2">
            <div className="card hover-img overflow-hidden border border-1 border-dark skeleton-card"
                 style={{boxShadow: "0 0 5px lightgray", borderRadius: "12px"}}
            >
                <div className="position-relative">
                    <div className="skeleton-image" style={{ height: '125px' }}></div>
                    <div className="text-bg-primary rounded-circle p-2 text-white d-inline-flex position-absolute bottom-0 end-0 mb-n3 me-3 skeleton-icon"></div>
                </div>
                <div className="card-body pt-3 p-4">
                    <h6 className="fs-4 skeleton-text skeleton-text-long"></h6>
                    <div className="d-flex align-items-center justify-content-between">
                        <h6 className="fs-4 mb-0">
                            <span className="skeleton-text skeleton-text-short"></span>
                            <span className="ms-2 fw-normal text-muted fs-3 skeleton-text skeleton-text-short"></span>
                        </h6>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoaderArticle;
