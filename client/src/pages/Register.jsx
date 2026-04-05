import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

export default function Register() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const response = await api.post('/auth/register', { phone, username, password });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Registration failed');
      return;
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">{t('register')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('signupText')}</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-slate-700">
            {t('phone')}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm text-slate-700">
            {t('username')}
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm text-slate-700">
            {t('password')}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button type="submit" className="w-full rounded-2xl bg-brand px-4 py-3 text-white">{t('submit')}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/login" className="text-brand underline">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}
