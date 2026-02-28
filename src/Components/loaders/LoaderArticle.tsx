import { Box, Card, CardContent, Skeleton } from '@mui/material';

const LoaderArticle = () => {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            <Skeleton variant="rectangular" height={180} />
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Skeleton variant="text" width="85%" height={22} />
                <Skeleton variant="text" width="60%" height={22} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Skeleton variant="text" width={90} height={24} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Box>
            </CardContent>
        </Card>
    );
};

export default LoaderArticle;
