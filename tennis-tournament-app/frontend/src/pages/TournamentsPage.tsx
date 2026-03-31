import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { TournamentSummary } from '../types';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto',
  FULL: 'Completo',
  IN_PROGRESS: 'En curso',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700',
  FULL: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  FINISHED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ tournaments: TournamentSummary[] }>('/tournaments')
      .then(({ tournaments }) => setTournaments(tournaments))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="spinner" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-700 mb-6">Torneos</h1>

      {tournaments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="text-4xl">🏆</span>
          <p className="text-gray-500 mt-3">No hay torneos disponibles todavía.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">{t.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t.location}</p>
                </div>
                <div className="flex gap-1.5">
                  {!t.isPublic && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Privado</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </div>
              </div>

              {t.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{t.description}</p>
              )}

              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span>{new Date(t.date).toLocaleDateString('es-ES')}</span>
                <span>{t._count.registrations}/{t.maxParticipants} inscritos</span>
                <span>{t.modality}</span>
                {t.league && <span>{t.league.name}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
