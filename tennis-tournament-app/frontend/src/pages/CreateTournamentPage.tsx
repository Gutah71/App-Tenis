import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createTournament } from '../services/tournamentService';
import { useAuth } from '../context/AuthContext';

const PLAYER_OPTIONS = [2, 4, 8, 16, 32];

export default function CreateTournamentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leagueId = searchParams.get('leagueId') ?? undefined;

  const [name, setName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'OPEN'>('OPEN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'ORGANIZER') {
    return <p className="text-center py-16 text-gray-500">Solo los organizadores pueden crear torneos.</p>;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (startDate && endDate && endDate < startDate) {
      setError('La fecha de fin debe ser posterior o igual a la de inicio');
      return;
    }
    setLoading(true);
    try {
      const t = await createTournament({
        name,
        maxPlayers,
        location: location || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        leagueId,
        status,
      });
      navigate(`/tournaments/${t.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear torneo{leagueId ? ' en liga' : ''}</h1>
      {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del torneo</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="Club de tenis, ciudad..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de jugadores</label>
          <select value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
            {PLAYER_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} jugadores</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado inicial</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'OPEN')}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="OPEN">Abierto (inscripciones habilitadas)</option>
            <option value="DRAFT">Borrador (sin inscripciones)</option>
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Creando...' : 'Crear torneo'}
        </button>
      </form>
    </div>
  );
}
