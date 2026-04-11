import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  licenseNumber: '',
  idCardNumber: '',
  organisation: '',
  specialty: 'Sexual Health',
  licenseDocument: '',
  bio: '',
  textChatPrice: '',
  voiceChatPrice: '',
  videoChatPrice: ''
};

export default function RegisterProfessional() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const response = await api.post('/auth/register-professional', form);
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Registration failed');
      return;
    }

    setSuccess(data.message || t('professionalRegisterSuccess'));
    navigate('/login', {
      replace: true,
      state: { message: data.message || t('professionalRegisterSuccess') }
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_28%),linear-gradient(180deg,_#f6f4ee_0%,_#edf5f1_50%,_#ffffff_100%)] px-4 py-8 text-[var(--nsobanuza-ink)]">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] bg-[linear-gradient(160deg,_#0f766e_0%,_#115e59_58%,_#132238_100%)] p-8 text-white shadow-[0_24px_70px_rgba(15,118,110,0.22)]">
            <div className="inline-flex rounded-full bg-white/14 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-teal-100">
              {t('registerProfessional')}
            </div>
            <h1 className="mt-6 text-3xl leading-tight sm:text-[2.4rem]">{t('professionalCreateTitle')}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-teal-50/90">
              {t('professionalSignupRequires')}
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-white">{t('landingValueTrustTitle')}</p>
                <p className="mt-2 text-sm leading-7 text-teal-50/90">{t('landingValueTrustBody')}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/12 bg-slate-950/20 p-5 backdrop-blur">
                <p className="text-sm text-white">{t('professionalRegistrationNoteTitle')}</p>
                <p className="mt-2 text-sm leading-7 text-teal-50/90">{t('professionalRegistrationNoteBody')}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-white">{t('kycReviewTitle')}</p>
                <p className="mt-2 text-sm leading-7 text-teal-50/90">{t('kycReviewBody')}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">
              {t('registerProfessional')}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t('professionalSignupRequires')}</p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700 sm:col-span-2">
                {t('fullName')}
                <input
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('email')}
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('password')}
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('licenseNumber')}
                <input
                  value={form.licenseNumber}
                  onChange={handleChange('licenseNumber')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('idCardNumber')}
                <input
                  value={form.idCardNumber}
                  onChange={handleChange('idCardNumber')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('organisation')}
                <input
                  value={form.organisation}
                  onChange={handleChange('organisation')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t('specialty')}
                <select
                  value={form.specialty}
                  onChange={handleChange('specialty')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                >
                  <option>Sexual Health</option>
                  <option>Mental Health</option>
                  <option>Period Health</option>
                  <option>General Health</option>
                </select>
              </label>
              <label className="block text-sm text-slate-700 sm:col-span-2">
                {t('licenseDocument')}
                <input
                  value={form.licenseDocument}
                  onChange={handleChange('licenseDocument')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                  placeholder={t('licenseDocumentPlaceholder')}
                />
              </label>
              <label className="block text-sm text-slate-700 sm:col-span-2">
                {t('professionalBio')}
                <textarea
                  rows="4"
                  value={form.bio}
                  onChange={handleChange('bio')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                  placeholder={t('professionalBioPlaceholder')}
                />
              </label>

              <div className="sm:col-span-2 rounded-[1.7rem] border border-emerald-100 bg-emerald-50/80 p-5">
                <p className="text-sm font-semibold text-emerald-900">{t('pricingTitle')}</p>
                <p className="mt-2 text-sm leading-7 text-emerald-800">{t('pricingIntro')}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="block text-sm text-slate-700">
                    {t('textChatPrice')}
                    <input
                      type="number"
                      min="0"
                      value={form.textChatPrice}
                      onChange={handleChange('textChatPrice')}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                    />
                  </label>
                  <label className="block text-sm text-slate-700">
                    {t('voiceChatPrice')}
                    <input
                      type="number"
                      min="0"
                      value={form.voiceChatPrice}
                      onChange={handleChange('voiceChatPrice')}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                    />
                  </label>
                  <label className="block text-sm text-slate-700">
                    {t('videoChatPrice')}
                    <input
                      type="number"
                      min="0"
                      value={form.videoChatPrice}
                      onChange={handleChange('videoChatPrice')}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
                {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-sm text-white shadow-[0_16px_35px_rgba(15,118,110,0.18)] transition hover:bg-[var(--nsobanuza-primary-deep)]"
                >
                  {t('submitProfessionalApplication')}
                </button>
              </div>
            </form>

            <div className="mt-8 rounded-[1.75rem] bg-[linear-gradient(180deg,_#fffdf8_0%,_#f8f4ea_100%)] p-5">
              <p className="text-sm text-slate-900">{t('haveAccountPrompt')}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{t('professionalLoginHint')}</p>
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
