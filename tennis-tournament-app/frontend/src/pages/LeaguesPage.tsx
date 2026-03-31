import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listLeagues, createLeague, joinLeague } from '../services/leagueService';
import { useAuth } from '../context/AuthContext';
import type { League } from '../types';

export default function LeaguesPage() {
  const { isAuthenticated, user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try { setLeagues(await listLeagues()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try { await createLeague(newName.trim()); setNewName(''); await load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setCreating(false); }
  }

  async function handleJoin(id: string) {
    try { await joinLeague(id); await load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando ligas...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Ligas</h1>
      {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}

      {isAuthenticated && user?.role === 'ORGANIZER' && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Nombre de la liga"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {creating ? 'Creando...' : 'Crear liga'}
          </button>
        </form>
      )}

      {leagues.length === 0 ? (
        <p className="text-gray-500">No hay ligas disponibles.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((l) => {
            const isMember = l.members?.some((m) => m.userId === user?.id);
            return (
              <div key={l.id} className="bg-white rounded-lg shadow p-5">
                <h2 className="font-semibold text-gray-800 mb-1">
                  <Link to={`/leagues/${l.id}`} className="hover:text-green-700">{l.name}</Link>
                </h2>
                <p className="text-xs text-gray-400 mb-1">Creada por: {l.createdBy?.name}</p>
                <p className="text-sm text-gray-500">
                  {l._count?.members ?? 0} miembros · {l._count?.tournaments ?? 0} torneos
                </p>
                {isAuthenticated && !isMember && (
                  <button
                    onClick={() => handleJoin(l.id)}
                    className="mt-3 text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                  >
                    Unirse
                  </button>
                )}
                {isMember && (
                  <span className="mt-3 inline-block text-xs text-green-600">Ya eres miembro</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
