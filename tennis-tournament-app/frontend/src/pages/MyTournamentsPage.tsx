import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTournaments } from '../services/tournamentService';
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

  useEffect(() => {
    listTournaments()
      .then((all) => {
        // Player: show where registered. Organizer: show where created.
        const filtered = user?.role === 'ORGANIZER'
          ? all.filter((t) => t.createdById === user.id)
          : all.filter((t) => t.registrations?.some((r) => r.userId === user?.id));
        setTournaments(filtered);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [user]);

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
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
            >
              <h2 className="font-semibold text-gray-800 mb-1">{t.name}</h2>
              <span className="text-xs text-gray-500">{STATUS_LABELS[t.status] ?? t.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
