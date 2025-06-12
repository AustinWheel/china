# China Trip 2025 - Project Information

## Overview
This is a collaborative trip planning application for a China trip from July 5-21, 2025. Built with Next.js, Prisma, PostgreSQL, and Liveblocks for real-time collaboration.

## Key Features

### 1. Event Management
- Events can be created and stored in PostgreSQL via Prisma
- Events have a `isBuffered` field to determine if they're scheduled or in the buffer
- Drag-and-drop functionality between buffer and calendar (desktop)
- Mobile-friendly scheduling controls in event details dialog

### 2. Calendar View
- Horizontal scroll for time slots (8AM-11PM + any early hours with events)
- Vertical scroll for days
- Sticky headers for dates and times
- Color-coded by city
- Fixed viewport height on desktop

### 3. Event Buffer
- Unscheduled events appear in the buffer first
- Drag events to calendar to schedule them
- Drag events back to buffer to unschedule
- Mobile users can use dialog controls instead of drag-and-drop

### 4. Real-time Collaborative Notes
- Uses Liveblocks with Yjs for real-time collaboration
- BlockNote editor for rich text editing
- Persists automatically
- No authentication required (public access)
- Fixed room ID: 'china-trip-notes-2025'

## Environment Variables
```
PRISMA_DATABASE_URL=<your_prisma_accelerate_url>
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=<your_liveblocks_public_key>
```

## Tech Stack
- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL via Prisma Accelerate
- **Real-time**: Liveblocks (Yjs provider for BlockNote)
- **Editor**: BlockNote with Mantine theme
- **State Management**: React Query (TanStack Query)

## Important Commands
```bash
# Development
npm run dev

# Database
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma client

# Build
npm run build

# Lint (if configured)
npm run lint
```

## Known Issues & Solutions

### Safari Height Issue
The trip notes dialog uses `h-[80vh] max-h-[600px]` with proper min-heights to ensure consistent display across Safari and Chrome.

### Real-time Sync
The notes use Liveblocks Yjs provider which handles both real-time synchronization and persistence. Both users must connect to the same room ID.

## Cities & Schedule
The trip covers 7 cities over 17 days:
- Shenzhen (July 5)
- Guangzhou (July 6-7)
- Guilin (July 8-10)
- Guizhou (July 11-14)
- Chongqing (July 15-17)
- Hangzhou (July 18-19)
- Shanghai (July 20-21)

Each city has a unique color in the calendar view for easy identification.