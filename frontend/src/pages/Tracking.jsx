import { useMemo, useState } from 'react';
import {
  getPredictedNextPeriod,
  getTrackingEntries,
  saveTrackingEntry
} from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const moodOptions = ['happy', 'tired', 'anxious', 'calm'];
const symptomOptions = ['cramps', 'headache', 'none'];

export default function Tracking() {
  const { t, formatDate } = useLanguage();
  const [periodStartDate, setPeriodStartDate] = useState('');
  const [mood, setMood] = useState('happy');
  const [symptoms, setSymptoms] = useState('none');
  const [entries, setEntries] = useState(() => getTrackingEntries());

  const predictedNextPeriod = useMemo(() => getPredictedNextPeriod(), [entries]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!periodStartDate) return;

    const nextEntries = await saveTrackingEntry({ periodStartDate, mood, symptoms });
    setEntries(nextEntries);
    setPeriodStartDate('');
    setMood('happy');
    setSymptoms('none');
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="panel p-5">
        <h2 className="text-2xl font-semibold text-slate-900">{t('trackerTitle')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('trackerIntro')}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('periodStart')}</span>
            <input
              type="date"
              value={periodStartDate}
              onChange={(event) => setPeriodStartDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('mood')}</span>
            <select
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand"
            >
              {moodOptions.map((option) => (
                <option key={option} value={option}>
                  {t(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('symptoms')}</span>
            <select
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand"
            >
              {symptomOptions.map((option) => (
                <option key={option} value={option}>
                  {t(option)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
          >
            {t('saveEntry')}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="panel p-5">
          <h3 className="text-lg font-semibold text-slate-900">{t('predictedNextPeriod')}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {predictedNextPeriod ? formatDate(predictedNextPeriod) : t('noTracking')}
          </p>
        </div>

        <div className="panel p-5">
          <h3 className="text-lg font-semibold text-slate-900">{t('history')}</h3>
          <div className="mt-4 space-y-3">
            {entries.length === 0 ? (
              <div className="rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-500">
                {t('noTracking')}
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(entry.periodStartDate)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {t('mood')}: {t(entry.mood)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {t('symptoms')}: {t(entry.symptoms)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
