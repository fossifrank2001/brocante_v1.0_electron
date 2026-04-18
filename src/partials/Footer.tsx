import Constants from '@/Data/Utilities/constants'
import { Link } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function Footer() {
    const { t } = useTranslation()
    return <div className="p-4 rounded-4 mt-auto text-center admin_footer" style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        transition: 'background-color 0.3s ease',
        marginTop: '2rem',
        borderTop: '1px solid var(--border-color)',
    }}>
        <p className="mb-0 fs-4" style={{ color: 'var(--text-secondary)' }}>{t('footer.designedBy')}
            <Link href="#" target="_blank"
                      className="pe-1 text-primary text-decoration-underline"> {Constants.AUTHOR.name}</Link></p>
    </div>
}
