import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, getToken } from '../api';

const categories = ['All', 'Sexual Health', 'Mental Health', 'Period Health'];

export default function Videos() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = getToken();
    api.get('/videos', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setVideos(data.videos || []));
  }, []);

  const filtered = videos.filter((video) => filter === 'All' || video.category === filter);

  return (
    <div className="px-4 pb-28 pt-4 space-y-4">
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{t('videos')}</h2>
            <p className="text-sm text-slate-500">{t('videoCategories')}</p>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-4">
        {filtered.map((video) => (
          <button key={video.id} onClick={() => setSelected(video)} className="group rounded-[2rem] overflow-hidden bg-white shadow-sm text-left">
            <img src={video.thumbnail} alt={video.title} className="h-48 w-full object-cover transition duration-300 group-hover:scale-105" />
            <div className="p-4">
              <div className="text-sm text-slate-500">{video.category}</div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{video.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{video.description}</p>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold">{selected.title}</h3>
              <button className="text-slate-500" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-3xl bg-slate-900">
              <iframe title={selected.title} src={selected.url} allowFullScreen className="h-full w-full border-0"></iframe>
            </div>
            <p className="mt-4 text-slate-600">{selected.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
