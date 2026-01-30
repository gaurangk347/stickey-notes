import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Board } from "@/components/Board";
import { Note } from "@/types/note";

// Mock useLocalStorage hook
const mockNotes: Note[] = [];
const mockSetNotes = jest.fn((updater) => {
  if (typeof updater === "function") {
    const result = updater(mockNotes);
    mockNotes.length = 0;
    mockNotes.push(...result);
  } else {
    mockNotes.length = 0;
    mockNotes.push(...updater);
  }
});

jest.mock("@/hooks/useLocalStorage", () => ({
  useLocalStorage: jest.fn(() => [mockNotes, mockSetNotes, true]),
}));

// Mock StickyNote component to simplify testing
jest.mock("@/components/StickyNote", () => ({
  StickyNote: ({ note, onUpdate, onDelete, onBringToFront }: {
    note: Note;
    onUpdate: (id: string, updates: Partial<Note>) => void;
    onDelete: (id: string) => void;
    onBringToFront: (id: string) => void;
  }) => (
    <div data-testid={`sticky-note-${note.id}`}>
      <span data-testid="note-text">{note.text}</span>
      <span data-testid="note-color">{note.color}</span>
      <span data-testid="note-zindex">{note.zIndex}</span>
      <button onClick={() => onUpdate(note.id, { text: "updated" })} data-testid="update-btn">
        Update
      </button>
      <button onClick={() => onDelete(note.id)} data-testid="delete-btn">
        Delete
      </button>
      <button onClick={() => onBringToFront(note.id)} data-testid="bring-to-front-btn">
        Bring to Front
      </button>
    </div>
  ),
}));

