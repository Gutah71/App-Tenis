import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLeague } from '../services/leagueService';
import { useAuth } from '../context/AuthContext';

export default function CreateLeaguePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'ORGANIZER') {
    return <p className="text-center py-16 text-gray-500">Solo los organizadores pueden crear ligas.</p>;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createLeague(name.trim(), isPrivate, isPrivate ? password : undefined);
      navigate('/my-leagues');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la liga');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="section-title">Crear liga</h1>
        <p className="section-subtitle">Crea una nueva liga para organizar tus torneos</p>
      </div>
      <div className="card">
        {error && <p className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nombre de la liga</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Ej: Liga de verano 2026"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isPrivate} onChange={(e) => { setIsPrivate(e.target.checked); if (!e.target.checked) setPassword(''); }}
                className="sr-only peer" />
              <div className="w-9 h-5 bg-brand-surface-3 border border-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green peer-checked:after:bg-white"></div>
            </label>
            <span className="text-sm text-gray-300">Liga privada</span>
          </div>
          {isPrivate && (
            <div>
              <label className="label">Contraseña de la liga</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="Contraseña para unirse" />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creando...' : 'Crear liga'}
          </button>
        </form>
      </div>
    </div>
  );
}
