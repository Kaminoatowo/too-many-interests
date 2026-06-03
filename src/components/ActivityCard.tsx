import { useState, useRef, useEffect } from 'react';
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
  const menuRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: { activity },
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showMenu]);

  const commitRename = () => {
    if (draft.trim()) onRename(activity.id, draft.trim());
    else setDraft(activity.name);
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-2.5 rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${isDragging ? 'opacity-40' : ''}`}
    >
      {/* Drag handle — solo questo elemento attiva il drag */}
      <span
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 select-none px-1 touch-none flex-shrink-0"
        aria-label="Trascina per spostare"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4.5" cy="3" r="1.2" />
          <circle cx="9.5" cy="3" r="1.2" />
          <circle cx="4.5" cy="7" r="1.2" />
          <circle cx="9.5" cy="7" r="1.2" />
          <circle cx="4.5" cy="11" r="1.2" />
          <circle cx="9.5" cy="11" r="1.2" />
        </svg>
      </span>

      {/* Nome */}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') { setDraft(activity.name); setEditing(false); }
          }}
          className="flex-1 text-sm border-b border-indigo-400 outline-none bg-transparent dark:text-white"
        />
      ) : (
        <span className="flex-1 text-sm dark:text-gray-100 select-none">{activity.name}</span>
      )}

      {/* Settings button + menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setShowMenu(v => !v)}
          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Opzioni"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="3" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[170px] overflow-hidden">
            {/* Rinomina */}
            <button
              onClick={() => { setDraft(activity.name); setEditing(true); setShowMenu(false); }}
              className="flex items-center gap-2 w-full text-left text-sm px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 10.5l1.5-1.5 6-6 1.5 1.5-6 6L2 10.5z" />
                <path d="M8 3l2 2" />
              </svg>
              Rinomina
            </button>

            {/* Separatore + sposta */}
            <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-1.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">Sposta in</span>
            </div>
            {([1, 2, 3] as BucketId[]).filter(b => b !== activity.bucket).map(b => {
              const cfg = BUCKET_CONFIG[b];
              return (
                <button
                  key={b}
                  onClick={() => { onMove(activity.id, b); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full text-left text-sm px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
                  {cfg.label}
                </button>
              );
            })}

            {/* Elimina */}
            <div className="border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => { onRemove(activity.id); setShowMenu(false); }}
                className="flex items-center gap-2 w-full text-left text-sm px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7" />
                </svg>
                Elimina
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
