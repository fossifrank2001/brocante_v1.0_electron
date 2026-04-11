import { motion } from 'framer-motion';
import Logo from '@/Components/common/Logo';
import { useTranslation } from 'react-i18next';

const Loading = () => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <div className="text-center mb-5">
                <Logo 
                    animate={true} 
                    showVersion={true} 
                    fontSize="2.5rem"
                    imageSize={40}
                />
                <p className="text-muted" style={{ fontFamily: "'Inter', sans-serif" }}>{t('common.loadingMessage')}</p>
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
                            backgroundColor: 'var(--accent-primary)',
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
                {t('common.loading')}
            </motion.p>
        </motion.div>
    );
};

export default Loading;

