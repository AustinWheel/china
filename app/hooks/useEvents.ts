import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Event } from '../types'

const EVENTS_KEY = ['events']

async function fetchEvents(): Promise<Event[]> {
  const response = await fetch('/api/events')
  if (!response.ok) {
    throw new Error('Failed to fetch events')
  }
  return response.json()
}

async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create event')
  }
  
  return response.json()
}

async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`/api/events/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete event')
  }
}

async function updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
  const response = await fetch(`/api/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update event')
  }
  
  return response.json()
}

export function useEvents() {
  return useQuery({
    queryKey: EVENTS_KEY,
    queryFn: fetchEvents,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Event> }) => 
      updateEvent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY })
    },
  })
}