import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

function LayoutInner() {
  const { user, isGuest, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ──────────────────────────────────── */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-t-4 border-green-700">
        <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-green-700"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="font-bold text-lg text-green-700 hover:text-green-800">
              🎾 AppTenis
            </Link>
          </div>

          {/* Right: auth buttons or profile link */}
          <div className="flex items-center gap-4">
            {isGuest ? (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-green-700 font-medium"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-green-700 text-white px-4 py-1.5 rounded-md hover:bg-green-800 font-medium"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 font-medium"
              >
                <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                  {user!.name.charAt(0).toUpperCase()}
                </span>
                Mi perfil
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* ── Sidebar ─────────────────────────────────── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Page content ────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm text-gray-500 font-medium">
            🎾 Tennis Tournament App
          </span>
          <span className="text-xs text-gray-400">
            TFG &mdash; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <LayoutInner />
    </AuthProvider>
  );
}
