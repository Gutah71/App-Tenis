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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-green-100 text-green-700',
  FULL: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  FINISHED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-600',
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
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Torneos</h1>
      {tournaments.length === 0 ? (
        <p className="text-gray-500">No hay torneos disponibles.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold text-gray-800">{t.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status] ?? ''}`}>
                  {STATUS_LABELS[t.status] ?? t.status}
                </span>
              </div>
              {t.league && <p className="text-xs text-gray-400 mb-1">Liga: {t.league.name}</p>}
              <p className="text-sm text-gray-500">
                {t._count?.registrations ?? 0} / {t.maxPlayers} jugadores
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