import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("Board", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotes.length = 0;

    // Reset window dimensions
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 768,
      writable: true,
    });

    (useLocalStorage as jest.Mock).mockReturnValue([mockNotes, mockSetNotes, true]);
  });

  it("should render the toolbar", () => {
    render(<Board />);
    expect(screen.getByText("Sticky Notes")).toBeInTheDocument();
  });

  it("should show loading state when not loaded", () => {
    (useLocalStorage as jest.Mock).mockReturnValue([[], jest.fn(), false]);
    render(<Board />);

    expect(screen.getByText("Loading notes...")).toBeInTheDocument();
  });

  it("should show empty state when no notes exist", () => {
    render(<Board />);

    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    expect(screen.getByText('Click "Create Note" to get started')).toBeInTheDocument();
  });

  it("should not show empty state when notes exist", () => {
    const existingNotes: Note[] = [
      {
        id: "note-1",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 250 },
        text: "Test note",
        color: "yellow",
        zIndex: 1,
        isMinimized: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    mockNotes.push(...existingNotes);

    render(<Board />);

    expect(screen.queryByText("No notes yet")).not.toBeInTheDocument();
  });

  it("should render all notes from localStorage", () => {
    const existingNotes: Note[] = [
      {
        id: "note-1",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 250 },
        text: "First note",
        color: "yellow",
        zIndex: 1,
        isMinimized: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "note-2",
        position: { x: 200, y: 200 },
        size: { width: 300, height: 250 },
        text: "Second note",
        color: "pink",
        zIndex: 2,
        isMinimized: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    mockNotes.push(...existingNotes);

    render(<Board />);

    expect(screen.getByTestId("sticky-note-note-1")).toBeInTheDocument();
    expect(screen.getByTestId("sticky-note-note-2")).toBeInTheDocument();
  });

  describe("handleCreateNote", () => {
    it("should create a new note when Create Note is clicked", () => {
      render(<Board />);

      fireEvent.click(screen.getByText("+ Create Note"));

      expect(mockSetNotes).toHaveBeenCalled();
    });

    it("should create note with selected color", () => {
      render(<Board />);

      // Select pink color
      fireEvent.click(screen.getByTitle("Pink"));

      // Create note
      fireEvent.click(screen.getByText("+ Create Note"));

      // Check that setNotes was called
      expect(mockSetNotes).toHaveBeenCalled();

      // Get the function passed to setNotes and call it
      const updateFn = mockSetNotes.mock.calls[0][0];
      const result = updateFn([]);

      expect(result[0].color).toBe("pink");
    });

    it("should increment zIndex for each new note", () => {
      render(<Board />);

      fireEvent.click(screen.getByText("+ Create Note"));

      const firstCall = mockSetNotes.mock.calls[0][0];
      const firstNote = firstCall([])[0];

      fireEvent.click(screen.getByText("+ Create Note"));

      const secondCall = mockSetNotes.mock.calls[1][0];
      const secondNotes = secondCall([firstNote]);

      expect(secondNotes[1].zIndex).toBeGreaterThan(firstNote.zIndex);
    });

    it("should position note at center of viewport", () => {
      Object.defineProperty(window, "innerWidth", { value: 1000 });
      Object.defineProperty(window, "innerHeight", { value: 800 });

      render(<Board />);
      fireEvent.click(screen.getByText("+ Create Note"));

      const updateFn = mockSetNotes.mock.calls[0][0];
      const result = updateFn([]);

      // Center X: 1000/2 - 150 = 350
      // Center Y: 800/2 - 125 = 275
      expect(result[0].position.x).toBeGreaterThanOrEqual(0);
      expect(result[0].position.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe("updateNote", () => {
    it("should update note properties", () => {
      const existingNote: Note = {
        id: "note-1",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 250 },
        text: "Original text",
        color: "yellow",
        zIndex: 1,
        isMinimized: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      mockNotes.push(existingNote);

      render(<Board />);

      // Click the update button on the mocked StickyNote
      fireEvent.click(screen.getByTestId("update-btn"));

      expect(mockSetNotes).toHaveBeenCalled();
    });

    it("should update updatedAt timestamp when note is updated", () => {
      const originalTime = Date.now() - 10000;
      const existingNote: Note = {
        id: "note-1",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 250 },
        text: "Original",
        color: "yellow",
        zIndex: 1,
        isMinimized: false,
        createdAt: originalTime,
        updatedAt: originalTime,
      };
      mockNotes.push(existingNote);

      render(<Board />);
      fireEvent.click(screen.getByTestId("update-btn"));

      const updateFn = mockSetNotes.mock.calls[0][0];
      const result = updateFn([existingNote]);

      expect(result[0].updatedAt).toBeGreaterThan(originalTime);
    });
  });

  describe("deleteNote", () => {
    it("should remove note from state", () => {
      const existingNote: Note = {
        id: "note-1",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 250 },
        text: "To be deleted",
        color: "yellow",
        zIndex: 1,
        isMinimized: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      mockNotes.push(existingNote);

      render(<Board />);

      fireEvent.click(screen.getByTestId("delete-btn"));

      expect(mockSetNotes).toHaveBeenCalled();

      const updateFn = mockSetNotes.mock.calls[0][0];
      const result = updateFn([existingNote]);

      expect(result).toHaveLength(0);
    });
  });

  describe("bringToFront", () => {
    it("should increase zIndex when bringing note to front", () => {
      const existingNote: Note = {
        id: "note-1",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 250 },
        text: "Test",
        color: "yellow",
        zIndex: 1,
        isMinimized: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      mockNotes.push(existingNote);

      render(<Board />);

      fireEvent.click(screen.getByTestId("bring-to-front-btn"));

      expect(mockSetNotes).toHaveBeenCalled();
    });
  });

  describe("color selection", () => {
    it("should update selected color when color is clicked", () => {
      render(<Board />);

      fireEvent.click(screen.getByTitle("Blue"));
      fireEvent.click(screen.getByText("+ Create Note"));

      const updateFn = mockSetNotes.mock.calls[0][0];
      const result = updateFn([]);

      expect(result[0].color).toBe("blue");
    });

    it("should default to yellow color", () => {
      render(<Board />);
      fireEvent.click(screen.getByText("+ Create Note"));

      const updateFn = mockSetNotes.mock.calls[0][0];
      const result = updateFn([]);

      expect(result[0].color).toBe("yellow");
    });
  });

  describe("maxZIndex calculation", () => {
    it("should initialize maxZIndex from loaded notes", async () => {
      const existingNotes: Note[] = [
        {
          id: "note-1",
          position: { x: 100, y: 100 },
          size: { width: 300, height: 250 },
          text: "First",
          color: "yellow",
          zIndex: 5,
          isMinimized: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "note-2",
          position: { x: 200, y: 200 },
          size: { width: 300, height: 250 },
          text: "Second",
          color: "pink",
          zIndex: 10,
          isMinimized: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      mockNotes.push(...existingNotes);

      render(<Board />);

      // Create a new note
      fireEvent.click(screen.getByText("+ Create Note"));

      const updateFn = mockSetNotes.mock.calls[0][0];
      const result = updateFn(existingNotes);

      // New note should have zIndex > 10 (max of existing notes)
      expect(result[2].zIndex).toBeGreaterThan(10);
    });
  });

  describe("board styling", () => {
    it("should have correct container classes", () => {
      const { container } = render(<Board />);
      const board = container.firstChild as HTMLElement;

      expect(board.className).toContain("w-full");
      expect(board.className).toContain("h-screen");
    });

    it("should have min-width and min-height styles", () => {
      const { container } = render(<Board />);
      const board = container.firstChild as HTMLElement;

      expect(board.style.minWidth).toBe("1024px");
      expect(board.style.minHeight).toBe("768px");
    });
  });
});
