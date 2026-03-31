import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, getUserStats } from '../services/userService';
import type { User, UserStats } from '../types';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getUserStats()])
      .then(([p, s]) => { setProfile(p); setStats(s); })
      .catch(() => {/* use cached user */})
      .finally(() => setLoading(false));
  }, []);

  const displayed = profile ?? authUser;

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando perfil...</p>;
  if (!displayed) return <p className="text-center py-16 text-gray-500">No has iniciado sesión.</p>;

  const ROLE_LABELS: Record<string, string> = { PLAYER: 'Jugador', ORGANIZER: 'Organizador' };

  return (
    <div className="max-w-md mx-auto space-y-6 mt-8">
      <div className="bg-white rounded-lg shadow p-8">
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

      {stats && displayed.role === 'PLAYER' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Mis estadísticas</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Torneos jugados</span>
              <span className="font-semibold text-gray-800">{stats.tournamentsPlayed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Torneos ganados</span>
              <span className="font-semibold text-green-700">{stats.tournamentsWon}</span>
            </div>
            <hr />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Partidos jugados</span>
              <span className="font-semibold text-gray-800">{stats.matchesPlayed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Partidos ganados</span>
              <span className="font-semibold text-green-700">{stats.matchesWon}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Partidos perdidos</span>
              <span className="font-semibold text-red-600">{stats.matchesLost}</span>
            </div>
            <hr />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sets ganados</span>
              <span className="font-semibold text-gray-800">{stats.setsWon}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sets perdidos</span>
              <span className="font-semibold text-gray-800">{stats.setsLost}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
