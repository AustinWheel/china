export type EventType = 'food' | 'activity' | 'transport' | 'accommodation' | 'other';

export interface Event {
  id: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:MM (24hr)
  type: EventType;
  title: string;
  description?: string;
}

export interface City {
  name: string;
  color: string;
}

export const CITIES: Record<string, City> = {
  'Shenzhen': { name: 'Shenzhen', color: '#dc2626' }, // red-600
  'Guangzhou': { name: 'Guangzhou', color: '#ea580c' }, // orange-600
  'Guilin': { name: 'Guilin', color: '#16a34a' }, // green-600
  'Guizhou': { name: 'Guizhou', color: '#0891b2' }, // cyan-600
  'Chongqing': { name: 'Chongqing', color: '#7c3aed' }, // violet-600
  'Hangzhou': { name: 'Hangzhou', color: '#c026d3' }, // fuchsia-600
  'Shanghai': { name: 'Shanghai', color: '#0284c7' }, // sky-600
};

export const SCHEDULE: Record<string, string> = {
  '2025-07-05': 'Shenzhen',
  '2025-07-06': 'Guangzhou',
  '2025-07-07': 'Guangzhou',
  '2025-07-08': 'Guilin',
  '2025-07-09': 'Guilin',
  '2025-07-10': 'Guilin',
  '2025-07-11': 'Guizhou',
  '2025-07-12': 'Guizhou',
  '2025-07-13': 'Guizhou',
  '2025-07-14': 'Guizhou',
  '2025-07-15': 'Chongqing',
  '2025-07-16': 'Chongqing',
  '2025-07-17': 'Chongqing',
  '2025-07-18': 'Hangzhou',
  '2025-07-19': 'Hangzhou',
  '2025-07-20': 'Shanghai',
  '2025-07-21': 'Shanghai',
};

export const HARDCODED_EVENTS: Event[] = [
  {
    id: 'hc-1',
    date: '2025-07-05',
    time: '14:00',
    type: 'transport',
    title: 'Arrive in Shenzhen',
    description: 'Flight arrival'
  },
  {
    id: 'hc-2',
    date: '2025-07-06',
    time: '09:00',
    type: 'transport',
    title: 'Train to Guangzhou',
    description: 'High-speed rail'
  },
  {
    id: 'hc-3',
    date: '2025-07-08',
    time: '10:00',
    type: 'activity',
    title: 'Li River Cruise',
    description: 'Scenic boat tour'
  },
  {
    id: 'hc-4',
    date: '2025-07-15',
    time: '19:00',
    type: 'food',
    title: 'Chongqing Hot Pot',
    description: 'Famous spicy hot pot dinner'
  },
  {
    id: 'hc-5',
    date: '2025-07-20',
    time: '20:00',
    type: 'activity',
    title: 'The Bund Night View',
    description: 'Shanghai skyline viewing'
  }
];