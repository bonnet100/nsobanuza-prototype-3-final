import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

const initialVideoForm = {
  title: '',
  description: '',
  url: '',
  category: 'General',
  thumbnail: '',
  createdBy: '',
  isPartnerAd: true
};

const initialPlatformSettings = {
  chatbotEnabled: true,
  aiProviderPreference: 'gemini',
  geminiModel: 'gemini-2.5-flash',
  openaiModel: 'gpt-5-mini',
  huggingFaceModel: 'Qwen/Qwen2.5-7B-Instruct',
  supportedLanguages: ['en', 'fr', 'rw', 'sw'],
  providers: {
    geminiConfigured: false,
    openaiConfigured: false,
    huggingFaceConfigured: false,
    builtInConfigured: true
  }
};

export default function Admin({ user }) {
  const { t } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [videoForm, setVideoForm] = useState(initialVideoForm);
  const [platformSettings, setPlatformSettings] = useState(initialPlatformSettings);
  const [savingPlatformSettings, setSavingPlatformSettings] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const [overviewRes, usersRes, pendingRes, postsRes, videosRes, settingsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/professionals/pending'),
        api.get('/admin/posts/pending'),
        api.get('/admin/videos'),
        api.get('/admin/platform-settings')
      ]);

      const overviewData = await overviewRes.json();
      const usersData = await usersRes.json();
      const pendingData = await pendingRes.json();
      const postsData = await postsRes.json();
      const videosData = await videosRes.json();
      const settingsData = await settingsRes.json();

      if (!overviewRes.ok || !usersRes.ok || !pendingRes.ok || !postsRes.ok || !videosRes.ok || !settingsRes.ok) {
        throw new Error(
          overviewData.error ||
            usersData.error ||
            pendingData.error ||
            postsData.error ||
            videosData.error ||
            settingsData.error ||
            t('adminLoadError')
        );
      }

      setOverview(overviewData.overview);
      setUsers(usersData.users || []);
      setPendingProfessionals(pendingData.professionals || []);
      setPendingPosts(postsData.posts || []);
      setVideos(videosData.videos || []);
      setPlatformSettings(settingsData.settings || initialPlatformSettings);
    } catch (loadError) {
      setError(loadError.message || t('adminLoadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === 'admin') {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const verifyProfessional = async (id) => {
    setStatus('');
    setError('');

    const response = await api.post(`/admin/professionals/${id}/verify`, {});
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || t('adminVerifyError'));
      return;
    }

    setStatus(t('adminVerifySuccess'));
    await loadAdminData();
  };

  const toggleUserStatus = async (selectedUser) => {
    setStatus('');
    setError('');

    const response = await api.patch(`/admin/users/${selectedUser.id}/status`, {
      isActive: !selectedUser.isActive
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || t('adminStatusError'));
      return;
    }

    setStatus(selectedUser.isActive ? t('adminSuspendSuccess') : t('adminRestoreSuccess'));
    await loadAdminData();
  };

  const approvePost = async (postId) => {
    setStatus('');
    setError('');

    const response = await api.post(`/admin/posts/${postId}/approve`, {});
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || t('adminPostApproveError'));
      return;
    }

    setStatus(t('adminPostApproveSuccess'));
    await loadAdminData();
  };

  const updateVideoForm = (field) => (event) => {
    const value = field === 'isPartnerAd' ? event.target.checked : event.target.value;
    setVideoForm((current) => ({ ...current, [field]: value }));
  };

  const submitPartnerVideo = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    const response = await api.post('/admin/videos', videoForm);
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || t('adminVideoAddError'));
      return;
    }

    setStatus(t('adminVideoAddSuccess'));
    setVideoForm(initialVideoForm);
    await loadAdminData();
  };

  const updatePlatformField = (field) => (event) => {
    const value = field === 'chatbotEnabled' ? event.target.checked : event.target.value;
    setPlatformSettings((current) => ({ ...current, [field]: value }));
  };

  const savePlatformSettings = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');
    setSavingPlatformSettings(true);

    try {
      const response = await api.patch('/admin/platform-settings', {
        chatbotEnabled: platformSettings.chatbotEnabled,
        aiProviderPreference: platformSettings.aiProviderPreference,
        geminiModel: platformSettings.geminiModel,
        openaiModel: platformSettings.openaiModel,
        huggingFaceModel: platformSettings.huggingFaceModel
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('adminPlatformSettingsSaveError'));
      }

      setPlatformSettings(data.settings || platformSettings);
      setStatus(t('adminPlatformSettingsSaved'));
    } catch (saveError) {
      setError(saveError.message || t('adminPlatformSettingsSaveError'));
    } finally {
      setSavingPlatformSettings(false);
    }
  };

  const languageLabels = {
    en: t('languageEnglish'),
    fr: t('languageFrench'),
    rw: t('languageKinyarwanda'),
    sw: t('languageSwahili')
  };

  if (!user || loading) {
    return (
      <div className="px-4 pb-28 pt-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">{t('adminLoading')}</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="px-4 pb-28 pt-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl text-slate-900">{t('adminPanel')}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{t('adminAccessDenied')}</p>
          <Link to="/app/settings" className="mt-4 inline-flex text-sm text-[var(--nsobanuza-primary)] underline underline-offset-4">
            {t('settings')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-28 pt-4">
      <section className="rounded-[2rem] bg-[linear-gradient(160deg,_#0f766e_0%,_#115e59_58%,_#132238_100%)] p-6 text-white shadow-[0_24px_70px_rgba(15,118,110,0.22)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-teal-100">{t('adminPanel')}</p>
        <h2 className="mt-3 text-3xl leading-tight">{t('adminTitle')}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-teal-50/90">{t('adminIntro')}</p>
      </section>

      {status ? (
        <div className="rounded-3xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-sm">
          {status}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('adminTotalUsers')}</p>
          <p className="mt-3 text-3xl text-slate-900">{overview?.totalUsers ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('adminPendingProfessionals')}</p>
          <p className="mt-3 text-3xl text-slate-900">{overview?.pendingProfessionals ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('adminActiveUsers')}</p>
          <p className="mt-3 text-3xl text-slate-900">{overview?.activeUsers ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('adminPendingPosts')}</p>
          <p className="mt-3 text-3xl text-slate-900">{overview?.pendingPosts ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t('adminPartnerVideos')}</p>
          <p className="mt-3 text-3xl text-slate-900">{overview?.partnerVideos ?? 0}</p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl text-slate-900">{t('adminPendingReview')}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{t('adminPendingReviewHint')}</p>
          </div>
          <button
            type="button"
            onClick={loadAdminData}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            {t('adminRefresh')}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {pendingProfessionals.length === 0 ? (
            <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-500">{t('adminNoPendingProfessionals')}</div>
          ) : (
            pendingProfessionals.map((professional) => (
              <article key={professional.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg text-slate-900">{professional.fullName}</p>
                    <p className="mt-1 text-sm text-slate-600">{professional.email || t('adminNotProvided')}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {t('specialty')}: {professional.specialty || t('adminNotProvided')}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {t('licenseNumber')}: {professional.licenseNumber || t('adminNotProvided')}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {t('idCardNumber')}: {professional.idCardNumber || t('adminNotProvided')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => verifyProfessional(professional.id)}
                    className="rounded-full bg-[var(--nsobanuza-primary)] px-5 py-3 text-sm text-white transition hover:bg-[var(--nsobanuza-primary-deep)]"
                  >
                    {t('adminVerify')}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h3 className="text-xl text-slate-900">{t('adminPendingPostsTitle')}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">{t('adminPendingPostsBody')}</p>

        <div className="mt-5 space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-500">{t('adminNoPendingPosts')}</div>
          ) : (
            pendingPosts.map((post) => (
              <article key={post.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--nsobanuza-primary)]">{post.category}</p>
                    <p className="mt-2 text-lg text-slate-900">{post.authorName}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{post.content}</p>
                    {post.ctaLabel ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                        CTA: {post.ctaLabel} / {post.ctaUrl || '-'}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => approvePost(post.id)}
                    className="rounded-full bg-[var(--nsobanuza-primary)] px-5 py-3 text-sm text-white transition hover:bg-[var(--nsobanuza-primary-deep)]"
                  >
                    {t('adminApprovePost')}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="text-xl text-slate-900">{t('adminUserManagement')}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{t('adminUserManagementHint')}</p>

          <div className="mt-5 space-y-4">
            {users.map((listedUser) => (
              <article key={listedUser.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg text-slate-900">
                        {listedUser.displayName || listedUser.username || listedUser.email}
                      </p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {listedUser.role}
                      </span>
                      {listedUser.verified ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                          {t('adminVerified')}
                        </span>
                      ) : null}
                      {!listedUser.isActive ? (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700">
                          {t('adminSuspended')}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{listedUser.phone || listedUser.email || t('adminNotProvided')}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {listedUser.organisation || listedUser.specialty || t('adminNoAdditionalInfo')}
                    </p>
                  </div>
                  {listedUser.role !== 'admin' ? (
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(listedUser)}
                      className={`rounded-full px-5 py-3 text-sm text-white transition ${
                        listedUser.isActive
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : 'bg-[var(--nsobanuza-primary)] hover:bg-[var(--nsobanuza-primary-deep)]'
                      }`}
                    >
                      {listedUser.isActive ? t('adminSuspend') : t('adminRestore')}
                    </button>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-500">
                      {t('adminProtectedAccount')}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="text-xl text-slate-900">{t('adminPlatformControls')}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{t('adminPlatformControlsBody')}</p>

            <form onSubmit={savePlatformSettings} className="mt-5 space-y-4">
              <label className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span>{t('adminChatbotEnabled')}</span>
                <input
                  type="checkbox"
                  checked={platformSettings.chatbotEnabled}
                  onChange={updatePlatformField('chatbotEnabled')}
                />
              </label>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{t('adminAiProviderPreference')}</p>
                <select
                  value={platformSettings.aiProviderPreference}
                  onChange={updatePlatformField('aiProviderPreference')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                >
                  <option value="auto">{t('adminAiProviderAuto')}</option>
                  <option value="gemini">{t('adminAiProviderGemini')}</option>
                  <option value="huggingface">{t('adminAiProviderHuggingFace')}</option>
                  <option value="openai">{t('adminAiProviderOpenAI')}</option>
                  <option value="builtin">{t('adminAiProviderBuiltIn')}</option>
                </select>
              </div>

              <input
                value={platformSettings.geminiModel}
                onChange={updatePlatformField('geminiModel')}
                placeholder={t('adminGeminiModel')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
              <input
                value={platformSettings.openaiModel}
                onChange={updatePlatformField('openaiModel')}
                placeholder={t('adminOpenAiModel')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
              <input
                value={platformSettings.huggingFaceModel}
                onChange={updatePlatformField('huggingFaceModel')}
                placeholder={t('adminHuggingFaceModel')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />

              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{t('adminSupportedLanguages')}</p>
                <p className="mt-2">
                  {(platformSettings.supportedLanguages || []).map((code) => languageLabels[code] || code).join(', ')}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{t('adminProviderStatus')}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span>Gemini</span>
                    <span className={platformSettings.providers?.geminiConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                      {platformSettings.providers?.geminiConfigured ? t('adminConfigured') : t('adminNotConfigured')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>OpenAI</span>
                    <span className={platformSettings.providers?.openaiConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                      {platformSettings.providers?.openaiConfigured ? t('adminConfigured') : t('adminNotConfigured')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Hugging Face</span>
                    <span className={platformSettings.providers?.huggingFaceConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                      {platformSettings.providers?.huggingFaceConfigured ? t('adminConfigured') : t('adminNotConfigured')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{t('adminAiProviderBuiltIn')}</span>
                    <span className="text-emerald-700">{t('adminConfigured')}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPlatformSettings}
                className="w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPlatformSettings ? t('submitting') : t('adminPlatformSettingsSave')}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="text-xl text-slate-900">{t('adminAddPartnerVideo')}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{t('adminAddPartnerVideoBody')}</p>

            <form onSubmit={submitPartnerVideo} className="mt-5 space-y-4">
              <input
                value={videoForm.title}
                onChange={updateVideoForm('title')}
                placeholder={t('videoTitle')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
              <textarea
                rows="4"
                value={videoForm.description}
                onChange={updateVideoForm('description')}
                placeholder={t('videoDescription')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
              <input
                value={videoForm.url}
                onChange={updateVideoForm('url')}
                placeholder={t('videoUrl')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
              <input
                value={videoForm.thumbnail}
                onChange={updateVideoForm('thumbnail')}
                placeholder={t('thumbnailUrl')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={videoForm.createdBy}
                  onChange={updateVideoForm('createdBy')}
                  placeholder={t('createdBy')}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                />
                <select
                  value={videoForm.category}
                  onChange={updateVideoForm('category')}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                >
                  <option>General</option>
                  <option>Sexual Health</option>
                  <option>Mental Health</option>
                  <option>Period Health</option>
                </select>
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={videoForm.isPartnerAd}
                  onChange={updateVideoForm('isPartnerAd')}
                />
                {t('markAsPartnerAd')}
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-sm text-white"
              >
                {t('addVideo')}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="text-xl text-slate-900">{t('adminPublishedVideos')}</h3>
            <div className="mt-5 space-y-3">
              {videos.map((video) => (
                <div key={video.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{video.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {video.category} / {video.createdBy}
                      </p>
                    </div>
                    {video.isPartnerAd ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">
                        {t('partnerAd')}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
