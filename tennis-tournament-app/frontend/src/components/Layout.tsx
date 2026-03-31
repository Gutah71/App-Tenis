import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setSidebarOpen(false);
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-green-50 text-green-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const isOrganizer = user?.role === 'ORGANIZER';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Brand */}
          <NavLink to="/" className="font-bold text-lg text-green-700 shrink-0">
            🎾 TennisTournament
          </NavLink>

          {/* Auth section – right side */}
          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="text-sm text-gray-700 hover:text-green-700 font-medium hidden sm:block"
                >
                  {user?.name}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="text-sm text-gray-600 hover:text-green-700">
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700"
                >
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Left Sidebar Drawer ──────────────────────────────── */}
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold text-green-700">🎾 Menú</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NavLink to="/" end className={linkClass} onClick={() => setSidebarOpen(false)}>
            🏠 Inicio
          </NavLink>

          {/* PLAYER navigation */}
          {!isOrganizer && (
            <>
              <NavLink to="/tournaments" className={linkClass} onClick={() => setSidebarOpen(false)}>
                🏆 Torneos
              </NavLink>
              <NavLink to="/leagues" className={linkClass} onClick={() => setSidebarOpen(false)}>
                🌐 Ligas
              </NavLink>
              {isAuthenticated && (
                <NavLink to="/my-tournaments" className={linkClass} onClick={() => setSidebarOpen(false)}>
                  📋 Mis torneos
                </NavLink>
              )}
            </>
          )}

          {/* ORGANIZER navigation */}
          {isOrganizer && (
            <>
              <NavLink to="/tournaments/new" className={linkClass} onClick={() => setSidebarOpen(false)}>
                ➕ Crear torneo
              </NavLink>
              <NavLink to="/leagues/new" className={linkClass} onClick={() => setSidebarOpen(false)}>
                ➕ Crear liga
              </NavLink>
              <NavLink to="/my-tournaments" className={linkClass} onClick={() => setSidebarOpen(false)}>
                📋 Mis torneos
              </NavLink>
              <NavLink to="/my-leagues" className={linkClass} onClick={() => setSidebarOpen(false)}>
                🌐 Mis ligas
              </NavLink>
            </>
          )}

          {/* Common – always visible */}
          <NavLink to="/contact" className={linkClass} onClick={() => setSidebarOpen(false)}>
            ✉️ Contáctanos
          </NavLink>

          {/* Auth shortcuts inside drawer */}
          {isAuthenticated && (
            <>
              <div className="border-t my-2" />
              <NavLink to="/profile" className={linkClass} onClick={() => setSidebarOpen(false)}>
                👤 Mi perfil
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50"
              >
                🚪 Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* ── Page content ──────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="text-center text-xs text-gray-400 py-4">
        Tennis Tournament App — TFG {new Date().getFullYear()}
      </footer>
    </div>
  );
}
