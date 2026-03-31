import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { LeagueSummary } from '../types';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ leagues: LeagueSummary[] }>('/leagues')
      .then(({ leagues }) => setLeagues(leagues))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="spinner" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-700 mb-6">Ligas</h1>

      {leagues.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="text-4xl">📊</span>
          <p className="text-gray-500 mt-3">No hay ligas disponibles todavía.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map((league) => (
            <Link
              key={league.id}
              to={`/leagues/${league.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">{league.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{league.location}</p>
                </div>
                {!league.isPublic && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Privada</span>
                )}
              </div>
              {league.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{league.description}</p>
              )}
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span>{league._count.members} miembros</span>
                <span>{league._count.tournaments} torneos</span>
                <span>Creada por {league.createdBy.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
