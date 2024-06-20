import {motion} from "framer-motion";
import "Styles/Product.less"

export const LoadingAnimation = () => {
    return (
        <div className="loading-container">
            <motion.div
                className="loading-animation"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, loop: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
};