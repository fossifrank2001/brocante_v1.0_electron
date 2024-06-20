import React from 'react';
import { IPaginationData } from "Interfaces";
import { motion } from 'framer-motion';

interface PaginationProps {
    paginationData: IPaginationData;
    onPageChange: (page: number) => void;
}

const circleButtonStyles = {
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
};

const PaginationComponent: React.FC<PaginationProps> = ({ paginationData, onPageChange }) => {
    const { links, current_page, last_page } = paginationData;

    const handlePageChange = (page: number) => {
        if (page !== current_page && page >= 1 && page <= last_page) {
            onPageChange(page);
        }
    };

    const mapLabelToIcon = (label: string) => {
        switch (label) {
            case "&laquo; Previous":
                return <i className="ti ti-chevron-left"></i>;
            case "Next &raquo;":
                return <i className="ti ti-chevron-right"></i>;
            default:
                return label; // Retourne le label inchangé si aucune correspondance
        }
    };

    return (
        <nav>
            <ul className="pagination justify-content-center">
                <li className={`page-item ${!links[0].url ? 'disabled' : ''}`}>
                    <button
                        style={circleButtonStyles}
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                        disabled={!links[0].url}
                    >
                        <i className="ti ti-chevrons-left"></i>
                    </button>
                </li>
                {links.map((link, index) => (
                    <li key={index} className={`page-item ${link.active ? 'active' : ''}`}>
                        <motion.button
                            style={circleButtonStyles}
                            className="page-link btn-circle"
                            onClick={() => {
                                if (link.label === "&laquo; Previous") {
                                    handlePageChange(current_page - 1);
                                } else if (link.label === "Next &raquo;") {
                                    handlePageChange(current_page + 1);
                                } else {
                                    handlePageChange(parseInt(link.label));
                                }
                            }}
                            disabled={!link.url}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {link.label !== "&laquo; Previous" && link.label !== "Next &raquo;" ? link.label : mapLabelToIcon(link.label)}
                        </motion.button>
                    </li>
                ))}
                <li className={`page-item ${!links[links.length - 1].url ? 'disabled' : ''}`}>
                    <button
                        style={circleButtonStyles}
                        className="page-link"
                        onClick={() => handlePageChange(last_page)}
                        disabled={!links[links.length - 1].url}
                    >
                        <i className="ti ti-chevrons-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default PaginationComponent;
