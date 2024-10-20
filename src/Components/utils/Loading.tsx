import { motion } from 'framer-motion';

const Loading = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-container"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f0f0f0',
            }}
        >
            <div className='d-flex flex-column gap-8 align-items-center justify-content-center'>
                <h2 className='mb-5'><strong>Brocante</strong><span className='text-white py-1 px-3' style={{borderRadius: '10px', backgroundColor: '#007bff'}}>V1.0</span></h2>
                <motion.div
                    className="loader"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        width: 120,
                    }}
                >
                    <motion.div
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: '#007bff',
                        }}
                        animate={{ y: [0, -30, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: '#007bff',
                        }}
                        animate={{ y: [0, -30, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: 'easeInOut',
                            delay: 0.2,
                        }}
                    />
                    <motion.div
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: '#007bff',
                        }}
                        animate={{ y: [0, -30, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: 'easeInOut',
                            delay: 0.4,
                        }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Loading;

/*import { motion } from 'framer-motion';
const Loading = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-container"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f0f0f0',
                flexDirection: 'column',
            }}
        >
            <h2 style={{ marginBottom: '20px' }}>Loading...</h2>
            <motion.div
                style={{
                    width: '80%',
                    height: '10px',
                    borderRadius: '5px',
                    backgroundColor: '#ddd',
                    overflow: 'hidden',
                }}
            >
                <motion.div
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '5px',
                        backgroundColor: '#007bff',
                    }}
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        duration: 2,
                        ease: 'linear',
                        repeat: Infinity,
                        repeatType: 'loop',
                    }}
                />
            </motion.div>
        </motion.div>
    );
};
export default Loading;*/
