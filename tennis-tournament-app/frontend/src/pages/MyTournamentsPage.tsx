import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTournaments, deleteTournament } from '../services/tournamentService';
import { useAuth } from '../context/AuthContext';
import type { Tournament } from '../types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador', OPEN: 'Abierto', FULL: 'Completo',
  IN_PROGRESS: 'En curso', FINISHED: 'Finalizado', CANCELLED: 'Cancelado',
};

export default function MyTournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const all = await listTournaments();
      const filtered = user?.role === 'ORGANIZER'
        ? all.filter((t) => t.createdById === user.id)
        : all.filter((t) => t.registrations?.some((r) => r.userId === user?.id));
      setTournaments(filtered);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [user]);

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este torneo? Esta acción no se puede deshacer.')) return;
    try { await deleteTournament(id); await load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error al eliminar'); }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando...</p>;
  if (error) return <p className="text-center py-16 text-red-500">{error}</p>;

  const label = user?.role === 'ORGANIZER' ? 'Mis torneos organizados' : 'Mis torneos';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{label}</h1>
      {tournaments.length === 0 ? (
        <p className="text-gray-500">No tienes torneos aún.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <div key={t.id} className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
              <Link to={`/tournaments/${t.id}`} className="font-semibold text-gray-800 hover:text-green-700">
                {t.name}
              </Link>
              <span className="text-xs text-gray-500">{STATUS_LABELS[t.status] ?? t.status}</span>
              {user?.role === 'ORGANIZER' && (t.status === 'FINISHED' || t.status === 'CANCELLED') && (
                <button
                  onClick={() => handleDelete(t.id)}
                  className="self-start text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

