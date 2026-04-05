import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedCopy } from '../api';

export default function VideoPlayer({ video, onClose }) {
  const { language, t } = useLanguage();

  if (!video) return null;

  const title = getLocalizedCopy(video.title, language);
  const description = getLocalizedCopy(video.description, language);
  const shareLink = `${window.location.href.split('#')[0]}#video=${video.id}`;

  const handleShare = async () => {
    const payload = { title, text: description, url: shareLink };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        return;
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareLink);
      window.alert(t('shareCopied'));
      return;
    }

    window.prompt(t('sharePrompt'), shareLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-4xl rounded-[2rem] bg-white p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-deep">
              {t('freeHealthVideo')}
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{video.source}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        {/* The modal keeps video playback inside the app instead of sending users to YouTube directly. */}
        <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-950">
          <div className="absolute left-4 top-4 z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
            {t('playVideo')}
          </div>
          <div className="aspect-video">
            <iframe
              title={title}
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
          >
            {t('share')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
