import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const styles = `
  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .gradient-bg {
    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
`;

const ComingSoon: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const targetDate = new Date('2023-12-31T23:59:59').getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });

            if (difference < 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="container gradient-bg p-5 rounded-3">
                <motion.div
                    className="text-center text-white"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <motion.h1
                        className="display-2 fw-bold mb-4"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
                        style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.1em' }}
                    >
                        LAUNCHING SOON
                    </motion.h1>
                    <motion.p
                        className="lead mb-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Prepare for a digital revolution. The future begins here.
                    </motion.p>
                    <div className="row justify-content-center mb-5">
                        {Object.entries(timeLeft).map(([unit, value], index) => (
                            <motion.div
                                key={unit}
                                className="col-6 col-md-3 mb-4"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 * index, duration: 0.5 }}
                            >
                                <div className="glass-effect p-3">
                                    <motion.h2
                                        className="display-4 fw-bold mb-0"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                                    >
                                        {value}
                                    </motion.h2>
                                    <p className="text-uppercase mb-0 small">{unit}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <motion.form
                        className="row justify-content-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        <div className="col-12 col-md-5 mb-3">
                            <input
                                type="email"
                                className="form-control form-control-lg"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="col-12 col-md-auto">
                            <motion.button
                                type="submit"
                                className="btn btn-light btn-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Join the Revolution
                            </motion.button>
                        </div>
                    </motion.form>
                </motion.div>
            </div>
            <style dangerouslySetInnerHTML={{__html: styles}}/>
        </div>
    );
};

export default ComingSoon;