'use client';

import React, { Suspense, useEffect, useCallback } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { LiveblocksProvider, RoomProvider, useRoom, useStorage, useMutation } from '@liveblocks/react/suspense';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Users, X } from 'lucide-react';

const LIVEBLOCKS_PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!;

interface TripNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CollaborativeEditor() {
  const room = useRoom();
  const savedContent = useStorage((root) => root.editorContent);

  const updateContent = useMutation(({ storage }, content) => {
    storage.set('editorContent', content);
  }, []);

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce((blocks: any) => {
      updateContent(blocks);
    }, 1000),
    [updateContent]
  );

  const editor = useCreateBlockNote({
    initialContent: savedContent || [
      {
        type: 'heading',
        content: 'China Trip Notes 2025',
        props: { level: 1 }
      },
      {
        type: 'paragraph',
        content: 'Start writing your collaborative trip notes here...'
      }
    ],
  });

  // Save content when it changes
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      const blocks = editor.document;
      debouncedSave(blocks);
    };

    editor.onEditorContentChange(handleChange);
  }, [editor, debouncedSave]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <BlockNoteView
        editor={editor}
        theme="light"
      />
    </div>
  );
}

function TripNotesContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users className="h-4 w-4" />
        <span>Notes are automatically saved</span>
      </div>
      <CollaborativeEditor />
    </div>
  );
}

function TripNotesRoom() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <TripNotesContent />
    </Suspense>
  );
}

export default function TripNotesDialog({ open, onOpenChange }: TripNotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Trip Notes</DialogTitle>
          <Button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <LiveblocksProvider publicApiKey={LIVEBLOCKS_PUBLIC_KEY}>
            <RoomProvider
              id="china-trip-2025-notes"
              initialPresence={{}}
              initialStorage={{
                editorContent: [
                  {
                    type: 'heading',
                    content: 'China Trip Notes 2025',
                    props: { level: 1 }
                  },
                  {
                    type: 'paragraph',
                    content: 'Start writing your collaborative trip notes here...'
                  }
                ]
              }}
            >
              <TripNotesRoom />
            </RoomProvider>
          </LiveblocksProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
