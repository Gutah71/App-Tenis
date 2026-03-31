import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  getTournament,
  registerForTournament,
  cancelRegistration,
  generateBracket,
  reportResult,
  confirmResult,
  disputeResult,
  organizerResolve,
  updateTournamentStatus,
  scheduleMatch,
} from '../services/tournamentService';
import { useAuth } from '../context/AuthContext';
import BracketView from '../components/BracketView';
import type { Tournament, Match } from '../types';

interface SetInput { p1: string; p2: string; }

function validateSetScore(p1Str: string, p2Str: string): string | null {
  if (p1Str === '' && p2Str === '') return null;
  if (p1Str === '' || p2Str === '') return 'Introduce ambos valores del set';
  const p1 = parseInt(p1Str, 10), p2 = parseInt(p2Str, 10);
  if (isNaN(p1) || isNaN(p2)) return 'Valores numéricos requeridos';
  if (p1 < 0 || p2 < 0) return 'Valores negativos no permitidos';
  if (p1 > 7 || p2 > 7) return 'Máximo 7 juegos por set';
  if (p1 === p2) {
    if (p1 === 6) return '6-6 no es final: debe jugarse tiebreak (7-6)';
    return `${p1}-${p2} no es un resultado válido`;
  }
  const max = Math.max(p1, p2), min = Math.min(p1, p2);
  if (max === 7) {
    if (min !== 5 && min !== 6) return `7-${min} no es válido (use 7-5 o 7-6)`;
    return null;
  }
  if (max === 6) {
    if (min === 5) return '6-5 no es final: debe ser 7-5';
    return null; // 6-0..6-4 valid
  }
  return `${p1}-${p2} no es un resultado completo del set`;
}

function computeResult(
  sets: SetInput[],
  player1Id: string | null | undefined,
  player2Id: string | null | undefined
): { winnerId: string | null; scoreStr: string; p1Sets: number; p2Sets: number; error: string | null } {
  let p1Sets = 0, p2Sets = 0;
  const parts: string[] = [];

  for (let i = 0; i < sets.length; i++) {
    if (p1Sets === 2 || p2Sets === 2) break;
    const s = sets[i];
    if (s.p1 === '' && s.p2 === '') continue;
    const err = validateSetScore(s.p1, s.p2);
    if (err) return { winnerId: null, scoreStr: '', p1Sets, p2Sets, error: `Set ${i + 1}: ${err}` };
    const p1 = parseInt(s.p1, 10), p2 = parseInt(s.p2, 10);
    parts.push(`${p1}-${p2}`);
    if (p1 > p2) p1Sets++; else p2Sets++;
  }

  const scoreStr = parts.join(' ');
  if (p1Sets === 2 && player1Id) return { winnerId: player1Id, scoreStr, p1Sets, p2Sets, error: null };
  if (p2Sets === 2 && player2Id) return { winnerId: player2Id, scoreStr, p1Sets, p2Sets, error: null };
  return { winnerId: null, scoreStr, p1Sets, p2Sets, error: scoreStr ? 'Se necesita ganar 2 sets' : 'Introduce los sets jugados' };
}

