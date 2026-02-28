import { useEffect, useLayoutEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box, useTheme, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAppContext } from "@/contexts/appContext";
import constants from "Data/Utilities/constants";
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { motion } from 'framer-motion';
import DashboardComponent from '@/Components/dashboard/DashboardComponent.js';

const glassCardStyle = {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        boxShadow: '0 25px 50px rgba(0,0,0,0.08)',
        transform: 'translateY(-4px)'
    }
};

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
        }, 1500);
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
                },
                background: 'transparent',
                fontFamily: 'inherit'
            },
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    columnWidth: '50%',
                    distributed: true,
                    dataLabels: {
                        position: 'top'
                    },
                }
            },
            fill: {
                opacity: 0.85,
            },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#14b8a6'],
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val + "€";
                },
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ["#334155"],
                    fontWeight: 700
                }
            },
            grid: {
                borderColor: 'rgba(226, 232, 240, 0.6)',
                strokeDashArray: 4,
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } }
            },
            xaxis: {
                categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        colors: '#64748b',
                        fontWeight: 600,
                        fontSize: '13px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#64748b',
                        fontWeight: 600,
                        fontSize: '13px'
                    },
                    formatter: (value) => `${value}€`
                }
            },
            tooltip: {
                theme: 'light',
                y: {
                    formatter: (value) => `${value}€`
                },
                style: {
                    fontSize: '13px',
                }
            }
        }
    };

    const revenueData: { series: number[], options: ApexOptions } = {
        series: [44, 55, 13, 43],
        options: {
            chart: {
                type: 'donut' as const,
                fontFamily: 'inherit',
                background: 'transparent'
            },
            labels: ['Vêtements', 'Électronique', 'Meubles', 'Autres'],
            colors: [
                '#6366f1', // Indigo
                '#10b981', // Emerald
                '#f59e0b', // Amber
                '#0ea5e9', // Sky blue
            ],
            stroke: {
                width: 0
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '20px',
                                fontWeight: 800,
                                color: '#1e293b',
                                offsetY: -10
                            },
                            value: {
                                show: true,
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#64748b',
                                offsetY: 16,
                                formatter: function (val) {
                                    return val + "%"
                                }
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                label: 'Total',
                                fontSize: '20px',
                                fontWeight: 800,
                                color: '#1e293b',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => {
                                        return a + b
                                    }, 0) + "%"
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                position: 'bottom',
                fontWeight: 600,
                fontSize: '14px',
                labels: {
                    colors: '#475569'
                },
                markers: {
                    offsetX: -4,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 8
                }
            },
            tooltip: {
                theme: 'light'
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width={250} height={50} />
                    <Skeleton variant="text" width={300} height={30} />
                </Box>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={12} lg={8}>
                        <Skeleton variant="rectangular" height={450} sx={{ borderRadius: '24px' }} />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <Skeleton variant="rectangular" height={450} sx={{ borderRadius: '24px' }} />
                    </Grid>
                </Grid>
                <DashboardComponent />
            </Box>
        );
    }

    return <>
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', mb: 1 }}>
                        Tableau de bord
                    </Typography>
                </Box>
            </motion.div>

            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={{ height: '100%' }}
                    >
                        <Card sx={{ ...glassCardStyle, height: '100%' }}>
                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                <Typography variant="h6" gutterBottom sx={{
                                    fontWeight: 800,
                                    color: '#1e293b',
                                    mb: 4
                                }}>
                                    Aperçu des ventes
                                </Typography>
                                <ReactApexChart
                                    options={salesData.options}
                                    series={salesData.series}
                                    type="bar"
                                    height={360}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{ height: '100%' }}
                    >
                        <Card sx={{ ...glassCardStyle, height: '100%' }}>
                            <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Typography variant="h6" gutterBottom sx={{
                                    fontWeight: 800,
                                    color: '#1e293b',
                                    mb: 4
                                }}>
                                    Répartition des revenus
                                </Typography>
                                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: 2 }}>
                                    <ReactApexChart
                                        options={revenueData.options}
                                        series={revenueData.series}
                                        type="donut"
                                        height={360}
                                        width="100%"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <DashboardComponent />
            </motion.div>
        </Box>
    </>
}