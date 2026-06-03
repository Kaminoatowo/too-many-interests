import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { BucketView } from './views/BucketView';
import { CalendarView } from './views/CalendarView';
import { ReviewView } from './views/ReviewView';

type Tab = 'bucket' | 'calendar' | 'review';

export default function App() {
  const appState = useAppState();
  const [tab, setTab] = useState<Tab>('bucket');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'bucket', label: 'Bucket' },
    { id: 'calendar', label: 'Calendario' },
    { id: 'review', label: 'Revisione' },
  ];

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
                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >{t.label}</button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {tab === 'bucket' && <BucketView appState={appState} />}
        {tab === 'calendar' && <CalendarView appState={appState} onNavigateToReview={() => setTab('review')} />}
        {tab === 'review' && <ReviewView appState={appState} />}
      </main>
    </div>
  );
}
