import { useLanguage } from '../contexts/LanguageContext';
import { findVideo, getLocalizedCopy } from '../api';

export default function PostCard({ post, onOpenVideo }) {
  const { language, t } = useLanguage();
  const video = findVideo(post.videoId);

  return (
    <article className="panel overflow-hidden p-4">
      <div className="flex items-start gap-3">
        <img
          src={post.avatar}
          alt={post.organization}
          className="h-12 w-12 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-slate-900">{post.organization}</h3>
            <span
              className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700"
              title={t('verifiedHealthBody')}
            >
              {t('verified')}
            </span>
            {post.isSponsored && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                {t('sponsored')}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {getLocalizedCopy(post.caption, language)}
          </p>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[1.5rem] bg-slate-100">
        <img
          src={post.image}
          alt={getLocalizedCopy(post.caption, language)}
          className="h-72 w-full object-cover"
        />
        {post.mediaType === 'video' && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        )}
        {post.mediaType === 'video' && video && (
          <button
            type="button"
            onClick={() => onOpenVideo(video)}
            className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02]"
          >
            {t('playVideo')}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
          {t(post.category)}
        </span>
        {video && (
          <button
            type="button"
            onClick={() => onOpenVideo(video)}
            className="rounded-full bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand-deep"
          >
            {t('watchNow')}
          </button>
        )}
      </div>
    </article>
  );
}
