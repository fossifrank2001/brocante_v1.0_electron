import React from 'react';
import { motion } from 'framer-motion';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/images/logos/dark-logo.png';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
    className?: string;
    showVersion?: boolean;
    animate?: boolean;
    showImage?: boolean;
    imageSize?: number;
    fontSize?: string;
}

const Logo: React.FC<LogoProps> = ({
    className = "",
    showVersion = true,
    animate = false,
    showImage = true,
    imageSize = 26,
    fontSize = "1.5rem"
}) => {
    const { resolvedTheme } = useTheme();
    const logo = resolvedTheme === 'dark' ? logoDark : logoLight;

    const baseComponent = (
        <div className={`d-flex align-items-center justify-content-center`}>
            {showImage && (
                <img
                    src={logo}
                    alt='logo'
                    style={{
                        width: `${imageSize}px`,
                        height: `${imageSize/2}px`,
                        objectFit: "contain",
                        objectPosition: "center"
                    }}
                />
            )}
        </div>
    );

    if (!animate) return baseComponent;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {baseComponent}
        </motion.div>
    );
};

export default Logo;
