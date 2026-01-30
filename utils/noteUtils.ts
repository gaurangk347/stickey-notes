import { Note, NoteColor, Position, Size } from "@/types/note";
import { DEFAULT_NOTE_SIZE } from "./constants";

export const generateNoteId = (): string => {
  return `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const createNote = (
  position: Position,
  color: NoteColor = "yellow",
  zIndex: number = 1,
): Note => {
  const now = Date.now();
  const size = DEFAULT_NOTE_SIZE;
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
