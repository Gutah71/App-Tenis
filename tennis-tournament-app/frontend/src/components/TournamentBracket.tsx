import { useState } from 'react';
import {
  Bracket,
  Seed,
  SeedItem,
  SeedTeam,
  type IRenderSeedProps,
  type IRoundProps,
} from 'react-brackets';
import { api, ApiError } from '../lib/api';
import type { MatchData } from '../types';

interface Props {
  matches: MatchData[];
  isOrganizer: boolean;
  token: string | null;
  onUpdate: () => void;
}

/**
 * Convert flat match list → react-brackets RoundProps[]
 */
function matchesToRounds(matches: MatchData[]): IRoundProps[] {
  const roundMap = new Map<number, MatchData[]>();

  for (const m of matches) {
    const arr = roundMap.get(m.round) ?? [];
    arr.push(m);
    roundMap.set(m.round, arr);
  }

  const totalRounds = Math.max(...roundMap.keys());

  const ROUND_NAMES: Record<number, string> = {};
  if (totalRounds >= 1) ROUND_NAMES[totalRounds] = 'Final';
  if (totalRounds >= 2) ROUND_NAMES[totalRounds - 1] = 'Semifinal';
  if (totalRounds >= 3) ROUND_NAMES[totalRounds - 2] = 'Cuartos';

  const rounds: IRoundProps[] = [];

  for (let round = 1; round <= totalRounds; round++) {
    const roundMatches = roundMap.get(round) ?? [];
    rounds.push({
      title: ROUND_NAMES[round] ?? `Ronda ${round}`,
      seeds: roundMatches.map((m) => ({
        id: m.id,
        teams: [
          {
            name: m.player1?.name ?? 'Por definir',
            id: m.player1?.id ?? null,
            isWinner: m.winner?.id === m.player1?.id && m.winner !== null,
          },
          {
            name: m.player2?.name ?? 'Por definir',
            id: m.player2?.id ?? null,
            isWinner: m.winner?.id === m.player2?.id && m.winner !== null,
          },
        ],
        // Extra data for custom render
        matchData: m,
      })),
    });
  }

  return rounds;
}

export default function TournamentBracket({ matches, isOrganizer, token, onUpdate }: Props) {
  const rounds = matchesToRounds(matches);

  if (matches.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h2 className="font-semibold text-gray-800 mb-4">Cuadro del torneo</h2>
      <Bracket
        rounds={rounds}
        renderSeedComponent={(props) => (
          <CustomSeed
            {...props}
            isOrganizer={isOrganizer}
            token={token}
            onUpdate={onUpdate}
          />
        )}
        roundTitleComponent={(title) => (
          <div className="text-center text-sm font-medium text-green-700 mb-2">
            {title}
          </div>
        )}
      />
    </div>
  );
}

/* ── Custom Seed (match card) ──────────────────────────────────────────────── */

interface CustomSeedExtraProps {
  isOrganizer: boolean;
  token: string | null;
  onUpdate: () => void;
}

function CustomSeed(props: IRenderSeedProps & CustomSeedExtraProps) {
  const { seed, breakpoint, isOrganizer, token, onUpdate } = props;
  const matchData = (seed as any).matchData as MatchData;
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState('');
  const [winnerId, setWinnerId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canReport =
    isOrganizer &&
    matchData.status !== 'CONFIRMED' &&
    matchData.player1 !== null &&
    matchData.player2 !== null;

  async function handleReport() {
    if (!token || !winnerId || !result.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.post(
        `/tournaments/${matchData.tournamentId}/matches/${matchData.id}/result`,
        { winnerId, result: result.trim() },
        token,
      );
      setShowForm(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al reportar');
    } finally {
      setSaving(false);
    }
  }

  const team1 = seed.teams[0] as any;
  const team2 = seed.teams[1] as any;

  return (
    <Seed mobileBreakpoint={breakpoint} style={{ fontSize: 13 }}>
      <SeedItem style={{ borderRadius: 8, overflow: 'hidden' }}>
        <div className="bg-white border border-gray-200 rounded-lg">
          <SeedTeam
            style={{
              backgroundColor: team1.isWinner ? '#dcfce7' : '#f9fafb',
              color: team1.id ? '#1f2937' : '#9ca3af',
              fontWeight: team1.isWinner ? 600 : 400,
              padding: '6px 10px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            {team1.name}
            {team1.isWinner && <span className="ml-1 text-green-600">✓</span>}
          </SeedTeam>
          <SeedTeam
            style={{
              backgroundColor: team2.isWinner ? '#dcfce7' : '#f9fafb',
              color: team2.id ? '#1f2937' : '#9ca3af',
              fontWeight: team2.isWinner ? 600 : 400,
              padding: '6px 10px',
            }}
          >
            {team2.name}
            {team2.isWinner && <span className="ml-1 text-green-600">✓</span>}
          </SeedTeam>

          {matchData.result && (
            <div className="text-center text-xs text-gray-400 py-1 bg-gray-50 border-t border-gray-200">
              {matchData.result}
            </div>
          )}

          {canReport && !showForm && (
            <div className="text-center py-1 border-t border-gray-200">
              <button
                onClick={() => setShowForm(true)}
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                Reportar resultado
              </button>
            </div>
          )}

          {showForm && (
            <div className="p-2 border-t border-gray-200 bg-gray-50 space-y-2">
              <select
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value)}
                className="w-full text-xs border rounded px-2 py-1"
              >
                <option value="">Seleccionar ganador</option>
                {matchData.player1 && (
                  <option value={matchData.player1.id}>{matchData.player1.name}</option>
                )}
                {matchData.player2 && (
                  <option value={matchData.player2.id}>{matchData.player2.name}</option>
                )}
              </select>
              <input
                type="text"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Ej: 6-3, 7-5"
                className="w-full text-xs border rounded px-2 py-1"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-1">
                <button
                  onClick={handleReport}
                  disabled={saving || !winnerId || !result.trim()}
                  className="flex-1 text-xs bg-green-600 text-white rounded py-1 hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? '...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setError(''); }}
                  className="text-xs text-gray-500 px-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </SeedItem>
    </Seed>
  );
}
