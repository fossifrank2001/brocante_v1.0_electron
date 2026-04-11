import Constants from '@/Data/Utilities/constants'
import { Link } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function Footer() {
    const { t } = useTranslation()
    return <div className="p-6 rounded-4 mb-2 text-center admin_footer" style={{
        position: 'absolute',
        display: 'block',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'var(--bg-surface)',
        transition: 'background-color 0.3s ease',
    }}>
        <p className="mb-0 fs-4" style={{ color: 'var(--text-secondary)' }}>{t('footer.designedBy')}
            <Link href="#" target="_blank"
                      className="pe-1 text-primary text-decoration-underline"> {Constants.AUTHOR.name}</Link></p>
    </div>
}
