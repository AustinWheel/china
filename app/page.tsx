'use client';

import { useState, useEffect } from 'react';
import ImprovedCalendar from './components/ImprovedCalendar';
import { Event, HARDCODED_EVENTS, EventType } from './types';
import { encodeEventsToURL, decodeEventsFromURL, formatTime } from './utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Plus, Share2, Calendar, MapPin, Clock, Trash2 } from 'lucide-react';

export default function Home() {
  const [dynamicEvents, setDynamicEvents] = useState<Event[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Load events from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventsParam = params.get('events');
    if (eventsParam) {
      const decoded = decodeEventsFromURL(eventsParam);
      setDynamicEvents(decoded);
    }
  }, []);

  // Update URL when dynamic events change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (dynamicEvents.length > 0) {
      params.set('events', encodeEventsToURL(dynamicEvents));
    } else {
      params.delete('events');
    }
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  }, [dynamicEvents]);

  const allEvents = [...HARDCODED_EVENTS, ...dynamicEvents];

  const handleAddEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: `dyn-${Date.now()}`
    };
    setDynamicEvents([...dynamicEvents, newEvent]);
    setShowAddEvent(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setDynamicEvents(dynamicEvents.filter(e => e.id !== eventId));
    setSelectedEvent(null);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard! Share it with others to show your itinerary.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">China Trip 2025</h1>
              <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">
                July 5 - 21
              </Badge>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={() => setShowAddEvent(true)}
                className="flex items-center gap-2 text-sm sm:text-base"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Event</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                onClick={handleShareLink}
                variant="outline"
                className="flex items-center gap-2 text-sm sm:text-base"
                size="sm"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share Link</span>
                <span className="sm:hidden">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <ImprovedCalendar 
          events={allEvents}
          onEventClick={setSelectedEvent}
        />
        
        {/* Event count summary */}
        <div className="mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center">
          <Badge variant="outline" className="px-3 py-1">
            🍜 Food: {allEvents.filter(e => e.type === 'food').length}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            🎯 Activities: {allEvents.filter(e => e.type === 'activity').length}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            ✈️ Transport: {allEvents.filter(e => e.type === 'transport').length}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            🏨 Accommodation: {allEvents.filter(e => e.type === 'accommodation').length}
          </Badge>
        </div>
      </main>

      {/* Add Event Modal */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <AddEventModal
          onClose={() => setShowAddEvent(false)}
          onAdd={handleAddEvent}
        />
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onDelete={selectedEvent.id.startsWith('dyn-') ? handleDeleteEvent : undefined}
          />
        )}
      </Dialog>
    </div>
  );
}

interface AddEventModalProps {
  onClose: () => void;
  onAdd: (event: Omit<Event, 'id'>) => void;
}

function AddEventModal({ onClose, onAdd }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    date: '2025-07-05',
    time: '12:00',
    type: 'activity' as EventType,
    title: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAdd(formData);
    }
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
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Event
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={formData.date}
            min="2025-07-05"
            max="2025-07-21"
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Time</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
          >
            <option value="food">{getEventTypeIcon('food')} Food</option>
            <option value="activity">{getEventTypeIcon('activity')} Activity</option>
            <option value="transport">{getEventTypeIcon('transport')} Transport</option>
            <option value="accommodation">{getEventTypeIcon('accommodation')} Accommodation</option>
            <option value="other">{getEventTypeIcon('other')} Other</option>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter event title"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description (optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add any additional details"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            Add Event
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
  onDelete?: (eventId: string) => void;
}

function EventDetailsModal({ event, onClose, onDelete }: EventDetailsModalProps) {
  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'food': return '🍜';
      case 'activity': return '🎯';
      case 'transport': return '✈️';
      case 'accommodation': return '🏨';
      default: return '📌';
    }
  };

  const getEventTypeBadge = (type: EventType) => {
    const variants: Record<EventType, string> = {
      food: 'bg-amber-100 text-amber-800',
      activity: 'bg-blue-100 text-blue-800',
      transport: 'bg-indigo-100 text-indigo-800',
      accommodation: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[type]}>
        {getEventTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {getEventTypeIcon(event.type)}
          {event.title}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{formatTime(event.time)}</span>
          </div>
          {getEventTypeBadge(event.type)}
        </div>
        
        {event.description && (
          <div className="pt-2">
            <p className="text-sm text-gray-600 font-medium mb-1">Description</p>
            <p className="text-sm text-gray-700">{event.description}</p>
          </div>
        )}
        
        <div className="flex gap-3 pt-4">
          {onDelete && (
            <Button 
              onClick={() => onDelete(event.id)} 
              variant="destructive"
              className="flex items-center gap-2 flex-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Event
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className={onDelete ? 'flex-1' : 'w-full'}>
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}