import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-green-700 font-semibold' : 'text-gray-600 hover:text-green-700';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-5 flex-wrap">
          <NavLink to="/" className="font-bold text-lg text-green-700 mr-2">
            🎾 TennisTournament
          </NavLink>
          <NavLink to="/tournaments" className={navClass}>Torneos</NavLink>
          <NavLink to="/leagues" className={navClass}>Ligas</NavLink>

          <div className="ml-auto flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/my-tournaments" className={navClass}>Mis torneos</NavLink>
                {user?.role === 'ORGANIZER' && (
                  <NavLink to="/tournaments/new" className={navClass}>+ Crear torneo</NavLink>
                )}
                <NavLink to="/profile" className={navClass}>{user?.name}</NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>Iniciar sesión</NavLink>
                <NavLink
                  to="/register"
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        Tennis Tournament App — TFG {new Date().getFullYear()}
      </footer>
    </div>
  );
}
