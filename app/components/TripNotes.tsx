'use client';

import React, { useEffect, useState } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { BlockNoteEditor } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { LiveblocksProvider, RoomProvider, useRoom } from '@liveblocks/react/suspense';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Users, X } from 'lucide-react';
import * as Y from 'yjs';

const LIVEBLOCKS_PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!;
const ROOM_ID = 'china-trip-notes-2025'; // Fixed room ID

interface TripNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Editor() {
  const room = useRoom();
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Create Yjs document
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    
    // Listen for sync
    const syncHandler = (isSynced: boolean) => {
      console.log('Sync status:', isSynced);
      setSynced(isSynced);
    };
    yProvider.on('sync', syncHandler);
    
    setProvider(yProvider);
    
    // Create editor with collaboration
    const editor = BlockNoteEditor.create({
      collaboration: {
        provider: yProvider,
        fragment: yDoc.getXmlFragment('document'),
        user: {
          name: 'User',
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        },
      },
    });
    
    setEditor(editor);
    
    return () => {
      yProvider.off('sync', syncHandler);
      yProvider.destroy();
      yDoc.destroy();
    };
  }, [room]);

  if (!editor || !provider) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Users className="h-4 w-4" />
        <span>Real-time collaboration</span>
        <div className={`ml-auto flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${synced ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-xs">{synced ? 'Connected' : 'Syncing...'}</span>
        </div>
      </div>
      <div className="min-h-[400px]">
        <BlockNoteView editor={editor} theme="light" />
      </div>
    </>
  );
}

function TripNotesContent() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <Editor />
    </React.Suspense>
  );
}

export default function TripNotesDialog({ open, onOpenChange }: TripNotesDialogProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] max-h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Trip Notes</DialogTitle>
          <Button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            variant="ghost"
            size="icon"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-[400px]">
          <LiveblocksProvider publicApiKey={LIVEBLOCKS_PUBLIC_KEY}>
            <RoomProvider id={ROOM_ID} initialPresence={{}}>
              <TripNotesContent />
            </RoomProvider>
          </LiveblocksProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}