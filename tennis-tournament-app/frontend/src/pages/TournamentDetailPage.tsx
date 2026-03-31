import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { TournamentDetail, MatchData } from '../types';
import TournamentBracket from '../components/TournamentBracket';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto',
  FULL: 'Completo',
  IN_PROGRESS: 'En curso',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700',
  FULL: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  FINISHED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, isPlayer, isGuest, isOrganizer } = useAuth();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');
  const [password, setPassword] = useState('');
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPrize, setEditPrize] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const loadMatches = useCallback(() => {
    if (!id) return;
    api.get<{ matches: MatchData[] }>(`/tournaments/${id}/matches`)
      .then(({ matches }) => setMatches(matches))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get<{ tournament: TournamentDetail }>(`/tournaments/${id}`)
      .then(({ tournament }) => setTournament(tournament))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar el torneo'))
      .finally(() => setLoading(false));
    loadMatches();
  }, [id, loadMatches]);

  const isRegistered = tournament?.registrations.some((r) => r.user.id === user?.id) ?? false;
  const canJoin = tournament?.status === 'OPEN' && !isRegistered;
  const isOwner = isOrganizer && user?.id === tournament?.createdById;
  const canEdit = isOwner && tournament?.status !== 'IN_PROGRESS' && tournament?.status !== 'FINISHED';
  const canLeaveStatus = tournament?.status === 'OPEN' || tournament?.status === 'FULL';

  async function handleJoin() {
    if (isGuest) {
      navigate('/login');
      return;
    }
    if (!token || !id) return;

    setJoining(true);
    setJoinMsg('');
    try {
      const body = !tournament?.isPublic ? { password } : undefined;
      await api.post(`/tournaments/${id}/join`, body, token);
      const { tournament: updated } = await api.get<{ tournament: TournamentDetail }>(`/tournaments/${id}`);
      setTournament(updated);
      setJoinMsg('¡Te has inscrito en el torneo!');
      setPassword('');
    } catch (err) {
      setJoinMsg(err instanceof ApiError ? err.message : 'Error al inscribirte');
    } finally {
      setJoining(false);
    }
  }

  async function handleSaveEdit() {
    if (!token || !id) return;
    setSaving(true);
    try {
      await api.patch(`/tournaments/${id}`, {
        name: editName.trim(), description: editDesc.trim() || null,
        location: editLoc.trim(), date: editDate, prize: editPrize.trim() || null,
      }, token);
      const { tournament: updated } = await api.get<{ tournament: TournamentDetail }>(`/tournaments/${id}`);
      setTournament(updated);
      setEditing(false);
      setJoinMsg('Torneo actualizado');
    } catch (err) {
      setJoinMsg(err instanceof ApiError ? err.message : 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !id) return;
    try {
      await api.delete(`/tournaments/${id}`, token);
      navigate('/my-tournaments');
    } catch (err) {
      setJoinMsg(err instanceof ApiError ? err.message : 'Error al eliminar');
    }
  }

  async function handleLeave() {
    if (!token || !id) return;
    setLeaving(true);
    try {
      await api.post(`/tournaments/${id}/leave`, undefined, token);
      const { tournament: updated } = await api.get<{ tournament: TournamentDetail }>(`/tournaments/${id}`);
      setTournament(updated);
      setJoinMsg('Has abandonado el torneo');
    } catch (err) {
      setJoinMsg(err instanceof ApiError ? err.message : 'Error al abandonar');
    } finally {
      setLeaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;
  if (error) return <p className="text-red-500 py-8">{error}</p>;
  if (!tournament) return null;

  return (
    <div>
      <div className="mb-6">
        <Link to="/tournaments" className="text-sm text-green-700 hover:underline">← Volver a torneos</Link>
      </div>

      {/* Main info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{tournament.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{tournament.location}</p>
          </div>
          <div className="flex gap-1.5">
            {!tournament.isPublic && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Privado</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[tournament.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[tournament.status] ?? tournament.status}
            </span>
          </div>
        </div>

        {tournament.description && (
          <p className="text-gray-600 mt-3">{tournament.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-400">Fecha</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(tournament.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Modalidad</p>
            <p className="text-sm font-medium text-gray-700">{tournament.modality}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Inscritos</p>
            <p className="text-sm font-medium text-gray-700">
              {tournament.registrations.length} / {tournament.maxParticipants}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Organizador</p>
            <p className="text-sm font-medium text-gray-700">{tournament.createdBy.name}</p>
          </div>
          {tournament.prize && (
            <div>
              <p className="text-xs text-gray-400">Premio</p>
              <p className="text-sm font-medium text-gray-700">{tournament.prize}</p>
            </div>
          )}
          {tournament.league && (
            <div>
              <p className="text-xs text-gray-400">Liga</p>
              <Link to={`/leagues/${tournament.leagueId}`} className="text-sm font-medium text-green-700 hover:underline">
                {tournament.league.name}
              </Link>
            </div>
          )}
        </div>

        {/* Join section */}
        {(isPlayer || isGuest) && canJoin && (
          <div className="mt-5 border-t pt-4">
            {!tournament.isPublic && (isPlayer) && (
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">Contraseña del torneo</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Introduce la contraseña"
                />
              </div>
            )}
            <button
              onClick={handleJoin}
              disabled={joining}
              className="bg-green-700 text-white text-sm px-5 py-2 rounded-md hover:bg-green-800 disabled:opacity-50"
            >
              {joining ? 'Inscribiéndote...' : 'Inscribirme'}
            </button>
          </div>
        )}

        {isRegistered && (
          <p className="mt-4 text-sm text-green-600 font-medium">Ya estás inscrito en este torneo</p>
        )}

        {/* Leave button */}
        {isPlayer && isRegistered && canLeaveStatus && (
          <div className="mt-2">
            <button onClick={handleLeave} disabled={leaving} className="text-xs text-red-500 hover:text-red-700">
              {leaving ? 'Abandonando...' : 'Abandonar torneo'}
            </button>
          </div>
        )}

        {/* Organizer actions */}
        {canEdit && !editing && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3">
            <button
              onClick={() => {
                setEditName(tournament.name);
                setEditDesc(tournament.description ?? '');
                setEditLoc(tournament.location);
                setEditDate(tournament.date.split('T')[0]);
                setEditPrize(tournament.prize ?? '');
                setEditing(true);
              }}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              ✏️ Editar
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="text-sm text-red-500 hover:text-red-700">
                Eliminar torneo
              </button>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-xs text-red-600">¿Seguro?</span>
                <button onClick={handleDelete} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Sí</button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500">No</button>
              </span>
            )}
          </div>
        )}

        {editing && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Nombre" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="border rounded px-3 py-2 text-sm" />
              <input value={editLoc} onChange={(e) => setEditLoc(e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="Ubicación" />
            </div>
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full border rounded px-3 py-2 text-sm" placeholder="Descripción" />
            <input value={editPrize} onChange={(e) => setEditPrize(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Premio" />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} disabled={saving} className="text-sm bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditing(false)} className="text-sm text-gray-500">Cancelar</button>
            </div>
          </div>
        )}

        {joinMsg && (
          <p className={`mt-2 text-sm ${joinMsg.includes('Error') || joinMsg.includes('incorrecta') ? 'text-red-600' : 'text-green-600'}`}>
            {joinMsg}
          </p>
        )}
      </div>

      {/* Generate bracket button (organizer only, when FULL) */}
      {isOrganizer && user?.id === tournament.createdById && tournament.status === 'FULL' && matches.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-sm text-gray-600 mb-3">
            El torneo está completo. Puedes generar el cuadro de eliminación directa.
          </p>
          <button
            onClick={async () => {
              if (!token || !id) return;
              setGenerating(true);
              try {
                await api.post(`/tournaments/${id}/bracket`, undefined, token);
                const { tournament: updated } = await api.get<{ tournament: TournamentDetail }>(`/tournaments/${id}`);
                setTournament(updated);
                loadMatches();
              } catch (err) {
                setJoinMsg(err instanceof ApiError ? err.message : 'Error al generar el cuadro');
              } finally {
                setGenerating(false);
              }
            }}
            disabled={generating}
            className="bg-green-700 text-white text-sm px-5 py-2 rounded-md hover:bg-green-800 disabled:opacity-50"
          >
            {generating ? 'Generando cuadro...' : 'Generar cuadro'}
          </button>
        </div>
      )}

      {/* Bracket */}
      {matches.length > 0 && (
        <div className="mb-6">
          <TournamentBracket
            matches={matches}
            isOrganizer={isOrganizer && user?.id === tournament.createdById}
            token={token}
            onUpdate={() => {
              loadMatches();
              api.get<{ tournament: TournamentDetail }>(`/tournaments/${id}`)
                .then(({ tournament: updated }) => setTournament(updated));
            }}
          />
        </div>
      )}

      {/* Participants */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-3">
          Participantes ({tournament.registrations.length}/{tournament.maxParticipants})
        </h2>
        {tournament.registrations.length === 0 ? (
          <p className="text-sm text-gray-400">No hay inscritos todavía.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {tournament.registrations.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                  {r.user.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <span className="text-sm text-gray-700">{r.user.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(r.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
