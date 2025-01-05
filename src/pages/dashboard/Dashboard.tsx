import { useEffect, useLayoutEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box, useTheme, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAppContext } from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { motion } from 'framer-motion';
import DashboardComponent from '@/Components/dashboard/DashboardComponent.js';

export default function Dashboard() {
    const theme = useTheme();
    const context = useAppContext();
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        context.togglePageLoading()
        document.title = constants.APP_NAME + ' .:. Dashboard'
    }, [context]);

    useEffect(() => {
        // Simuler le chargement des données
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const salesData: { series: { name: string, data: number[] }[], options: ApexOptions } = {
        series: [{
            name: 'Ventes',
            data: [31, 40, 28, 51, 42, 109, 100].map(Number)
        }],
        options: {
            chart: {
                type: 'bar',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: '85%',
                    distributed: true,
                    dataLabels: {
                        position: 'top'
                    },
                }
            },
            fill: {
                opacity: 1
            },
            colors: [theme.palette.primary.main],
            dataLabels: {
                enabled: false
            },
            grid: {
                borderColor: theme.palette.divider,
                strokeDashArray: 4,
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            xaxis: {
                categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: theme.palette.text.secondary
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: (value) => `${value}€`
                }
            }
        }
    };

    const revenueData: { series: number[], options: ApexOptions } = {
        series: [44, 55, 13, 43],
        options: {
            chart: {
                type: 'donut' as const
            },
            labels: ['Vêtements', 'Électronique', 'Meubles', 'Autres'],
            colors: [
                theme.palette.primary.main,
                theme.palette.secondary.main,
                theme.palette.success.main,
                theme.palette.warning.main
            ],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%'
                    }
                }
            },
            legend: {
                position: 'bottom'
            },
            tooltip: {
                theme: theme.palette.mode
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return <>
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card 
                            elevation={0}
                            sx={{
                                height: '100%',
                                // background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                borderRadius: 2,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.12)}`,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    mb: 2
                                }}>
                                    Aperçu des ventes
                                </Typography>
                                <ReactApexChart 
                                    options={salesData.options}
                                    series={salesData.series}
                                    type="bar"
                                    height={350}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card 
                            elevation={0}
                            sx={{
                                height: '100%',
                                background: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.12)}`,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    mb: 2
                                }}>
                                    Répartition des revenus
                                </Typography>
                                <ReactApexChart 
                                    options={revenueData.options}
                                    series={revenueData.series}
                                    type="donut"
                                    height={350}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
        <DashboardComponent />
    </>
}