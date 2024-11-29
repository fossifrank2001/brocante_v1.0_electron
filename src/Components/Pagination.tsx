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
        <nav className='position-fixed bg-white d-flex justify-content-between align-items-center' style={{
            left:'50%',
            bottom:'20px',
            padding: "10px 12px",
            borderRadius: "8px",
            zIndex: 500
        }}>
            <div className="d-flex align-items-center me-2">
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
            <ul className="pagination justify-content-center m-0">
                <li className={`page-item ${!links[0].url ? 'disabled' : ''}`}>
                    <button
                        style={circleButtonStyles}
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                        disabled={!links[0].url}
                        aria-label="First page"
                    >
                        <i className="ti ti-chevrons-left" aria-hidden="true"></i>
                    </button>
                </li>
                {links.map((link, index) => (
                    <li key={index} className={`page-item ${link.active ? 'active' : ''}`}>
                        <motion.button
                            style={circleButtonStyles}
                            className="page-link btn-circle mx-1"
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
                            aria-label={link.label}
                        >
                            {link.label !== "&laquo; Previous" && link.label !== "Next &raquo;" ? link.label :
                                mapLabelToIcon(link.label)}
                        </motion.button>
                    </li>
                ))}
                <li className={`page-item ${!links[links.length - 1].url ? 'disabled' : ''}`}>
                    <button
                        style={circleButtonStyles}
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