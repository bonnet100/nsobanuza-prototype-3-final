import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { getHomeFeed } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const categories = ['allCategories', 'sexualHealth', 'mentalHealth', 'periodHealth'];

export default function Home({
  onNavigate,
  onOpenVideo,
  boostSponsored,
  onBoostSponsoredChange
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('allCategories');
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    getHomeFeed({ search, category, boostSponsored }).then(setFeed);
  }, [search, category, boostSponsored]);

  return (
    <div className="space-y-4">
      <section className="panel overflow-hidden">
        <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep">
                {t('freeHealthVideo')}
              </div>
              <h2 className="text-3xl font-semibold leading-tight text-slate-900">
                {t('heroTitle')}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t('heroBody')}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('videos')}
                className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
              >
                {t('startWatching')}
              </button>
              <span className="rounded-full bg-accent-soft px-4 py-3 text-sm font-semibold text-amber-900">
                {t('freeWithAds')}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem]">
            <img
              src="https://source.unsplash.com/featured/1000x800/?Rwanda,youth,health,community"
              alt="Nsobanuza hero"
              className="h-full min-h-[280px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchVideos')}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {t(item)}
              </option>
            ))}
          </select>
        </div>

        {/* Sponsored priority is intentionally localStorage-backed to simulate a simple admin boost control. */}
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[1.25rem] bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={boostSponsored}
            onChange={(event) => onBoostSponsoredChange(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span>
            <span className="block font-semibold text-slate-900">{t('adminBoostLabel')}</span>
            <span className="mt-1 block text-sm text-slate-500">{t('adminBoostHint')}</span>
          </span>
        </label>
      </section>

      <section className="grid gap-4">
        {feed.length === 0 ? (
          <div className="panel p-8 text-center text-slate-500">{t('noPosts')}</div>
        ) : (
          feed.map((post) => <PostCard key={post.id} post={post} onOpenVideo={onOpenVideo} />)
        )}
      </section>
    </div>
  );
}
