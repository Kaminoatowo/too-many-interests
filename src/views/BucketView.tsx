import { useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { BucketId } from '../storage';
import { BucketColumn } from '../components/BucketColumn';
import { useAppState } from '../hooks/useAppState';

interface Props {
  appState: ReturnType<typeof useAppState>;
}

export function BucketView({ appState }: Props) {
  const { activities, addActivity, removeActivity, renameActivity, moveActivity } = appState;
  const [input, setInput] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleAdd = () => {
    const name = input.trim();
    if (!name) return;
    addActivity(name);
    setInput('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith('bucket-')) return;
    const bucket = parseInt(overId.replace('bucket-', '')) as BucketId;
    moveActivity(String(active.id), bucket);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Aggiungi un'attività... (invio per confermare)"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
        >Aggiungi</button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([1, 2, 3] as BucketId[]).map(b => (
            <BucketColumn
              key={b}
              bucketId={b}
              activities={activities.filter(a => a.bucket === b)}
              onRename={renameActivity}
              onRemove={removeActivity}
              onMove={moveActivity}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