function ScoreForm({ match, submitLabel, onSubmit, onCancel }: {
  match: Match;
  submitLabel?: string;
  onSubmit: (winnerId: string, score: string) => Promise<void>;
  onCancel: () => void;
}) {
  const EMPTY: SetInput = { p1: '', p2: '' };
  const [sets, setSets] = useState<[SetInput, SetInput, SetInput]>([{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }]);
  const [submitting, setSubmitting] = useState(false);

  function updateSet(idx: number, field: 'p1' | 'p2', val: string) {
    const num = val.replace(/[^0-9]/g, '');
    const clamped = num === '' ? '' : String(Math.min(7, parseInt(num, 10)));
    setSets((prev) => {
      const next: [SetInput, SetInput, SetInput] = [{ ...prev[0] }, { ...prev[1] }, { ...prev[2] }];
      next[idx] = { ...next[idx], [field]: clamped };
      return next;
    });
  }

  const result = useMemo(() => computeResult(sets, match.player1Id, match.player2Id), [sets, match.player1Id, match.player2Id]);
  const showSet3 = result.p1Sets === 1 && result.p2Sets === 1 && sets[0].p1 !== '' && sets[1].p1 !== '';

  async function handleSubmit() {
    if (!result.winnerId) return;
    setSubmitting(true);
    try { await onSubmit(result.winnerId, result.scoreStr); }
    finally { setSubmitting(false); }
  }

  const winnerName = result.winnerId === match.player1Id
    ? (match.player1?.name ?? 'Jugador 1')
    : result.winnerId === match.player2Id
    ? (match.player2?.name ?? 'Jugador 2')
    : null;

  return (
    <div className="mt-3 bg-white border border-green-200 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resultado del partido</p>
      <div className="grid grid-cols-[3rem_1fr_1rem_1fr] gap-x-2 items-center text-xs text-gray-400 font-medium">
        <span />
        <span className="text-center truncate">{match.player1?.name ?? 'J1'}</span>
        <span />
        <span className="text-center truncate">{match.player2?.name ?? 'J2'}</span>
      </div>
      {([0, 1] as const).map((idx) => (
        <div key={idx} className="grid grid-cols-[3rem_1fr_1rem_1fr] gap-x-2 items-center">
          <span className="text-xs text-gray-400">Set {idx + 1}</span>
          <input type="number" min={0} max={7} value={sets[idx].p1}
            onChange={(e) => updateSet(idx, 'p1', e.target.value)}
            className="w-full border rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="0" />
          <span className="text-gray-400 text-center">-</span>
          <input type="number" min={0} max={7} value={sets[idx].p2}
            onChange={(e) => updateSet(idx, 'p2', e.target.value)}
            className="w-full border rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="0" />
        </div>
      ))}
      {showSet3 && (
        <div className="grid grid-cols-[3rem_1fr_1rem_1fr] gap-x-2 items-center">
          <span className="text-xs text-gray-400">Set 3</span>
          <input type="number" min={0} max={7} value={sets[2].p1}
            onChange={(e) => updateSet(2, 'p1', e.target.value)}
            className="w-full border rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="0" />
          <span className="text-gray-400 text-center">-</span>
          <input type="number" min={0} max={7} value={sets[2].p2}
            onChange={(e) => updateSet(2, 'p2', e.target.value)}
            className="w-full border rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="0" />
        </div>
      )}
      {winnerName
        ? <p className="text-sm font-semibold text-green-700 bg-green-50 rounded px-3 py-1.5">Ganador: {winnerName} ({result.p1Sets}-{result.p2Sets})</p>
        : sets.some(s => s.p1 !== '' || s.p2 !== '') && result.error
        ? <p className="text-xs text-orange-500">{result.error}</p>
        : null
      }
      <div className="flex gap-2 pt-1">
        <button onClick={handleSubmit} disabled={!result.winnerId || submitting}
          className="bg-green-600 text-white text-sm px-4 py-1.5 rounded hover:bg-green-700 disabled:opacity-40">
          {submitting ? 'Enviando...' : (submitLabel ?? 'Enviar resultado')}
        </button>
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 px-2">Cancelar</button>
      </div>
    </div>
  );
}

