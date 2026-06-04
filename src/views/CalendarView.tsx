import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '../storage';
import { SLOTS_PER_DAY, HOURS_PER_SLOT, DAYS, BUCKET_CONFIG } from '../constants';
import { useAppState } from '../hooks/useAppState';

interface Props {
  appState: ReturnType<typeof useAppState>;
  onNavigateToReview: () => void;
}

const SLOT_LABELS = Array.from({ length: SLOTS_PER_DAY }, (_, i) => {
  const h = 8 + i * HOURS_PER_SLOT;
  return `${String(h).padStart(2, '0')}:00`;
});

function nextRRDate(startDate: string, recurrenceMonths: number): Date {
  const start = new Date(startDate);
  const now = new Date();
  let candidate = new Date(start);
  while (candidate <= now) {
    candidate = new Date(candidate);
    candidate.setMonth(candidate.getMonth() + recurrenceMonths);
  }
  return candidate;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function daysUntil(d: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function CalendarView({ appState, onNavigateToReview }: Props) {
  const { activities, calendarEvents, rrStartDate, rrRecurrenceMonths, setCalendarEvent, setRREvent } = appState;
  const [activeCell, setActiveCell] = useState<{ day: number; slot: number } | null>(null);
  const [rrPopup, setRRPopup] = useState<{ day: number; slot: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close selectors on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setActiveCell(null);
        setRRPopup(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getEvent = (day: number, slot: number): CalendarEvent | undefined =>
    calendarEvents.find(e => e.dayIndex === day && e.slotIndex === slot);

  const getActivity = (activityId: string | null) =>
    activityId ? activities.find(a => a.id === activityId) : undefined;

  const summary = ([1, 2, 3] as const).map(b => {
    const count = calendarEvents.filter(e => {
      if (e.kind === 'rr') return false;
      return getActivity(e.activityId)?.bucket === b;
    }).length;
    return { bucket: b, hours: count * HOURS_PER_SLOT };
  });
  const totalHours = summary.reduce((acc, s) => acc + s.hours, 0);

  const nextRR = nextRRDate(rrStartDate, rrRecurrenceMonths);
  const daysLeft = daysUntil(nextRR);

  return (
    <div className="px-4 py-6 md:px-6 max-w-6xl mx-auto w-full">
      {/* Summary row */}
      <div className="mb-6 flex gap-3 flex-wrap items-center">
        {summary.map(({ bucket, hours }) => {
          const cfg = BUCKET_CONFIG[bucket];
          const pct = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
          return (
            <div key={bucket} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${cfg.borderClass} ${cfg.bgClass}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`} />
              <span className="text-sm font-medium dark:text-gray-100">{cfg.label}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{hours}h · {pct}%</span>
            </div>
          );
        })}
        {totalHours === 0 && <div className="text-sm text-gray-400">Nessuno slot pianificato</div>}

        {/* R&R next date chip */}
        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <span>⟳</span>
          <span>
            Prossimo R&R: <strong className="text-gray-700 dark:text-gray-200">{formatDate(nextRR)}</strong>
            <span className="ml-1 text-gray-400">({daysLeft === 0 ? 'oggi' : `fra ${daysLeft}g`})</span>
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto overscroll-x-contain -mx-4 px-4 md:mx-0 md:px-0" ref={popupRef}>
        <div className="grid min-w-[520px]" style={{ gridTemplateColumns: `48px repeat(7, 1fr)` }}>
          {/* Header */}
          <div />
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 px-0.5">{d}</div>
          ))}

          {/* Rows */}
          {Array.from({ length: SLOTS_PER_DAY }, (_, slot) => (
            <>
              <div key={`label-${slot}`} className="text-xs text-gray-400 flex items-center justify-end pr-1 py-1 leading-tight">
                {SLOT_LABELS[slot]}
              </div>
              {Array.from({ length: 7 }, (_, day) => {
                const event = getEvent(day, slot);
                const isRR = event?.kind === 'rr';
                const activity = event ? getActivity(event.activityId) : undefined;
                const cfg = activity ? BUCKET_CONFIG[activity.bucket] : null;
                const isCellActive = activeCell?.day === day && activeCell?.slot === slot;
                const isRRPopupOpen = rrPopup?.day === day && rrPopup?.slot === slot;

                return (
                  <div key={`${day}-${slot}`} className="relative p-0.5">
                    <button
                      onClick={() => {
                        if (isRR) {
                          setRRPopup(isRRPopupOpen ? null : { day, slot });
                          setActiveCell(null);
                          return;
                        }
                        setActiveCell(isCellActive ? null : { day, slot });
                        setRRPopup(null);
                      }}
                      className={`w-full h-10 md:h-12 rounded text-xs font-medium transition-colors border
                        ${isRR
                          ? 'border-dashed border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          : cfg
                            ? `${cfg.cellClass} border-transparent`
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {isRR ? '⟳ R&R' : activity?.name ?? ''}
                    </button>

                    {/* R&R popup (remove / go to review) */}
                    {isRRPopupOpen && (
                      <div className="absolute left-0 top-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg min-w-[160px] mt-1">
                        <button
                          onClick={() => { onNavigateToReview(); setRRPopup(null); }}
                          className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                        >→ Vai alla revisione</button>
                        <button
                          onClick={() => { setRREvent(day, slot, false); setRRPopup(null); }}
                          className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-500 border-t border-gray-100 dark:border-gray-700"
                        >✕ Rimuovi</button>
                      </div>
                    )}

                    {/* Activity selector */}
                    {isCellActive && (
                      <div className="absolute left-0 top-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg min-w-[160px] mt-1">
                        <button
                          onClick={() => { setCalendarEvent(day, slot, null); setActiveCell(null); }}
                          className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700"
                        >— Svuota</button>
                        {/* R&R option */}
                        <button
                          onClick={() => { setRREvent(day, slot, true); setActiveCell(null); }}
                          className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 italic"
                        >⟳ R&R</button>
                        {([1, 2, 3] as const).map(b => {
                          const bActs = activities.filter(a => a.bucket === b);
                          if (!bActs.length) return null;
                          return (
                            <div key={b}>
                              <div className="text-xs font-semibold px-3 py-1 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900">
                                {BUCKET_CONFIG[b].label}
                              </div>
                              {bActs.map(a => (
                                <button
                                  key={a.id}
                                  onClick={() => { setCalendarEvent(day, slot, a.id); setActiveCell(null); }}
                                  className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                                >{a.name}</button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
