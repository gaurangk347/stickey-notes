"use client";

import { useState, useRef, MouseEvent as ReactMouseEvent } from "react";
import { Note } from "@/types/note";
import { NOTE_COLORS, HEADER_HEIGHT } from "@/utils/constants";
import { getFirstLine } from "@/utils/noteUtils";
import { useDragNote } from "@/hooks/useDragNote";
import { useResizeNote } from "@/hooks/useResizeNote";

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export const StickyNote = ({
  note,
  onUpdate,
  onDelete,
  onBringToFront,
}: StickyNoteProps) => {
  const [isMinimized, setIsMinimized] = useState(note.isMinimized);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colorScheme = NOTE_COLORS[note.color];

  // Use custom hooks for drag and resize
  const { isDragging, handleDragStart } = useDragNote({
    note,
    onUpdate,
    onBringToFront,
  });

  const { handleResizeStart } = useResizeNote({
    note,
    onUpdate,
    onBringToFront,
  });

  const handleMinimize = (e: ReactMouseEvent) => {
    e.stopPropagation();
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    onUpdate(note.id, { isMinimized: newMinimizedState });
  };

  const handleDelete = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(note.id, { text: e.target.value });
  };

  const handleNoteClick = () => {
    onBringToFront(note.id);
  };

  return (
    <div
      className={`absolute rounded-lg shadow-lg transition-shadow hover:shadow-xl border ${colorScheme.body} ${colorScheme.border}`}
      style={{
        left: `${note.position.x}px`,
        top: `${note.position.y}px`,
        width: `${note.size.width}px`,
        height: isMinimized ? "auto" : `${note.size.height}px`,
        zIndex: note.zIndex,
        opacity: isDragging ? 0.9 : 1,
      }}
      onClick={handleNoteClick}
    >
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${colorScheme.header}`}
        style={{ height: `${HEADER_HEIGHT}px` }}
        onMouseDown={handleDragStart}
      >
        {/* Left side - Minimize button */}
        <button
          onClick={handleMinimize}
          className="w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded transition-colors"
          title={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? (
            // Square icon for expand
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <rect
                x="2"
                y="2"
                width="8"
                height="8"
                stroke="#374151"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            // Dash icon for minimize
            <div className="w-3 h-0.5 bg-gray-700"></div>
          )}
        </button>

        {/* Center - Show first line when minimized */}
        {isMinimized && (
          <div className="flex-1 mx-3 text-sm text-gray-600 truncate italic">
            {getFirstLine(note.text)}...
          </div>
        )}

        {/* Right side - Delete button */}
        <button
          onClick={handleDelete}
          className="w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded transition-colors"
          title="Delete note"
        >
          {/* X icon */}
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1L11 11M1 11L11 1"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      {!isMinimized && (
        <div
          className={`p-4 rounded-b-lg ${colorScheme.body}`}
          style={{ height: `calc(100% - ${HEADER_HEIGHT}px)` }}
        >
          <textarea
            ref={textareaRef}
            value={note.text}
            onChange={handleTextChange}
            placeholder="Type your note here..."
            className={`w-full h-full bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-400`}
            style={{ fontSize: "14px", lineHeight: "1.5" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onBringToFront(note.id);
            }}
            onFocus={() => onBringToFront(note.id)}
          />
        </div>
      )}

      {/* Resize Handles - Only show when not minimized */}
      {!isMinimized && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize  rounded-tl-lg transition-colors"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize  rounded-tr-lg transition-colors"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize  rounded-bl-lg transition-colors"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize  rounded-br-lg transition-colors"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />

          {/* Edge Handles - Full length edges */}
          {/* Top edge - spans full width minus corners */}
          <div
            className="absolute top-0 left-4 right-4 h-2 cursor-n-resize  transition-colors"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          {/* Bottom edge - spans full width minus corners */}
          <div
            className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize  transition-colors"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          {/* Left edge - spans full height minus corners */}
          <div
            className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize  transition-colors"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          {/* Right edge - spans full height minus corners */}
          <div
            className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize  transition-colors"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}
    </div>
  );
};
