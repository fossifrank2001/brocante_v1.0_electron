import { Pages } from "@/Data/Objects/state";
import { setActivePage } from "@/Data/Slices/NavigationSlice";
import chatBc from "@/assets/images/backgrounds/ChatBc.png";
import { useAppDispatch } from '@/hooks';
import { Link } from "@mui/material";

interface IBreadcrumb {
    parent  : string;
    url     ?: Pages;
    _child  ?: string | number; 
}

export default function Breadcrumd(props : IBreadcrumb) {
    const dispatch = useAppDispatch()

    return <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-2">
        <div className="card-body px-4 py-1" style={{height: "75px"}}>
            <div className="row align-items-center">
                <div className="col-9">
                    <h4 className="fw-semibold mb-8">{props.parent}</h4>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link className="text-muted text-decoration-none" href='#' onClick={() => dispatch(setActivePage({page: Pages.DASHBOARD}))} >Dashboard</Link>
                            </li>
                            {
                                props.url?<>
                                        <li className="breadcrumb-item">
                                        <Link
                                            className="text-muted text-decoration-none"
                                            href="#"
                                            onClick={() => dispatch(setActivePage({page: props.url!}))}
                                        >
                                            {props.parent}
                                        </Link>                                        </li>
                                        <li className="breadcrumb-item" aria-current="page">{props._child}</li>
                                    </> :
                                    <li className="breadcrumb-item" aria-current="page">{props.parent}</li>
                            }

                        </ol>
                    </nav>
                </div>
                <div className="col-3">
                    <div className="text-center mb-n5">
                        <img src={chatBc} alt="modernize-img"
                             className="img-fluid mb-n4" />
                    </div>
                </div>
            </div>
        </div>
    </div>
}
