import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { PlayerStats } from '../types';

export default function StatsPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get<{ stats: PlayerStats }>('/users/stats', token)
      .then(({ stats }) => setStats(stats))
      .finally(() => setLoading(false));
  }, [token]);

  if (!user) return null;
  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;
  if (!stats) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Mi historial y estadísticas</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Partidos jugados" value={stats.totalPlayed} />
        <StatCard label="Victorias" value={stats.matchesWon} color="text-green-600" />
        <StatCard label="Derrotas" value={stats.matchesLost} color="text-red-500" />
        <StatCard label="% Victoria" value={`${stats.winRate}%`} color="text-blue-600" />
        <StatCard label="Torneos jugados" value={stats.tournamentsPlayed} />
        <StatCard label="Torneos ganados" value={stats.tournamentsWon} color="text-yellow-600" />
      </div>

      {/* Win rate bar */}
      {stats.totalPlayed > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <p className="text-sm text-gray-600 mb-2">Ratio de victorias</p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.winRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{stats.matchesWon}W</span>
            <span>{stats.matchesLost}L</span>
          </div>
        </div>
      )}

      {/* Recent matches */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Últimos partidos</h2>
        {stats.recentMatches.length === 0 ? (
          <p className="text-sm text-gray-400">No hay partidos registrados todavía.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentMatches.map((m) => {
              const won = m.winner?.id === user.id;
              const opponent = m.player1?.id === user.id ? m.player2 : m.player1;

              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-3 rounded border ${
                    won ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${won ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {won ? 'W' : 'L'}
                    </span>
                    <div>
                      <span className="text-sm text-gray-700">
                        vs {opponent?.name ?? 'Desconocido'}
                      </span>
                      <Link
                        to={`/tournaments/${m.tournament.id}`}
                        className="block text-xs text-green-600 hover:underline"
                      >
                        {m.tournament.name} · Ronda {m.round}
                      </Link>
                    </div>
                  </div>
                  {m.result && (
                    <span className="text-xs text-gray-500 font-mono">{m.result}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className={`text-2xl font-bold ${color ?? 'text-gray-800'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
