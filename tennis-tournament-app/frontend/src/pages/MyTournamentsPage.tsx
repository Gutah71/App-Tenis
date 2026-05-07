import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTournaments, deleteTournament } from '../services/tournamentService';
import { getMyTournaments } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import type { Tournament } from '../types';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto', FULL: 'Completo',
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
      if (user?.role === 'ORGANIZER') {
        const all = await listTournaments();
        setTournaments(all.filter((t) => t.createdById === user.id));
      } else {
        setTournaments(await getMyTournaments());
      }
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
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="section-title">{label}</h1>
        <p className="section-subtitle">{user?.role === 'ORGANIZER' ? 'Gestiona tus torneos' : 'Sigue tu progreso en los torneos'}</p>
      </div>
      {tournaments.length === 0 ? (
        <div className="card text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-gray-400">No tienes torneos aún</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="card hover:border-brand-green/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3 flex-1">
                <h2 className="font-semibold text-white text-base group-hover:text-brand-green transition-colors flex-1">{t.name}</h2>
                {t.isPrivate && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap bg-amber-500/10 border border-amber-500/50 text-amber-400">
                    Privado
                  </span>
                )}
              </div>
              <div className="space-y-3 pt-3 border-t border-brand-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Estado:</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-brand-blue/10 text-brand-green">
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </div>
                {user?.role === 'ORGANIZER' && (t.status === 'FINISHED' || t.status === 'CANCELLED') && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(t.id);
                    }}
                    className="w-full text-xs bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded font-medium transition-colors"
                  >
                    Eliminar torneo
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

