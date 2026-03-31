import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { TournamentSummary } from '../types';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto',
  FULL: 'Completo',
  IN_PROGRESS: 'En curso',
  FINISHED: 'Finalizado',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700',
  FULL: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  FINISHED: 'bg-gray-100 text-gray-600',
};

export default function MyTournamentsPage() {
  const { token, isOrganizer } = useAuth();
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get<{ tournaments: TournamentSummary[] }>('/tournaments/mine', token)
      .then((res) => setTournaments(res.tournaments))
      .finally(() => setLoading(false));
  }, [token]);

  if (!isOrganizer) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-gray-500">Solo los organizadores pueden ver sus torneos creados.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-16"><div className="spinner" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">Mis torneos creados</h1>
        <Link
          to="/create"
          className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Crear torneo
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Aún no has creado ningún torneo.</p>
          <Link to="/create" className="text-green-600 hover:underline text-sm">
            Crear tu primer torneo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition p-4"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-800">{t.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[t.status] ?? t.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">📍 {t.location}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>📅 {new Date(t.date).toLocaleDateString('es-ES')}</span>
                <span>👥 {t._count.registrations}/{t.maxParticipants}</span>
                <span>{t.modality === 'SINGLES' ? '🎾 Singles' : '🎾 Dobles'}</span>
              </div>
              {!t.isPublic && (
                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🔒 Privado</span>
              )}
              {t.league && (
                <p className="text-xs text-green-600 mt-2">Liga: {t.league.name}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Creado el {new Date(t.createdAt).toLocaleDateString('es-ES')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
