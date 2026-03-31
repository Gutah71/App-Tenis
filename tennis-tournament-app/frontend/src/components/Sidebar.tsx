import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { isGuest, isPlayer, isOrganizer } = useAuth();

  const guestLinks: NavItem[] = [
    { to: '/leagues', label: 'Ligas' },
    { to: '/tournaments', label: 'Torneos' },
    { to: '/contact', label: 'Contacto' },
  ];

  const playerLinks: NavItem[] = [
    { to: '/leagues', label: 'Ligas' },
    { to: '/tournaments', label: 'Torneos' },
    { to: '/my-space', label: 'Mis ligas / Torneos' },
    { to: '/stats', label: 'Mi historial' },
    { to: '/contact', label: 'Contacto' },
  ];

  const organizerLinks: NavItem[] = [
    { to: '/create', label: 'Crear liga / torneo' },
    { to: '/my-leagues', label: 'Ver ligas creadas' },
    { to: '/my-tournaments', label: 'Ver torneos creados' },
    { to: '/contact', label: 'Contacto' },
  ];

  let links: NavItem[];
  if (isOrganizer) links = organizerLinks;
  else if (isPlayer) links = playerLinks;
  else links = guestLinks;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold text-green-700 text-lg">Menú</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col py-2">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 border-l-4 border-green-700'
                    : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Guest hint at bottom */}
        {isGuest && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <p className="text-xs text-gray-400 text-center">
              Inicia sesión para acceder a más funciones
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
