import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlagEN, FlagFR } from '@/Components/common/LanguageFlags';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    const currentLanguage = i18n.language || 'fr';

    return (
        <div className="language-switcher" style={{ display: 'flex', gap: 8 }}>
            <button
                type="button"
                onClick={() => changeLanguage('en')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    border: 'none',
                    borderRadius: '8px',
                    background: currentLanguage === 'en' ? 'var(--accent-primary)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: currentLanguage === 'en' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                    boxShadow: 'none',
                    transform: 'none',
                }}
                title="English"
            >
                <FlagEN size={16} />
                EN
            </button>
            <button
                type="button"
                onClick={() => changeLanguage('fr')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    border: 'none',
                    borderRadius: '8px',
                    background: currentLanguage === 'fr' ? 'var(--accent-primary)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: currentLanguage === 'fr' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                    boxShadow: 'none',
                    transform: 'none',
                }}
                title="Français"
            >
                <FlagFR size={16} />
                FR
            </button>
        </div>
    );
};

export default LanguageSwitcher;
