'use client';

import { Event, CITIES, SCHEDULE, EventType } from '../types';
import { formatTime, formatDate } from '../utils';

interface CalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function Calendar({ events, onEventClick }: CalendarProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dates = Object.keys(SCHEDULE).sort();

  const getEventsForDateTime = (date: string, hour: number) => {
    return events.filter(event => {
      const eventHour = parseInt(event.time.split(':')[0]);
      return event.date === date && eventHour === hour;
    });
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'food': return '🍜';
      case 'activity': return '🎯';
      case 'transport': return '✈️';
      case 'accommodation': return '🏨';
      default: return '📌';
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Header with hours */}
        <div className="flex sticky top-0 bg-white z-10 border-b-2 border-gray-300">
          <div className="w-24 flex-shrink-0 p-2 font-bold bg-gray-100"></div>
          {hours.map(hour => (
            <div key={hour} className="flex-1 p-2 text-center text-sm font-medium border-l border-gray-200">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}
        </div>

        {/* Days and events */}
        {dates.map(date => {
          const city = SCHEDULE[date];
          const cityColor = CITIES[city]?.color || '#6b7280';
          
          return (
            <div key={date} className="flex border-b border-gray-200 hover:bg-gray-50">
              {/* Date cell */}
              <div 
                className="w-24 flex-shrink-0 p-3 font-medium text-white sticky left-0 z-10"
                style={{ backgroundColor: cityColor }}
              >
                <div className="text-sm">{formatDate(date)}</div>
                <div className="text-xs opacity-90">{city}</div>
              </div>
              
              {/* Hour cells */}
              {hours.map(hour => {
                const hourEvents = getEventsForDateTime(date, hour);
                
                return (
                  <div 
                    key={`${date}-${hour}`} 
                    className="flex-1 p-1 border-l border-gray-200 min-h-[60px] relative"
                  >
                    {hourEvents.map((event, idx) => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className="absolute left-1 right-1 p-1 rounded text-xs cursor-pointer hover:shadow-md transition-shadow"
                        style={{
                          top: `${idx * 25}px`,
                          backgroundColor: getEventBackgroundColor(event.type),
                          border: `1px solid ${getEventBorderColor(event.type)}`
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>{getEventTypeIcon(event.type)}</span>
                          <span className="font-medium truncate">{event.title}</span>
                          <span className="text-[10px] opacity-75">{formatTime(event.time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getEventBackgroundColor(type: EventType): string {
  switch (type) {
    case 'food': return '#fef3c7';
    case 'activity': return '#dbeafe';
    case 'transport': return '#e0e7ff';
    case 'accommodation': return '#fce7f3';
    default: return '#f3f4f6';
  }
}

function getEventBorderColor(type: EventType): string {
  switch (type) {
    case 'food': return '#f59e0b';
    case 'activity': return '#3b82f6';
    case 'transport': return '#6366f1';
    case 'accommodation': return '#ec4899';
    default: return '#9ca3af';
  }
}