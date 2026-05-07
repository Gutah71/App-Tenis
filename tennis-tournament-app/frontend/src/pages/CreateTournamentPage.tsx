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
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const status = 'OPEN';
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
        isPrivate,
        password: isPrivate ? password : undefined,
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
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isPrivate} onChange={(e) => { setIsPrivate(e.target.checked); if (!e.target.checked) setPassword(''); }}
                className="sr-only peer" />
              <div className="w-9 h-5 bg-brand-surface-3 border border-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green peer-checked:after:bg-white"></div>
            </label>
            <span className="text-sm text-gray-300">Torneo privado</span>
          </div>
          {isPrivate && (
            <div>
              <label className="label">Contraseña del torneo</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="Contraseña para unirse" />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando...' : 'Crear torneo'}
          </button>
        </form>
      </div>
    </div>
  );
}
