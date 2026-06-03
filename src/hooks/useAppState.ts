import { useState, useCallback } from 'react';
import { load, save } from '../storage';
import type { AppState, Activity, BucketId, CalendarEvent, ReviewNote } from '../storage';
import { SLOTS_PER_DAY, DAYS } from '../constants';

export function useAppState() {
  const [state, setState] = useState<AppState>(load);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const addActivity = useCallback((name: string) => {
    const activity: Activity = { id: crypto.randomUUID(), name, bucket: 3 };
    update(s => ({ ...s, activities: [...s.activities, activity] }));
  }, [update]);

  const removeActivity = useCallback((id: string) => {
    update(s => ({
      ...s,
      activities: s.activities.filter(a => a.id !== id),
      calendarEvents: s.calendarEvents.map(e => e.activityId === id ? { ...e, activityId: null } : e),
    }));
  }, [update]);

  const renameActivity = useCallback((id: string, name: string) => {
    update(s => ({ ...s, activities: s.activities.map(a => a.id === id ? { ...a, name } : a) }));
  }, [update]);

  const moveActivity = useCallback((id: string, bucket: BucketId) => {
    update(s => ({ ...s, activities: s.activities.map(a => a.id === id ? { ...a, bucket } : a) }));
  }, [update]);

  const setCalendarEvent = useCallback((dayIndex: number, slotIndex: number, activityId: string | null) => {
    update(s => {
      const existing = s.calendarEvents.find(e => e.dayIndex === dayIndex && e.slotIndex === slotIndex && e.kind === 'activity');
      if (existing) {
        if (activityId === null) {
          return { ...s, calendarEvents: s.calendarEvents.filter(e => e !== existing) };
        }
        return { ...s, calendarEvents: s.calendarEvents.map(e => e === existing ? { ...e, activityId } : e) };
      }
      if (activityId === null) return s;
      const event: CalendarEvent = { id: crypto.randomUUID(), dayIndex, slotIndex, activityId, kind: 'activity' };
      return { ...s, calendarEvents: [...s.calendarEvents, event] };
    });
  }, [update]);

  const setRREvent = useCallback((dayIndex: number, slotIndex: number, place: boolean) => {
    update(s => {
      const existing = s.calendarEvents.find(e => e.dayIndex === dayIndex && e.slotIndex === slotIndex);
      if (!place) {
        return { ...s, calendarEvents: s.calendarEvents.filter(e => !(e.dayIndex === dayIndex && e.slotIndex === slotIndex)) };
      }
      if (existing) {
        // replace whatever is there with an R&R event
        return {
          ...s,
          calendarEvents: s.calendarEvents.map(e =>
            e.dayIndex === dayIndex && e.slotIndex === slotIndex
              ? { ...e, kind: 'rr' as const, activityId: null, label: 'R&R' }
              : e
          ),
        };
      }
      const event: CalendarEvent = { id: crypto.randomUUID(), dayIndex, slotIndex, activityId: null, kind: 'rr', label: 'R&R' };
      return { ...s, calendarEvents: [...s.calendarEvents, event] };
    });
  }, [update]);

  const addReviewNote = useCallback((body: string) => {
    const note: ReviewNote = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), body };
    update(s => ({ ...s, reviewNotes: [note, ...s.reviewNotes] }));
  }, [update]);

  const updateReviewNote = useCallback((id: string, body: string) => {
    update(s => ({ ...s, reviewNotes: s.reviewNotes.map(n => n.id === id ? { ...n, body } : n) }));
  }, [update]);

  const removeReviewNote = useCallback((id: string) => {
    update(s => ({ ...s, reviewNotes: s.reviewNotes.filter(n => n.id !== id) }));
  }, [update]);

  const updateRR = useCallback((rrStartDate: string, rrRecurrenceMonths: number) => {
    update(s => ({ ...s, rrStartDate, rrRecurrenceMonths }));
  }, [update]);

  // Suppress unused import warnings
  void SLOTS_PER_DAY;
  void DAYS;

  return {
    ...state,
    addActivity,
    removeActivity,
    renameActivity,
    moveActivity,
    setCalendarEvent,
    setRREvent,
    addReviewNote,
    updateReviewNote,
    removeReviewNote,
    updateRR,
  };
}
