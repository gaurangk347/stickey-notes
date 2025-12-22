import { useState, useEffect, MouseEvent as ReactMouseEvent } from "react";
import { Note, Position } from "@/types/note";

interface UseDragNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onBringToFront: (id: string) => void;
}

interface UseDragNoteReturn {
  isDragging: boolean;
  handleDragStart: (e: ReactMouseEvent) => void;
}

export const useDragNote = ({
  note,
  onUpdate,
  onBringToFront,
}: UseDragNoteProps): UseDragNoteReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  const handleDragStart = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onBringToFront(note.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - note.position.x,
      y: e.clientY - note.position.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Toolbar area constraints (protect toolbar rectangle only)
      const toolbarLeft = 0;
      const toolbarTop = 0;
      const toolbarRight = 280; // Toolbar width
      const toolbarBottom = 330; // Toolbar height

      let constrainedX = Math.max(0, newX);
      let constrainedY = Math.max(0, newY);

      // Check if note's top-left corner would overlap toolbar rectangle
      const wouldOverlapToolbar =
        constrainedX < toolbarRight &&
        constrainedX + note.size.width > toolbarLeft &&
        constrainedY < toolbarBottom &&
        constrainedY + note.size.height > toolbarTop;

      // If overlapping, push note to the right of toolbar
      if (wouldOverlapToolbar && constrainedY < toolbarBottom) {
        constrainedX = toolbarRight;
      }

      onUpdate(note.id, {
        position: { x: constrainedX, y: constrainedY },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, note, onUpdate, onBringToFront]);

  return {
    isDragging,
    handleDragStart,
  };
};
