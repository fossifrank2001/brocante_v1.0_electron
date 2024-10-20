import PageLoadingIndicator from "Components/PageLoadingIndicator.tsx";
import {useAppContext} from "@/contexts/appContext.tsx";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useLayoutEffect, useState} from "react";
import constants from "Data/Utilities/constants.ts";
import success_congratulation from "../../assets/images/products/success_congratulation.jpg"
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";

function SuccessSellPage() {
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const navigation = useAppSelector(state => state.navigaton);
    const [isDownloading, setIsDownloading] = useState(false)

    useLayoutEffect(() => {
        document.title = constants.APP_NAME + " .:. Success Sell"
        context.togglePageLoading()
    }, []);

    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true)
        }catch (e) {
            console.error(e.message)
        }finally {
            setIsDownloading(false)
        }
    }


    return  <>
        <PageLoadingIndicator visible={context.pageLoading} />
        <div className="body-wrapper-home">
            <div className="min-vh-100">
                <div className='w-100 d-flex justify-content-center flex-column' style={{height: "100vh"}}>
                    <div className="" style={{margin: "0 auto", width: '75%', height: "200px"}}>
                        <img src={success_congratulation} className='w-100 h-100 object-fit-contain' alt='succecc-sell' style={{objectPosition: "center"}} />
                    </div>
                    <p className='fs-6 text-center'>Sell has been proceed successfully.</p>
                    <p className='fs-2 text-center'>Sell Number : <strong>{navigation.param?.number}</strong></p>
                    <div className='btn-actions d-flex align-items-center justify-content-center w-100 gap-3'>
                        <button className='btn py-3 px-5 btn-primary d-flex align-items-center' onClick={() => {
                            context.togglePageLoading(true)
                            dispatch(setActivePage({page: Pages.HOME}))
                        }}>
                            <i className='ti ti-arrow-back me-1'></i>
                            <span>Back to shop</span>
                        </button>
                        {navigation.param && <button
                            className='btn py-3 px-5 btn-secondary d-flex align-items-center'
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                        >
                            <i className='ti ti-file me-1'></i>
                            {navigation.param?.type === 'total' ?
                                <span>Download receipt</span>
                                :
                                <span>Download invoice</span>
                            }
                        </button>}
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default SuccessSellPage
