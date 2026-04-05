import { useEffect, useMemo, useState } from 'react';
import { getProviders } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

export default function Providers() {
  const { t } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [message, setMessage] = useState('');
  const [thread, setThread] = useState([]);

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  const specialtyLabel = useMemo(
    () => ({
      sexualHealth: t('sexualHealth'),
      mentalHealth: t('mentalHealth')
    }),
    [t]
  );

  const openConsultation = (provider) => {
    setSelectedProvider(provider);
    setMessage('');
    setThread([
      {
        id: 'intro',
        role: 'provider',
        text: `${provider.name}: ${t('mockConsultation')}`
      }
    ]);
  };

  const sendMockMessage = () => {
    if (!message.trim() || !selectedProvider) return;

    setThread((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text: message.trim() },
      {
        id: `provider-${Date.now() + 1}`,
        role: 'provider',
        text: `${selectedProvider.name}: ${t('providerAutoReply')}`
      }
    ]);
    setMessage('');
  };

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <h2 className="text-2xl font-semibold text-slate-900">{t('providersTitle')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('providersIntro')}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => (
          <article key={provider.id} className="panel overflow-hidden p-5">
            <div className="flex items-start gap-4">
              <img
                src={provider.photo}
                alt={provider.name}
                className="h-16 w-16 rounded-[1.25rem] object-cover"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{provider.name}</h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {t('verified')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{specialtyLabel[provider.specialty]}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[1.25rem] bg-slate-50 p-3">
                <p className="text-slate-500">{t('rating')}</p>
                <p className="mt-1 font-semibold text-slate-900">{provider.rating}</p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-3">
                <p className="text-slate-500">{t('fee')}</p>
                <p className="mt-1 font-semibold text-slate-900">{provider.fee}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openConsultation(provider)}
              className="mt-4 w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
            >
              {t('chatWithProvider')}
            </button>
          </article>
        ))}
      </section>

      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedProvider.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {specialtyLabel[selectedProvider.specialty]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="rounded-full bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-[1.5rem] bg-slate-50 p-4">
              {thread.map((entry) => (
                <div
                  key={entry.id}
                  className={`max-w-[92%] rounded-[1.25rem] px-4 py-3 text-sm leading-7 ${
                    entry.role === 'provider'
                      ? 'bg-white text-slate-700'
                      : 'ml-auto bg-brand text-white'
                  }`}
                >
                  {entry.text}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t('consultationPlaceholder')}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand"
              />
              <button
                type="button"
                onClick={sendMockMessage}
                className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
              >
                {t('send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
