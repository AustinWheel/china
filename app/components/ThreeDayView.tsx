'use client';

import { useState, useMemo } from 'react';
import { Event } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime, getCityForDate, getCityColor } from '../utils';

interface ThreeDayViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEventDrop?: (eventId: string, date: string, hour: number) => void;
}

export default function ThreeDayView({ events, onEventClick, onEventDrop }: ThreeDayViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-05'));
  
  // Generate array of hours (8 AM to 11 PM)
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  
  // Get three consecutive days starting from currentDate
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      result.push(date);
    }
    return result;
  }, [currentDate]);
  
  // Filter events for the visible days
  const visibleEvents = useMemo(() => {
    const dateStrings = days.map(d => d.toISOString().split('T')[0]);
    return events.filter(event => !event.isBuffered && dateStrings.includes(event.date));
  }, [events, days]);
  
  // Group events by date and hour
  const eventsByDateAndHour = useMemo(() => {
    const map = new Map<string, Event[]>();
    visibleEvents.forEach(event => {
      const hour = parseInt(event.time.split(':')[0]);
      const key = `${event.date}-${hour}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(event);
    });
    return map;
  }, [visibleEvents]);
  
  const navigateDays = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    
    // Ensure we stay within trip bounds
    if (newDate >= new Date('2025-07-05') && newDate <= new Date('2025-07-19')) {
      setCurrentDate(newDate);
    }
  };
  
  const handleDrop = (e: React.DragEvent, date: string, hour: number) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId && onEventDrop) {
      onEventDrop(eventId, date, hour);
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
          onClick={() => navigateDays(-1)}
          disabled={currentDate <= new Date('2025-07-05')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-4">
          {days.map((day, index) => {
            const dateStr = day.toISOString().split('T')[0];
            const city = getCityForDate(dateStr);
            const cityColor = getCityColor(city);
            
            return (
              <div key={index} className="text-center">
                <div className="font-semibold text-lg">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm text-gray-600">
                  {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className={cn("text-xs mt-1 px-2 py-0.5 rounded", cityColor)}>
                  {city}
                </div>
              </div>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateDays(1)}
          disabled={currentDate >= new Date('2025-07-19')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px]">
          {/* Time slots */}
          {hours.map(hour => (
            <div key={hour} className="flex border-b">
              {/* Time label */}
              <div className="w-20 p-2 text-sm text-gray-600 font-medium border-r bg-gray-50">
                {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
              </div>
              
              {/* Day columns */}
              {days.map((day, dayIndex) => {
                const dateStr = day.toISOString().split('T')[0];
                const eventsAtHour = eventsByDateAndHour.get(`${dateStr}-${hour}`) || [];
                
                return (
                  <div
                    key={dayIndex}
                    className="flex-1 min-h-[60px] p-1 border-r last:border-r-0 hover:bg-gray-50"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.currentTarget.classList.remove('bg-blue-50');
                      handleDrop(e, dateStr, hour);
                    }}
                  >
                    <div className="space-y-1">
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
                            "p-2 rounded text-xs cursor-pointer hover:shadow-md transition-all",
                            event.type === 'food' && "bg-amber-100 text-amber-800",
                            event.type === 'activity' && "bg-blue-100 text-blue-800",
                            event.type === 'transport' && "bg-indigo-100 text-indigo-800",
                            event.type === 'accommodation' && "bg-pink-100 text-pink-800",
                            event.type === 'other' && "bg-gray-100 text-gray-800"
                          )}
                        >
                          <div className="flex items-start gap-1">
                            <span>{getEventTypeIcon(event.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-xs opacity-75">
                                {formatTime(event.time)}
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
          ))}
        </div>
      </div>
    </div>
  );
}