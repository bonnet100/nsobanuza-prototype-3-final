import { useLanguage } from '../contexts/LanguageContext';

export default function AdBanner({ visible, watchingAd, onWatchAd }) {
  const { t } = useLanguage();

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-4xl">
      <div className="rounded-[1.5rem] bg-gradient-to-r from-brand-deep via-brand to-emerald-500 p-4 text-white shadow-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
              {t('freeWithAds')}
            </p>
            <h3 className="mt-1 font-heading text-base font-semibold">{t('adBannerTitle')}</h3>
            <p className="mt-1 text-sm text-emerald-50">{t('adBannerBody')}</p>
          </div>
          <button
            type="button"
            onClick={onWatchAd}
            disabled={watchingAd}
            className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand-deep transition hover:bg-emerald-50 disabled:cursor-not-allowed"
          >
            {watchingAd ? t('watchingAd') : t('watchAdRemoveAds')}
          </button>
        </div>
      </div>
    </div>
  );
}
