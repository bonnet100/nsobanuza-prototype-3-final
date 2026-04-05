import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const tabs = [
  { to: '/', label: 'home' },
  { to: '/chat', label: 'chat' },
  { to: '/tracking', label: 'tracking' },
  { to: '/providers', label: 'providers' },
  { to: '/videos', label: 'videos' }
];

export default function BottomNav() {
  const { t } = useLanguage();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-sm">
      <div className="mx-auto flex max-w-4xl justify-between px-4 py-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[11px] ${isActive ? 'text-brand font-semibold' : 'text-slate-500'}`
            }
          >
            <span className="text-xl">{tab.label === 'home' ? '🏠' : tab.label === 'chat' ? '💬' : tab.label === 'tracking' ? '📅' : tab.label === 'providers' ? '👩‍⚕️' : '🎥'}</span>
            {t(tab.label)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
