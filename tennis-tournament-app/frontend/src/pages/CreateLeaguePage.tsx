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
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear liga</h1>
      {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la liga</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ej: Liga de verano 2026"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear liga'}
        </button>
      </form>
    </div>
  );
}
