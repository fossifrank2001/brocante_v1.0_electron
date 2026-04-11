import React, { useRef, useState, useEffect } from 'react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const themeOptions: { mode: ThemeMode; icon: string; label: string }[] = [
    { mode: 'light', icon: 'ti ti-sun', label: 'Clair' },
    { mode: 'dark', icon: 'ti ti-moon', label: 'Sombre' },
    { mode: 'system', icon: 'ti ti-device-desktop', label: 'Système' },
];

interface ThemeToggleProps {
    /** Compact mode: just show the icon, no dropdown */
    compact?: boolean;
    /** Custom class */
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = '' }) => {
    const { mode, setMode, resolvedTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const current = themeOptions.find(o => o.mode === mode) ?? themeOptions[0];

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (compact) {
        return (
            <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    const order: ThemeMode[] = ['light', 'dark', 'system'];
                    const idx = order.indexOf(mode);
                    setMode(order[(idx + 1) % order.length]);
                }}
                className={className}
                title={`Thème: ${current.label}`}
                style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                }}
            >
                <i className={current.icon} style={{ fontSize: '1.1rem' }} />
            </motion.button>
        );
    }

    return (
        <div ref={ref} style={{ position: 'relative' }} className={className}>
            <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(!open)}
                title={`Thème: ${current.label}`}
                style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                }}
            >
                <i className={current.icon} style={{ fontSize: '1rem' }} />
                <span style={{ fontSize: '0.75rem' }}>{current.label}</span>
                <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', opacity: 0.5 }} />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 6,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 12,
                            boxShadow: 'var(--shadow-lg)',
                            padding: 6,
                            minWidth: 160,
                            zIndex: 900,
                        }}
                    >
                        {themeOptions.map(opt => {
                            const isActive = mode === opt.mode;
                            return (
                                <button
                                    key={opt.mode}
                                    onClick={() => { setMode(opt.mode); setOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        borderRadius: 8,
                                        background: isActive ? 'var(--accent-primary-muted)' : 'transparent',
                                        color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: '0.85rem',
                                        transition: 'all 0.15s ease',
                                        boxShadow: 'none',
                                        transform: 'none',
                                    }}
                                    onMouseEnter={e => {
                                        if (!isActive) (e.currentTarget.style.background = 'var(--bg-secondary)');
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) (e.currentTarget.style.background = 'transparent');
                                    }}
                                >
                                    <i className={opt.icon} style={{ fontSize: '1.1rem' }} />
                                    <span>{opt.label}</span>
                                    {isActive && (
                                        <i className="ti ti-check" style={{ marginLeft: 'auto', fontSize: '0.9rem' }} />
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeToggle;
