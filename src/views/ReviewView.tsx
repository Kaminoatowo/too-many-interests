import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { BUCKET_CONFIG } from '../constants';

interface Props {
  appState: ReturnType<typeof useAppState>;
}

export function ReviewView({ appState }: Props) {
  const { activities, reviewNotes, rrStartDate, rrRecurrenceMonths, addReviewNote, updateReviewNote, removeReviewNote, updateRR } = appState;
  const [draft, setDraft] = useState('');
  const [editingRR, setEditingRR] = useState(false);
  const [rrDateDraft, setRRDateDraft] = useState(rrStartDate);
  const [rrMonthsDraft, setRRMonthsDraft] = useState(String(rrRecurrenceMonths));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Bucket summary */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Stato attuale dei bucket</h2>
        <div className="flex flex-col gap-2">
          {([1, 2, 3] as const).map(b => {
            const cfg = BUCKET_CONFIG[b];
            const count = activities.filter(a => a.bucket === b).length;
            return (
              <div key={b} className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${cfg.borderClass} ${cfg.bgClass}`}>
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
                <span className="text-sm font-medium dark:text-gray-100">{cfg.label}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{count} attività</span>
                <div className="flex-1 flex flex-wrap gap-1">
                  {activities.filter(a => a.bucket === b).map(a => (
                    <span key={a.id} className={`text-xs px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>{a.name}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* R&R settings */}
      <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Impostazioni R&R</h2>
          <button onClick={() => setEditingRR(v => !v)} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
            {editingRR ? 'Chiudi' : 'Modifica'}
          </button>
        </div>
        {editingRR ? (
          <div className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data di partenza</label>
              <input type="date" value={rrDateDraft} onChange={e => setRRDateDraft(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ricorrenza (mesi)</label>
              <input type="number" min="1" max="12" value={rrMonthsDraft} onChange={e => setRRMonthsDraft(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-20 bg-white dark:bg-gray-800 dark:text-white" />
            </div>
            <button
              onClick={() => { updateRR(rrDateDraft, parseInt(rrMonthsDraft) || 3); setEditingRR(false); }}
              className="px-3 py-1.5 bg-teal-500 text-white rounded text-sm hover:bg-teal-600"
            >Salva</button>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Prossima revisione ogni <strong>{rrRecurrenceMonths} mesi</strong> a partire dal <strong>{rrStartDate}</strong>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Note di revisione</h2>
        <div className="mb-4 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Scrivi una nota di revisione..."
            rows={3}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          />
          <button
            onClick={() => { if (draft.trim()) { addReviewNote(draft.trim()); setDraft(''); } }}
            className="self-end px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600"
          >Aggiungi nota</button>
        </div>

        <div className="flex flex-col gap-3">
          {reviewNotes.length === 0 && <div className="text-sm text-gray-400 text-center py-8">Nessuna nota ancora. Usa questa pagina per riflessioni sui tuoi bucket.</div>}
          {reviewNotes.map(note => (
            <NoteCard key={note.id} note={note} onUpdate={updateReviewNote} onRemove={removeReviewNote} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, onUpdate, onRemove }: {
  note: import('../storage').ReviewNote;
  onUpdate: (id: string, body: string) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);

  const dateStr = new Date(note.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{dateStr}</span>
        <div className="flex gap-2">
          <button onClick={() => { setDraft(note.body); setEditing(v => !v); }} className="text-xs text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">
            {editing ? 'Annulla' : 'Modifica'}
          </button>
          <button onClick={() => onRemove(note.id)} className="text-xs text-gray-400 hover:text-red-500">Elimina</button>
        </div>
      </div>
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-teal-400 resize-none w-full" />
          <button onClick={() => { onUpdate(note.id, draft.trim()); setEditing(false); }}
            className="self-end px-3 py-1 bg-teal-500 text-white rounded text-sm hover:bg-teal-600">Salva</button>
        </div>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.body}</p>
      )}
    </div>
  );
}
