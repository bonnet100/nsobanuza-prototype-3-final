import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Tracking from './pages/Tracking';
import Providers from './pages/Providers';
import Library from './pages/Videos';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterProfessional from './pages/RegisterProfessional';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import LanguageSwitcher from './components/LanguageSwitcher';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading authentication...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/app/admin' : '/app'} replace />;
  }

  return children;
}

function AppShell() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--nsobanuza-primary)] text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,118,110,0.25)]">
              N
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--nsobanuza-primary)]">
                Nsobanuza
              </div>
              <div className="text-xs text-slate-500">
                {user?.displayName} / {t('supportiveYouthHealth')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'admin' ? (
              <Link
                to="/app/admin"
                className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 sm:inline-flex"
              >
                {t('adminPanel')}
              </Link>
            ) : null}
            <Link
              to="/app/settings"
              className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-700 sm:inline-flex"
            >
              {t('settings')}
            </Link>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={logout}
              className="hidden rounded-full bg-slate-950 px-4 py-2 text-xs text-white sm:inline-flex"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24">
        <Routes>
          <Route index element={<Home user={user} />} />
          <Route path="chat" element={<Chat />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="providers" element={<Providers />} />
          <Route path="library" element={<Library />} />
          <Route path="admin" element={<Admin user={user} />} />
          <Route path="settings" element={<Settings user={user} onLogout={logout} />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <Login />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicAuthRoute>
                <Register />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/register-professional"
            element={
              <PublicAuthRoute>
                <RegisterProfessional />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
