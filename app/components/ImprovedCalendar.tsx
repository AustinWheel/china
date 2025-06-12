'use client';

import { Event, CITIES, SCHEDULE, EventType } from '../types';
import { formatTime, formatDate } from '../utils';
import { mixColors } from '../utils/colorUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';

interface ImprovedCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEventDrop?: (eventId: string, date: string, hour: number) => void;
}

export default function ImprovedCalendar({ events, onEventClick, onEventDrop }: ImprovedCalendarProps) {
  const dates = Object.keys(SCHEDULE).sort();
  
  // Get all unique hours that have events
  const getActiveHours = () => {
    const hoursWithEvents = new Set<number>();
    events.forEach(event => {
      const hour = parseInt(event.time.split(':')[0]);
      hoursWithEvents.add(hour);
    });
    
    // Always show 8AM-11PM, plus any early morning hours with events
    const hours: number[] = [];
    for (let h = 0; h < 24; h++) {
      if ((h >= 8 && h <= 23) || hoursWithEvents.has(h)) {
        hours.push(h);
      }
    }
    return hours.sort((a, b) => a - b);
  };

  const activeHours = getActiveHours();

  const getEventsForDateTime = (date: string, hour: number) => {
    return events.filter(event => {
      const eventHour = parseInt(event.time.split(':')[0]);
      return event.date === date && eventHour === hour && !event.isBuffered;
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

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'food': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'activity': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'transport': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'accommodation': return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card className="w-full h-full overflow-hidden shadow-lg flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col min-h-0 min-w-0">
        <div className="flex-1 overflow-auto relative min-w-0">
          <div className="inline-block min-w-full">
            {/* Header with hours */}
            <div className="flex sticky top-0 bg-white z-20 border-b-2 border-gray-200">
              <div className="w-32 flex-shrink-0 p-3 font-semibold bg-gray-50 border-r-2 border-gray-200 sticky left-0 z-30">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Date / Time</span>
                </div>
              </div>
              {activeHours.map((hour, idx) => (
                <div key={hour} className={cn(
                  "flex-1 min-w-[140px] p-3 text-center text-sm font-medium border-r border-gray-100",
                  idx === activeHours.length - 1 && "pr-6"
                )}>
                  <div className="text-gray-900">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                </div>
              ))}
            </div>

            {/* Days and events */}
            {dates.map((date, dateIdx) => {
              const city = SCHEDULE[date];
              const cityColor = CITIES[city]?.color || '#6b7280';
              const dayEvents = events.filter(e => e.date === date && !e.isBuffered);
              
              return (
                <div 
                  key={date} 
                  className={cn(
                    "flex border-b border-gray-200",
                    dateIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  {/* Date cell */}
                  <div 
                    className="w-32 flex-shrink-0 p-3 sticky left-0 z-10 border-r-2 bg-inherit"
                    style={{ 
                      background: (() => {
                        const baseColor = dateIdx % 2 === 0 ? '#ffffff' : '#fafafa';
                        const lightTintedColor = mixColors(baseColor, cityColor, 0.05);
                        return lightTintedColor
                      })(),
                      borderRightColor: cityColor
                    }}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">{formatDate(date)}</div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" style={{ color: cityColor }} />
                        <span className="text-xs font-medium" style={{ color: cityColor }}>{city}</span>
                      </div>
                      {dayEvents.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Hour cells */}
                  {activeHours.map((hour, idx) => {
                    const hourEvents = getEventsForDateTime(date, hour);
                    
                    return (
                      <div 
                        key={`${date}-${hour}`} 
                        className={cn(
                          "flex-1 min-w-[140px] p-1 border-r border-gray-100 min-h-[80px] relative",
                          idx === activeHours.length - 1 && "pr-4 border-r-0"
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-blue-50');
                          const eventId = e.dataTransfer.getData('eventId');
                          if (eventId && onEventDrop) {
                            onEventDrop(eventId, date, hour);
                          }
                        }}
                      >
                        <div className="space-y-1">
                          {hourEvents.map((event, idx) => (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('eventId', event.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onClick={() => onEventClick?.(event)}
                              className={cn(
                                "p-2 rounded-md text-xs cursor-move transition-all transform hover:scale-105 hover:shadow-md",
                                getEventTypeColor(event.type)
                              )}
                            >
                              <div className="flex items-start gap-1">
                                <span className="text-base">{getEventTypeIcon(event.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate">{event.title}</div>
                                  <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-75">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(event.time)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}