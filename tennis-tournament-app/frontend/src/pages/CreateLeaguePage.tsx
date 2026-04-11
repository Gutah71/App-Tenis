import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLeague } from '../services/leagueService';
import { useAuth } from '../context/AuthContext';

export default function CreateLeaguePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await createLeague(name.trim());
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
