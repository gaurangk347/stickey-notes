import { useState, useEffect, MouseEvent as ReactMouseEvent } from "react";
import { Note } from "@/types/note";

interface UseResizeNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onBringToFront: (id: string) => void;
}

interface UseResizeNoteReturn {
  isResizing: boolean;
  handleResizeStart: (e: ReactMouseEvent, direction: string) => void;
}

export const useResizeNote = ({
  note,
  onUpdate,
  onBringToFront,
}: UseResizeNoteProps): UseResizeNoteReturn => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");

  const handleResizeStart = (e: ReactMouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    onBringToFront(note.id);
    setIsResizing(true);
    setResizeDirection(direction);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const minSize = 150;
      const maxSize = 600;
      let newWidth = note.size.width;
      let newHeight = note.size.height;
      let newX = note.position.x;
      let newY = note.position.y;

      switch (resizeDirection) {
        case "se": // bottom-right corner
          newWidth = Math.max(
            minSize,
            Math.min(maxSize, e.clientX - note.position.x)
          );
          newHeight = Math.max(
            minSize,
            Math.min(maxSize, e.clientY - note.position.y)
          );
          break;
        case "sw": // bottom-left corner
          newWidth = Math.max(
            minSize,
            Math.min(maxSize, note.position.x + note.size.width - e.clientX)
          );
          newHeight = Math.max(
            minSize,
            Math.min(maxSize, e.clientY - note.position.y)
          );
          newX = note.position.x + note.size.width - newWidth;
          break;
        case "ne": // top-right corner
          newWidth = Math.max(
            minSize,
            Math.min(maxSize, e.clientX - note.position.x)
          );
          newHeight = Math.max(
            minSize,
            Math.min(maxSize, note.position.y + note.size.height - e.clientY)
          );
          newY = note.position.y + note.size.height - newHeight;
          break;
        case "nw": // top-left corner
          newWidth = Math.max(
            minSize,
            Math.min(maxSize, note.position.x + note.size.width - e.clientX)
          );
          newHeight = Math.max(
            minSize,
            Math.min(maxSize, note.position.y + note.size.height - e.clientY)
          );
          newX = note.position.x + note.size.width - newWidth;
          newY = note.position.y + note.size.height - newHeight;
          break;
        case "e": // right edge
          newWidth = Math.max(
            minSize,
            Math.min(maxSize, e.clientX - note.position.x)
          );
          break;
        case "w": // left edge
          newWidth = Math.max(
            minSize,
            Math.min(maxSize, note.position.x + note.size.width - e.clientX)
          );
          newX = note.position.x + note.size.width - newWidth;
          break;
        case "s": // bottom edge
          newHeight = Math.max(
            minSize,
            Math.min(maxSize, e.clientY - note.position.y)
          );
          break;
        case "n": // top edge
          newHeight = Math.max(
            minSize,
            Math.min(maxSize, note.position.y + note.size.height - e.clientY)
          );
          newY = note.position.y + note.size.height - newHeight;
          break;
      }

      onUpdate(note.id, {
        size: { width: newWidth, height: newHeight },
        position: { x: newX, y: newY },
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection("");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeDirection, note, onUpdate, onBringToFront]);

  return {
    isResizing,
    handleResizeStart,
  };
};
