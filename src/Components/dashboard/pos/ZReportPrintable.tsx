import { forwardRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import { ICashSession } from '@/Data/Interfaces/CashSession';
import Constants from '@/Data/Utilities/constants';
import { useTranslation } from 'react-i18next';

interface ZReportProps {
    session: ICashSession;
    summary: any;
    actualCash: number;
    difference: number;
    closingNotes: string;
}

const ZReportPrintable = forwardRef<HTMLDivElement, ZReportProps>(({ session, summary, actualCash, difference, closingNotes }, ref) => {
    const { t } = useTranslation();

    const formatDate = (dateString: string | Date | null | undefined) => {
        if (!dateString) return t('common.notAvailable');
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const expectedCash = summary?.stats?.expected_cash ?? (
        Number(session?.opening_balance ?? 0) + Number(session?.total_cash_payments ?? 0) - Number(session?.total_refunds ?? 0)
    );

    return (
        <Box
            ref={ref}
            sx={{
                width: '300px', // Typical 80mm thermal receipt width
                p: 2,
                bgcolor: 'white',
                color: 'black',
                fontFamily: 'monospace',
                fontSize: '12px',
                mx: 'auto'
            }}
        >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '18px', textTransform: 'uppercase' }}>
                    {Constants.APP_NAME}
                </Typography>
                <Typography sx={{ fontSize: '12px' }}>{t('zReport.title')}</Typography>
                <Typography sx={{ fontSize: '10px', color: '#666' }}>{t('zReport.auditDocument')}</Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: 'black' }} />

            {/* Session Info */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 'bold' }}>{t('cashSession.sessionNumber')}:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{session.session_code}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 'bold' }}>{t('cashSession.opening')}:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{formatDate(session.opened_at)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 'bold' }}>{t('cashSession.closing')}:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{formatDate(new Date())}</Typography>
                </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: 'black' }} />

            {/* Sales Volume */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 'bold', mb: 1, textAlign: 'center' }}>{t('zReport.volumetry')}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '11px' }}>{t('zReport.salesCount')}:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{summary?.stats?.sales_count ?? session?.sales_count ?? 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '11px' }}>{t('zReport.canceledCount')}:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{summary?.stats?.canceled_count ?? 0}</Typography>
                </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: 'black' }} />

            {/* Financials */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 'bold', mb: 1, textAlign: 'center' }}>{t('zReport.financialFlow')}</Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '11px' }}>{t('zReport.initialCash')}:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{UtilMethods.formatNumber(session?.opening_balance ?? 0)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '11px' }}>(+) {t('zReport.totalCashSales')}:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{UtilMethods.formatNumber(summary?.stats?.total_sales ?? session?.total_sales ?? 0)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '11px' }}>(-) {t('zReport.refunds')}:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{UtilMethods.formatNumber(summary?.stats?.total_refunds ?? session?.total_refunds ?? 0)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid black' }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>{t('zReport.expectedCash')}:</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>{UtilMethods.formatNumber(expectedCash)}</Typography>
                </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: 'black' }} />

            {/* Reconciliation */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 'bold', mb: 1, textAlign: 'center' }}>{t('zReport.closureAndDifferences')}</Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>{t('zReport.cashRecounted')}:</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>{UtilMethods.formatNumber(actualCash)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>{t('zReport.differenceFound')}:</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {difference > 0 ? '+' : ''}{UtilMethods.formatNumber(difference)}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: 'black' }} />

            {/* Notes & Signatures */}
            <Box sx={{ mt: 2 }}>
                {closingNotes && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 'bold' }}>{t('zReport.observations')}:</Typography>
                        <Typography sx={{ fontSize: '11px', fontStyle: 'italic' }}>"{closingNotes}"</Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, px: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '10px' }}>{t('zReport.cashierSignature')}</Typography>
                        <Box sx={{ borderBottom: '1px solid black', width: '80px', mt: 4 }}></Box>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '10px' }}>{t('zReport.managerSignature')}</Typography>
                        <Box sx={{ borderBottom: '1px solid black', width: '80px', mt: 4 }}></Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography sx={{ fontSize: '10px' }}>{t('zReport.generatedBy', { appName: Constants.APP_NAME })}</Typography>
                <Typography sx={{ fontSize: '9px' }}>{formatDate(new Date())}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>- {t('zReport.endOfReport')} -</Typography>
            </Box>
        </Box>
    );
});

ZReportPrintable.displayName = 'ZReportPrintable';

export default ZReportPrintable;
