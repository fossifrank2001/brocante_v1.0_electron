import { motion } from 'framer-motion';
import Logo from '@/Components/common/Logo';

const Loading = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-white"
        >
            <div className="text-center mb-5">
                <Logo 
                    animate={true} 
                    showVersion={true} 
                    fontSize="2.5rem"
                    imageSize={40}
                />
                <p className="text-muted" style={{ fontFamily: "'Inter', sans-serif" }}>Votre marché aux trésors</p>
            </div>

            <motion.div
                className="d-flex justify-content-center align-items-center"
                style={{ gap: '8px' }}
            >
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#0d6efd',
                        }}
                        animate={{
                            y: ['0%', '-100%', '0%'],
                            opacity: [1, 0.5, 1],
                            scale: [1, 0.8, 1],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </motion.div>

            <motion.p
                className="text-muted mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Chargement en cours...
            </motion.p>
        </motion.div>
    );
};

export default Loading;
