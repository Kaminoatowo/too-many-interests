import { useState } from 'react';
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

export function CalendarView({ appState, onNavigateToReview }: Props) {
  const { activities, calendarEvents, setCalendarEvent } = appState;
  const [activeCell, setActiveCell] = useState<{ day: number; slot: number } | null>(null);

  const getEvent = (day: number, slot: number): CalendarEvent | undefined =>
    calendarEvents.find(e => e.dayIndex === day && e.slotIndex === slot);

  const getActivity = (activityId: string | null) =>
    activityId ? activities.find(a => a.id === activityId) : undefined;

  // Summary: hours per bucket
  const summary = [1, 2, 3].map(b => {
    const count = calendarEvents.filter(e => {
      if (e.kind === 'rr') return false;
      const act = getActivity(e.activityId);
      return act?.bucket === b;
    }).length;
    return { bucket: b, hours: count * HOURS_PER_SLOT };
  });
  const totalHours = summary.reduce((acc, s) => acc + s.hours, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Summary */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {summary.map(({ bucket, hours }) => {
          const cfg = BUCKET_CONFIG[bucket as 1 | 2 | 3];
          const pct = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
          return (
            <div key={bucket} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${cfg.borderClass} ${cfg.bgClass}`}>
              <span className={`w-3 h-3 rounded-full ${cfg.dotClass}`} />
              <span className="text-sm font-medium dark:text-gray-100">{cfg.label}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{hours}h · {pct}%</span>
            </div>
          );
        })}
        {totalHours === 0 && <div className="text-sm text-gray-400">Nessuno slot pianificato</div>}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[600px]" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
          {/* Header */}
          <div />
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">{d}</div>
          ))}

          {/* Rows */}
          {Array.from({ length: SLOTS_PER_DAY }, (_, slot) => (
            <>
              <div key={`label-${slot}`} className="text-xs text-gray-400 flex items-center justify-end pr-2 py-1">
                {SLOT_LABELS[slot]}
              </div>
              {Array.from({ length: 7 }, (_, day) => {
                const event = getEvent(day, slot);
                const isRR = event?.kind === 'rr';
                const activity = event ? getActivity(event.activityId) : undefined;
                const cfg = activity ? BUCKET_CONFIG[activity.bucket] : null;
                const isActive = activeCell?.day === day && activeCell?.slot === slot;

                return (
                  <div key={`${day}-${slot}`} className="relative p-0.5">
                    <button
                      onClick={() => {
                        if (isRR) { onNavigateToReview(); return; }
                        setActiveCell(isActive ? null : { day, slot });
                      }}
                      className={`w-full h-12 rounded text-xs font-medium transition-colors border
                        ${isRR
                          ? 'border-dashed border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          : cfg
                            ? `${cfg.cellClass} border-transparent`
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {isRR ? '⟳ R&R' : activity?.name ?? ''}
                    </button>

                    {/* Inline selector */}
                    {isActive && (
                      <div className="absolute left-0 top-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg min-w-[160px] mt-1">
                        <button
                          onClick={() => { setCalendarEvent(day, slot, null); setActiveCell(null); }}
                          className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700"
                        >— Svuota</button>
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
