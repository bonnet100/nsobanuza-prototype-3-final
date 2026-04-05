import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, getToken, clearToken } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Settings({ user, onLogout }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('');
  const [expiresAt, setExpiresAt] = useState(user?.adRemovalExpiresAt || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const token = getToken();
      if (!token) return;
      api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => setExpiresAt(data.user?.adRemovalExpiresAt || null));
    }
  }, [user]);

  const watchAd = async () => {
    const token = getToken();
    const response = await api.post('/ad-removal/watch', {}, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (data.expires_at) {
      setExpiresAt(data.expires_at);
      setStatus(`${t('adRemovedUntil')} ${new Date(data.expires_at).toLocaleString()}`);
    }
  };

  const handleLogout = () => {
    clearToken();
    onLogout?.();
    navigate('/login');
  };

  return (
    <div className="px-4 pb-28 pt-4 space-y-6">
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">{t('settings')}</h2>
        <p className="mt-2 text-sm text-slate-500">{user?.username || 'Guest'}</p>
      </div>
      <div className="rounded-3xl bg-white p-4 shadow-sm space-y-4">
        <button onClick={watchAd} className="w-full rounded-2xl bg-brand px-4 py-3 text-white">{t('watchAdRemoveAds')}</button>
        {expiresAt && <p className="text-sm text-slate-600">{t('adRemovedUntil')} {new Date(expiresAt).toLocaleString()}</p>}
        {status && <p className="text-sm text-emerald-600">{status}</p>}
      </div>
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <button onClick={handleLogout} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white">{t('logout')}</button>
      </div>
    </div>
  );
}
