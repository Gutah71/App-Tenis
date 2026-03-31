import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ApiError } from '../context/AuthContext';
import { api } from '../lib/api';
import type { LeagueSummary } from '../types';

type Tab = 'league' | 'tournament';

export default function CreatePage() {
  const { token, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('league');

  if (!isOrganizer) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-gray-500">Solo los organizadores pueden crear ligas y torneos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Crear</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setTab('league')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === 'league'
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Liga
        </button>
        <button
          onClick={() => setTab('tournament')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === 'tournament'
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Torneo
        </button>
      </div>

      {tab === 'league' ? (
        <CreateLeagueForm token={token!} onCreated={(id) => navigate(`/leagues/${id}`)} />
      ) : (
        <CreateTournamentForm token={token!} onCreated={(id) => navigate(`/tournaments/${id}`)} />
      )}
    </div>
  );
}

/* ── Create League Form ─────────────────────────────────────────────────────── */

function CreateLeagueForm({ token, onCreated }: { token: string; onCreated: (id: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post<{ league: { id: string } }>(
        '/leagues',
        {
          name: name.trim(),
          description: description.trim() || undefined,
          location: location.trim(),
          isPublic,
        },
        token,
      );
      onCreated(res.league.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear la liga');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Liga de tenis local"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          minLength={2}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Madrid"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Descripción opcional..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="league-public"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="rounded text-green-600"
        />
        <label htmlFor="league-public" className="text-sm text-gray-700">Liga pública</label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
      >
        {saving ? 'Creando...' : 'Crear liga'}
      </button>
    </form>
  );
}

/* ── Create Tournament Form ─────────────────────────────────────────────────── */

function CreateTournamentForm({ token, onCreated }: { token: string; onCreated: (id: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [modality, setModality] = useState('SINGLES');
  const [prize, setPrize] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [myLeagues, setMyLeagues] = useState<LeagueSummary[]>([]);

  useEffect(() => {
    api.get<{ leagues: LeagueSummary[] }>('/leagues/mine', token).then((res) => setMyLeagues(res.leagues));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post<{ tournament: { id: string } }>(
        '/tournaments',
        {
          name: name.trim(),
          description: description.trim() || undefined,
          date,
          location: location.trim(),
          maxParticipants,
          modality,
          prize: prize.trim() || undefined,
          isPublic,
          password: !isPublic ? password : undefined,
          leagueId: leagueId || undefined,
        },
        token,
      );
      onCreated(res.tournament.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear el torneo');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Torneo de verano"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            minLength={2}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Club local"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Máx. participantes *</label>
          <select
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {[4, 8, 16, 32, 64].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="SINGLES">Singles</option>
            <option value="DOUBLES">Dobles</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Descripción opcional..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Premio</label>
        <input
          type="text"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Trofeo, medalla..."
        />
      </div>

      {myLeagues.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Liga (opcional)</label>
          <select
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Sin liga</option>
            {myLeagues.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="tournament-public"
          checked={isPublic}
          onChange={(e) => { setIsPublic(e.target.checked); if (e.target.checked) setPassword(''); }}
          className="rounded text-green-600"
        />
        <label htmlFor="tournament-public" className="text-sm text-gray-700">Torneo público</label>
      </div>

      {!isPublic && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña del torneo *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Contraseña para unirse"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
      >
        {saving ? 'Creando...' : 'Crear torneo'}
      </button>
    </form>
  );
}
