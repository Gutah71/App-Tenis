import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTournaments } from '../services/tournamentService';
import type { Tournament } from '../types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Abierto',
  FULL: 'Completo',
  IN_PROGRESS: 'En curso',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
  DRAFT: { bg: 'bg-brand-surface-2', text: 'text-gray-400', icon: '📝' },
  OPEN: { bg: 'bg-brand-green/10 border border-brand-green/50', text: 'text-brand-green', icon: '🟢' },
  FULL: { bg: 'bg-amber-500/10 border border-amber-500/50', text: 'text-amber-400', icon: '🟡' },
  IN_PROGRESS: { bg: 'bg-blue-500/10 border border-blue-500/50', text: 'text-blue-400', icon: '🔴' },
  FINISHED: { bg: 'bg-purple-500/10 border border-purple-500/50', text: 'text-purple-400', icon: '🏆' },
  CANCELLED: { bg: 'bg-red-500/10 border border-red-500/50', text: 'text-red-400', icon: '❌' },
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listTournaments()
      .then(setTournaments)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando torneos...</p>;
  if (error) return <p className="text-center py-16 text-red-500">{error}</p>;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="section-title">Todos los Torneos</h1>
        <p className="section-subtitle">Explora y únete a torneos de tenis en tu zona</p>
      </div>

      {tournaments.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-400 mb-4">No hay torneos disponibles por el momento</p>
          <Link to="/" className="text-brand-green hover:text-brand-green-light font-medium transition-colors">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => {
            const colors = STATUS_COLOR_MAP[t.status] || STATUS_COLOR_MAP.DRAFT;
            return (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="card hover:border-brand-green/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-bold text-white text-base group-hover:text-brand-green transition-colors flex-1">{t.name}</h2>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${colors.bg} ${colors.text}`}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </div>

                {t.league && (
                  <p className="text-xs text-brand-green/70 mb-3 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Liga: {t.league.name}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Plazas</span>
                    <span className="text-white font-semibold">
                      {t._count?.registrations ?? 0} / {t.maxPlayers}
                    </span>
                  </div>
                  <div className="w-full bg-brand-surface-3 rounded-full h-1.5">
                    <div
                      className="bg-brand-green h-1.5 rounded-full transition-all"
                      style={{
                        width: `${((t._count?.registrations ?? 0) / t.maxPlayers) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {t.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.location}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-brand-border">
                  <p className="text-xs text-brand-green font-medium group-hover:translate-x-1 transition-transform">
                    Ver detalles →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
