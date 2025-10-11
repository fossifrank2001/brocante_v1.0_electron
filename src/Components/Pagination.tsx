import { IPaginationData } from "Interfaces";
import { motion } from 'framer-motion';
import {Select, MenuItem, FormControl, InputLabel, SelectChangeEvent} from '@mui/material';

interface PaginationProps {
    paginationData: IPaginationData;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    perPage: number;
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

export default function PaginationComponent({ paginationData, onPageChange, onPerPageChange, perPage }: PaginationProps) {
    const { links, current_page, last_page, total } = paginationData;

    const handlePageChange = (page: number) => {
        if (page !== current_page && page >= 1 && page <= last_page) {
            onPageChange(page);
        }
    };

    const handlePerPageChange = (event: SelectChangeEvent<number>) => {
        onPerPageChange(event.target.value as number);
    };

    const mapLabelToIcon = (label: string) => {
        switch (label) {
            case "&laquo; Previous":
                return <i className="ti ti-chevron-left" aria-hidden="true"></i>;
            case "Next &raquo;":
                return <i className="ti ti-chevron-right" aria-hidden="true"></i>;
            default:
                return label;
        }
    };

    return (
        <nav
            className='position-fixed d-flex align-items-center'
            style={{
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: '20px',
                padding: '10px 14px',
                borderRadius: '12px',
                zIndex: 1100,
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'saturate(180%) blur(8px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                gap: '12px'
            }}
        >
            <div className="d-flex align-items-center">
                <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
                    <InputLabel id="per-page-select-label">Per page</InputLabel>
                    <Select
                        labelId="per-page-select-label"
                        id="per-page-select"
                        value={perPage}
                        onChange={handlePerPageChange}
                        label="Per page"
                        variant="outlined"
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={total}>All</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <ul className="pagination justify-content-center align-items-center m-0" style={{ gap: '8px' }}>
                <li className={`page-item ${!links[0].url ? 'disabled' : ''}`}>
                    <button
                        style={{
                            ...circleButtonStyles,
                            backgroundColor: 'white',
                            color: '#1976d2',
                            border: '1px solid #e0e0e0'
                        }}
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                        disabled={!links[0].url}
                        aria-label="First page"
                    >
                        <i className="ti ti-chevrons-left" aria-hidden="true"></i>
                    </button>
                </li>
                {links.map((link, index) => {
                    const isPrev = link.label === "&laquo; Previous";
                    const isNext = link.label === "Next &raquo;";
                    const isActive = link.active && !isPrev && !isNext;
                    const bg = isActive ? '#1976d2' : 'white';
                    const color = isActive ? 'white' : '#1976d2';
                    return (
                        <li key={index} className={`page-item ${isActive ? 'active' : ''}`}>
                            <motion.button
                                style={{
                                    ...circleButtonStyles,
                                    backgroundColor: bg,
                                    color,
                                    border: '1px solid #e0e0e0'
                                }}
                                className="page-link btn-circle"
                                onClick={() => {
                                    if (isPrev) {
                                        handlePageChange(current_page - 1);
                                    } else if (isNext) {
                                        handlePageChange(current_page + 1);
                                    } else {
                                        handlePageChange(parseInt(link.label));
                                    }
                                }}
                                disabled={!link.url}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.96 }}
                                aria-label={link.label}
                            >
                                {!isPrev && !isNext ? link.label : mapLabelToIcon(link.label)}
                            </motion.button>
                        </li>
                    );
                })}
                <li className={`page-item ${!links[links.length - 1].url ? 'disabled' : ''}`}>
                    <button
                        style={{
                            ...circleButtonStyles,
                            backgroundColor: 'white',
                            color: '#1976d2',
                            border: '1px solid #e0e0e0'
                        }}
                        className="page-link"
                        onClick={() => handlePageChange(last_page)}
                        disabled={!links[links.length - 1].url}
                        aria-label="Last page"
                    >
                        <i className="ti ti-chevrons-right" aria-hidden="true"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
}