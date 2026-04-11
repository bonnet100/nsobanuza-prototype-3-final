import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

const categories = ['All', 'Sexual Health', 'Mental Health', 'Period Health', 'General'];

export default function Videos() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/videos'), api.get('/books')])
      .then(async ([videosRes, booksRes]) => {
        const videosData = await videosRes.json();
        const booksData = await booksRes.json();
        setVideos(videosData.videos || []);
        setBooks(booksData.books || []);
      })
      .catch((error) => {
        console.error('Library load error:', error);
      });
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => filter === 'All' || video.category === filter);
  }, [videos, filter]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => filter === 'All' || book.category === filter);
  }, [books, filter]);

  const featuredVideo = filteredVideos[0] || videos[0] || null;
  const showVideos = tab === 'all' || tab === 'videos';
  const showBooks = tab === 'all' || tab === 'guides';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_32%),radial-gradient(circle_at_85%_12%,_rgba(180,83,9,0.10),_transparent_20%),linear-gradient(180deg,_#f8f7f3_0%,_#eef5f3_52%,_#ffffff_100%)] px-4 pb-28 pt-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2.4rem] bg-[linear-gradient(135deg,_#0f766e_0%,_#115e59_45%,_#132238_100%)] p-7 text-white shadow-[0_28px_80px_rgba(15,118,110,0.22)]">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-100">{t('library')}</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">{t('libraryHeroTitle')}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-emerald-50/90">{t('libraryHeroBody')}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setTab('videos')}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    tab === 'videos' ? 'bg-white text-slate-950' : 'border border-white/25 bg-white/10 text-white'
                  }`}
                >
                  {t('healthVideos')}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('guides')}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    tab === 'guides' ? 'bg-white text-slate-950' : 'border border-white/25 bg-white/10 text-white'
                  }`}
                >
                  {t('healthGuides')}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('all')}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    tab === 'all' ? 'bg-white text-slate-950' : 'border border-white/25 bg-white/10 text-white'
                  }`}
                >
                  {t('allContent')}
                </button>
              </div>
            </div>

            {featuredVideo ? (
              <div className="rounded-[2rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100">{t('featuredFreeVideo')}</p>
                <h3 className="mt-3 text-xl font-semibold">{featuredVideo.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/90">{featuredVideo.description}</p>
                <button
                  type="button"
                  onClick={() => setSelectedVideo(featuredVideo)}
                  className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  {t('playHealthVideo')}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">{t('library')}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{t('libraryIntro')}</p>
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
        </section>

        {showVideos ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-slate-950">{t('healthVideos')}</h3>
              <p className="text-sm text-slate-500">{filteredVideos.length} {t('itemsAvailable')}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredVideos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setSelectedVideo(video)}
                  className="overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/92 text-left shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-900">
                    <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950">
                      {t('playHealthVideo')}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-800">
                        {video.category}
                      </span>
                      {video.isPartnerAd ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                          {t('partnerAd')}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-slate-950">{video.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">{video.createdBy}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{video.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {showBooks ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-slate-950">{t('healthGuides')}</h3>
              <p className="text-sm text-slate-500">{filteredBooks.length} {t('itemsAvailable')}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredBooks.length === 0 ? (
                <div className="col-span-full rounded-[2rem] border border-white/70 bg-white/92 p-8 text-center text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  {t('noBooksFound')}
                </div>
              ) : null}

              {filteredBooks.map((book) => (
                <article
                  key={book.id}
                  className="rounded-[2.2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="overflow-hidden rounded-[1.8rem] bg-slate-100">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="h-56 w-full object-cover" />
                    ) : (
                      <div className="flex h-56 items-center justify-center text-5xl text-slate-400">BOOK</div>
                    )}
                  </div>
                  <div className="mt-5">
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-800">
                      {book.category}
                    </span>
                    <h4 className="mt-4 text-xl font-semibold text-slate-950">{book.title}</h4>
                    <p className="mt-2 text-sm text-[var(--nsobanuza-primary)]">
                      {t('publishedBy')} {book.author}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{book.summary || book.description}</p>
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--nsobanuza-primary)]"
                    >
                      {t('readGuide')}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {selectedVideo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">{selectedVideo.category}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{selectedVideo.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{selectedVideo.createdBy}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500"
              >
                {t('close')}
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.8rem] bg-slate-950">
              <video
                src={selectedVideo.url}
                poster={selectedVideo.thumbnail}
                controls
                autoPlay
                playsInline
                className="aspect-video w-full object-cover"
              />
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-600">{selectedVideo.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
