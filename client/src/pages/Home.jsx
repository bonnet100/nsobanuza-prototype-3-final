import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, getToken } from '../api';

const categories = ['All', 'Sexual Health', 'Mental Health', 'Period Health'];

export default function Home({ user }) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const token = getToken();
    api.get('/posts', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, []);

  const sponsoredActive = useMemo(() => {
    if (!user?.adRemovalExpiresAt) return false;
    return new Date(user.adRemovalExpiresAt) > new Date();
  }, [user]);

  const filtered = useMemo(() => {
    return posts.filter((item) => {
      const matchesSearch = item.content.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || item.content.toLowerCase().includes(category.toLowerCase()) || item.author_name.toLowerCase().includes(category.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, category]);

  const feed = useMemo(() => {
    const organic = filtered.filter((item) => !item.is_sponsored);
    const sponsored = filtered.filter((item) => item.is_sponsored);
    const list = [];
    let sponsorIndex = 0;
    organic.forEach((item, idx) => {
      list.push(item);
      if ((idx + 1) % 3 === 0 && sponsorIndex < sponsored.length) {
        list.push(sponsored[sponsorIndex]);
        sponsorIndex += 1;
      }
    });
    while (sponsorIndex < sponsored.length) {
      list.push(sponsored[sponsorIndex]);
      sponsorIndex += 1;
    }
    return list;
  }, [filtered]);

  return (
    <div className="space-y-4 px-4 pt-4 pb-28">
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{t('home')}</h2>
            <p className="text-sm text-slate-500">{t('searchHealth')}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            placeholder={t('searchHealth')}
          />
          <button className="rounded-2xl bg-brand px-4 py-3 text-white">{t('search')}</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm ${category === cat ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              {t({
                All: 'all',
                'Sexual Health': 'sexualHealth',
                'Mental Health': 'mentalHealth',
                'Period Health': 'periodHealth'
              }[cat])}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {feed.length === 0 && <div className="rounded-3xl bg-white p-6 text-center text-slate-500">{t('noPosts')}</div>}
        {feed.map((post) => (
          <article key={post.id} className="rounded-[2rem] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 pb-3">
              <div>
                <h3 className="font-semibold">{post.author_name}</h3>
                <p className="text-sm text-slate-500">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
              {post.is_sponsored ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{t('sposted')}</span> : null}
            </div>
            <p className="text-slate-700">{post.content}</p>
            {post.media_url ? (
              <div className="mt-4 overflow-hidden rounded-3xl bg-slate-100">
                <img src={post.media_url} alt="Post media" className="h-52 w-full object-cover" />
              </div>
            ) : null}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button className="rounded-2xl bg-brand px-4 py-2 text-sm text-white">{t('startWatching')}</button>
              <span className="text-sm text-slate-500">#{post.media_type}</span>
            </div>
          </article>
        ))}
      </div>

      {!sponsoredActive && (
        <div className="sticky bottom-24 rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4 text-white shadow-xl">
          <p className="font-semibold">{t('freeModeBanner')}</p>
          <p className="mt-2 text-sm text-slate-100">{t('watchAdRemoveAds')}</p>
        </div>
      )}
    </div>
  );
}
