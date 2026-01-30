import { generateNoteId, createNote, getFirstLine } from "@/utils/noteUtils";
import { DEFAULT_NOTE_SIZE } from "@/utils/constants";

describe("noteUtils", () => {
  describe("generateNoteId", () => {
    it("should generate a unique ID starting with 'note-'", () => {
      const id = generateNoteId();
      expect(id).toMatch(/^note-\d+-[a-z0-9]+$/);
    });

    it("should generate different IDs on subsequent calls", () => {
      const id1 = generateNoteId();
      const id2 = generateNoteId();
      expect(id1).not.toBe(id2);
    });

    it("should include a timestamp component", () => {
      const before = Date.now();
      const id = generateNoteId();
      const after = Date.now();

      const parts = id.split("-");
      const timestamp = parseInt(parts[1], 10);

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("createNote", () => {
    it("should create a note with the given position", () => {
      const position = { x: 100, y: 200 };
      const note = createNote(position);

      expect(note.position).toEqual(position);
    });

    it("should use default color yellow when not specified", () => {
      const note = createNote({ x: 0, y: 0 });
      expect(note.color).toBe("yellow");
    });

    it("should use the specified color", () => {
      const note = createNote({ x: 0, y: 0 }, "pink");
      expect(note.color).toBe("pink");
    });

    it("should use default zIndex of 1 when not specified", () => {
      const note = createNote({ x: 0, y: 0 });
      expect(note.zIndex).toBe(1);
    });

    it("should use the specified zIndex", () => {
      const note = createNote({ x: 0, y: 0 }, "yellow", 5);
      expect(note.zIndex).toBe(5);
    });

    it("should use DEFAULT_NOTE_SIZE for size", () => {
      const note = createNote({ x: 0, y: 0 });
      expect(note.size).toEqual(DEFAULT_NOTE_SIZE);
    });

    it("should initialize with empty text", () => {
      const note = createNote({ x: 0, y: 0 });
      expect(note.text).toBe("");
    });

    it("should initialize as not minimized", () => {
      const note = createNote({ x: 0, y: 0 });
      expect(note.isMinimized).toBe(false);
    });

    it("should set createdAt and updatedAt to the same timestamp", () => {
      const note = createNote({ x: 0, y: 0 });
      expect(note.createdAt).toBe(note.updatedAt);
    });

    it("should have a valid id", () => {
      const note = createNote({ x: 0, y: 0 });
      expect(note.id).toMatch(/^note-\d+-[a-z0-9]+$/);
    });
  });

  describe("getFirstLine", () => {
    it("should return 'Empty note...' for empty string", () => {
      expect(getFirstLine("")).toBe("Empty note...");
    });

    it("should return 'Empty note...' for null-ish values", () => {
      expect(getFirstLine(null as unknown as string)).toBe("Empty note...");
      expect(getFirstLine(undefined as unknown as string)).toBe(
        "Empty note...",
      );
    });

    it("should return the first line of multi-line text", () => {
      const text = "First line\nSecond line\nThird line";
      expect(getFirstLine(text)).toBe("First line");
    });

    it("should return the entire text if single line", () => {
      const text = "Single line text";
      expect(getFirstLine(text)).toBe("Single line text");
    });

    it("should trim whitespace from the first line", () => {
      const text = "   Trimmed line   \nSecond line";
      expect(getFirstLine(text)).toBe("Trimmed line");
    });

    it("should return 'Empty note...' if first line is only whitespace", () => {
      const text = "   \nActual content";
      expect(getFirstLine(text)).toBe("Empty note...");
    });
  });
});
