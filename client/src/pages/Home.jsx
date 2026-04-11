import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const categories = ['All', 'Sexual Health', 'Mental Health', 'Period Health', 'General'];

function formatTime(value) {
  return new Date(value).toLocaleDateString();
}

function FeedVideoCard({ item, audioAllowed, onRequireAudio, onSponsorAction }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) {
          return;
        }

        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.65 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const togglePlayback = () => {
    if (!videoRef.current) {
      return;
    }

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <article className="snap-start overflow-hidden rounded-[2.6rem] border border-white/10 bg-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
      <div className="relative h-[72vh]">
        <video
          ref={videoRef}
          src={item.url}
          poster={item.thumbnail}
          className="h-full w-full object-cover"
          loop
          playsInline
          muted={!audioAllowed}
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-slate-950/10" />

        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
            {item.category}
          </span>
          {item.isPartnerAd ? (
            <span className="rounded-full bg-amber-400/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-950">
              Partner Ad
            </span>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-100">{item.createdBy}</p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">{item.title}</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/88">{item.description}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              {isPlaying ? 'Pause video' : 'Play video'}
            </button>
            <button
              type="button"
              onClick={audioAllowed ? togglePlayback : onRequireAudio}
              className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              {audioAllowed ? 'Audio enabled' : 'Allow audio on scroll'}
            </button>
            {item.isPartnerAd ? (
              <button
                type="button"
                onClick={() => onSponsorAction(item)}
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Unlock 24h ad-light mode
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function ImageFeedCard({ item, onSponsorAction }) {
  const isExternalCta = item.ctaUrl && /^https?:\/\//i.test(item.ctaUrl);

  return (
    <article className="snap-start overflow-hidden rounded-[2.6rem] border border-white/70 bg-white/94 shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
      {item.mediaUrl ? (
        <div className="relative h-[50vh] overflow-hidden">
          <img src={item.mediaUrl} alt={item.authorName} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          <div className="absolute left-5 top-5 flex gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-900">
              {item.category}
            </span>
            {item.isSponsored ? (
              <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-950">
                Sponsored
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">{item.authorName}</p>
            <p className="mt-2 text-sm text-slate-500">{formatTime(item.createdAt)}</p>
          </div>
        </div>
        <p className="mt-5 text-[15px] leading-8 text-slate-700">{item.content}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {item.ctaUrl ? (
            isExternalCta ? (
              <a
                href={item.ctaUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[var(--nsobanuza-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--nsobanuza-primary-deep)]"
              >
                {item.ctaLabel || 'Open'}
              </a>
            ) : (
              <Link
                to={item.ctaUrl}
                className="rounded-full bg-[var(--nsobanuza-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--nsobanuza-primary-deep)]"
              >
                {item.ctaLabel || 'Open'}
              </Link>
            )
          ) : null}
          {item.isSponsored ? (
            <button
              type="button"
              onClick={() => onSponsorAction(item)}
              className="rounded-full border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900"
            >
              Watch sponsor benefit
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Home({ user }) {
  const { t } = useLanguage();
  const { setUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [audioAllowed, setAudioAllowed] = useState(false);
  const [status, setStatus] = useState('');
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [adLightExpiresAt, setAdLightExpiresAt] = useState(user?.adRemovalExpiresAt || null);
  const [composer, setComposer] = useState({
    content: '',
    category: 'Sexual Health',
    mediaUrl: '',
    ctaLabel: '',
    ctaUrl: ''
  });
  const [composeMessage, setComposeMessage] = useState('');

  useEffect(() => {
    const savedAudio = localStorage.getItem('nsobanuza_audio_enabled');
    setAudioAllowed(savedAudio === 'true');
  }, []);

  useEffect(() => {
    setAdLightExpiresAt(user?.adRemovalExpiresAt || null);
  }, [user?.adRemovalExpiresAt]);

  useEffect(() => {
    Promise.all([api.get('/posts'), api.get('/videos')])
      .then(async ([postsRes, videosRes]) => {
        const postsData = await postsRes.json();
        const videosData = await videosRes.json();
        setPosts(postsData.posts || []);
        setVideos(videosData.videos || []);
      })
      .catch((error) => {
        console.error('Feed load error:', error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const adFreeActive = adLightExpiresAt && new Date(adLightExpiresAt) > new Date();

  const allFeedItems = [
    ...videos.map((video) => ({ ...video, type: 'video', sortDate: video.createdAt })),
    ...posts.map((post) => ({ ...post, type: 'post', sortDate: post.createdAt }))
  ]
    .filter((item) => (adFreeActive ? !item.isSponsored && !item.isPartnerAd : true))
    .sort((left, right) => new Date(right.sortDate) - new Date(left.sortDate));

  const filteredFeed = allFeedItems.filter((item) => {
    const haystack = [
      item.title,
      item.description,
      item.content,
      item.authorName,
      item.createdBy,
      item.category
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const sponsorVideo =
    videos.find((item) => item.isPartnerAd) ||
    filteredFeed.find((item) => item.type === 'video' && item.isPartnerAd) ||
    null;

  const enableAudio = () => {
    localStorage.setItem('nsobanuza_audio_enabled', 'true');
    setAudioAllowed(true);
  };

  const openSponsorModal = (item) => {
    setSelectedSponsor(item.type === 'video' ? item : sponsorVideo);
    setShowSponsorModal(true);
  };

  const activateAdLightMode = async () => {
    const response = await api.post('/ad-removal/watch', {});
    const data = await response.json();
    if (response.ok) {
      setAdLightExpiresAt(data.expires_at);
      setUser((current) => (current ? { ...current, adRemovalExpiresAt: data.expires_at } : current));
      setStatus(`Ad-light mode enabled until ${new Date(data.expires_at).toLocaleString()}`);
      setShowSponsorModal(false);
    } else {
      setStatus(data.error || 'Unable to activate ad-light mode right now.');
    }
  };

  const handleComposeChange = (field) => (event) => {
    setComposer((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitPost = async (event) => {
    event.preventDefault();
    setComposeMessage('');

    const response = await api.post('/posts', composer);
    const data = await response.json();

    if (!response.ok) {
      setComposeMessage(data.error || 'Unable to submit post right now.');
      return;
    }

    setComposeMessage(data.message);
    setComposer({
      content: '',
      category: 'Sexual Health',
      mediaUrl: '',
      ctaLabel: '',
      ctaUrl: ''
    });

    if (data.post?.status === 'approved') {
      setPosts((current) => [data.post, ...current]);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.15),_transparent_32%),radial-gradient(circle_at_100%_10%,_rgba(180,83,9,0.12),_transparent_24%),linear-gradient(180deg,_#f8f7f3_0%,_#eef5f3_50%,_#ffffff_100%)] px-4 pb-28 pt-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2.4rem] bg-[linear-gradient(135deg,_#0f766e_0%,_#115e59_45%,_#132238_100%)] p-6 text-white shadow-[0_28px_80px_rgba(15,118,110,0.22)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-100">Confidential youth health ecosystem</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-[2.7rem]">
                Scroll trusted health stories, watch short videos, chat with AI, and reach verified professionals.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-emerald-50/90">
                Nsobanuza blends an Instagram-style health feed with a YouTube-like video layer so young people in Rwanda can learn privately, track their wellbeing, and move into care with confidence.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={enableAudio}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  {audioAllowed ? 'Audio is on while scrolling' : 'Allow audio while scrolling'}
                </button>
                <Link
                  to="/app/chat"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Open AI chatbot
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.8rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100">Free mode</p>
                <p className="mt-3 text-sm leading-7 text-white/90">
                  Core tools stay free. Sponsored health posts and partner videos help keep the platform accessible.
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-white/12 bg-slate-950/20 p-5 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.24em] text-amber-100">Languages</p>
                <p className="mt-3 text-sm leading-7 text-white/90">
                  The experience supports Kinyarwanda, English, French, and Swahili with a green-and-white visual system designed for clarity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <h3 className="text-xl font-semibold text-slate-950">{t('home')}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Explore verified health messages, partner-supported campaigns, and short videos designed for youth.
              </p>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('searchHealth')}
                className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      category === item
                        ? 'bg-[var(--nsobanuza-primary)] text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {!adFreeActive ? (
              <div className="rounded-[2rem] bg-[linear-gradient(135deg,_#f4c95d_0%,_#f8de92_100%)] p-6 text-slate-950 shadow-[0_24px_60px_rgba(244,201,93,0.24)]">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-700">Free mode with ads</p>
                <h3 className="mt-3 text-xl font-semibold">Watch a trusted sponsor video to reduce ads for 24 hours.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Partner-funded campaigns help keep the chatbot, health tracking, and youth education features available at no cost.
                </p>
                <button
                  type="button"
                  onClick={() => openSponsorModal({ type: 'video' })}
                  className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Play sponsor health video
                </button>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 text-emerald-900">
                <p className="text-[11px] uppercase tracking-[0.24em]">Ad-light mode</p>
                <p className="mt-3 text-sm leading-7">
                  Your feed is currently showing fewer sponsor posts because you activated a partner video benefit.
                </p>
              </div>
            )}

            {user?.role === 'professional' || user?.role === 'admin' ? (
              <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <h3 className="text-xl font-semibold text-slate-950">Publish a health message</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Verified professionals can publish trusted messages. Professional submissions go to admin review before reaching the feed.
                </p>
                <form onSubmit={submitPost} className="mt-5 space-y-4">
                  <textarea
                    value={composer.content}
                    onChange={handleComposeChange('content')}
                    rows="5"
                    className="w-full rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
                    placeholder="Write a youth-friendly health message..."
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={composer.category}
                      onChange={handleComposeChange('category')}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                    >
                      {categories.filter((item) => item !== 'All').map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                    <input
                      value={composer.mediaUrl}
                      onChange={handleComposeChange('mediaUrl')}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                      placeholder="Image URL"
                    />
                    <input
                      value={composer.ctaLabel}
                      onChange={handleComposeChange('ctaLabel')}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                      placeholder="CTA label"
                    />
                    <input
                      value={composer.ctaUrl}
                      onChange={handleComposeChange('ctaUrl')}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                      placeholder="CTA link"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[var(--nsobanuza-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--nsobanuza-primary-deep)]"
                  >
                    Submit health post
                  </button>
                </form>
                {composeMessage ? <p className="mt-4 text-sm text-slate-600">{composeMessage}</p> : null}
              </div>
            ) : null}

            {status ? (
              <div className="rounded-[1.8rem] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                {status}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="rounded-[2rem] border border-white/70 bg-white/92 p-10 text-center text-sm text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                Loading the Nsobanuza home feed...
              </div>
            ) : null}

            {!isLoading && filteredFeed.length === 0 ? (
              <div className="rounded-[2rem] border border-white/70 bg-white/92 p-10 text-center text-sm text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                No matching health posts were found for this filter.
              </div>
            ) : null}

            {!isLoading ? (
              <div className="h-[calc(100vh-190px)] space-y-6 overflow-y-auto rounded-[2.6rem] pr-1 snap-y snap-mandatory">
                {filteredFeed.map((item) =>
                  item.type === 'video' ? (
                    <FeedVideoCard
                      key={`video-${item.id}`}
                      item={item}
                      audioAllowed={audioAllowed}
                      onRequireAudio={enableAudio}
                      onSponsorAction={openSponsorModal}
                    />
                  ) : (
                    <ImageFeedCard
                      key={`post-${item.id}`}
                      item={item}
                      onSponsorAction={openSponsorModal}
                    />
                  )
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {showSponsorModal && selectedSponsor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">Partner health video</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                  {selectedSponsor.title || 'Sponsor-supported health message'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSponsorModal(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500"
              >
                Close
              </button>
            </div>

            {selectedSponsor.url ? (
              <div className="mt-5 overflow-hidden rounded-[1.8rem] bg-slate-950">
                <video
                  src={selectedSponsor.url}
                  poster={selectedSponsor.thumbnail}
                  controls
                  autoPlay
                  playsInline
                  className="aspect-video w-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[1.8rem]">
                <img
                  src={selectedSponsor.mediaUrl}
                  alt={selectedSponsor.authorName}
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}

            <p className="mt-5 text-sm leading-7 text-slate-600">
              Watch partner-supported health education and then activate ad-light mode so your feed shows fewer promotional items for 24 hours.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={activateAdLightMode}
                className="rounded-full bg-[var(--nsobanuza-primary)] px-5 py-3 text-sm font-semibold text-white"
              >
                I watched it, unlock ad-light mode
              </button>
              <button
                type="button"
                onClick={enableAudio}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Enable audio for future scrolling
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
