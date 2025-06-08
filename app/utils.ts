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