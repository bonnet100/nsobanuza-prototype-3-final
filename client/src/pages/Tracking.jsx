import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, getToken } from '../api';

export default function Tracking() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [periodStart, setPeriodStart] = useState('');
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = getToken();
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        const id = data.user?.id;
        if (!id) return;
        api.get(`/tracking/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => res.json())
          .then((data) => setLogs(data.logs || []));
        api.get('/tracking/predict', { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => res.json())
          .then((data) => setPrediction(data));
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = getToken();
    const response = await api.post('/tracking', { period_start_date: periodStart, mood, symptoms }, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (data.success) {
      setMessage(t('recordSaved'));
      setPeriodStart('');
      setMood('');
      setSymptoms('');
      const predictRes = await api.get('/tracking/predict', { headers: { Authorization: `Bearer ${token}` } });
      const predictData = await predictRes.json();
      setPrediction(predictData);
      api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    }
  };

  return (
    <div className="px-4 pb-28 pt-4 space-y-4">
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">{t('tracking')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('logPeriod')}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block text-sm text-slate-700">
            {t('periodDate')}
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm text-slate-700">
            {t('mood')}
            <input value={mood} onChange={(e) => setMood(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm text-slate-700">
            {t('symptoms')}
            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" rows="3" />
          </label>
          {message && <div className="rounded-2xl bg-emerald-100 p-3 text-slate-700">{message}</div>}
          <button type="submit" className="rounded-2xl bg-brand px-4 py-3 text-white">{t('submit')}</button>
        </form>
      </div>
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold">{t('history')}</h3>
        <div className="mt-4 space-y-3">
          {logs.length === 0 && <p className="text-sm text-slate-500">No tracking logs yet.</p>}
          {logs.map((log) => (
            <div key={log.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">{new Date(log.logged_at).toLocaleDateString()}</div>
              <p className="font-semibold">{log.period_start_date}</p>
              <p className="text-slate-600">{log.mood} • {log.symptoms}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold">{t('predictedNextPeriod')}</h3>
        <p className="mt-2 text-sm text-slate-500">{prediction?.prediction || 'Complete tracking to see predictions.'}</p>
      </div>
    </div>
  );
}
