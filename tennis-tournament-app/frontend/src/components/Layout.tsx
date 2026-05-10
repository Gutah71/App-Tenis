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
    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-green/10 text-brand-green border-l-2 border-brand-green pl-2.5'
        : 'text-gray-400 hover:bg-brand-surface-3 hover:text-gray-100'
    }`;

  const isOrganizer = user?.role === 'ORGANIZER';

  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      <header className="bg-brand-surface-1 border-b border-brand-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3.5 flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-brand-surface-3 text-gray-400 hover:text-gray-100 transition-colors"
            aria-label="Menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-brand-green rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2 C6 8, 18 16, 12 22"/>
                <path d="M2 12 C8 6, 16 18, 22 12"/>
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight hidden sm:block">
              <span className="text-brand-green">Tennis</span>
              <span className="text-white">Tournament</span>
            </span>
          </NavLink>

          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="text-sm text-gray-300 hover:text-brand-green font-medium hidden sm:flex items-center gap-2 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user?.name}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="text-sm text-gray-400 hover:text-gray-100 transition-colors hidden sm:block">
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-brand-green text-black px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-brand-green-light transition-colors whitespace-nowrap"
                >
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-brand-surface-1 border-r border-brand-border z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-green rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2 C6 8, 18 16, 12 22"/>
                <path d="M2 12 C8 6, 16 18, 22 12"/>
              </svg>
            </div>
            <span className="font-bold text-sm text-white">
              <span className="text-brand-green">Tennis</span>Tournament
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-brand-surface-3 text-gray-400 hover:text-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">Navegación</p>

          <NavLink to="/" end className={linkClass} onClick={() => setSidebarOpen(false)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Inicio
          </NavLink>

          {!isOrganizer && (
            <>
              <NavLink to="/tournaments" className={linkClass} onClick={() => setSidebarOpen(false)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Torneos
              </NavLink>
              <NavLink to="/leagues" className={linkClass} onClick={() => setSidebarOpen(false)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ligas
              </NavLink>
              {isAuthenticated && (
                <NavLink to="/my-tournaments" className={linkClass} onClick={() => setSidebarOpen(false)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Mis torneos
                </NavLink>
              )}
              {isAuthenticated && (
                <NavLink to="/my-leagues" className={linkClass} onClick={() => setSidebarOpen(false)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Mis ligas
                </NavLink>
              )}
              {isAuthenticated && (
                <NavLink to="/calendar" className={linkClass} onClick={() => setSidebarOpen(false)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Mi calendario
                </NavLink>
              )}
            </>
          )}

          {isOrganizer && (
            <>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mt-4 mb-2">Organización</p>
              <NavLink to="/tournaments/new" className={linkClass} onClick={() => setSidebarOpen(false)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Crear torneo
              </NavLink>
              <NavLink to="/leagues/new" className={linkClass} onClick={() => setSidebarOpen(false)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Crear liga
              </NavLink>
              <NavLink to="/my-tournaments" className={linkClass} onClick={() => setSidebarOpen(false)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Mis torneos
              </NavLink>
              <NavLink to="/my-leagues" className={linkClass} onClick={() => setSidebarOpen(false)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Mis ligas
              </NavLink>
            </>
          )}

          <div className="border-t border-brand-border my-3" />

          <NavLink to="/contact" className={linkClass} onClick={() => setSidebarOpen(false)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contacto
          </NavLink>

          {isAuthenticated && (
            <>
              <div className="border-t border-brand-border my-3" />
              <NavLink to="/profile" className={linkClass} onClick={() => setSidebarOpen(false)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi perfil
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-brand-surface-1 border-t border-brand-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-brand-green rounded flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2 C6 8, 18 16, 12 22"/>
                    <path d="M2 12 C8 6, 16 18, 22 12"/>
                  </svg>
                </div>
                <span className="font-bold text-sm"><span className="text-brand-green">Tennis</span><span className="text-white">Tournament</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Plataforma profesional para la gestión de torneos y ligas de tenis.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Plataforma</p>
              <ul className="space-y-2 text-sm text-gray-500">
                {isAuthenticated && user?.role === 'ORGANIZER' ? (
                  <>
                    <li><a href="/my-tournaments" className="hover:text-brand-green transition-colors">Mis torneos</a></li>
                    <li><a href="/my-leagues" className="hover:text-brand-green transition-colors">Mis ligas</a></li>
                  </>
                ) : (
                  <>
                    <li><a href="/tournaments" className="hover:text-brand-green transition-colors">Torneos</a></li>
                    <li><a href="/leagues" className="hover:text-brand-green transition-colors">Ligas</a></li>
                    {!isAuthenticated && (
                      <li><a href="/register" className="hover:text-brand-green transition-colors">Crear cuenta</a></li>
                    )}
                  </>
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Soporte</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/contact" className="hover:text-brand-green transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-brand-border mt-8 pt-6 text-center">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} TennisTournament — Trabajo de Fin de Grado
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}




