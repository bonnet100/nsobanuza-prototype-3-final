import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const tabs = [
  {
    to: '/app',
    label: 'home',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M3 10.5 12 3l9 7.5M5.25 9.75V21h13.5V9.75"
      />
    )
  },
  {
    to: '/app/chat',
    label: 'chat',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M7 8h10M7 12h6m-9 8 2.7-2.7a2 2 0 0 1 1.4-.6H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6A3 3 0 0 0 3 7v7a3 3 0 0 0 3 3h.5"
      />
    )
  },
  {
    to: '/app/tracking',
    label: 'tracking',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M8 3v3m8-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1Zm3 7h3v3H8v-3Z"
      />
    )
  },
  {
    to: '/app/providers',
    label: 'providers',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 0c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Zm6-9v4m-2-2h4"
      />
    )
  },
  {
    to: '/app/library',
    label: 'library',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M6 4.5A2.5 2.5 0 0 1 8.5 2H20v16H8.5A2.5 2.5 0 0 0 6 20.5m0-16v16m0-16H4v16h2"
      />
    )
  }
];

export default function BottomNav() {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-5xl grid-cols-5 px-2 py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition ${
                isActive
                  ? 'bg-emerald-50 text-[var(--nsobanuza-primary)]'
                  : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current">
              {tab.icon}
            </svg>
            <span>{t(tab.label)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
