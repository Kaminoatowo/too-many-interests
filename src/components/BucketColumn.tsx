import { useDroppable } from '@dnd-kit/core';
import type { Activity, BucketId } from '../storage';
import { BUCKET_CONFIG } from '../constants';
import { ActivityCard } from './ActivityCard';

interface Props {
  bucketId: BucketId;
  activities: Activity[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, bucket: BucketId) => void;
}

export function BucketColumn({ bucketId, activities, onRename, onRemove, onMove }: Props) {
  const cfg = BUCKET_CONFIG[bucketId];
  const { setNodeRef, isOver } = useDroppable({ id: `bucket-${bucketId}` });

  return (
    <div className={`flex flex-col rounded-lg border ${cfg.borderClass} ${cfg.bgClass} overflow-hidden`}>
      <div className={`px-4 py-3 ${cfg.headerClass}`}>
        <div className="font-semibold text-sm">{bucketId}. {cfg.label}</div>
        <div className="text-xs opacity-80 mt-0.5">{cfg.description}</div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 flex flex-col gap-2 min-h-32 transition-colors ${isOver ? 'bg-black/5 dark:bg-white/5' : ''}`}
      >
        {activities.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-4">Nessuna attività</div>
        )}
        {activities.map(a => (
          <ActivityCard key={a.id} activity={a} onRename={onRename} onRemove={onRemove} onMove={onMove} />
        ))}
      </div>
    </div>
  );
}
