import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/userService';
import type { User } from '../types';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {/* use cached user */})
      .finally(() => setLoading(false));
  }, []);

  const displayed = profile ?? authUser;

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando perfil...</p>;
  if (!displayed) return <p className="text-center py-16 text-gray-500">No has iniciado sesión.</p>;

  const ROLE_LABELS: Record<string, string> = { PLAYER: 'Jugador', ORGANIZER: 'Organizador' };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Mi perfil</h1>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-gray-500">Nombre</dt>
          <dd className="font-medium text-gray-800">{displayed.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Email</dt>
          <dd className="font-medium text-gray-800">{displayed.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Rol</dt>
          <dd className="font-medium text-gray-800">{ROLE_LABELS[displayed.role] ?? displayed.role}</dd>
        </div>
      </dl>
    </div>
  );
}
