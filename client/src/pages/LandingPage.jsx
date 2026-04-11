import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import LanguageSwitcher from '../components/LanguageSwitcher';

const serviceKeys = [
  { title: 'landingServiceEducationTitle', body: 'landingServiceEducationBody' },
  { title: 'landingServiceChatTitle', body: 'landingServiceChatBody' },
  { title: 'landingServiceTrackingTitle', body: 'landingServiceTrackingBody' },
  { title: 'landingServiceProvidersTitle', body: 'landingServiceProvidersBody' },
  { title: 'landingServiceVideosTitle', body: 'landingServiceVideosBody' },
  { title: 'landingServiceCommunityTitle', body: 'landingServiceCommunityBody' }
];

const valueKeys = [
  { title: 'landingValuePrivacyTitle', body: 'landingValuePrivacyBody' },
  { title: 'landingValueClarityTitle', body: 'landingValueClarityBody' },
  { title: 'landingValueTrustTitle', body: 'landingValueTrustBody' }
];

const journeyKeys = [
  { step: '01', title: 'landingJourneyOneTitle', body: 'landingJourneyOneBody' },
  { step: '02', title: 'landingJourneyTwoTitle', body: 'landingJourneyTwoBody' },
  { step: '03', title: 'landingJourneyThreeTitle', body: 'landingJourneyThreeBody' }
];

const landingImages = [
  {
    src: 'https://images.unsplash.com/photo-1576091160550-2173db999c1d?auto=format&fit=crop&w=1200&q=80',
    altKey: 'landingPhotoOneAlt',
    captionKey: 'landingPhotoOneCaption'
  },
  {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    altKey: 'landingPhotoTwoAlt',
    captionKey: 'landingPhotoTwoCaption'
  },
  {
    src: 'https://images.unsplash.com/photo-1531123897727-8f129e16fdce?auto=format&fit=crop&w=1200&q=80',
    altKey: 'landingPhotoThreeAlt',
    captionKey: 'landingPhotoThreeCaption'
  }
];

