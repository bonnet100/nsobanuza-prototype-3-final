import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-slate-500 uppercase tracking-[0.2em]">{t('language')}</label>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm outline-none"
      >
        <option value="en">{t('languageEnglish')}</option>
        <option value="fr">{t('languageFrench')}</option>
        <option value="rw">{t('languageKinyarwanda')}</option>
        <option value="sw">{t('languageSwahili')}</option>
      </select>
    </div>
  );
}
