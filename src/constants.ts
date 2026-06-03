export const SLOTS_PER_DAY = 6; // ~2h slots, easy to change
export const HOURS_PER_SLOT = 2;
export const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const BUCKET_CONFIG = {
  1: {
    label: 'Money maker',
    description: "L'unica skill che può pagare le bollette nei prossimi 1–3 anni. ~80% dell'energia.",
    color: 'indigo',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    cellClass: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    headerClass: 'bg-indigo-600 text-white',
    dotClass: 'bg-indigo-500',
  },
  2: {
    label: 'Soul stuff',
    description: 'Hobby che fanno stare bene. Da non monetizzare.',
    color: 'rose',
    bgClass: 'bg-rose-50 dark:bg-rose-950',
    borderClass: 'border-rose-200 dark:border-rose-800',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
    cellClass: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200',
    headerClass: 'bg-rose-500 text-white',
    dotClass: 'bg-rose-400',
  },
  3: {
    label: 'Curiosity shelf',
    description: "Tutto il resto. Non ora, non mai.",
    color: 'stone',
    bgClass: 'bg-stone-50 dark:bg-stone-900',
    borderClass: 'border-stone-200 dark:border-stone-700',
    badgeClass: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
    cellClass: 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200',
    headerClass: 'bg-stone-500 text-white',
    dotClass: 'bg-stone-400',
  },
} as const;
