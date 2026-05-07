// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – react-brackets ships typings for React 17; works fine at runtime with React 18
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets';
import { useNavigate } from 'react-router-dom';
import type { Match } from '../types';

interface BracketViewProps {
  matches: Match[];
  maxPlayers: number;
}

// Use a plain object type for round data to avoid peer-dep type conflicts
interface RoundData {
  title: string;
  seeds: { id: string; teams: { name: string }[] }[];
}

export default function BracketView({ matches, maxPlayers }: BracketViewProps) {
  const navigate = useNavigate();
  if (matches.length === 0) return null;

  // Use the actual rounds present in the data (not maxPlayers) so partial
  // brackets (e.g. tournament for 8 with only 4 players registered) don't
  // render empty trailing columns like a phantom "Final".
  const totalRounds = Math.max(...matches.map((m) => m.round));
  // Kept for parity with the prop signature; not currently used after fix.
  void maxPlayers;
  const matchMap = new Map<string, Match>(matches.map((m) => [m.id, m]));

  const rounds: RoundData[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    const roundMatches = matches
      .filter((m) => m.round === r)
      .sort((a, b) => a.position - b.position);

    let title = `Ronda ${r}`;
    // Name rounds based on number of matches in that round (more robust than
    // counting from the end, which fails for the first round when it equals
    // a named stage like "Cuartos").
    const n = roundMatches.length;
    if (n === 1) title = 'Final';
    else if (n === 2) title = 'Semifinal';
    else if (n === 4) title = 'Cuartos';
    else if (n === 8) title = 'Octavos';
    else if (n === 16) title = 'Dieciseisavos';

    rounds.push({
      title,
      seeds: roundMatches.map((m) => ({
        id: m.id,
        teams: [
          { name: m.player1?.name ?? 'TBD' },
          { name: m.player2?.name ?? 'TBD' },
        ],
      })),
    });
  }

  // Dark theme palette (matches Tailwind config: brand-surface-2/3, brand-border, brand-green)
  const COLORS = {
    surface: '#1a1a1a',     // brand-surface-2
    surfaceAlt: '#262626',  // brand-surface-3
    border: '#27272a',      // brand-border
    text: '#e5e7eb',        // gray-200
    muted: '#9ca3af',       // gray-400
    winnerBg: 'rgba(34, 197, 94, 0.12)',
    winnerText: '#22c55e',  // brand-green
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderSeed({ seed }: any) {
    const match = matchMap.get(seed.id as string);
    const p1Won = match?.status === 'CONFIRMED' && match?.winnerId === match?.player1Id;
    const p2Won = match?.status === 'CONFIRMED' && match?.winnerId === match?.player2Id;

    const winnerStyle = {
      background: COLORS.winnerBg,
      fontWeight: 700,
      color: COLORS.winnerText,
      padding: '8px 12px',
    };
    const pendingStyle = {
      background: COLORS.surface,
      color: COLORS.text,
      fontWeight: 400,
      padding: '8px 12px',
    };

    const p1Name = seed.teams[0]?.name ?? 'TBD';
    const p2Name = seed.teams[1]?.name ?? 'TBD';
    const p1Id = match?.player1Id;
    const p2Id = match?.player2Id;

    function playerSpan(name: string, playerId: string | null | undefined) {
      if (playerId && name !== 'TBD') {
        return (
          <span
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); navigate(`/players/${playerId}`); }}
          >
            {name}
          </span>
        );
      }
      return name;
    }

    return (
      <Seed>
        <SeedItem
          style={{
            minWidth: 150,
            fontSize: 13,
            borderRadius: 6,
            overflow: 'hidden',
            border: `1px solid ${COLORS.border}`,
            background: COLORS.surface,
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          <SeedTeam style={p1Won ? winnerStyle : pendingStyle}>
            {playerSpan(p1Name, p1Id)}
          </SeedTeam>
          <SeedTeam style={{ borderTop: `1px solid ${COLORS.border}`, ...(p2Won ? winnerStyle : pendingStyle) }}>
            {playerSpan(p2Name, p2Id)}
          </SeedTeam>
        </SeedItem>
        {match?.score && (
          <div style={{ textAlign: 'center', fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
            {match.score}
          </div>
        )}
      </Seed>
    );
  }

  // Override default react-brackets text/connector colors via scoped CSS
  return (
    <div className="bracket-dark overflow-x-auto py-2">
      <style>{`
        .bracket-dark [class*="RoundTitle"],
        .bracket-dark h3 {
          color: ${COLORS.muted} !important;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .bracket-dark svg line,
        .bracket-dark svg path {
          stroke: ${COLORS.border} !important;
        }
      `}</style>
      <Bracket rounds={rounds} renderSeedComponent={renderSeed} />
    </div>
  );
}
