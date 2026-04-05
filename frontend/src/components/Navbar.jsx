import { useLanguage } from '../contexts/LanguageContext';

const icons = {
  home: (
    <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-4.5V14h-6v7H4.5A1.5 1.5 0 0 1 3 19.5v-9Z" />
  ),
  'ai-chat': (
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H11l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z" />
  ),
  tracking: <path d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />,
  providers: (
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9a7 7 0 0 1 14 0M19 8h4M21 6v4" />
  ),
  videos: <path d="m9 7 8 5-8 5V7ZM4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
};

export default function Navbar({ items, activePage, onNavigate }) {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/80 bg-white/95 px-3 py-3 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
        {items.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                active ? 'bg-brand-soft text-brand-deep' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                {icons[item.id]}
              </svg>
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
