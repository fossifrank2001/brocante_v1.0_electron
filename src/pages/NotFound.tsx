import { Link } from "@mui/material";
import errorImg from "@/assets/images/backgrounds/errorimg.svg"
import { useAppDispatch } from "@/hooks";
import { setActivePage } from "@/Data/Slices/NavigationSlice";
import { Pages } from "@/Data/Objects/state";

export default function NotFound() {
    const dispatch = useAppDispatch();
    return <div id="main-wrapper" style={{minHeight: '80vh'}}>
        <div
            className="position-relative overflow-hidden min-vh-100 w-100 d-flex align-items-center justify-content-center">
            <div className="d-flex align-items-center justify-content-center w-100">
                <div className="row justify-content-center w-100">
                    <div className="col-lg-5">
                        <div className="text-center">
                            <img src={errorImg} alt="modernize-img"
                                 className="img-fluid" width="400" />
                                <h1 className="fw-semibold mb-4 fs-9">Opps!!!</h1>
                                <h5 className="mb-7 fw-light">This page you are looking for could not be found.</h5>
                                <Link onClick={() => dispatch(setActivePage({page: Pages.DASHBOARD}))} className="btn btn-primary text text-white" href="#" role="button">Go Back to
                                    Home</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
