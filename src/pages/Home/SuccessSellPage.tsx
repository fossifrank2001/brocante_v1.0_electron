import { useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import PageLoadingIndicator from "Components/PageLoadingIndicator";
import { useAppContext } from "@/contexts/appContext";
import { useAppDispatch, useAppSelector } from "@/hooks";
import constants from "Data/Utilities/constants";
import success_congratulation from "../../assets/images/products/success_congratulation.jpg";
import { setActivePage } from "Data/Slices/NavigationSlice";
import { Pages } from "Data/Objects/state";
import StreamedDocumentAPI from "Data/Api/StreamedDocument.ts";

/**
 * @returns {JSX.Element}
 */
function SuccessSellPage(): JSX.Element {
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const navigation = useAppSelector(state => state.navigaton);
    const [isDownloading, setIsDownloading] = useState(false);

    useLayoutEffect(() => {
        document.title = constants.APP_NAME + " .:. Success Sell";
        context.togglePageLoading(false);
    }, []);

    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true);
            const recordNumber = navigation.param?.number;
            const documentType = navigation.param?.type === 'total' ? 'receipt' : 'invoice';

            if (recordNumber) {
                await StreamedDocumentAPI.generate(documentType, recordNumber, 'download');
            } else {
                throw new Error("Record number is missing");
            }
        } catch (e) {
            // You might want to show an error message to the user here
        } finally {
            setIsDownloading(false);
        }
    };

    const pageVariants = {
        initial: { opacity: 0, y: 50 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -50 }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    return (
        <>
            <PageLoadingIndicator visible={context.pageLoading} />
            <motion.div
                className="body-wrapper-home"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
            >
                <div className="min-vh-100">
                    <div className='w-100 d-flex justify-content-center flex-column' style={{height: "100vh"}}>
                        <motion.div
                            className=""
                            style={{margin: "0 auto", width: '75%', height: "200px"}}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <img src={success_congratulation} className='w-100 h-100 object-fit-contain' alt='success-sell' style={{objectPosition: "center"}} />
                        </motion.div>
                        <motion.p
                            className='fs-6 text-center'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Sale has been processed successfully.
                        </motion.p>
                        <motion.p
                            className='fs-2 text-center'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            Sale Number: <strong>{navigation.param?.number}</strong>
                        </motion.p>
                        <motion.div
                            className='btn-actions d-flex align-items-center justify-content-center w-100 gap-3'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <motion.button
                                className='btn py-3 px-5 btn-primary d-flex align-items-center'
                                onClick={() => {
                                    context.togglePageLoading(true);
                                    dispatch(setActivePage({page: Pages.HOME}));
                                }}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <i className='ti ti-arrow-left me-2'></i>
                                <span>Back to shop</span>
                            </motion.button>
                            {navigation.param && (
                                <motion.button
                                    className='btn py-3 px-5 btn-secondary d-flex align-items-center'
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    {isDownloading ? (
                                        <motion.i
                                            className='ti ti-loader me-2'
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        ></motion.i>
                                    ) : (
                                        <i className='ti ti-file-text me-2'></i>
                                    )}
                                    <span>
                                        {navigation.param?.type === 'total' ? 'Download receipt' : 'Download invoice'}
                                    </span>
                                </motion.button>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default SuccessSellPage;