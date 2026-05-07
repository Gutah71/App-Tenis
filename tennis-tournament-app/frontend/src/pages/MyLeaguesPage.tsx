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
      await updateLeague(id, { name: editName.trim() });
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
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="section-title">Mis ligas</h1>
        <p className="section-subtitle">Organiza y gestiona tus ligas de tenis</p>
      </div>
      {error && <div className="card mb-6 text-red-500 text-sm">{error}</div>}

      {leagues.length === 0 ? (
        <div className="card text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
          </svg>
          <p className="text-gray-400 mb-6">No has creado ninguna liga todavía</p>
          <Link
            to="/leagues"
            className="btn-primary inline-flex items-center gap-2"
          >
            Crear primera liga
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leagues.map((l) => (
            <div key={l.id} className="card flex items-center justify-between gap-4">
              {editId === l.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 input-field"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(l.id)}
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(l.id)}
                    disabled={saving}
                    className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="text-gray-500 hover:text-gray-400 text-sm px-2 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/leagues/${l.id}`} className="font-semibold text-white hover:text-brand-green transition-colors">
                        {l.name}
                      </Link>
                      {l.isPrivate && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 border border-amber-500/50 text-amber-400">
                          Privada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {l._count?.members ?? 0} miembros · {l._count?.tournaments ?? 0} torneos
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/leagues/${l.id}`}
                      className="text-xs btn-primary"
                    >
                      Gestionar
                    </Link>
                    <button
                      onClick={() => startEdit(l)}
                      className="text-xs bg-brand-surface-2 border border-brand-border text-gray-400 hover:text-gray-300 px-3 py-1.5 rounded font-medium transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
