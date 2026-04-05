import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api, setToken } from '../api';

export default function Login() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const response = await api.post('/auth/login', { phone, password });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Login failed');
      return;
    }
    setToken(data.token);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-600 to-fuchsia-600 text-white px-4 py-8">
      <div className="mx-auto max-w-md rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold">{t('welcomeBack')}</h1>
        <p className="mt-3 text-sm text-slate-200">{t('signupText')}</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-100">
            {t('phone')}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/20 bg-slate-950/80 px-4 py-3 text-white outline-none" placeholder="+2507..." />
          </label>
          <label className="block text-sm font-medium text-slate-100">
            {t('password')}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/20 bg-slate-950/80 px-4 py-3 text-white outline-none" placeholder="••••••••" />
          </label>
          {error && <p className="text-sm text-amber-200">{error}</p>}
          <button type="submit" className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900">{t('login')}</button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-200">
          <Link to="/register" className="text-white underline">{t('register')}</Link> / <Link to="/register-professional" className="text-white underline">{t('registerProfessional')}</Link>
        </div>
      </div>
    </div>
  );
}
