import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { Activity, BucketId } from '../storage';
import { BucketColumn } from '../components/BucketColumn';
import { ActivityCard } from '../components/ActivityCard';
import { useAppState } from '../hooks/useAppState';

interface Props {
  appState: ReturnType<typeof useAppState>;
}

export function BucketView({ appState }: Props) {
  const { activities, addActivity, removeActivity, renameActivity, moveActivity } = appState;
  const [input, setInput] = useState('');
  const [draggingActivity, setDraggingActivity] = useState<Activity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const handleAdd = () => {
    const name = input.trim();
    if (!name) return;
    addActivity(name);
    setInput('');
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activity = activities.find(a => a.id === event.active.id);
    setDraggingActivity(activity ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingActivity(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith('bucket-')) return;
    const bucket = parseInt(overId.replace('bucket-', '')) as BucketId;
    moveActivity(String(active.id), bucket);
  };

  return (
    <div className="px-4 py-6 md:px-6 max-w-6xl mx-auto w-full">
      <div className="mb-6 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Aggiungi un'attività... (invio per confermare)"
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >Aggiungi</button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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

        <DragOverlay dropAnimation={null}>
          {draggingActivity && (
            <div className="rotate-1 shadow-xl opacity-95">
              <ActivityCard
                activity={draggingActivity}
                onRename={() => {}}
                onRemove={() => {}}
                onMove={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
