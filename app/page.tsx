'use client';

import { useState } from 'react';
import ImprovedCalendar from './components/ImprovedCalendar';
import ThreeDayView from './components/ThreeDayView';
import OneDayView from './components/OneDayView';
import EventBuffer from './components/EventBuffer';
import TripNotesDialog from './components/TripNotes';
import { Event, EventType } from './types';
import { formatTime } from './utils';
import { useEvents, useCreateEvent, useDeleteEvent, useUpdateEvent } from './hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Plus, Calendar, MapPin, Clock, Trash2, Loader2, Archive, CalendarPlus, FileText, CalendarDays, CalendarRange, CalendarCheck } from 'lucide-react';

export default function Home() {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showTripNotes, setShowTripNotes] = useState(false);
  const [viewMode, setViewMode] = useState<'full' | 'threeDay' | 'oneDay'>('full');
  
  const { data: events = [], isLoading, error } = useEvents();
  const createEventMutation = useCreateEvent();
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  const handleAddEvent = async (event: Omit<Event, 'id'>) => {
    try {
      await createEventMutation.mutateAsync({ ...event, isBuffered: true });
      setShowAddEvent(false);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleEventDrop = async (eventId: string, date: string, hour: number) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (event) {
        await updateEventMutation.mutateAsync({
          id: eventId,
          updates: {
            date,
            time: `${hour.toString().padStart(2, '0')}:${event.time.split(':')[1]}`,
            isBuffered: false
          }
        });
      }
    } catch (error) {
      console.error('Failed to move event:', error);
    }
  };

  const handleEventDropBack = async (eventId: string) => {
    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        updates: { isBuffered: true }
      });
    } catch (error) {
      console.error('Failed to move event to buffer:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync(eventId);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">Failed to load events. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">China Trip 2025</h1>
              <Badge variant="secondary" className="ml-2">
                July 5 - 21
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (viewMode === 'full') setViewMode('threeDay');
                  else if (viewMode === 'threeDay') setViewMode('oneDay');
                  else setViewMode('full');
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                {viewMode === 'full' ? (
                  <>
                    <CalendarDays className="h-4 w-4" />
                    3-Day View
                  </>
                ) : viewMode === 'threeDay' ? (
                  <>
                    <CalendarCheck className="h-4 w-4" />
                    1-Day View
                  </>
                ) : (
                  <>
                    <CalendarRange className="h-4 w-4" />
                    Full Calendar
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowTripNotes(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Trip Notes
              </Button>
              <Button
                onClick={() => setShowAddEvent(true)}
                size="icon"
                disabled={createEventMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-full">
            <div className="lg:h-full lg:overflow-auto">
              <EventBuffer 
                events={events}
                onEventClick={setSelectedEvent}
                onEventDropBack={handleEventDropBack}
              />
            </div>
            <div className="flex flex-col h-full min-h-0 min-w-0">
              <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                {viewMode === 'full' ? (
                  <ImprovedCalendar 
                    events={events}
                    onEventClick={setSelectedEvent}
                    onEventDrop={handleEventDrop}
                  />
                ) : viewMode === 'threeDay' ? (
                  <ThreeDayView
                    events={events}
                    onEventClick={setSelectedEvent}
                    onEventDrop={handleEventDrop}
                  />
                ) : (
                  <OneDayView
                    events={events}
                    onEventClick={setSelectedEvent}
                    onEventDrop={handleEventDrop}
                  />
                )}
              </div>
              
            </div>
          </div>
        )}
      </main>

      {/* Add Event Modal */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <AddEventModal
          onClose={() => setShowAddEvent(false)}
          onAdd={handleAddEvent}
          isLoading={createEventMutation.isPending}
        />
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onDelete={handleDeleteEvent}
            onUpdate={async (eventId, updates) => {
              await updateEventMutation.mutateAsync({ id: eventId, updates });
            }}
            isDeleting={deleteEventMutation.isPending}
            isUpdating={updateEventMutation.isPending}
          />
        )}
      </Dialog>

      {/* Trip Notes Dialog */}
      <TripNotesDialog 
        open={showTripNotes} 
        onOpenChange={setShowTripNotes} 
      />
    </div>
  );
}

interface AddEventModalProps {
  onClose: () => void;
  onAdd: (event: Omit<Event, 'id'>) => void;
  isLoading: boolean;
}

function AddEventModal({ onClose, onAdd, isLoading }: AddEventModalProps) {
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Event'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
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
  onDelete: (eventId: string) => void;
  onUpdate: (eventId: string, updates: Partial<Event>) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

function EventDetailsModal({ event, onClose, onDelete, onUpdate, isDeleting, isUpdating }: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(event.date);
  const [editTime, setEditTime] = useState(event.time);
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
        
        {/* Schedule/Buffer controls */}
        <div className="border-t pt-4">
          {event.isBuffered ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Schedule this event:</p>
              <div className="space-y-2">
                <input
                  type="date"
                  value={editDate}
                  min="2025-07-05"
                  max="2025-07-21"
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUpdating}
                />
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUpdating}
                />
              </div>
              <Button
                onClick={() => onUpdate(event.id, { 
                  date: editDate, 
                  time: editTime, 
                  isBuffered: false 
                })}
                className="w-full flex items-center justify-center gap-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4" />
                    Schedule Event
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Event is scheduled</p>
              <Button
                onClick={() => onUpdate(event.id, { isBuffered: true })}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Moving...
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    Move to Buffer
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={() => onDelete(event.id)} 
            variant="destructive"
            className="flex items-center gap-2 flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Event
              </>
            )}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1" disabled={isDeleting}>
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}