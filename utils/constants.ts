import { NoteColor } from "@/types/note";

export const NOTE_COLORS: Record<
  NoteColor,
  { body: string; header: string; border: string }
> = {
  yellow: {
    body: "bg-[#FFF9C4]",
    header: "bg-[#FFF59D]",
    border: "border-[#F9A825]",
  },
  pink: {
    body: "bg-[#FCE4EC]",
    header: "bg-[#F8BBD0]",
    border: "border-[#E91E63]",
  },
  blue: {
    body: "bg-[#E1F5FE]",
    header: "bg-[#B3E5FC]",
    border: "border-[#0288D1]",
  },
  green: {
    body: "bg-[#F1F8E9]",
    header: "bg-[#DCEDC8]",
    border: "border-[#689F38]",
  },
  purple: {
    body: "bg-[#F3E5F5]",
    header: "bg-[#E1BEE7]",
    border: "border-[#7B1FA2]",
  },
};

export const DEFAULT_NOTE_SIZE = {
  width: 300,
  height: 250,
};

export const MIN_NOTE_SIZE = {
  width: 150,
  height: 150,
};

export const MAX_NOTE_SIZE = {
  width: 600,
  height: 600,
};

export const HEADER_HEIGHT = 40;
