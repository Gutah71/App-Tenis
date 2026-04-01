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
    <div className="w-full max-w-2xl mx-auto px-6 py-12 space-y-6">
      <div className="card">
        <h1 className="section-title">Mi perfil</h1>
        <dl className="mt-6 space-y-5">
          <div className="pb-4 border-b border-brand-border">
            <dt className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Nombre</dt>
            <dd className="font-medium text-white mt-1">{displayed.name}</dd>
          </div>
          <div className="pb-4 border-b border-brand-border">
            <dt className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Email</dt>
            <dd className="font-medium text-white mt-1">{displayed.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Rol</dt>
            <dd className="font-medium text-white mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-green"></span>
              {ROLE_LABELS[displayed.role] ?? displayed.role}
            </dd>
          </div>
        </dl>
      </div>

      {stats && displayed.role === 'PLAYER' && (
        <div className="card">
          <h2 className="font-bold text-white text-lg mb-6">Mis estadísticas</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-surface-2 rounded-lg p-4 border border-brand-border">
                <p className="text-xs text-gray-500 font-medium uppercase">Torneos jugados</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.tournamentsPlayed}</p>
              </div>
              <div className="bg-brand-surface-2 rounded-lg p-4 border border-brand-border">
                <p className="text-xs text-brand-green font-medium uppercase">Torneos ganados</p>
                <p className="text-2xl font-bold text-brand-green mt-1">{stats.tournamentsWon}</p>
              </div>
            </div>

            <div className="bg-brand-surface-2/50 border border-brand-border rounded-lg p-4 space-y-3">
              <p className="text-xs text-gray-500 font-medium uppercase mb-3">Partidos</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Jugados</p>
                  <p className="text-xl font-bold text-white">{stats.matchesPlayed}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-green">Ganados</p>
                  <p className="text-xl font-bold text-brand-green">{stats.matchesWon}</p>
                </div>
                <div>
                  <p className="text-xs text-red-400">Perdidos</p>
                  <p className="text-xl font-bold text-red-400">{stats.matchesLost}</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface-2/50 rounded-lg p-4 border border-brand-border">
              <p className="text-xs text-gray-500 font-medium uppercase mb-3">Sets</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ganados</span>
                <span className="text-lg font-bold text-brand-green">{stats.setsWon}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Perdidos</span>
                <span className="text-lg font-bold text-gray-300">{stats.setsLost}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
