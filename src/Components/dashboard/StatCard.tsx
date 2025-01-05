import React from 'react';
import { Box, Paper, Typography, useTheme, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {useAppDispatch} from "@/hooks";
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from 'Data/Objects/state';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: number;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    viewMorePath?: Pages;
    viewMoreParams?: { type?: string; value?: string; } | null;
}

export const StatCard: React.FC<StatCardProps> = ({
    title, value, subtitle, icon, trend, color = 'primary', viewMorePath, viewMoreParams
}) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const handleViewMore = () => {
        viewMorePath && dispatch(setActivePage({ page: viewMorePath, search: viewMoreParams || null }));
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(
                    theme.palette[color].main,
                    0.05
                )} 100%)`,
                border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
                borderRadius: 2,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 2px 10px 0 ${alpha(theme.palette[color].main, 0.15)}`,
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                {icon && (
                    <Box
                        sx={{
                            p: 0.75,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette[color].main, 0.1),
                            color: theme.palette[color].main
                        }}
                    >
                        {icon}
                    </Box>
                )}
            </Box>

            <Box sx={{ mt: 1.5 }}>
                <Typography variant="h3" sx={{ 
                    color: theme.palette[color].main,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    mb: 0.5 
                }}>
                    {value}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {title}
                </Typography>

                {(subtitle || trend !== undefined) && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {trend !== undefined && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main
                                }}
                            >
                                {trend >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                                <Typography variant="caption" sx={{ ml: 0.25 }}>
                                    {Math.abs(trend)}%
                                </Typography>
                            </Box>
                        )}
                        {subtitle && (
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                )}

                {viewMorePath && (
                    <Box sx={{ mt: 1 }}>
                        <Button
                            size="small"
                            variant="text"
                            color={color}
                            onClick={handleViewMore}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                py: 0.5,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette[color].main, 0.1),
                                }
                            }}
                        >
                            View more
                        </Button>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};
