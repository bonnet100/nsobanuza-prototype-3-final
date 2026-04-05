import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import VideoPlayer from './components/VideoPlayer';
import AdBanner from './components/AdBanner';
import Home from './pages/Home';
import AIChat from './pages/AIChat';
import Tracking from './pages/Tracking';
import Providers from './pages/Providers';
import Videos from './pages/Videos';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  getAdRemovalUntil,
  getSponsoredBoost,
  setSponsoredBoost,
  watchAdToRemoveAds
} from './api';

const navItems = [
  { id: 'home', labelKey: 'home' },
  { id: 'ai-chat', labelKey: 'aiChat' },
  { id: 'tracking', labelKey: 'tracking' },
  { id: 'providers', labelKey: 'providers' },
  { id: 'videos', labelKey: 'videos' }
];

function AppShell() {
  const { language, setLanguage, t, formatDateTime } = useLanguage();
  const [activePage, setActivePage] = useState('home');
  const [activeVideo, setActiveVideo] = useState(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adFreeUntil, setAdFreeUntil] = useState(() => getAdRemovalUntil());
  const [boostSponsored, setBoostSponsoredState] = useState(() => getSponsoredBoost());

  const adsRemoved = useMemo(() => {
    return adFreeUntil ? new Date(adFreeUntil) > new Date() : false;
  }, [adFreeUntil]);

  useEffect(() => {
    if (!adsRemoved && adFreeUntil) {
      setAdFreeUntil(null);
    }
  }, [adsRemoved, adFreeUntil]);

  const handleWatchAd = async () => {
    setWatchingAd(true);
    const until = await watchAdToRemoveAds();
    setAdFreeUntil(until);
    setWatchingAd(false);
  };

  const handleBoostSponsored = (value) => {
    setSponsoredBoost(value);
    setBoostSponsoredState(value);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_35%),linear-gradient(180deg,_#f8faf9_0%,_#f4efe8_100%)] text-ink">
      <div className="mx-auto min-h-screen max-w-6xl px-4 pb-40 pt-4 sm:px-6">
        <header className="sticky top-4 z-30 mb-4 rounded-app border border-white/70 bg-white/85 p-4 shadow-card backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white">
                N
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-deep">
                  Nsobanuza
                </div>
                <h1 className="mt-1 text-xl font-semibold text-slate-900">{t('appTagline')}</h1>
                <p className="mt-1 text-sm text-slate-500">{t('freeWithAds')}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex rounded-full bg-slate-100 p-1">
                {[
                  { id: 'kin', label: t('kinyarwanda') },
                  { id: 'en', label: t('english') },
                  { id: 'fr', label: t('french') }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLanguage(option.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      language === option.id
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleWatchAd}
                disabled={watchingAd || adsRemoved}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  adsRemoved
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-accent text-slate-900 hover:bg-amber-300'
                } disabled:cursor-not-allowed`}
              >
                {adsRemoved
                  ? `${t('adsRemovedUntil')} ${formatDateTime(adFreeUntil)}`
                  : watchingAd
                    ? t('watchingAd')
                    : t('removeAds')}
              </button>
            </div>
          </div>
        </header>

        <main>
          {activePage === 'home' && (
            <Home
              onNavigate={setActivePage}
              onOpenVideo={setActiveVideo}
              boostSponsored={boostSponsored}
              onBoostSponsoredChange={handleBoostSponsored}
            />
          )}
          {activePage === 'ai-chat' && <AIChat />}
          {activePage === 'tracking' && <Tracking />}
          {activePage === 'providers' && <Providers />}
          {activePage === 'videos' && <Videos onOpenVideo={setActiveVideo} />}
        </main>

        <footer className="mt-8 rounded-app border border-white/70 bg-white/80 px-6 py-5 shadow-card backdrop-blur">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className="transition hover:text-brand"
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </footer>
      </div>

      <Navbar items={navItems} activePage={activePage} onNavigate={setActivePage} />
      <AdBanner visible={!adsRemoved} watchingAd={watchingAd} onWatchAd={handleWatchAd} />
      <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  );
}
