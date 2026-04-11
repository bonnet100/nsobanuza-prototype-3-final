import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString();
}

export default function Tracking() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [periodStart, setPeriodStart] = useState('');

  const fetchTrackingData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);

    try {
      const [logsRes, predictRes] = await Promise.all([
        api.get(`/tracking/${user.id}`),
        api.get('/tracking/predict')
      ]);

      const logsData = await logsRes.json();
      const predictData = await predictRes.json();

      if (logsRes.ok) {
        setLogs(logsData.logs || []);
      }

      if (predictRes.ok) {
        setPrediction(predictData);
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    fetchTrackingData();
  }, [user?.id, fetchTrackingData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setMessage('');

    if (!periodStart || !mood || !symptoms) {
      setFormError(t('allFieldsRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/tracking', {
        period_start_date: periodStart,
        mood,
        symptoms
      });
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || t('failedToSaveRecord'));
        return;
      }

      setMessage(data.message || t('recordSaved'));
      setPeriodStart('');
      setMood('');
      setSymptoms('');
      await fetchTrackingData();
    } catch (err) {
      console.error('Error submitting tracking data:', err);
      setFormError(t('networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_30%),linear-gradient(180deg,_#f8f7f3_0%,_#eef5f3_55%,_#ffffff_100%)] px-4 pb-28 pt-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2.2rem] bg-[linear-gradient(145deg,_#0f766e_0%,_#115e59_55%,_#132238_100%)] p-6 text-white shadow-[0_24px_70px_rgba(15,118,110,0.22)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100">{t('tracking')}</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">{t('trackingHeroTitle')}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-emerald-50/90">{t('trackingHeroBody')}</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100">{t('adaptiveCycleLearning')}</p>
              <p className="mt-3 text-sm leading-7 text-white/90">{prediction?.advice || t('trackingLearningHint')}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <h3 className="text-xl font-semibold text-slate-950">{t('logPeriod')}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{t('logPeriodIntro')}</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block text-sm text-slate-700">
                {t('periodDate')}
                <input
                  type="date"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                  required
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('mood')}
                <input
                  value={mood}
                  onChange={(event) => setMood(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                  placeholder={t('moodPlaceholder')}
                  required
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('symptoms')}
                <textarea
                  rows="4"
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                  placeholder={t('symptomsPlaceholder')}
                  required
                />
              </label>
              {formError ? <div className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700">{formError}</div> : null}
              {message ? <div className="rounded-2xl bg-emerald-100 p-3 text-sm text-emerald-800">{message}</div> : null}
              <button
                type="submit"
                className="w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-white shadow-[0_16px_35px_rgba(15,118,110,0.18)] transition hover:bg-[var(--nsobanuza-primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.8rem] border border-white/70 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('predictedNextPeriod')}</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {prediction?.nextPeriodDate ? formatDate(prediction.nextPeriodDate) : '-'}
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-white/70 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('averageCycleLength')}</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {prediction?.averageCycleLength ? `${prediction.averageCycleLength} ${t('days')}` : '-'}
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-white/70 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('fertileWindow')}</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {prediction?.fertileWindow?.start ? `${formatDate(prediction.fertileWindow.start)} - ${formatDate(prediction.fertileWindow.end)}` : '-'}
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-white/70 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('regularityScore')}</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {prediction?.regularityScore ? `${prediction.regularityScore}%` : '-'}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-emerald-900">{t('healthAdvice')}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {isLoading ? t('loadingPrediction') : prediction?.advice || t('completeTrackingForPrediction')}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-950">{t('history')}</h3>
              <div className="mt-4 space-y-3">
                {isLoading ? <p className="text-sm text-slate-500">{t('loadingLogs')}</p> : null}
                {!isLoading && logs.length === 0 ? (
                  <p className="text-sm text-slate-500">{t('noTrackingLogsYet')}</p>
                ) : null}
                {logs.map((log) => (
                  <div key={log.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">{formatDate(log.logged_at)}</div>
                    <p className="mt-2 font-semibold text-slate-950">{log.period_start_date}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {log.mood} / {log.symptoms}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