export default function LandingPage() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Use isAuthenticated from AuthContext

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_32%),radial-gradient(circle_at_85%_12%,_rgba(180,83,9,0.10),_transparent_20%),linear-gradient(180deg,_#f8f7f3_0%,_#eef5f3_52%,_#ffffff_100%)] text-[var(--nsobanuza-ink)]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/70 bg-white/82 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[var(--nsobanuza-primary)] text-lg font-medium text-white shadow-[0_18px_35px_rgba(15,118,110,0.28)]">
                N
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--nsobanuza-primary)]">
                  {t('landingEyebrow')}
                </p>
                <h1 className="mt-1 text-2xl text-slate-950 sm:text-[2rem]">Nsobanuza</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  {t('landingFormalSummary')}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <LanguageSwitcher />
              {isAuthLoading ? (
                <span className="text-sm text-slate-500 px-4">{t('loading')}</span>
              ) : isAuthenticated ? (
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm text-white transition hover:bg-slate-800"
                >
                  {t('landingOpenApp')}
                </Link>
              ) : (
                <>
                  <Link to="/login" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm text-slate-800 transition hover:bg-slate-50">
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm text-white transition hover:bg-slate-800"
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="space-y-8 pb-10 pt-8">
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2.4rem] border border-white/70 bg-white/90 p-7 shadow-[0_28px_80px_rgba(15,23,42,0.09)] sm:p-9">
              <div className="inline-flex rounded-full border border-[var(--nsobanuza-primary)]/15 bg-[var(--nsobanuza-primary-soft)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary-deep)]">
                {t('landingTagline')}
              </div>

              <h2 className="mt-6 max-w-3xl text-[2.35rem] leading-[1.08] text-slate-950 sm:text-[3rem]">
                {t('landingHeadline')}
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-slate-600 sm:text-base">
                {t('landingBody')}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={isAuthenticated ? '/app' : '/register'}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--nsobanuza-primary)] px-6 py-3.5 text-sm text-white shadow-[0_18px_40px_rgba(15,118,110,0.24)] transition hover:bg-[var(--nsobanuza-primary-deep)]"
                >
                  {isAuthLoading ? t('loading') : (isAuthenticated ? t('landingOpenApp') : t('landingPrimaryCta'))}
                </Link>
                <Link
                  to="/register-professional"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  {t('landingProfessionalCta')}
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {t('landingMetricOneLabel')}
                  </p>
                  <p className="mt-3 text-[15px] leading-6 text-slate-900">{t('landingMetricOneValue')}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {t('landingMetricTwoLabel')}
                  </p>
                  <p className="mt-3 text-[15px] leading-6 text-slate-900">{t('landingMetricTwoValue')}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {t('landingMetricThreeLabel')}
                  </p>
                  <p className="mt-3 text-[15px] leading-6 text-slate-900">{t('landingMetricThreeValue')}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr] sm:grid-rows-[1fr_auto]">
              <article className="group relative overflow-hidden rounded-[2.4rem] shadow-[0_28px_80px_rgba(15,118,110,0.22)] sm:row-span-2">
                <img
                  src={landingImages[0].src}
                  alt={t(landingImages[0].altKey)}
                  className="h-full min-h-[420px] w-full object-cover transition duration-700 group-hover:scale-[1.03] bg-slate-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-7">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-teal-100">
                    {t('landingBriefTitle')}
                  </p>
                  <p className="mt-3 max-w-md text-lg leading-8 text-white/95">
                    {t('landingBriefBody')}
                  </p>
                  <div className="mt-5 inline-flex rounded-full bg-white/14 px-4 py-2 text-sm text-white backdrop-blur">
                    {t(landingImages[0].captionKey)}
                  </div>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-[2rem]">
                <img
                  src={landingImages[1].src}
                  alt={t(landingImages[1].altKey)}
                  className="h-[210px] w-full object-cover transition duration-700 group-hover:scale-[1.03] bg-slate-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-sm leading-6">{t(landingImages[1].captionKey)}</p>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,_#0f766e_0%,_#134e4a_52%,_#12263a_100%)] p-6 text-white shadow-[0_18px_50px_rgba(15,118,110,0.24)]">
                <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-[var(--nsobanuza-accent)]/20 blur-2xl" />
                <div className="relative">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-teal-100">
                    {t('landingHighlightTwoTitle')}
                  </p>
                  <p className="mt-3 text-[15px] leading-7 text-teal-50/95">
                    {t('landingHighlightTwoBody')}
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2.4rem] border border-slate-200/70 bg-white/92 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-9">
              <div className="max-w-3xl">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-warm)]">
                  {t('landingServicesEyebrow')}
                </p>
                <h3 className="mt-3 text-[2rem] leading-[1.12] text-slate-950">
                  {t('landingServicesTitle')}
                </h3>
                <p className="mt-3 text-[15px] leading-8 text-slate-600">
                  {t('landingServicesBody')}
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {serviceKeys.map((item, index) => (
                  <article
                    key={item.title}
                    className={`rounded-[1.8rem] border p-5 ${
                      index % 3 === 0
                        ? 'border-teal-100 bg-teal-50/70'
                        : index % 3 === 1
                          ? 'border-amber-100 bg-amber-50/70'
                          : 'border-slate-200 bg-slate-50/90'
                    }`}
                  >
                    <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h4 className="mt-4 text-lg leading-7 text-slate-900">{t(item.title)}</h4>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{t(item.body)}</p>
                  </article>
                ))}
              </div>
            </div>

            <article className="group relative overflow-hidden rounded-[2.4rem] shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
              <img
                src={landingImages[2].src}
                alt={t(landingImages[2].altKey)}
                className="h-full min-h-[420px] w-full object-cover transition duration-700 group-hover:scale-[1.03] bg-slate-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/22 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-7">
                <p className="text-[11px] uppercase tracking-[0.24em] text-amber-100">
                  {t('landingHighlightThreeTitle')}
                </p>
                <p className="mt-3 max-w-md text-base leading-8 text-white/95">
                  {t('landingHighlightThreeBody')}
                </p>
                <div className="mt-5 inline-flex rounded-full bg-white/14 px-4 py-2 text-sm text-white backdrop-blur">
                  {t(landingImages[2].captionKey)}
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2.2rem] border border-slate-200/70 bg-[linear-gradient(180deg,_#fffdf7_0%,_#fff8eb_100%)] p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-warm)]">
                {t('landingJourneyEyebrow')}
              </p>
              <h3 className="mt-3 text-[2rem] leading-[1.12] text-slate-950">{t('landingJourneyTitle')}</h3>
              <div className="mt-8 space-y-4">
                {journeyKeys.map((item) => (
                  <div key={item.step} className="rounded-[1.7rem] border border-amber-100 bg-white/85 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--nsobanuza-accent)] text-sm text-slate-900">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="text-lg leading-7 text-slate-900">{t(item.title)}</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{t(item.body)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.2rem] border border-slate-200/70 bg-white/92 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">
                {t('landingValuesEyebrow')}
              </p>
              <h3 className="mt-3 text-[2rem] leading-[1.12] text-slate-950">{t('landingValuesTitle')}</h3>
              <p className="mt-3 text-[15px] leading-8 text-slate-600">{t('landingValuesBody')}</p>

              <div className="mt-8 space-y-4">
                {valueKeys.map((item) => (
                  <article key={item.title} className="rounded-[1.7rem] bg-slate-50 p-5">
                    <h4 className="text-lg leading-7 text-slate-900">{t(item.title)}</h4>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{t(item.body)}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 rounded-[1.8rem] bg-slate-950 px-6 py-6 text-white">
                <p className="text-[11px] uppercase tracking-[0.18em] text-teal-200">
                  {t('landingAudienceTitle')}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{t('landingAudienceBody')}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2.4rem] bg-[linear-gradient(135deg,_#12263a_0%,_#0f766e_100%)] px-7 py-8 text-white shadow-[0_28px_80px_rgba(18,38,58,0.28)] sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] uppercase tracking-[0.24em] text-teal-100">
                  {t('landingClosingEyebrow')}
                </p>
                <h3 className="mt-3 text-[2rem] leading-[1.12] text-white sm:text-[2.45rem]">
                  {t('landingClosingTitle')}
                </h3>
                <p className="mt-4 text-[15px] leading-8 text-teal-50/90">
                  {t('landingClosingBody')}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to={isAuthenticated ? '/app' : '/login'}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm text-slate-900 transition hover:bg-slate-100"
                >
                  {isAuthLoading ? t('loading') : (isAuthenticated ? t('landingOpenApp') : t('landingSecondaryCta'))}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-sm text-white transition hover:bg-white/10"
                >
                  {t('register')}
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
