import { Note, NoteColor, Position, Size } from "@/types/note";
import { DEFAULT_NOTE_SIZE } from "./constants";

export const generateNoteId = (): string => {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createNote = (
  position: Position,
  color: NoteColor = "yellow",
  size: Size = DEFAULT_NOTE_SIZE,
  zIndex: number = 1
): Note => {
  const now = Date.now();
  return {
    id: generateNoteId(),
    position,
    size,
    text: "",
    color,
    zIndex,
    isMinimized: false,
    createdAt: now,
    updatedAt: now,
  };
};

export const getFirstLine = (text: string): string => {
  if (!text) return "Empty note...";
  const firstLine = text.split("\n")[0];
  return firstLine.trim() || "Empty note...";
};

export const constrainPosition = (
  position: Position,
  size: Size,
  containerWidth: number,
  containerHeight: number
): Position => {
  return {
    x: Math.max(0, Math.min(position.x, containerWidth - size.width)),
    y: Math.max(0, Math.min(position.y, containerHeight - size.height)),
  };
};

export const constrainSize = (
  size: Size,
  minSize: Size,
  maxSize: Size
): Size => {
  return {
    width: Math.max(minSize.width, Math.min(size.width, maxSize.width)),
    height: Math.max(minSize.height, Math.min(size.height, maxSize.height)),
  };
};
