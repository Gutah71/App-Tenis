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
    <div className="w-full max-w-md mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="section-title">Crear torneo{leagueId ? ' en liga' : ''}</h1>
        <p className="section-subtitle">Configura los detalles del nuevo torneo</p>
      </div>
      <div className="card">
        {error && <p className="mb-5 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nombre del torneo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="input-field" placeholder="Ej: Torneo de verano 2026" />
          </div>
          <div>
            <label className="label">Ubicación</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Club de tenis, ciudad..."
              className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha inicio</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="input-field" />
            </div>
            <div>
              <label className="label">Fecha fin</label>
              <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)}
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Máximo de jugadores</label>
            <select value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="input-field">
              {PLAYER_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} jugadores</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Estado inicial</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'OPEN')}
              className="input-field">
              <option value="OPEN">Abierto (inscripciones habilitadas)</option>
              <option value="DRAFT">Borrador (sin inscripciones)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando...' : 'Crear torneo'}
          </button>
        </form>
      </div>
    </div>
  );
}
