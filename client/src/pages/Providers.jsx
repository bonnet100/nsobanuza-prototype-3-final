import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, getToken } from '../api';

const specialties = ['All', 'Sexual Health', 'Mental Health', 'Period Health'];

export default function Providers() {
  const { t } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [specialty, setSpecialty] = useState('All');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');

  const loadProviders = async (selectedSpecialty) => {
    const token = getToken();
    const url = selectedSpecialty !== 'All' ? `/providers?specialty=${encodeURIComponent(selectedSpecialty)}` : '/providers';
    const response = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setProviders(data.providers || []);
  };

  useEffect(() => {
    loadProviders(specialty);
  }, [specialty]);

  const requestConsultation = async () => {
    if (!selected || !message.trim()) return;
    const token = getToken();
    const response = await api.post('/providers/consultations/request', { professionalId: selected.id, message }, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (data.success) {
      setStatus(t('consultationRequested'));
      setMessage('');
      setSelected(null);
    }
  };

  return (
    <div className="px-4 pb-28 pt-4 space-y-4">
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{t('verifiedProviders')}</h2>
            <p className="text-sm text-slate-500">{t('providers')}</p>
          </div>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
            {specialties.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-4">
        {providers.length === 0 && <div className="rounded-3xl bg-white p-6 text-center text-slate-500">{t('noProvidersFound')}</div>}
        {providers.map((provider) => (
          <div key={provider.id} className="rounded-[2rem] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{provider.organisation || provider.username}</h3>
                <p className="text-sm text-slate-500">{provider.specialty}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">#{provider.license_number}</span>
            </div>
            <button onClick={() => setSelected(provider)} className="mt-4 rounded-2xl bg-brand px-4 py-3 text-white">{t('requestConsultation')}</button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-x-4 bottom-24 z-30 rounded-3xl bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t('requestConsultation')}</h3>
              <p className="text-sm text-slate-500">{selected.organisation}</p>
            </div>
            <button className="text-slate-500" onClick={() => setSelected(null)}>✕</button>
          </div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="4" className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 outline-none" placeholder="Describe your concern..." />
          <button onClick={requestConsultation} className="mt-4 w-full rounded-2xl bg-brand px-4 py-3 text-white">{t('submit')}</button>
          {status && <p className="mt-3 text-center text-green-600">{status}</p>}
        </div>
      )}
    </div>
  );
}
