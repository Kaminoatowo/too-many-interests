export type BucketId = 1 | 2 | 3;

export interface Activity {
  id: string;
  name: string;
  bucket: BucketId;
}

export interface CalendarEvent {
  id: string;
  dayIndex: number;   // 0 = Monday ... 6 = Sunday
  slotIndex: number;
  activityId: string | null;
  kind: 'activity' | 'rr';
  label?: string;
}

export interface ReviewNote {
  id: string;
  createdAt: string;
  body: string;
}

export interface AppState {
  activities: Activity[];
  calendarEvents: CalendarEvent[];
  reviewNotes: ReviewNote[];
  rrStartDate: string; // ISO date
  rrRecurrenceMonths: number; // default 3
}

const STORAGE_KEY = 'bucket-app-state';

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'a1', name: 'Coding', bucket: 3 },
  { id: 'a2', name: 'Chitarra', bucket: 3 },
  { id: 'a3', name: 'Fotografia', bucket: 3 },
  { id: 'a4', name: 'Podcast', bucket: 3 },
  { id: 'a5', name: 'Digital marketing', bucket: 3 },
];

export function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {}
  return {
    activities: DEFAULT_ACTIVITIES,
    calendarEvents: [],
    reviewNotes: [],
    rrStartDate: new Date().toISOString().split('T')[0],
    rrRecurrenceMonths: 3,
  };
}

export function save(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
