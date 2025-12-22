export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type NoteColor = "yellow" | "pink" | "blue" | "green" | "purple";

export interface Note {
  id: string;
  position: Position;
  size: Size;
  text: string;
  color: NoteColor;
  zIndex: number;
  isMinimized: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DragState {
  isDragging: boolean;
  dragType: "move" | "resize" | null;
  direction?: string; // for resize: 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
  startPosition: Position;
  startSize: Size;
  startMousePosition: Position;
}
