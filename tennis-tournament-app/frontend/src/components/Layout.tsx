import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Navbar ──────────────────────────────────── */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
          <span className="font-bold text-lg text-green-700">🎾 TennisTournament</span>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-green-700 font-semibold' : 'text-gray-600 hover:text-green-700'
            }
          >
            Inicio
          </NavLink>
          {/* Add more nav links here */}
        </nav>
      </header>

      {/* ── Page content ────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="text-center text-xs text-gray-400 py-4">
        Tennis Tournament App — TFG {new Date().getFullYear()}
      </footer>
    </div>
  );
}
