import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyMatches } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import type { Match } from '../types';

type MatchWithTournament = Match & { tournament: { id: string; name: string } };

const M_STATUS: Record<string, string> = {
  PENDING: 'Pendiente',
  PENDING_CONFIRMATION: 'Pend. confirmación',
  CONFIRMED: 'Confirmado',
  DISPUTED: 'Disputado',
  ORGANIZER_REVIEW: 'En revisión',
};

const M_STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
  PENDING_CONFIRMATION: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  CONFIRMED: 'bg-brand-green/10 border-brand-green/30 text-brand-green',
  DISPUTED: 'bg-red-500/10 border-red-500/30 text-red-400',
  ORGANIZER_REVIEW: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // Monday-based: 0=Mon … 6=Sun
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarPage() {
  const { user } = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [matches, setMatches] = useState<MatchWithTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    getMyMatches()
      .then((data) => setMatches(data as MatchWithTournament[]))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);

  // Build calendar grid (cells = empty slots + day numbers)
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null);

  function matchesOnDay(day: number) {
    const d = new Date(year, month, day);
    return matches.filter((m) => m.scheduledDate && isSameDay(new Date(m.scheduledDate), d));
  }

  const selectedMatches = selectedDay
    ? matches.filter((m) => m.scheduledDate && isSameDay(new Date(m.scheduledDate), selectedDay))
    : [];

  const opponent = (m: MatchWithTournament) =>
    m.player1Id === user?.id ? m.player2?.name : m.player1?.name;

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando...</p>;
  if (error) return <p className="text-center py-16 text-red-500">{error}</p>;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="section-title">Mi calendario</h1>
        <p className="section-subtitle">Tus partidos programados</p>
      </div>

      {/* Calendar header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-brand-surface-3 text-gray-400 hover:text-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-white">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-brand-surface-3 text-gray-400 hover:text-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />;
            }
            const dayMatches = matchesOnDay(day);
            const isToday = isSameDay(new Date(year, month, day), today);
            const isSelected = selectedDay && isSameDay(new Date(year, month, day), selectedDay);
            const hasMatch = dayMatches.length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(new Date(year, month, day))}
                className={`
                  relative flex flex-col items-center justify-start rounded-lg py-2 px-1 min-h-[52px] transition-all
                  ${isSelected
                    ? 'bg-brand-green text-black font-bold ring-2 ring-brand-green'
                    : isToday
                    ? 'bg-brand-green/10 border border-brand-green/40 text-brand-green font-semibold'
                    : hasMatch
                    ? 'bg-brand-surface-3 hover:bg-brand-surface-3 border border-brand-border hover:border-brand-green/50 cursor-pointer'
                    : 'hover:bg-brand-surface-2 text-gray-400 cursor-pointer'}
                `}
              >
                <span className="text-sm">{day}</span>
                {hasMatch && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayMatches.slice(0, 3).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-brand-green'}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day matches */}
      {selectedDay && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {selectedDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {selectedMatches.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay partidos este día.</p>
          ) : (
            <div className="space-y-3">
              {selectedMatches.map((m) => (
                <div key={m.id} className="card flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm truncate">
                        vs {opponent(m) ?? 'TBD'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${M_STATUS_COLOR[m.status] ?? M_STATUS_COLOR.PENDING}`}>
                        {M_STATUS[m.status] ?? m.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {m.tournament.name}
                      {m.scheduledDate && (
                        <> · {new Date(m.scheduledDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</>
                      )}
                    </p>
                    {m.score && m.status === 'CONFIRMED' && (
                      <p className="text-xs text-gray-400 mt-1">Marcador: {m.score}</p>
                    )}
                  </div>
                  <Link
                    to={`/tournaments/${m.tournamentId}`}
                    className="text-xs btn-secondary shrink-0"
                  >
                    Ver torneo
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming matches list */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Próximos partidos
        </h3>
        {matches.filter((m) => m.scheduledDate && new Date(m.scheduledDate) >= today).length === 0 ? (
          <div className="card text-center">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No tienes partidos programados próximamente.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches
              .filter((m) => m.scheduledDate && new Date(m.scheduledDate) >= today)
              .map((m) => (
                <div key={m.id} className="card flex items-center justify-between gap-4 py-4">
                  <div className="w-14 text-center shrink-0">
                    <p className="text-xs text-gray-500 uppercase">
                      {new Date(m.scheduledDate!).toLocaleDateString('es-ES', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-black text-brand-green leading-none">
                      {new Date(m.scheduledDate!).getDate()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(m.scheduledDate!).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0 border-l border-brand-border pl-4">
                    <p className="text-white font-semibold text-sm truncate">vs {opponent(m) ?? 'TBD'}</p>
                    <p className="text-xs text-gray-500 truncate">{m.tournament.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${M_STATUS_COLOR[m.status] ?? M_STATUS_COLOR.PENDING}`}>
                    {M_STATUS[m.status] ?? m.status}
                  </span>
                  <Link to={`/tournaments/${m.tournamentId}`} className="text-xs btn-secondary shrink-0">
                    Ver torneo
                  </Link>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
