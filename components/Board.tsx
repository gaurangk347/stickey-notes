"use client";

import { useState, useEffect } from "react";
import { Note, NoteColor } from "@/types/note";
import { StickyNote } from "./StickyNote";
import { Toolbar } from "./Toolbar";
import { createNote } from "@/utils/noteUtils";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const Board = () => {
  const [notes, setNotes, isLoaded] = useLocalStorage<Note[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [selectedColor, setSelectedColor] = useState<NoteColor>("yellow");

  // Update maxZIndex based on loaded notes
  useEffect(() => {
    if (isLoaded && notes.length > 0) {
      const maxZ = Math.max(...notes.map((note) => note.zIndex));
      setMaxZIndex(maxZ);
    }
  }, [isLoaded, notes]);

  const handleCreateNote = () => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);

    // Create note at center of viewport
    let centerX = window.innerWidth / 2 - 150; // 150 = half of default width (300)
    let centerY = window.innerHeight / 2 - 125; // 125 = half of default height (250)

    // Avoid toolbar area (280px from left, 400px from top)
    const toolbarWidth = 280;
    const toolbarHeight = 400;

    if (centerX < toolbarWidth && centerY < toolbarHeight) {
      centerX = toolbarWidth + 20; // Add some padding
    }

    const newNote = createNote(
      { x: Math.max(0, centerX), y: Math.max(0, centerY) },
      selectedColor,
      undefined,
      newZIndex
    );

    setNotes((prevNotes) => [...prevNotes, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const bringToFront = (id: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    updateNote(id, { zIndex: newZIndex });
  };

  // Show loading state while loading from localStorage
  if (!isLoaded) {
    return (
      <div className="relative w-full h-screen bg-gray-50 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="board-scrollable relative w-full h-screen bg-gray-50 overflow-auto"
      style={{ minWidth: "1024px", minHeight: "768px" }}
    >
      {/* Toolbar */}
      <Toolbar
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        onCreateNote={handleCreateNote}
      />

      {/* Board canvas */}
      <div className="relative w-full h-full">
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDelete={deleteNote}
            onBringToFront={bringToFront}
          />
        ))}
      </div>

      {/* Empty state message */}
      {notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">No notes yet</p>
            <p className="text-sm">Click "Create Note" to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};
