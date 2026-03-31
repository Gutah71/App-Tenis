import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { LeagueDetail } from '../types';

export default function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, isPlayer, isGuest, isOrganizer } = useAuth();
  const navigate = useNavigate();

  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<{ league: LeagueDetail }>(`/leagues/${id}`)
      .then(({ league }) => setLeague(league))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error al cargar la liga'))
      .finally(() => setLoading(false));
  }, [id]);

  const isMember = league?.members.some((m) => m.user.id === user?.id) ?? false;
  const isOwner = isOrganizer && user?.id === league?.createdById;

  async function handleJoin() {
    if (isGuest) {
      navigate('/login');
      return;
    }
    if (!token || !id) return;

    setJoining(true);
    setJoinMsg('');
    try {
      await api.post(`/leagues/${id}/join`, undefined, token);
      const { league: updated } = await api.get<{ league: LeagueDetail }>(`/leagues/${id}`);
      setLeague(updated);
      setJoinMsg('¡Te has unido a la liga!');
    } catch (err) {
      setJoinMsg(err instanceof ApiError ? err.message : 'Error al unirte');
    } finally {
      setJoining(false);
    }
  }

  async function handleSaveEdit() {
    if (!token || !id) return;
    setSaving(true);
    try {
      await api.patch(`/leagues/${id}`, { name: editName.trim(), description: editDesc.trim() || null, location: editLoc.trim() }, token);
      const { league: updated } = await api.get<{ league: LeagueDetail }>(`/leagues/${id}`);
      setLeague(updated);
      setEditing(false);
      setJoinMsg('Liga actualizada');
    } catch (err) {
      setJoinMsg(err instanceof ApiError ? err.message : 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !id) return;
    try {
      await api.delete(`/leagues/${id}`, token);
      navigate('/my-leagues');
    } catch (err) {
      setJoinMsg(err instanceof ApiError ? err.message : 'Error al eliminar');
    }
  }

  async function handleLeave() {
    if (!token || !id) return;
    setLeaving(true);
    try {
      await api.post(`/leagues/${id}/leave`, undefined, token);
      const { league: updated } = await api.get<{ league: LeagueDetail }>(`/leagues/${id}`);
      setLeague(updated);
      setJoinMsg('Has abandonado la liga');
    } catch (err) {
      setJoinMsg(err instanceof ApiError ? err.message : 'Error al abandonar');
    } finally {
      setLeaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;
  if (error) return <p className="text-red-500 py-8">{error}</p>;
  if (!league) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/leagues" className="text-sm text-green-700 hover:underline">← Volver a ligas</Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{league.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{league.location}</p>
          </div>
          {!league.isPublic && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Privada</span>
          )}
        </div>

        {league.description && (
          <p className="text-gray-600 mt-3">{league.description}</p>
        )}

        <div className="flex gap-4 mt-4 text-sm text-gray-400">
          <span>{league.members.length} miembros</span>
          <span>{league.tournaments.length} torneos</span>
          <span>Creada por {league.createdBy.name}</span>
        </div>

        {/* Join button */}
        {isPlayer && !isMember && (
          <div className="mt-4">
            <button
              onClick={handleJoin}
              disabled={joining}
              className="bg-green-700 text-white text-sm px-5 py-2 rounded-md hover:bg-green-800 disabled:opacity-50"
            >
              {joining ? 'Uniéndote...' : 'Unirme a esta liga'}
            </button>
          </div>
        )}

        {isGuest && (
          <div className="mt-4">
            <button
              onClick={handleJoin}
              className="bg-green-700 text-white text-sm px-5 py-2 rounded-md hover:bg-green-800"
            >
              Unirme a esta liga
            </button>
          </div>
        )}

        {isMember && (
          <p className="mt-4 text-sm text-green-600 font-medium">Ya eres miembro de esta liga</p>
        )}

        {/* Leave button for members */}
        {isPlayer && isMember && (
          <div className="mt-2">
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="text-xs text-red-500 hover:text-red-700"
            >
              {leaving ? 'Abandonando...' : 'Abandonar liga'}
            </button>
          </div>
        )}

        {/* Organizer actions */}
        {isOwner && !editing && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3">
            <button
              onClick={() => { setEditName(league.name); setEditDesc(league.description ?? ''); setEditLoc(league.location); setEditing(true); }}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              ✏️ Editar
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="text-sm text-red-500 hover:text-red-700">
                Eliminar liga
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
            <input value={editLoc} onChange={(e) => setEditLoc(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Ubicación" />
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full border rounded px-3 py-2 text-sm" placeholder="Descripción" />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} disabled={saving} className="text-sm bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditing(false)} className="text-sm text-gray-500">Cancelar</button>
            </div>
          </div>
        )}

        {joinMsg && (
          <p className={`mt-2 text-sm ${joinMsg.includes('Error') || joinMsg.includes('Ya') ? 'text-red-600' : 'text-green-600'}`}>
            {joinMsg}
          </p>
        )}
      </div>

      {/* Members */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Miembros ({league.members.length})</h2>
        {league.members.length === 0 ? (
          <p className="text-sm text-gray-400">No hay miembros todavía.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {league.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                  {m.user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm text-gray-700">{m.user.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tournaments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-3">Torneos ({league.tournaments.length})</h2>
        {league.tournaments.length === 0 ? (
          <p className="text-sm text-gray-400">No hay torneos en esta liga.</p>
        ) : (
          <div className="space-y-2">
            {league.tournaments.map((t) => (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="flex items-center justify-between p-3 rounded hover:bg-gray-50 border border-gray-100"
              >
                <div>
                  <span className="text-sm font-medium text-gray-800">{t.name}</span>
                  <span className="text-xs text-gray-400 ml-3">
                    {new Date(t.date).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
