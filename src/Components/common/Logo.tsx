import React from 'react';
import { motion } from 'framer-motion';
import logo from '../../../public/favicon.png';

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
    const baseComponent = (
        <div className={`d-flex align-items-center gap-2 ${className}`}>
            {showImage && (
                <img 
                    src={logo} 
                    alt='logo' 
                    style={{
                        width: `${imageSize}px`, 
                        height: `${imageSize}px`, 
                        objectFit: "cover", 
                        objectPosition: "center"
                    }}
                />
            )}
            <h1 className="mb-0" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                <span className="text-dark" style={{ fontSize, letterSpacing: '-0.5px' }}>Brocante</span>
                {showVersion && (
                    <span 
                        className="ms-2 badge bg-primary" 
                        style={{ 
                            fontSize: `calc(${fontSize} * 0.5)`, 
                            verticalAlign: 'middle', 
                            fontWeight: 600 
                        }}
                    >
                        V1.0
                    </span>
                )}
            </h1>
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
