import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

export default function RegisterProfessional() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ phone: '', username: '', password: '', license_number: '', organisation: '', license_document: '', specialty: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const response = await api.post('/auth/register-professional', form);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Registration failed');
      return;
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">{t('registerProfessional')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('professionalSignupRequires')}</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          {['phone', 'username', 'password', 'licenseNumber', 'organisation', 'licenseDocument', 'specialty'].map((field) => (
            <label key={field} className="block text-sm text-slate-700">
              {t(field)}
              <input
                type={field === 'password' ? 'password' : 'text'}
                value={form[field === 'licenseNumber' ? 'license_number' : field === 'licenseDocument' ? 'license_document' : field] || ''}
                onChange={handleChange(field === 'licenseNumber' ? 'license_number' : field === 'licenseDocument' ? 'license_document' : field)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
            </label>
          ))}
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
