import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { api, getToken, setToken, clearToken } from './api';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Tracking from './pages/Tracking';
import Providers from './pages/Providers';
import Videos from './pages/Videos';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterProfessional from './pages/RegisterProfessional';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import LanguageSwitcher from './components/LanguageSwitcher';

function ProtectedRoute({ children }) {
  const authed = Boolean(getToken());
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppShell() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        clearToken();
      });
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-brand font-bold">Nsobanuza</div>
          <div className="text-xs text-slate-500">{t('supportiveYouthHealth')}</div>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="pb-24">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/settings" element={<Settings user={user} onLogout={logout} setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/login" element={<Login setUser={(user) => setToken(user.token)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-professional" element={<RegisterProfessional />} />
        <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
