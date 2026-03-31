import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { LeagueSummary } from '../types';

export default function MyLeaguesPage() {
  const { token, isOrganizer } = useAuth();
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get<{ leagues: LeagueSummary[] }>('/leagues/mine', token)
      .then((res) => setLeagues(res.leagues))
      .finally(() => setLoading(false));
  }, [token]);

  if (!isOrganizer) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-gray-500">Solo los organizadores pueden ver sus ligas creadas.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-16"><div className="spinner" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">Mis ligas creadas</h1>
        <Link
          to="/create"
          className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Crear liga
        </Link>
      </div>

      {leagues.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Aún no has creado ninguna liga.</p>
          <Link to="/create" className="text-green-600 hover:underline text-sm">
            Crear tu primera liga
          </Link>
        </div>
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
              {league.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{league.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">📍 {league.location}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>👥 {league._count.members} miembros</span>
                <span>🏆 {league._count.tournaments} torneos</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Creada el {new Date(league.createdAt).toLocaleDateString('es-ES')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
