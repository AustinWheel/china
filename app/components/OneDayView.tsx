'use client';

import { useState, useMemo } from 'react';
import { Event } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime, getCityForDate, getCityColor } from '../utils';

interface OneDayViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEventDrop?: (eventId: string, date: string, hour: number) => void;
}

export default function OneDayView({ events, onEventClick, onEventDrop }: OneDayViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-05'));
  
  // Generate array of hours (8 AM to 11 PM)
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  
  const dateStr = currentDate.toISOString().split('T')[0];
  const city = getCityForDate(dateStr);
  const cityColor = getCityColor(city);
  
  // Filter events for the current day
  const dayEvents = useMemo(() => {
    return events.filter(event => !event.isBuffered && event.date === dateStr);
  }, [events, dateStr]);
  
  // Group events by hour
  const eventsByHour = useMemo(() => {
    const map = new Map<number, Event[]>();
    dayEvents.forEach(event => {
      const hour = parseInt(event.time.split(':')[0]);
      if (!map.has(hour)) {
        map.set(hour, []);
      }
      map.get(hour)!.push(event);
    });
    return map;
  }, [dayEvents]);
  
  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    
    // Ensure we stay within trip bounds
    if (newDate >= new Date('2025-07-05') && newDate <= new Date('2025-07-21')) {
      setCurrentDate(newDate);
    }
  };
  
  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId && onEventDrop) {
      onEventDrop(eventId, dateStr, hour);
    }
  };
  
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return '🍜';
      case 'activity': return '🎯';
      case 'transport': return '✈️';
      case 'accommodation': return '🏨';
      default: return '📌';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Navigation Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateDay(-1)}
          disabled={currentDate <= new Date('2025-07-05')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <div className="font-semibold text-xl">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className="text-sm text-gray-600">
            {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className={cn("text-sm mt-1 px-3 py-1 rounded inline-block", cityColor)}>
            {city}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateDay(1)}
          disabled={currentDate >= new Date('2025-07-21')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[400px]">
          {/* Time slots */}
          {hours.map(hour => {
            const eventsAtHour = eventsByHour.get(hour) || [];
            
            return (
              <div key={hour} className="flex border-b">
                {/* Time label */}
                <div className="w-24 p-3 text-sm text-gray-600 font-medium border-r bg-gray-50">
                  {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                </div>
                
                {/* Events */}
                <div
                  className="flex-1 min-h-[80px] p-2 hover:bg-gray-50"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-blue-50');
                  }}
                  onDrop={(e) => {
                    e.currentTarget.classList.remove('bg-blue-50');
                    handleDrop(e, hour);
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {eventsAtHour.map(event => (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('eventId', event.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "p-3 rounded cursor-pointer hover:shadow-md transition-all",
                          event.type === 'food' && "bg-amber-100 text-amber-800",
                          event.type === 'activity' && "bg-blue-100 text-blue-800",
                          event.type === 'transport' && "bg-indigo-100 text-indigo-800",
                          event.type === 'accommodation' && "bg-pink-100 text-pink-800",
                          event.type === 'other' && "bg-gray-100 text-gray-800"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-sm opacity-75 mt-1">
                              {formatTime(event.time)}
                            </div>
                            {event.description && (
                              <div className="text-xs opacity-60 mt-1 line-clamp-2">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}