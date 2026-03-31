import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { MyLeague, MyTournament } from '../types';

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

export default function MySpacePage() {
  const { token } = useAuth();
  const [leagues, setLeagues] = useState<MyLeague[]>([]);
  const [tournaments, setTournaments] = useState<MyTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api.get<{ leagues: MyLeague[] }>('/users/my-leagues', token),
      api.get<{ tournaments: MyTournament[] }>('/users/my-tournaments', token),
    ])
      .then(([leaguesRes, tournamentsRes]) => {
        setLeagues(leaguesRes.leagues);
        setTournaments(tournamentsRes.tournaments);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="spinner" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      {/* Mis ligas */}
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4">Mis ligas</h2>
        {leagues.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No estás inscrito en ninguna liga.{' '}
            <Link to="/leagues" className="text-green-600 hover:underline">Explorar ligas</Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {leagues.map((league) => (
              <Link
                key={league.id}
                to={`/leagues/${league.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-800">{league.name}</h3>
                  {!league.isPublic && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Privada</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">📍 {league.location}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>👥 {league._count.members} miembros</span>
                  <span>🏆 {league._count.tournaments} torneos</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Unido el {new Date(league.joinedAt).toLocaleDateString('es-ES')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Mis torneos */}
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4">Mis torneos</h2>
        {tournaments.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No estás inscrito en ningún torneo.{' '}
            <Link to="/tournaments" className="text-green-600 hover:underline">Explorar torneos</Link>
          </p>
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
                {t.league && (
                  <p className="text-xs text-green-600 mt-2">Liga: {t.league.name}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Inscrito el {new Date(t.registeredAt).toLocaleDateString('es-ES')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