const T_STATUS: Record<string, string> = {
  DRAFT: 'Borrador', OPEN: 'Abierto', FULL: 'Completo',
  IN_PROGRESS: 'En curso', FINISHED: 'Finalizado', CANCELLED: 'Cancelado',
};
const M_STATUS: Record<string, string> = {
  PENDING: 'Pendiente', PENDING_CONFIRMATION: 'Pend. confirmacion',
  CONFIRMED: 'Confirmado', DISPUTED: 'En disputa', ORGANIZER_REVIEW: 'Revision organizador',
};

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [reportMatchId, setReportMatchId] = useState<string | null>(null);
  const [disputeMatchId, setDisputeMatchId] = useState<string | null>(null);
  const [scheduleMatchId, setScheduleMatchId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');

  async function load() {
    if (!id) return;
    setLoading(true);
    try { setTournament(await getTournament(id)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [id]);

  async function run(fn: () => Promise<unknown>) {
    setActionError('');
    try { await fn(); await load(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Error'); }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando...</p>;
  if (error || !tournament) return <p className="text-center py-16 text-red-500">{error || 'No encontrado'}</p>;

  const registrations = tournament.registrations ?? [];
  const matches = tournament.matches ?? [];
  const isRegistered = isAuthenticated && registrations.some(r => r.userId === user?.id);
  const isOrganizer = isAuthenticated && user?.id === tournament.createdById;
  const matchesByRound: Record<number, Match[]> = {};
  for (const m of matches) {
    if (!matchesByRound[m.round]) matchesByRound[m.round] = [];
    matchesByRound[m.round].push(m);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{tournament.name}</h1>
          <span className="shrink-0 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            {T_STATUS[tournament.status] ?? tournament.status}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-500 space-y-0.5">
          <p>Organizador: <strong>{tournament.createdBy?.name}</strong> · {registrations.length}/{tournament.maxPlayers} jugadores
            {tournament.league && ` · Liga: ${tournament.league.name}`}
          </p>
          {tournament.location && <p>Ubicación: <strong>{tournament.location}</strong></p>}
          {(tournament.startDate || tournament.endDate) && (
            <p>Fechas: <strong>{fmtDate(tournament.startDate)} — {fmtDate(tournament.endDate)}</strong></p>
          )}
        </div>
        {actionError && <p className="mt-3 text-red-500 text-sm">{actionError}</p>}

        {isAuthenticated && !isOrganizer && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {!isRegistered && tournament.status === 'OPEN' && (
              <button onClick={() => run(() => registerForTournament(id!))}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">Inscribirse</button>
            )}
            {isRegistered && (tournament.status === 'OPEN' || tournament.status === 'FULL') && (
              <button onClick={() => run(() => cancelRegistration(id!))}
                className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 text-sm">Cancelar inscripcion</button>
            )}
          </div>
        )}

        {isOrganizer && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {tournament.status === 'DRAFT' && (
              <button onClick={() => run(() => updateTournamentStatus(id!, 'OPEN'))}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">Abrir inscripciones</button>
            )}
            {(tournament.status === 'FULL' || tournament.status === 'OPEN') && (
              <button onClick={() => run(() => generateBracket(id!))}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Generar bracket</button>
            )}
            {tournament.status !== 'CANCELLED' && tournament.status !== 'FINISHED' && (
              <button onClick={() => run(() => updateTournamentStatus(id!, 'CANCELLED'))}
                className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 text-sm">Cancelar torneo</button>
            )}
          </div>
        )}
      </div>

      {/* Players */}
      {registrations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Jugadores inscritos ({registrations.length})</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {registrations.map(r => (
              <li key={r.userId} className="text-sm text-gray-600 py-1 px-2 bg-gray-50 rounded">{r.user.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bracket view */}
      {matches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Cuadro eliminatorio</h2>
          <BracketView matches={matches} maxPlayers={tournament.maxPlayers} />
        </div>
      )}

      {/* Matches */}
      {matches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Partidos</h2>
          {Object.entries(matchesByRound).sort(([a], [b]) => Number(a) - Number(b)).map(([round, rMatches]) => (
            <div key={round} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {Number(round) === Math.log2(tournament.maxPlayers) ? 'Final'
                  : Number(round) === Math.log2(tournament.maxPlayers) - 1 && tournament.maxPlayers > 4 ? 'Semifinal'
                  : `Ronda ${round}`}
              </h3>
              <div className="space-y-3">
                {rMatches.map(m => {
                  const isPlayer = m.player1Id === user?.id || m.player2Id === user?.id;
                  const canReport = isAuthenticated && isPlayer && m.status === 'PENDING' && m.player1Id != null && m.player2Id != null;

                  // PENDING_CONFIRMATION: non-reporter can confirm or dispute (with score = counter-report)
                  const canActOnPendingConf = isAuthenticated && isPlayer && m.status === 'PENDING_CONFIRMATION' && m.reportedById !== user?.id;

                  // DISPUTED: the player who is NOT the current reporter (reportedById) can confirm or escalate
                  const canActOnDisputed = isAuthenticated && isPlayer && m.status === 'DISPUTED' && m.reportedById !== user?.id;

                  // ORGANIZER_REVIEW: only the organizer
                  const canOrgResolve = isOrganizer && m.status === 'ORGANIZER_REVIEW' && m.player1Id && m.player2Id;

                  return (
                    <div key={m.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm flex items-center gap-1.5">
                          <span className={m.winnerId === m.player1Id && m.status === 'CONFIRMED' ? 'font-bold text-green-700' : 'text-gray-700'}>
                            {m.player1?.name ?? 'TBD'}
                          </span>
                          <span className="text-gray-300">vs</span>
                          <span className={m.winnerId === m.player2Id && m.status === 'CONFIRMED' ? 'font-bold text-green-700' : 'text-gray-700'}>
                            {m.player2?.name ?? 'TBD'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{M_STATUS[m.status] ?? m.status}</span>
                      </div>

                      {m.scheduledDate && (
                        <p className="text-xs text-blue-500 mt-1">Fecha programada: {fmtDate(m.scheduledDate)}</p>
                      )}
                      {m.score && <p className="text-xs text-gray-500 mt-1">Marcador: {m.score}</p>}
                      {m.status === 'CONFIRMED' && m.winner && (
                        <p className="text-xs text-green-600 mt-1 font-medium">Ganador: {m.winner.name}</p>
                      )}
                      {m.status === 'DISPUTED' && (
                        <p className="text-xs text-orange-500 mt-1">
                          Resultado disputado — {m.reportedById === user?.id
                            ? 'Espera la respuesta del otro jugador'
                            : 'Confirma o disputa el resultado'}
                        </p>
                      )}
                      {m.status === 'ORGANIZER_REVIEW' && (
                        <p className="text-xs text-red-500 mt-1">Ambos jugadores han disputado — el organizador debe resolver</p>
                      )}

                      {/* Schedule match date (organizer only, if tournament has dates) */}
                      {isOrganizer && m.player1Id && m.player2Id && m.status !== 'CONFIRMED' && (
                        <div className="mt-2">
                          {scheduleMatchId === m.id ? (
                            <div className="flex items-center gap-2">
                              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                                min={tournament.startDate ? tournament.startDate.split('T')[0] : undefined}
                                max={tournament.endDate ? tournament.endDate.split('T')[0] : undefined}
                                className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                              <button onClick={() => run(async () => {
                                await scheduleMatch(id!, m.id, scheduleDate);
                                setScheduleMatchId(null);
                              })} disabled={!scheduleDate}
                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-40">
                                Guardar
                              </button>
                              <button onClick={() => setScheduleMatchId(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                            </div>
                          ) : (
                            <button onClick={() => { setScheduleMatchId(m.id); setScheduleDate(m.scheduledDate ? m.scheduledDate.split('T')[0] : ''); }}
                              className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">
                              {m.scheduledDate ? 'Cambiar fecha' : 'Programar fecha'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Report result */}
                      {canReport && reportMatchId !== m.id && (
                        <button onClick={() => setReportMatchId(m.id)}
                          className="mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200">
                          Reportar resultado
                        </button>
                      )}
                      {reportMatchId === m.id && (
                        <ScoreForm match={m} submitLabel="Enviar resultado" onCancel={() => setReportMatchId(null)}
                          onSubmit={async (winnerId, score) => {
                            await reportResult(id!, m.id, winnerId, score);
                            setReportMatchId(null);
                            await load();
                          }} />
                      )}

                      {/* Confirm or dispute (first round) */}
                      {canActOnPendingConf && disputeMatchId !== m.id && (
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => run(() => confirmResult(id!, m.id))}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200">
                            Confirmar resultado
                          </button>
                          <button onClick={() => setDisputeMatchId(m.id)}
                            className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200">
                            Disputar (enviar mi versión)
                          </button>
                        </div>
                      )}
                      {canActOnPendingConf && disputeMatchId === m.id && (
                        <ScoreForm match={m} submitLabel="Enviar mi versión" onCancel={() => setDisputeMatchId(null)}
                          onSubmit={async (winnerId, score) => {
                            await disputeResult(id!, m.id, winnerId, score);
                            setDisputeMatchId(null);
                            await load();
                          }} />
                      )}

                      {/* Confirm or escalate (second round) */}
                      {canActOnDisputed && (
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => run(() => confirmResult(id!, m.id))}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200">
                            Aceptar versión del otro jugador
                          </button>
                          <button onClick={() => run(() => disputeResult(id!, m.id, '', ''))}
                            className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200">
                            Escalar al organizador
                          </button>
                        </div>
                      )}

                      {/* Organizer resolve */}
                      {canOrgResolve && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Selecciona el ganador:</p>
                          <div className="flex gap-2">
                            <button onClick={() => run(() => organizerResolve(id!, m.id, m.player1Id!))}
                              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-200">
                              {m.player1?.name ?? 'Jugador 1'}
                            </button>
                            <button onClick={() => run(() => organizerResolve(id!, m.id, m.player2Id!))}
                              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-200">
                              {m.player2?.name ?? 'Jugador 2'}
                            </button>
                          </div>
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
