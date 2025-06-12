'use client';

import { Event, EventType } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '../utils';

interface EventBufferProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEventDropBack?: (eventId: string) => void;
}

export default function EventBuffer({ events, onEventClick, onEventDropBack }: EventBufferProps) {
  const bufferedEvents = events.filter(e => e.isBuffered);

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Unscheduled Events</CardTitle>
      </CardHeader>
      <CardContent 
        className="space-y-2 min-h-[100px]"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('bg-gray-50');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('bg-gray-50');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('bg-gray-50');
          const eventId = e.dataTransfer.getData('eventId');
          if (eventId && onEventDropBack) {
            onEventDropBack(eventId);
          }
        }}
      >
        {bufferedEvents.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No unscheduled events. Add new events to see them here.
          </p>
        ) : (
          bufferedEvents.map((event) => (
            <div
              key={event.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('eventId', event.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onClick={() => onEventClick?.(event)}
              className={cn(
                "p-3 rounded-lg cursor-move transition-all hover:shadow-md flex items-center gap-2",
                getEventTypeColor(event.type)
              )}
            >
              <GripVertical className="w-4 h-4 opacity-50" />
              <span className="text-lg">{getEventTypeIcon(event.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{event.title}</div>
                <div className="flex items-center gap-1 mt-0.5 text-xs opacity-75">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(event.time)}</span>
                  <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0">
                    {event.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}