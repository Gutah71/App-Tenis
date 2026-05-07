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
  const [joinPasswordId, setJoinPasswordId] = useState<string | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [search, setSearch] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');

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
    try { await createLeague(newName.trim(), newIsPrivate, newIsPrivate ? newPassword : undefined); setNewName(''); setNewDescription(''); setNewIsPrivate(false); setNewPassword(''); setFormOpen(false); await load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setCreating(false); }
  }

  async function handleJoin(id: string, password?: string) {
    setJoinError('');
    setJoining(true);
    try {
      await joinLeague(id, password);
      setJoinPasswordId(null);
      setJoinPassword('');
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error';
      // If we are in the password prompt flow, show error inline; otherwise top-level.
      if (joinPasswordId === id) setJoinError(msg);
      else setError(msg);
    } finally {
      setJoining(false);
    }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando ligas...</p>;

  const filteredLeagues = leagues.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (privacyFilter === 'PUBLIC' && l.isPrivate) return false;
    if (privacyFilter === 'PRIVATE' && !l.isPrivate) return false;
    return true;
  });
  const hasActiveFilters = search || privacyFilter !== 'ALL';

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
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={newIsPrivate} onChange={(e) => { setNewIsPrivate(e.target.checked); if (!e.target.checked) setNewPassword(''); }}
                  className="sr-only peer" />
                <div className="w-9 h-5 bg-brand-surface-3 border border-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green peer-checked:after:bg-white"></div>
              </label>
              <span className="text-sm text-gray-300">Liga privada</span>
            </div>
            {newIsPrivate && (
              <div>
                <label className="label">Contraseña</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field" placeholder="Contraseña para unirse" />
              </div>
            )}
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
                  setNewIsPrivate(false);
                  setNewPassword('');
                }}
                className="px-4 py-2 rounded-lg border border-brand-border text-gray-400 hover:text-white hover:border-brand-border-light transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {leagues.length > 0 && (
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="input-field text-sm pl-9 w-full"
              />
            </div>
            <select
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value as 'ALL' | 'PUBLIC' | 'PRIVATE')}
              className="input-field text-sm md:w-44"
            >
              <option value="ALL">Todas</option>
              <option value="PUBLIC">Públicas</option>
              <option value="PRIVATE">Privadas</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setPrivacyFilter('ALL'); }}
                className="text-sm text-gray-400 hover:text-white px-3 transition-colors whitespace-nowrap"
              >
                Limpiar
              </button>
            )}
          </div>
          {hasActiveFilters && (
            <p className="text-xs text-gray-500 mt-3">
              Mostrando {filteredLeagues.length} de {leagues.length} ligas
            </p>
          )}
        </div>
      )}

      {leagues.length === 0 ? (
        <div className="card text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
          </svg>
          <p className="text-gray-400">No hay ligas disponibles</p>
        </div>
      ) : filteredLeagues.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-400">No hay ligas que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLeagues.map((l) => {
            const isMember = !!l.viewerIsMember || l.members?.some((m) => m.userId === user?.id);
            return (
              <div
                key={l.id}
                className="card hover:border-brand-green/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col group"
              >
                <Link
                  to={`/leagues/${l.id}`}
                  className="flex-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-bold text-white text-base group-hover:text-brand-green transition-colors hover:cursor-pointer">{l.name}</h2>
                    {l.isPrivate && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 border border-amber-500/50 text-amber-400">
                        Privada
                      </span>
                    )}
                  </div>
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

                {isAuthenticated && user?.role === 'PLAYER' && !isMember && (
                  <>
                    {l.isPrivate && joinPasswordId === l.id ? (
                      <div className="mt-4 space-y-2">
                        <input
                          type="password"
                          autoFocus
                          value={joinPassword}
                          onChange={(e) => { setJoinPassword(e.target.value); if (joinError) setJoinError(''); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' && joinPassword) void handleJoin(l.id, joinPassword); }}
                          placeholder="Contraseña de la liga"
                          className="input-field text-sm"
                        />
                        {joinError && (
                          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
                            {joinError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleJoin(l.id, joinPassword)}
                            disabled={joining || !joinPassword}
                            className="flex-1 px-3 py-1.5 bg-brand-green/10 border border-brand-green/50 text-brand-green hover:bg-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-sm"
                          >
                            {joining ? 'Comprobando...' : 'Confirmar'}
                          </button>
                          <button
                            onClick={() => { setJoinPasswordId(null); setJoinPassword(''); setJoinError(''); }}
                            className="px-3 py-1.5 border border-brand-border text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => l.isPrivate ? (setJoinPasswordId(l.id), setJoinError('')) : handleJoin(l.id)}
                        className="mt-4 w-full px-4 py-2 bg-brand-green/10 border border-brand-green/50 text-brand-green hover:bg-brand-green/20 rounded-lg font-medium transition-colors text-sm"
                      >
                        Unirse a la liga
                      </button>
                    )}
                  </>
                )}
                {isMember && (
                  <Link
                    to={`/leagues/${l.id}`}
                    className="mt-4 w-full block px-4 py-2 bg-brand-green/10 border border-brand-green/50 text-brand-green rounded-lg text-center font-medium text-sm hover:bg-brand-green/20 transition-colors"
                  >
                    Ver liga
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
