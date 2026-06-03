import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Activity, BucketId } from '../storage';
import { BUCKET_CONFIG } from '../constants';

interface Props {
  activity: Activity;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, bucket: BucketId) => void;
}

export function ActivityCard({ activity, onRename, onRemove, onMove }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(activity.name);
  const [showMenu, setShowMenu] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: { activity },
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  const commitRename = () => {
    if (draft.trim()) onRename(activity.id, draft.trim());
    else setDraft(activity.name);
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 group ${isDragging ? 'opacity-40' : ''}`}
    >
      <span
        {...listeners}
        {...attributes}
        className="cursor-grab text-gray-400 select-none px-1"
        title="Drag to move"
      >⠿</span>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setDraft(activity.name); setEditing(false); } }}
          className="flex-1 text-sm border-b border-gray-400 outline-none bg-transparent dark:text-white"
        />
      ) : (
        <span
          className="flex-1 text-sm dark:text-gray-100 cursor-default select-none"
          onDoubleClick={() => { setDraft(activity.name); setEditing(true); }}
        >{activity.name}</span>
      )}

      <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => { setDraft(activity.name); setEditing(true); }} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1">✎</button>
        <button onClick={() => setShowMenu(v => !v)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1">↕</button>
        <button onClick={() => onRemove(activity.id)} className="text-xs text-gray-400 hover:text-red-500 px-1">✕</button>

        {showMenu && (
          <div className="absolute right-0 top-6 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-md min-w-[140px]">
            {([1, 2, 3] as BucketId[]).filter(b => b !== activity.bucket).map(b => (
              <button
                key={b}
                onClick={() => { onMove(activity.id, b); setShowMenu(false); }}
                className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                → {BUCKET_CONFIG[b].label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
