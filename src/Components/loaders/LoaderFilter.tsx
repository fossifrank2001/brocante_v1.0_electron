import { Box, Divider, Skeleton } from '@mui/material';
import { AttachMoney, Category, FilterAlt, Inventory } from '@mui/icons-material';

const LoaderFilter = () => {
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: '1px solid #e0e0e0'
                }}
            >
                <FilterAlt color="primary" fontSize="small" />
                <Skeleton variant="text" width={90} height={24} />
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                {/* Categories */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Category color="primary" fontSize="small" />
                    <Skeleton variant="text" width={110} height={20} />
                </Box>

                {Array.from({ length: 3 }).map((_, i) => (
                    <Box
                        key={i}
                        sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: 1.5,
                            mb: 1.25,
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ px: 1.25, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Skeleton variant="text" width={160} height={18} />
                            <Skeleton variant="circular" width={18} height={18} />
                        </Box>
                        <Box sx={{ px: 1.25, pb: 1.25 }}>
                            {Array.from({ length: 2 }).map((_, j) => (
                                <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                    <Skeleton variant="rounded" width={16} height={16} />
                                    <Skeleton variant="text" width={120} height={16} />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Inventory color="primary" fontSize="small" />
                    <Skeleton variant="text" width={70} height={20} />
                </Box>
                {Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Skeleton variant="circular" width={16} height={16} />
                        <Skeleton variant="text" width={140} height={16} />
                    </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Price */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AttachMoney color="primary" fontSize="small" />
                    <Skeleton variant="text" width={45} height={20} />
                </Box>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Skeleton variant="circular" width={16} height={16} />
                        <Skeleton variant="text" width={180} height={16} />
                    </Box>
                ))}
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Skeleton variant="rounded" height={36} />
            </Box>
        </Box>
    );
};

export default LoaderFilter;
