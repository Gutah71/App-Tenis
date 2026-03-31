import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getTournament,
  registerForTournament,
  cancelRegistration,
  generateBracket,
  reportResult,
  confirmResult,
  disputeResult,
  updateTournamentStatus,
} from '../services/tournamentService';
import { useAuth } from '../context/AuthContext';
import type { Tournament, Match } from '../types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador', OPEN: 'Abierto', FULL: 'Completo',
  IN_PROGRESS: 'En curso', FINISHED: 'Finalizado', CANCELLED: 'Cancelado',
};
const MATCH_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', PENDING_CONFIRMATION: 'Pendiente confirmación',
  CONFIRMED: 'Confirmado', DISPUTED: 'En disputa',
};

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [reportMatchId, setReportMatchId] = useState<string | null>(null);
  const [reportWinnerId, setReportWinnerId] = useState('');

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const t = await getTournament(id);
      setTournament(t);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function handleRegister() {
    setActionError('');
    try { await registerForTournament(id!); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  async function handleCancel() {
    setActionError('');
    try { await cancelRegistration(id!); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  async function handleGenerateBracket() {
    setActionError('');
    try { await generateBracket(id!); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  async function handleReport(matchId: string, winnerId: string) {
    setActionError('');
    try { await reportResult(id!, matchId, winnerId); setReportMatchId(null); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  async function handleConfirm(matchId: string) {
    setActionError('');
    try { await confirmResult(id!, matchId); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  async function handleDispute(matchId: string) {
    setActionError('');
    try { await disputeResult(id!, matchId); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  async function handleStatusChange(status: string) {
    setActionError('');
    try { await updateTournamentStatus(id!, status); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando...</p>;
  if (error || !tournament) return <p className="text-center py-16 text-red-500">{error || 'No encontrado'}</p>;

  const registrations = tournament.registrations ?? [];
  const matches = tournament.matches ?? [];
  const isRegistered = isAuthenticated && registrations.some((r) => r.userId === user?.id);
  const isOrganizer = isAuthenticated && user?.id === tournament.createdById;
  const registrationCount = registrations.length;

  const matchesByRound: Record<number, Match[]> = {};
  for (const m of matches) {
    if (!matchesByRound[m.round]) matchesByRound[m.round] = [];
    matchesByRound[m.round].push(m);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{tournament.name}</h1>
          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            {STATUS_LABELS[tournament.status] ?? tournament.status}
          </span>
        </div>
        <p className="text-gray-500 mt-1">
          Organizador: {tournament.createdBy?.name} · {registrationCount}/{tournament.maxPlayers} jugadores
          {tournament.league && ` · Liga: ${tournament.league.name}`}
        </p>

        {actionError && <p className="mt-3 text-red-500 text-sm">{actionError}</p>}

        {/* Player actions */}
        {isAuthenticated && !isOrganizer && (
          <div className="mt-4 flex gap-2">
            {!isRegistered && tournament.status === 'OPEN' && (
              <button onClick={handleRegister} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Inscribirse
              </button>
            )}
            {isRegistered && (tournament.status === 'OPEN' || tournament.status === 'FULL') && (
              <button onClick={handleCancel} className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">
                Cancelar inscripción
              </button>
            )}
          </div>
        )}

        {/* Organizer actions */}
        {isOrganizer && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(tournament.status === 'FULL' || tournament.status === 'OPEN') && (
              <button onClick={handleGenerateBracket} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Generar bracket
              </button>
            )}
            {tournament.status === 'DRAFT' && (
              <button onClick={() => handleStatusChange('OPEN')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Abrir inscripciones
              </button>
            )}
            {tournament.status !== 'CANCELLED' && tournament.status !== 'FINISHED' && (
              <button onClick={() => handleStatusChange('CANCELLED')} className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">
                Cancelar torneo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Registered players */}
      {registrations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Jugadores inscritos</h2>
          <ul className="divide-y">
            {registrations.map((r) => (
              <li key={r.userId} className="py-2 text-sm text-gray-600">{r.user.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bracket */}
      {matches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Bracket</h2>
          {Object.entries(matchesByRound)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([round, roundMatches]) => (
              <div key={round} className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
                  {Number(round) === Math.log2(tournament.maxPlayers) ? 'Final' : `Ronda ${round}`}
                </h3>
                <div className="space-y-3">
                  {roundMatches.map((m) => {
                    const isPlayer = m.player1Id === user?.id || m.player2Id === user?.id;
                    const canReport = isAuthenticated && isPlayer && m.status === 'PENDING';
                    const canConfirm =
                      isAuthenticated && isPlayer &&
                      m.status === 'PENDING_CONFIRMATION' &&
                      m.player1Id !== undefined && m.reportedById !== user?.id;

                    return (
                      <div key={m.id} className="border rounded p-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className={m.winnerId === m.player1Id && m.status === 'CONFIRMED' ? 'font-bold text-green-700' : ''}>
                              {m.player1?.name ?? 'TBD'}
                            </span>
                            <span className="mx-2 text-gray-400">vs</span>
                            <span className={m.winnerId === m.player2Id && m.status === 'CONFIRMED' ? 'font-bold text-green-700' : ''}>
                              {m.player2?.name ?? 'TBD'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{MATCH_STATUS_LABELS[m.status]}</span>
                        </div>
                        {m.status === 'CONFIRMED' && m.winner && (
                          <p className="text-xs text-green-600 mt-1">Ganador: {m.winner.name}</p>
                        )}

                        {/* Report result */}
                        {canReport && reportMatchId !== m.id && (
                          <button
                            onClick={() => { setReportMatchId(m.id); setReportWinnerId(''); }}
                            className="mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                          >
                            Reportar resultado
                          </button>
                        )}
                        {reportMatchId === m.id && (
                          <div className="mt-2 flex gap-2 items-center">
                            <select
                              value={reportWinnerId}
                              onChange={(e) => setReportWinnerId(e.target.value)}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="">-- Ganador --</option>
                              {m.player1 && <option value={m.player1.id}>{m.player1.name}</option>}
                              {m.player2 && <option value={m.player2.id}>{m.player2.name}</option>}
                            </select>
                            <button
                              onClick={() => reportWinnerId && handleReport(m.id, reportWinnerId)}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                              Enviar
                            </button>
                            <button
                              onClick={() => setReportMatchId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}

                        {/* Confirm / dispute */}
                        {canConfirm && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => handleConfirm(m.id)}
                              className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleDispute(m.id)}
                              className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                            >
                              Disputar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
