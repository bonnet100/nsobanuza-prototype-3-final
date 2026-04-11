import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const specialties = ['All', 'Sexual Health', 'Mental Health', 'Period Health', 'General Health'];
const consultationModes = [
  { value: 'text', priceKey: 'textChatPrice', labelKey: 'textChat' },
  { value: 'voice', priceKey: 'voiceChatPrice', labelKey: 'voiceChat' },
  { value: 'video', priceKey: 'videoChatPrice', labelKey: 'videoChat' }
];

function Stars({ value }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(value || 0) ? 'opacity-100' : 'opacity-25'}>
          ★
        </span>
      ))}
    </div>
  );
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString()} RWF`;
}

export default function Providers() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [specialty, setSpecialty] = useState('All');
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestForm, setRequestForm] = useState({
    consultationType: 'text',
    message: ''
  });
  const [reviewDrafts, setReviewDrafts] = useState({});

  const isProfessional = user?.role === 'professional';

  const loadProviders = async (nextSpecialty = specialty) => {
    const query =
      nextSpecialty && nextSpecialty !== 'All'
        ? `/providers?specialty=${encodeURIComponent(nextSpecialty)}`
        : '/providers';
    const response = await api.get(query);
    const data = await response.json();
    setProviders(data.providers || []);
  };

  const loadConsultations = async () => {
    const response = await api.get('/consultations');
    const data = await response.json();
    if (response.ok) {
      setConsultations(data.consultations || []);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadProviders(specialty), loadConsultations()])
      .catch((error) => {
        console.error('Provider page load error:', error);
      })
      .finally(() => setLoading(false));
  }, [specialty]);

  const selectedMode = useMemo(() => {
    return consultationModes.find((mode) => mode.value === requestForm.consultationType) || consultationModes[0];
  }, [requestForm.consultationType]);

  const openProvider = async (provider) => {
    setSelected(provider);
    setRequestForm({ consultationType: 'text', message: '' });
    const response = await api.get(`/providers/${provider.id}/reviews`);
    const data = await response.json();
    if (response.ok) {
      setReviews(data.reviews || []);
    } else {
      setReviews([]);
    }
  };

  const requestConsultation = async (event) => {
    event.preventDefault();
    if (!selected || !requestForm.message.trim()) {
      return;
    }

    const response = await api.post('/providers/consultations/request', {
      professionalId: selected.id,
      message: requestForm.message,
      consultationType: requestForm.consultationType
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || t('consultationRequestFailed'));
      return;
    }

    setStatus(`${t('consultationRequested')} ${formatCurrency(data.price)}`);
    setSelected(null);
    setRequestForm({ consultationType: 'text', message: '' });
    await loadConsultations();
  };

  const updateConsultationStatus = async (consultationId, nextStatus) => {
    const response = await api.patch(`/consultations/${consultationId}/status`, { status: nextStatus });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || t('consultationStatusFailed'));
      return;
    }

    setStatus(t('consultationStatusUpdated'));
    await loadConsultations();
  };

  const setReviewValue = (consultationId, field, value) => {
    setReviewDrafts((current) => ({
      ...current,
      [consultationId]: {
        rating: current[consultationId]?.rating || 5,
        comment: current[consultationId]?.comment || '',
        [field]: value
      }
    }));
  };

  const submitReview = async (consultation) => {
    const draft = reviewDrafts[consultation.id];
    if (!draft?.rating) {
      return;
    }

    const response = await api.post(`/providers/${consultation.professional_id}/reviews`, {
      consultationId: consultation.id,
      rating: Number(draft.rating),
      comment: draft.comment || ''
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || t('reviewFailed'));
      return;
    }

    setStatus(t('reviewSubmitted'));
    await loadConsultations();
    setReviewDrafts((current) => {
      const next = { ...current };
      delete next[consultation.id];
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_28%),linear-gradient(180deg,_#f8f7f3_0%,_#eef5f3_56%,_#ffffff_100%)] px-4 pb-28 pt-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2.2rem] bg-[linear-gradient(145deg,_#0f766e_0%,_#115e59_55%,_#132238_100%)] p-6 text-white shadow-[0_24px_70px_rgba(15,118,110,0.22)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100">{t('verifiedProviders')}</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">{t('providerMarketplaceTitle')}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-emerald-50/90">{t('providerMarketplaceBody')}</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100">{t('pricingTitle')}</p>
              <p className="mt-3 text-sm leading-7 text-white/90">{t('providerPricingBody')}</p>
            </div>
          </div>
        </section>

        {status ? (
          <div className="rounded-[1.8rem] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {status}
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">{t('verifiedProviders')}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{t('providerFilterIntro')}</p>
            </div>
            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            >
              {specialties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {loading ? (
            <div className="rounded-[2rem] border border-white/70 bg-white/92 p-8 text-sm text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              {t('loadingProviders')}
            </div>
          ) : null}

          {!loading && providers.length === 0 ? (
            <div className="rounded-[2rem] border border-white/70 bg-white/92 p-8 text-sm text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              {t('noProvidersFound')}
            </div>
          ) : null}

          {!loading
            ? providers.map((provider) => (
                <article
                  key={provider.id}
                  className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--nsobanuza-primary)]">
                        {provider.specialty}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">
                        {provider.fullName || provider.organisation || provider.username}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">{provider.organisation || t('independentProfessional')}</p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600">
                      #{provider.licenseNumber}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                    <Stars value={provider.averageRating} />
                    <span>
                      {provider.averageRating?.toFixed ? provider.averageRating.toFixed(1) : Number(provider.averageRating || 0).toFixed(1)}
                    </span>
                    <span>{provider.reviewCount} {t('reviews')}</span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">{provider.bio || t('providerBioFallback')}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {consultationModes.map((mode) => (
                      <div key={mode.value} className="rounded-[1.5rem] bg-slate-50 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{t(mode.labelKey)}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {formatCurrency(provider[mode.priceKey])}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => openProvider(provider)}
                    className="mt-5 w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--nsobanuza-primary-deep)]"
                  >
                    {isProfessional ? t('viewProfessionalProfile') : t('requestConsultation')}
                  </button>
                </article>
              ))
            : null}
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h3 className="text-xl font-semibold text-slate-950">
            {isProfessional ? t('incomingConsultations') : t('myConsultations')}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {isProfessional ? t('incomingConsultationsBody') : t('myConsultationsBody')}
          </p>

          <div className="mt-5 space-y-4">
            {consultations.length === 0 ? (
              <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-500">{t('noConsultationsYet')}</div>
            ) : (
              consultations.map((consultation) => {
                const reviewDraft = reviewDrafts[consultation.id] || { rating: 5, comment: '' };

                return (
                  <article key={consultation.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">
                          {isProfessional ? consultation.user_name : consultation.professional_name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {consultation.channel} / {formatCurrency(consultation.price)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{consultation.status}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{consultation.message}</p>
                      </div>

                      {isProfessional ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateConsultationStatus(consultation.id, 'scheduled')}
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
                          >
                            {t('markScheduled')}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateConsultationStatus(consultation.id, 'completed')}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white"
                          >
                            {t('markCompleted')}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateConsultationStatus(consultation.id, 'declined')}
                            className="rounded-full bg-rose-600 px-4 py-2 text-sm text-white"
                          >
                            {t('decline')}
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {!isProfessional && consultation.status === 'completed' && !consultation.review_id ? (
                      <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">{t('rateProfessional')}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setReviewValue(consultation.id, 'rating', value)}
                              className={`rounded-full px-3 py-2 text-sm ${
                                reviewDraft.rating === value
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-white text-slate-600'
                              }`}
                            >
                              {value}★
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows="3"
                          value={reviewDraft.comment}
                          onChange={(event) => setReviewValue(consultation.id, 'comment', event.target.value)}
                          placeholder={t('reviewPlaceholder')}
                          className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => submitReview(consultation)}
                          className="mt-3 rounded-full bg-[var(--nsobanuza-primary)] px-5 py-3 text-sm font-semibold text-white"
                        >
                          {t('submitReview')}
                        </button>
                      </div>
                    ) : null}

                    {!isProfessional && consultation.review_id ? (
                      <div className="mt-5 rounded-[1.5rem] bg-emerald-50 p-4 text-sm text-emerald-800">
                        {t('reviewAlreadySubmitted')}
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">
                  {selected.specialty}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                  {selected.fullName || selected.organisation}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{selected.organisation || t('independentProfessional')}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500"
              >
                {t('close')}
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-[1.7rem] bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <Stars value={selected.averageRating} />
                    <p className="text-sm text-slate-600">
                      {Number(selected.averageRating || 0).toFixed(1)} / 5
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{selected.bio || t('providerBioFallback')}</p>
                </div>

                <div className="rounded-[1.7rem] bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">{t('consultationPricing')}</p>
                  <div className="mt-4 space-y-3">
                    {consultationModes.map((mode) => (
                      <div key={mode.value} className="flex items-center justify-between text-sm text-slate-600">
                        <span>{t(mode.labelKey)}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(selected[mode.priceKey])}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.7rem] bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">{t('recentReviews')}</p>
                  <div className="mt-4 space-y-3">
                    {reviews.length === 0 ? (
                      <p className="text-sm text-slate-500">{t('noReviewsYet')}</p>
                    ) : (
                      reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="rounded-[1.25rem] bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">{review.reviewerName}</p>
                            <p className="text-sm text-amber-500">{review.rating}★</p>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{review.comment || t('noCommentProvided')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {!isProfessional ? (
                <form onSubmit={requestConsultation} className="rounded-[1.8rem] border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-900">{t('requestConsultation')}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{t('consultationRequestIntro')}</p>

                  <label className="mt-4 block text-sm text-slate-700">
                    {t('consultationType')}
                    <select
                      value={requestForm.consultationType}
                      onChange={(event) =>
                        setRequestForm((current) => ({ ...current, consultationType: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                    >
                      {consultationModes.map((mode) => (
                        <option key={mode.value} value={mode.value}>
                          {t(mode.labelKey)} - {formatCurrency(selected[mode.priceKey])}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-4 rounded-[1.5rem] bg-emerald-50 p-4 text-sm text-emerald-900">
                    {t('estimatedPrice')}: {formatCurrency(selected[selectedMode.priceKey])}
                  </div>

                  <label className="mt-4 block text-sm text-slate-700">
                    {t('describeConcern')}
                    <textarea
                      rows="6"
                      value={requestForm.message}
                      onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))}
                      className="mt-2 w-full rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                      placeholder={t('consultationMessagePlaceholder')}
                    />
                  </label>

                  <button
                    type="submit"
                    className="mt-5 w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-sm font-semibold text-white"
                  >
                    {t('sendConsultationRequest')}
                  </button>
                </form>
              ) : (
                <div className="rounded-[1.8rem] border border-slate-200 p-5 text-sm leading-7 text-slate-600">
                  {t('professionalViewOnlyNotice')}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
