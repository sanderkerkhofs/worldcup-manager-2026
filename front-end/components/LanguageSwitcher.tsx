import { useLocale, useT } from '../lib/i18n';

export function LanguageSwitcher() {
    const t = useT();
    const { locale, setLocale } = useLocale();

    return (
        <label className="language-switcher">
            <span>{t('common.language')}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as 'en' | 'nl')}>
                <option value="en">EN</option>
                <option value="nl">NL</option>
            </select>
        </label>
    );
}