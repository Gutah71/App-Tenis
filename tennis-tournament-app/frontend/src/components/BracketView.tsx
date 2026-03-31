// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – react-brackets ships typings for React 17; works fine at runtime with React 18
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets';
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
  if (matches.length === 0) return null;

  const totalRounds = Math.log2(maxPlayers);
  const matchMap = new Map<string, Match>(matches.map((m) => [m.id, m]));

  const rounds: RoundData[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    const roundMatches = matches
      .filter((m) => m.round === r)
      .sort((a, b) => a.position - b.position);

    let title = `Ronda ${r}`;
    if (r === totalRounds) title = 'Final';
    else if (totalRounds > 2 && r === totalRounds - 1) title = 'Semifinal';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderSeed({ seed }: any) {
    const match = matchMap.get(seed.id as string);
    const p1Won = match?.status === 'CONFIRMED' && match?.winnerId === match?.player1Id;
    const p2Won = match?.status === 'CONFIRMED' && match?.winnerId === match?.player2Id;

    const winnerStyle = {
      background: '#f0fdf4',
      fontWeight: 700,
      color: '#15803d',
    };
    const pendingStyle = {
      background: '#f9fafb',
      color: '#374151',
      fontWeight: 400,
    };

    return (
      <Seed>
        <SeedItem style={{ minWidth: 140, fontSize: 13, borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <SeedTeam style={p1Won ? winnerStyle : pendingStyle}>
            {seed.teams[0]?.name ?? 'TBD'}
          </SeedTeam>
          <SeedTeam style={{ borderTop: '1px solid #e5e7eb', ...(p2Won ? winnerStyle : pendingStyle) }}>
            {seed.teams[1]?.name ?? 'TBD'}
          </SeedTeam>
        </SeedItem>
        {match?.score && (
          <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
            {match.score}
          </div>
        )}
      </Seed>
    );
  }

  return (
    <div className="overflow-x-auto py-2">
      <Bracket rounds={rounds} renderSeedComponent={renderSeed} />
    </div>
  );
}
