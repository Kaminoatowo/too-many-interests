import { useState, useRef } from 'react';
import { useAppState } from './hooks/useAppState';
import { BucketView } from './views/BucketView';
import { CalendarView } from './views/CalendarView';
import { ReviewView } from './views/ReviewView';
import { load, save } from './storage';
import type { AppState } from './storage';

type Tab = 'bucket' | 'calendar' | 'review';

function isValidAppState(obj: unknown): obj is AppState {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  return (
    Array.isArray(s.activities) &&
    Array.isArray(s.calendarEvents) &&
    Array.isArray(s.reviewNotes) &&
    typeof s.rrStartDate === 'string' &&
    typeof s.rrRecurrenceMonths === 'number'
  );
}

export default function App() {
  const appState = useAppState();
  const [tab, setTab] = useState<Tab>('bucket');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'bucket', label: 'Bucket' },
    { id: 'calendar', label: 'Calendario' },
    { id: 'review', label: 'Revisione' },
  ];

  const handleExport = () => {
    const state = load();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bucket-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!isValidAppState(parsed)) throw new Error('Formato non valido');
        save(parsed);
        window.location.reload();
      } catch {
        setImportError('File non valido. Assicurati di usare un backup esportato da questa app.');
        setTimeout(() => setImportError(null), 4000);
      }
    };
    reader.readAsText(file);
    // reset input so the same file can be re-imported
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight">Bucket</h1>
          <nav className="flex gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${tab === t.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >{t.label}</button>
            ))}
          </nav>

          {/* Export / Import */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleExport}
              title="Esporta dati come JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6.5 1v8M3.5 6l3 3 3-3" />
                <path d="M1.5 10.5v1h10v-1" />
              </svg>
              Esporta
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Importa dati da JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6.5 9V1M3.5 4l3-3 3 3" />
                <path d="M1.5 10.5v1h10v-1" />
              </svg>
              Importa
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* Import error toast */}
      {importError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-red-600 text-white text-sm rounded-lg shadow-lg">
          {importError}
        </div>
      )}

      <main>
        {tab === 'bucket' && <BucketView appState={appState} />}
        {tab === 'calendar' && <CalendarView appState={appState} onNavigateToReview={() => setTab('review')} />}
        {tab === 'review' && <ReviewView appState={appState} />}
      </main>
    </div>
  );
}
