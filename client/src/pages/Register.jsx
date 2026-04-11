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
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const response = await api.post('/auth/register', { phone, username, password });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Registration failed');
      return;
    }

    setSuccess(data.message || t('registerSuccess'));
    navigate('/login', {
      replace: true,
      state: { message: data.message || t('registerSuccess') }
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_28%),linear-gradient(180deg,_#f6f4ee_0%,_#edf5f1_50%,_#ffffff_100%)] px-4 py-8 text-[var(--nsobanuza-ink)]">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] bg-[linear-gradient(160deg,_#0f766e_0%,_#115e59_58%,_#132238_100%)] p-8 text-white shadow-[0_24px_70px_rgba(15,118,110,0.22)]">
            <div className="inline-flex rounded-full bg-white/14 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-teal-100">
              {t('register')}
            </div>
            <h1 className="mt-6 text-3xl leading-tight sm:text-[2.4rem]">{t('createAccountTitle')}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-teal-50/90">
              {t('createAccountIntro')}
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-white">{t('landingHighlightOneTitle')}</p>
                <p className="mt-2 text-sm leading-7 text-teal-50/90">{t('landingHighlightOneBody')}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/12 bg-slate-950/20 p-5 backdrop-blur">
                <p className="text-sm text-white">{t('landingValuePrivacyTitle')}</p>
                <p className="mt-2 text-sm leading-7 text-teal-50/90">{t('landingValuePrivacyBody')}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">
              {t('register')}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t('signupText')}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="block text-sm text-slate-700">
                {t('phone')}
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('username')}
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('password')}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
              {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}
              <button
                type="submit"
                className="w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-sm text-white shadow-[0_16px_35px_rgba(15,118,110,0.18)] transition hover:bg-[var(--nsobanuza-primary-deep)]"
              >
                {t('submit')}
              </button>
            </form>

            <div className="mt-8 rounded-[1.75rem] bg-[linear-gradient(180deg,_#fffdf8_0%,_#f8f4ea_100%)] p-5">
              <p className="text-sm text-slate-900">{t('haveAccountPrompt')}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{t('haveAccountHint')}</p>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm text-slate-900 transition hover:border-[var(--nsobanuza-primary)] hover:bg-teal-50/60"
                >
                  {t('login')}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
