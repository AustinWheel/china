import { Event } from './types';

export function encodeEventsToURL(events: Event[]): string {
  try {
    const encoded = encodeURIComponent(JSON.stringify(events));
    return encoded;
  } catch {
    return '';
  }
}

export function decodeEventsFromURL(encoded: string): Event[] {
  try {
    const decoded = JSON.parse(decodeURIComponent(encoded));
    if (Array.isArray(decoded)) {
      return decoded;
    }
  } catch {
    // Invalid URL data
  }
  return [];
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[date.getDay()];
  return `${month}/${day} ${dayName}`;
}

export function getCityForDate(date: string): string {
  const cities = [
    { start: '2025-07-05', end: '2025-07-05', name: 'Shenzhen' },
    { start: '2025-07-06', end: '2025-07-07', name: 'Guangzhou' },
    { start: '2025-07-08', end: '2025-07-10', name: 'Guilin' },
    { start: '2025-07-11', end: '2025-07-14', name: 'Guizhou' },
    { start: '2025-07-15', end: '2025-07-17', name: 'Chongqing' },
    { start: '2025-07-18', end: '2025-07-19', name: 'Hangzhou' },
    { start: '2025-07-20', end: '2025-07-21', name: 'Shanghai' }
  ];
  
  for (const city of cities) {
    if (date >= city.start && date <= city.end) {
      return city.name;
    }
  }
  return 'Unknown';
}

export function getCityColor(city: string): string {
  const colors: Record<string, string> = {
    'Shenzhen': 'bg-purple-100 text-purple-800',
    'Guangzhou': 'bg-emerald-100 text-emerald-800',
    'Guilin': 'bg-teal-100 text-teal-800',
    'Guizhou': 'bg-rose-100 text-rose-800',
    'Chongqing': 'bg-orange-100 text-orange-800',
    'Hangzhou': 'bg-sky-100 text-sky-800',
    'Shanghai': 'bg-violet-100 text-violet-800'
  };
  return colors[city] || 'bg-gray-100 text-gray-800';
}