import { useState } from 'react';
import type { ReviewNote } from '../storage';
import { useAppState } from '../hooks/useAppState';
import { BUCKET_CONFIG, HOURS_PER_SLOT } from '../constants';

interface Props {
  appState: ReturnType<typeof useAppState>;
}

function nextRRDate(startDate: string, recurrenceMonths: number): Date {
  const now = new Date();
  let candidate = new Date(startDate);
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

export function ReviewView({ appState }: Props) {
  const {
    activities, calendarEvents, reviewNotes,
    rrStartDate, rrRecurrenceMonths,
    addReviewNote, updateReviewNote, removeReviewNote, updateRR,
  } = appState;

  const [draft, setDraft] = useState('');
  const [editingRR, setEditingRR] = useState(false);
  const [rrDateDraft, setRRDateDraft] = useState(rrStartDate);
  const [rrMonthsDraft, setRRMonthsDraft] = useState(String(rrRecurrenceMonths));

  const nextRR = nextRRDate(rrStartDate, rrRecurrenceMonths);
  const daysLeft = daysUntil(nextRR);

  // Hours per bucket from calendar
  const hoursPerBucket = ([1, 2, 3] as const).map(b => {
    const count = calendarEvents.filter(e => {
      if (e.kind === 'rr') return false;
      const act = activities.find(a => a.id === e.activityId);
      return act?.bucket === b;
    }).length;
    return { bucket: b, hours: count * HOURS_PER_SLOT };
  });
  const totalHours = hoursPerBucket.reduce((acc, s) => acc + s.hours, 0);

  const handleAdd = () => {
    if (!draft.trim()) return;
    addReviewNote(draft.trim());
    setDraft('');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* R&R countdown banner */}
      <div className={`mb-8 flex items-center gap-4 px-5 py-4 rounded-lg border border-dashed
        ${daysLeft <= 7
          ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950'
          : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800'
        }`}>
        <span className="text-2xl select-none">⟳</span>
        <div className="flex-1">
          <div className="text-sm font-medium dark:text-gray-100">
            Prossima sessione R&R: <strong>{formatDate(nextRR)}</strong>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {daysLeft === 0
              ? 'È oggi — tempo di fare una revisione.'
              : daysLeft === 1
                ? 'Domani.'
                : `Fra ${daysLeft} giorni · ricorrenza ogni ${rrRecurrenceMonths} mesi`}
          </div>
        </div>
        <button
          onClick={() => { setEditingRR(v => !v); setRRDateDraft(rrStartDate); setRRMonthsDraft(String(rrRecurrenceMonths)); }}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
        >{editingRR ? 'Annulla' : 'Modifica'}</button>
      </div>

      {/* R&R settings (inline edit) */}
      {editingRR && (
        <div className="mb-8 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-4 flex-wrap items-end">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data di partenza</label>
            <input type="date" value={rrDateDraft} onChange={e => setRRDateDraft(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ricorrenza (mesi)</label>
            <input type="number" min="1" max="24" value={rrMonthsDraft} onChange={e => setRRMonthsDraft(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm w-20 bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <button
            onClick={() => { updateRR(rrDateDraft, parseInt(rrMonthsDraft) || 3); setEditingRR(false); }}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
          >Salva</button>
        </div>
      )}

      {/* Bucket snapshot */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider">
          Stato attuale dei bucket
        </h2>
        <div className="flex flex-col gap-2">
          {([1, 2, 3] as const).map(b => {
            const cfg = BUCKET_CONFIG[b];
            const actList = activities.filter(a => a.bucket === b);
            const { hours } = hoursPerBucket.find(h => h.bucket === b)!;
            const pct = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
            return (
              <div key={b} className={`rounded-lg border ${cfg.borderClass} ${cfg.bgClass} px-4 py-3`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
                  <span className="text-sm font-medium dark:text-gray-100">{cfg.label}</span>
                  <span className="text-xs text-gray-400 ml-auto">{actList.length} attività · {hours}h/sett · {pct}%</span>
                </div>
                {actList.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {actList.map(a => (
                      <span key={a.id} className={`text-xs px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>{a.name}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">Nessuna attività</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider">
          Note di revisione
        </h2>

        <div className="mb-6">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
            placeholder="Cosa cambi? Cosa tieni? Scrivi qui… (⌘/Ctrl+Invio per salvare)"
            rows={4}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAdd}
              disabled={!draft.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Aggiungi nota</button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {reviewNotes.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              Nessuna nota ancora.<br />
              <span className="text-xs">Usa questa pagina per riflettere sui bucket e pianificare i prossimi mesi.</span>
            </div>
          )}
          {reviewNotes.map(note => (
            <NoteCard key={note.id} note={note} onUpdate={updateReviewNote} onRemove={removeReviewNote} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, onUpdate, onRemove }: {
  note: ReviewNote;
  onUpdate: (id: string, body: string) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);

  const dateStr = new Date(note.createdAt).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const commit = () => {
    if (draft.trim()) onUpdate(note.id, draft.trim());
    else setDraft(note.body);
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <span className="text-xs text-gray-400">{dateStr}</span>
        <div className="flex gap-3">
          {editing ? (
            <>
              <button onClick={commit} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Salva</button>
              <button onClick={() => { setDraft(note.body); setEditing(false); }} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Annulla</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Modifica</button>
              <button onClick={() => onRemove(note.id)} className="text-xs text-gray-400 hover:text-red-500">Elimina</button>
            </>
          )}
        </div>
      </div>
      <div className="px-4 py-3">
        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commit(); if (e.key === 'Escape') { setDraft(note.body); setEditing(false); } }}
            rows={4}
            className="w-full text-sm bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{note.body}</p>
        )}
      </div>
    </div>
  );
}
