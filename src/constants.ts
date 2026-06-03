export const SLOTS_PER_DAY = 6; // ~2h slots, easy to change
export const HOURS_PER_SLOT = 2;
export const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const BUCKET_CONFIG = {
  1: {
    label: 'Money maker',
    description: "L'unica skill che può pagare le bollette nei prossimi 1–3 anni. ~80% dell'energia.",
    color: 'teal',
    bgClass: 'bg-teal-50 dark:bg-teal-950',
    borderClass: 'border-teal-300 dark:border-teal-700',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    cellClass: 'bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100',
    headerClass: 'bg-teal-500 text-white',
    dotClass: 'bg-teal-500',
  },
  2: {
    label: 'Soul stuff',
    description: 'Hobby che fanno stare bene. Da non monetizzare.',
    color: 'coral',
    bgClass: 'bg-orange-50 dark:bg-orange-950',
    borderClass: 'border-orange-300 dark:border-orange-700',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    cellClass: 'bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100',
    headerClass: 'bg-orange-500 text-white',
    dotClass: 'bg-orange-500',
  },
  3: {
    label: 'Curiosity shelf',
    description: "Tutto il resto. Non ora, non mai.",
    color: 'gray',
    bgClass: 'bg-gray-50 dark:bg-gray-900',
    borderClass: 'border-gray-300 dark:border-gray-700',
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    cellClass: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    headerClass: 'bg-gray-500 text-white',
    dotClass: 'bg-gray-500',
  },
} as const;
