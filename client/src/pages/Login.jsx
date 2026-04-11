import { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { t } = useLanguage();
  const { login, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const successMessage = location.state?.message;
  const [accountType, setAccountType] = useState('user');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const copy = useMemo(() => {
    if (accountType === 'professional') {
      return {
        heading: t('professionalLoginTitle'),
        intro: t('professionalLoginIntro'),
        identifierLabel: t('email'),
        identifierPlaceholder: t('emailPlaceholder')
      };
    }

    return {
      heading: t('welcomeBack'),
      intro: t('loginIntro'),
      identifierLabel: t('username'),
      identifierPlaceholder: t('usernamePlaceholder')
    };
  }, [accountType, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const result = await login({
      identifier,
      password,
      accountType
    });

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_28%),linear-gradient(180deg,_#f6f4ee_0%,_#edf5f1_50%,_#ffffff_100%)] px-4 py-8 text-[var(--nsobanuza-ink)]">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] bg-[linear-gradient(160deg,_#0f766e_0%,_#115e59_58%,_#132238_100%)] p-8 text-white shadow-[0_24px_70px_rgba(15,118,110,0.22)]">
            <div className="inline-flex rounded-full bg-white/14 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-teal-100">
              {t('landingEyebrow')}
            </div>
            <h1 className="mt-6 text-3xl leading-tight sm:text-[2.4rem]">{copy.heading}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-teal-50/90">{copy.intro}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setAccountType('user');
                  setIdentifier('');
                  setError('');
                }}
                className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                  accountType === 'user'
                    ? 'border-white/40 bg-white/18 text-white'
                    : 'border-white/10 bg-white/8 text-teal-50/85'
                }`}
              >
                <p className="text-sm">{t('loginAsUser')}</p>
                <p className="mt-2 text-xs leading-6 text-teal-50/80">{t('userLoginHint')}</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountType('professional');
                  setIdentifier('');
                  setError('');
                }}
                className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                  accountType === 'professional'
                    ? 'border-white/40 bg-white/18 text-white'
                    : 'border-white/10 bg-white/8 text-teal-50/85'
                }`}
              >
                <p className="text-sm">{t('loginAsProfessional')}</p>
                <p className="mt-2 text-xs leading-6 text-teal-50/80">{t('professionalLoginHint')}</p>
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-white">{t('landingHighlightOneTitle')}</p>
                <p className="mt-2 text-sm leading-7 text-teal-50/90">{t('landingHighlightOneBody')}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/12 bg-slate-950/20 p-5 backdrop-blur">
                <p className="text-sm text-white">{t('landingHighlightThreeTitle')}</p>
                <p className="mt-2 text-sm leading-7 text-teal-50/90">{t('landingHighlightThreeBody')}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">
              {accountType === 'professional' ? t('loginAsProfessional') : t('login')}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{copy.intro}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="block text-sm text-slate-700">
                {copy.identifierLabel}
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                  placeholder={copy.identifierPlaceholder}
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('password')}
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                  placeholder="........"
                />
              </label>
              {successMessage ? (
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>
              ) : null}
              {error ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p> : null}
              <button
                type="submit"
                className="w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-sm text-white shadow-[0_16px_35px_rgba(15,118,110,0.18)] transition hover:bg-[var(--nsobanuza-primary-deep)]"
              >
                {accountType === 'professional' ? t('professionalSignIn') : t('login')}
              </button>
            </form>
            {isAuthLoading ? <p className="mt-4 text-sm text-slate-500">{t('loggingIn')}</p> : null}

            <div className="mt-8 rounded-[1.75rem] bg-[linear-gradient(180deg,_#fffdf8_0%,_#f8f4ea_100%)] p-5">
              <p className="text-sm text-slate-900">{t('loginRegisterPrompt')}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{t('loginRegisterHint')}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/register"
                  className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 transition hover:border-[var(--nsobanuza-primary)] hover:bg-teal-50/60"
                >
                  <span className="block text-sm text-slate-900">{t('register')}</span>
                  <span className="mt-1 block text-xs leading-6 text-slate-500">{t('loginRegisterUserHint')}</span>
                </Link>
                <Link
                  to="/register-professional"
                  className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 transition hover:border-[var(--nsobanuza-warm)] hover:bg-amber-50/70"
                >
                  <span className="block text-sm text-slate-900">{t('registerProfessional')}</span>
                  <span className="mt-1 block text-xs leading-6 text-slate-500">{t('loginRegisterProfessionalHint')}</span>
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/" className="text-sm text-[var(--nsobanuza-primary)] underline underline-offset-4">
                {t('learnMore')}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
