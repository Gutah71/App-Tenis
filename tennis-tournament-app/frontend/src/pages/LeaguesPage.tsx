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
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

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
    try { await createLeague(newName.trim()); setNewName(''); setNewDescription(''); setFormOpen(false); await load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setCreating(false); }
  }

  async function handleJoin(id: string) {
    try { await joinLeague(id); await load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando ligas...</p>;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="section-title">Todas las Ligas</h1>
          <p className="section-subtitle">Únete a una liga y compite con otros jugadores</p>
        </div>
        {isAuthenticated && user?.role === 'ORGANIZER' && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="btn-primary whitespace-nowrap"
          >
            Crear Liga
          </button>
        )}
      </div>

      {error && <div className="card mb-6 text-red-500 text-sm">{error}</div>}

      {formOpen && (
        <div className="card mb-8">
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="label">Nombre de la Liga</label>
              <input
                type="text"
                placeholder="Ej: Liga Profesional de Tenis"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Descripción (opcional)</label>
              <textarea
                placeholder="Describe la finalidad de la liga..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="input-field resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creando...' : 'Crear Liga'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setNewName('');
                  setNewDescription('');
                }}
                className="px-4 py-2 rounded-lg border border-brand-border text-gray-400 hover:text-white hover:border-brand-border-light transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {leagues.length === 0 ? (
        <div className="card text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
          </svg>
          <p className="text-gray-400">No hay ligas disponibles</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((l) => {
            const isMember = l.members?.some((m) => m.userId === user?.id);
            return (
              <div
                key={l.id}
                className="card hover:border-brand-green/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col group"
              >
                <Link
                  to={`/leagues/${l.id}`}
                  className="flex-1"
                >
                  <h2 className="font-bold text-white text-base group-hover:text-brand-green transition-colors mb-2 hover:cursor-pointer">{l.name}</h2>
                </Link>

                {l.createdBy && (
                  <p className="text-xs text-gray-500 mb-3">Creada por: <span className="text-gray-400">{l.createdBy.name}</span></p>
                )}

                <div className="space-y-3 py-4 border-t border-brand-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3.75A2.75 2.75 0 011 18.25V5.75A2.75 2.75 0 013.75 3h16.5A2.75 2.75 0 0123 5.75v12.5A2.75 2.75 0 0120.25 21h-5" />
                      </svg>
                      Miembros
                    </span>
                    <span className="text-white font-semibold">{l._count?.members ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Torneos
                    </span>
                    <span className="text-white font-semibold">{l._count?.tournaments ?? 0}</span>
                  </div>
                </div>

                {isAuthenticated && !isMember && (
                  <button
                    onClick={() => handleJoin(l.id)}
                    className="mt-4 w-full px-4 py-2 bg-brand-green/10 border border-brand-green/50 text-brand-green hover:bg-brand-green/20 rounded-lg font-medium transition-colors text-sm"
                  >
                    Unirse a la liga
                  </button>
                )}
                {isMember && (
                  <div className="mt-4 w-full px-4 py-2 bg-brand-green/10 border border-brand-green/50 text-brand-green rounded-lg text-center font-medium text-sm">
                    Eres miembro
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
