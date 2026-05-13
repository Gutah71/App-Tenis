import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getLeague, joinLeague, leaveLeague, kickMember, updateLeague, deleteLeague,
  addAnnouncement, deleteAnnouncement, getLeagueStats,
} from '../services/leagueService';
import { useAuth } from '../context/AuthContext';
import type { League, PlayerStats, TournamentStatus } from '../types';

const T_STATUS: Record<TournamentStatus, string> = {
  OPEN: 'Abierto', FULL: 'Completo',
  IN_PROGRESS: 'En curso', FINISHED: 'Finalizado', CANCELLED: 'Cancelado',
};

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [league, setLeague] = useState<League | null>(null);
  const [stats, setStats] = useState<PlayerStats[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Announcement
  const [annContent, setAnnContent] = useState('');
  const [addingAnn, setAddingAnn] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  // Privacy settings (organizer only)
  const [editingPrivacy, setEditingPrivacy] = useState(false);
  const [privacyIsPrivate, setPrivacyIsPrivate] = useState(false);
  const [privacyPassword, setPrivacyPassword] = useState('');
  const [privacyError, setPrivacyError] = useState('');
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Active tab
  const [tab, setTab] = useState<'active' | 'past' | 'announcements' | 'members' | 'stats'>('active');

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const [l, s] = await Promise.all([getLeague(id), getLeagueStats(id)]);
      setLeague(l);
      setStats(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function run(fn: () => Promise<unknown>) {
    setActionError('');
    try { await fn(); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  async function handleSaveName() {
    if (!newName.trim() || !id) return;
    await run(() => updateLeague(id, { name: newName.trim() }));
    setEditingName(false);
  }

  async function handleDelete() {
    if (!id || !confirm('¿Eliminar esta liga? Todos los torneos y datos se perderán.')) return;
    try {
      await deleteLeague(id);
      navigate('/my-leagues');
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  async function handleLeave() {
    if (!id || !confirm('¿Seguro que quieres salir de esta liga?')) return;
    try {
      await leaveLeague(id);
      navigate('/leagues');
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Error al salir');
    }
  }

  async function handleKick(userId: string, name: string) {
    if (!id || !confirm(`¿Expulsar a ${name} de la liga?`)) return;
    await run(() => kickMember(id, userId));
  }

  async function handleAddAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!annContent.trim() || !id) return;
    setAddingAnn(true);
    try { await addAnnouncement(id, annContent.trim()); setAnnContent(''); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
    finally { setAddingAnn(false); }
  }

  async function handleJoin() {
    if (!league) return;
    setJoinError('');
    setJoining(true);
    try {
      await joinLeague(league.id, league.isPrivate ? joinPassword : undefined);
      setShowJoinPassword(false);
      setJoinPassword('');
      await load();
    } catch (e: unknown) {
      setJoinError(e instanceof Error ? e.message : 'Error');
    } finally {
      setJoining(false);
    }
  }

  function openPrivacyEditor() {
    if (!league) return;
    setPrivacyIsPrivate(!!league.isPrivate);
    setPrivacyPassword('');
    setPrivacyError('');
    setEditingPrivacy(true);
  }

  async function handleSavePrivacy() {
    if (!id) return;
    setPrivacyError('');
    setSavingPrivacy(true);
    try {
      await updateLeague(id, {
        isPrivate: privacyIsPrivate,
        password: privacyIsPrivate && privacyPassword ? privacyPassword : undefined,
      });
      setEditingPrivacy(false);
      setPrivacyPassword('');
      await load();
    } catch (e: unknown) {
      setPrivacyError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSavingPrivacy(false);
    }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando liga...</p>;
  if (error || !league) return <p className="text-center py-16 text-red-500">{error || 'Liga no encontrada'}</p>;

  const isCreator = isAuthenticated && user?.id === league.createdById;
  const isOrganizer = isAuthenticated && (
    user?.id === league.createdById ||
    league.members?.some(m => m.userId === user?.id && m.role === 'ADMIN')
  );
  const isMember = league.members?.some(m => m.userId === user?.id);
  const canJoin = isAuthenticated && user?.role === 'PLAYER';
  const members = league.members ?? [];

  const tournaments = league.tournaments ?? [];
  const activeTournaments = tournaments.filter(t =>
    t.status === 'OPEN' || t.status === 'FULL' || t.status === 'IN_PROGRESS'
  );
  const pastTournaments = tournaments.filter(t =>
    t.status === 'FINISHED' || t.status === 'CANCELLED'
  );
  const announcements = league.announcements ?? [];

  const TABS = [
    { key: 'active', label: `Torneos activos (${activeTournaments.length})` },
    { key: 'past', label: `Torneos pasados (${pastTournaments.length})` },
    { key: 'announcements', label: `Anuncios (${announcements.length})` },
    { key: 'members', label: `Miembros (${members.length})` },
    { key: 'stats', label: 'Top 10' },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 space-y-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-green transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-3">
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-field text-lg font-bold flex-1"
              />
              <button onClick={handleSaveName} className="btn-primary text-sm">Guardar</button>
              <button onClick={() => setEditingName(false)} className="btn-secondary text-sm">Cancelar</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{league.name}</h1>
              {league.isPrivate && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/10 border border-amber-500/50 text-amber-400">
                  Privada
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            {isOrganizer && !editingName && (
              <>
                <button
                  onClick={() => { setNewName(league.name); setEditingName(true); }}
                  className="text-xs bg-brand-surface-3 border border-brand-border text-gray-300 px-3 py-1.5 rounded hover:border-brand-green hover:text-brand-green transition-colors"
                >
                  Editar nombre
                </button>
                <button
                  onClick={openPrivacyEditor}
                  className="text-xs bg-brand-surface-3 border border-brand-border text-gray-300 px-3 py-1.5 rounded hover:border-brand-green hover:text-brand-green transition-colors"
                >
                  Privacidad
                </button>
                <Link
                  to={`/tournaments/new?leagueId=${league.id}`}
                  className="text-xs bg-brand-green/20 border border-brand-green/50 text-brand-green px-3 py-1.5 rounded hover:bg-brand-green/30 transition-colors font-medium"
                >
                  + Torneo
                </Link>
                <button onClick={handleDelete} className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors">
                  Eliminar liga
                </button>
              </>
            )}
            {canJoin && !isMember && !isOrganizer && (
              league.isPrivate && !showJoinPassword ? (
                <button onClick={() => { setShowJoinPassword(true); setJoinError(''); }}
                  className="btn-primary text-sm">
                  Unirse a la liga
                </button>
              ) : !league.isPrivate ? (
                <button onClick={() => run(() => joinLeague(league.id))}
                  className="btn-primary text-sm">
                  Unirse a la liga
                </button>
              ) : null
            )}
            {isMember && !isCreator && (
              <button onClick={handleLeave}
                className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors">
                Salir de la liga
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-3">
          Creada por <strong className="text-gray-300">{league.createdBy?.name}</strong>
          <span className="mx-2 text-brand-border">·</span>
          <span className="text-gray-400">{league._count?.members ?? league.members?.length ?? 0} miembros</span>
        </p>
        {actionError && <p className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{actionError}</p>}
        {showJoinPassword && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="password"
                autoFocus
                value={joinPassword}
                onChange={(e) => { setJoinPassword(e.target.value); if (joinError) setJoinError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && joinPassword) void handleJoin(); }}
                placeholder="Contraseña de la liga"
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={handleJoin}
                disabled={joining || !joinPassword}
                className="btn-primary text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? 'Comprobando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => { setShowJoinPassword(false); setJoinPassword(''); setJoinError(''); }}
                className="text-sm text-gray-400 hover:text-white transition-colors px-2"
              >
                Cancelar
              </button>
            </div>
            {joinError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
                {joinError}
              </p>
            )}
          </div>
        )}
        {isOrganizer && editingPrivacy && (
          <div className="mt-4 p-4 border border-brand-border rounded-lg bg-brand-surface-2 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Configuración de privacidad</p>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={privacyIsPrivate}
                  onChange={(e) => { setPrivacyIsPrivate(e.target.checked); if (!e.target.checked) setPrivacyPassword(''); }}
                  className="sr-only peer" />
                <div className="w-9 h-5 bg-brand-surface-3 border border-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green peer-checked:after:bg-white"></div>
              </label>
              <span className="text-sm text-gray-300">Liga privada</span>
            </div>
            {privacyIsPrivate && (
              <div>
                <label className="label">
                  {league.isPrivate ? 'Nueva contraseña (opcional, deja en blanco para mantener)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  value={privacyPassword}
                  onChange={(e) => setPrivacyPassword(e.target.value)}
                  className="input-field text-sm"
                  placeholder={league.isPrivate ? 'Mínimo 4 caracteres' : 'Contraseña de la liga'}
                />
              </div>
            )}
            {!privacyIsPrivate && league.isPrivate && (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1">
                Al hacer la liga pública se eliminará la contraseña y cualquiera podrá unirse.
              </p>
            )}
            {privacyError && <p className="text-xs text-red-400">{privacyError}</p>}
            <div className="flex gap-2">
              <button onClick={handleSavePrivacy} disabled={savingPrivacy}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {savingPrivacy ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => { setEditingPrivacy(false); setPrivacyError(''); }}
                className="text-sm text-gray-400 hover:text-white transition-colors px-2">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      {league.restricted ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 mx-auto mb-4 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-300 font-medium mb-1">Esta liga es privada</p>
          <p className="text-sm text-gray-500">Únete a la liga con la contraseña para ver miembros, torneos y anuncios.</p>
        </div>
      ) : (
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-brand-border overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Active tournaments */}
          {tab === 'active' && (
            activeTournaments.length === 0
              ? <p className="text-gray-500 text-sm">No hay torneos activos.</p>
              : <div className="space-y-3">
                  {activeTournaments.map(t => (
                    <Link key={t.id} to={`/tournaments/${t.id}`}
                      className="flex items-center justify-between p-3 border border-brand-border rounded-lg hover:border-brand-green/50 hover:bg-brand-surface-2 transition-colors">
                      <div>
                        <p className="font-medium text-white">{t.name}</p>
                        {(t.startDate || t.location) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {t.location && `${t.location} · `}
                            {fmtDate(t.startDate)}{t.endDate && ` — ${fmtDate(t.endDate)}`}
                          </p>
                        )}
                      </div>
                      <span className="text-xs bg-brand-green/10 text-brand-green border border-brand-green/30 px-2.5 py-1 rounded-full font-medium shrink-0 ml-3">
                        {T_STATUS[t.status]}
                      </span>
                    </Link>
                  ))}
                </div>
          )}

          {/* Past tournaments */}
          {tab === 'past' && (
            pastTournaments.length === 0
              ? <p className="text-gray-500 text-sm">No hay torneos pasados.</p>
              : <div className="space-y-3">
                  {pastTournaments.map(t => (
                    <Link key={t.id} to={`/tournaments/${t.id}`}
                      className="flex items-center justify-between p-3 border border-brand-border rounded-lg hover:border-brand-green/50 hover:bg-brand-surface-2 transition-colors">
                      <div>
                        <p className="font-medium text-white">{t.name}</p>
                        {t.location && <p className="text-xs text-gray-400 mt-0.5">{t.location}</p>}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ml-3 border ${
                        t.status === 'FINISHED'
                          ? 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {T_STATUS[t.status]}
                      </span>
                    </Link>
                  ))}
                </div>
          )}

          {/* Announcements */}
          {tab === 'announcements' && (
            <div className="space-y-4">
              {isOrganizer && (
                <form onSubmit={handleAddAnnouncement} className="flex gap-2">
                  <input
                    type="text"
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Escribe un anuncio..."
                    className="input-field flex-1"
                  />
                  <button type="submit" disabled={addingAnn || !annContent.trim()}
                    className="btn-primary text-sm disabled:opacity-50 shrink-0">
                    {addingAnn ? '...' : 'Publicar'}
                  </button>
                </form>
              )}
              {announcements.length === 0
                ? <p className="text-gray-500 text-sm">No hay anuncios.</p>
                : announcements.map(a => (
                  <div key={a.id} className="border border-brand-border rounded-lg p-4 bg-brand-surface-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-200">{a.content}</p>
                      {isOrganizer && (
                        <button
                          onClick={() => run(() => deleteAnnouncement(league.id, a.id))}
                          className="text-xs text-red-400 hover:text-red-300 shrink-0 transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {a.createdBy.name} · {new Date(a.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))
              }
            </div>
          )}

          {/* Members */}
          {tab === 'members' && (
            members.length === 0
              ? <p className="text-gray-500 text-sm">No hay miembros.</p>
              : <ul className="space-y-2">
                  {members.map(m => {
                    const isMemberCreator = m.userId === league.createdById;
                    return (
                      <li key={m.userId}
                        className="flex items-center justify-between p-3 border border-brand-border rounded-lg bg-brand-surface-2 hover:border-brand-green/50 hover:bg-brand-surface-3 transition-colors">
                        <div>
                          <p className="font-medium text-white">
                            <Link to={`/players/${m.userId}`} className="hover:text-brand-green transition-colors">{m.user?.name ?? 'Jugador'}</Link>
                            {isMemberCreator && (
                              <span className="ml-2 text-xs bg-brand-green/20 text-brand-green border border-brand-green/30 px-2 py-0.5 rounded-full">Creador</span>
                            )}
                          </p>
                          {m.user?.email && (
                            <p className="text-xs text-gray-500 mt-0.5">{m.user.email}</p>
                          )}
                        </div>
                        {isCreator && !isMemberCreator && (
                          <button
                            onClick={() => handleKick(m.userId, m.user?.name ?? 'este miembro')}
                            className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors shrink-0">
                            Expulsar
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
          )}

          {/* Stats */}
          {tab === 'stats' && (
            !stats || stats.filter(s => s.userId !== league?.createdById).length === 0
              ? <p className="text-gray-500 text-sm">Aún no hay estadísticas.</p>
              : <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase border-b border-brand-border">
                        <th className="py-2 pr-4">#</th>
                        <th className="py-2 pr-4">Jugador</th>
                        <th className="py-2 pr-4 text-center">Torneos J/G</th>
                        <th className="py-2 pr-4 text-center">Partidos J/G/P</th>
                        <th className="py-2 text-center">Sets G</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.filter(s => s.userId !== league?.createdById).map((s, i) => (
                        <tr key={s.userId} className={`border-b border-brand-border/50 transition-colors hover:bg-brand-surface-3 ${i % 2 === 0 ? 'bg-brand-green/5' : ''}`}>
                          <td className="py-2.5 pr-4 font-bold text-gray-500">{i + 1}</td>
                          <td className="py-2.5 pr-4 font-semibold text-white"><Link to={`/players/${s.userId}`} className="hover:text-brand-green transition-colors">{s.name}</Link></td>
                          <td className="py-2.5 pr-4 text-center text-gray-400">
                            {s.tournamentsPlayed}/{s.tournamentsWon}
                          </td>
                          <td className="py-2.5 pr-4 text-center text-gray-400">
                            {s.matchesPlayed}/{s.matchesWon}/{s.matchesLost}
                          </td>
                          <td className="py-2.5 text-center text-brand-green font-semibold">
                            {s.setsWon}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
