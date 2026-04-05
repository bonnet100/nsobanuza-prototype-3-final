import { useEffect, useState } from 'react';
import { getLocalizedCopy, getVideos } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const categories = ['allCategories', 'sexualHealth', 'mentalHealth', 'periodHealth'];

export default function Videos({ onOpenVideo }) {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('allCategories');
  const [items, setItems] = useState([]);

  useEffect(() => {
    getVideos({ search, category }).then(setItems);
  }, [search, category]);

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <h2 className="text-2xl font-semibold text-slate-900">{t('videosTitle')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('videosIntro')}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_240px]">
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
      </section>

      {items.length === 0 ? (
        <div className="panel p-8 text-center text-slate-500">{t('noVideos')}</div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => onOpenVideo(video)}
              className="panel overflow-hidden text-left transition hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={getLocalizedCopy(video.title, language)}
                  className="h-56 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                  {t('playVideo')}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    {t(video.category)}
                  </span>
                  <span className="text-xs text-slate-500">{video.source}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  {getLocalizedCopy(video.title, language)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {getLocalizedCopy(video.description, language)}
                </p>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
