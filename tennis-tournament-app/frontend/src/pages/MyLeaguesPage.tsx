import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listLeagues, updateLeague } from '../services/leagueService';
import type { League } from '../types';

export default function MyLeaguesPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const all = await listLeagues();
      setLeagues(all.filter((l) => l.createdById === user?.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [user]);

  function startEdit(league: League) {
    setEditId(league.id);
    setEditName(league.name);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateLeague(id, editName.trim());
      setEditId(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis ligas</h1>
      {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}

      {leagues.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="mb-4">No has creado ninguna liga todavía.</p>
          <a
            href="/leagues/new"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Crear primera liga
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {leagues.map((l) => (
            <div key={l.id} className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
              {editId === l.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(l.id)}
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(l.id)}
                    disabled={saving}
                    className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? '...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="text-gray-400 hover:text-gray-600 text-sm px-2"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <Link to={`/leagues/${l.id}`} className="font-semibold text-gray-800 hover:text-green-700">
                      {l.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {l._count?.members ?? 0} miembros · {l._count?.tournaments ?? 0} torneos
                    </p>
                  </div>
                  <Link
                    to={`/leagues/${l.id}`}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
                  >
                    Gestionar
                  </Link>
                  <button
                    onClick={() => startEdit(l)}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200"
                  >
                    ✏️ Editar nombre
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
