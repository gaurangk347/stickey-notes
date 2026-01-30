import { render, screen, fireEvent } from "@testing-library/react";
import { StickyNote } from "@/components/StickyNote";
import { Note } from "@/types/note";

// Mock the custom hooks
jest.mock("@/hooks/useDragNote", () => ({
  useDragNote: jest.fn(() => ({
    isDragging: false,
    handleDragStart: jest.fn(),
  })),
}));

jest.mock("@/hooks/useResizeNote", () => ({
  useResizeNote: jest.fn(() => ({
    isResizing: false,
    handleResizeStart: jest.fn(),
  })),
}));

import { useDragNote } from "@/hooks/useDragNote";
import { useResizeNote } from "@/hooks/useResizeNote";

describe("StickyNote", () => {
  const createMockNote = (overrides?: Partial<Note>): Note => ({
    id: "note-1",
    position: { x: 100, y: 200 },
    size: { width: 300, height: 250 },
    text: "Test note content",
    color: "yellow",
    zIndex: 1,
    isMinimized: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  const defaultProps = {
    note: createMockNote(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onBringToFront: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDragNote as jest.Mock).mockReturnValue({
      isDragging: false,
      handleDragStart: jest.fn(),
    });
    (useResizeNote as jest.Mock).mockReturnValue({
      isResizing: false,
      handleResizeStart: jest.fn(),
    });
  });

  it("should render the note with correct position", () => {
    const { container } = render(<StickyNote {...defaultProps} />);
    const noteElement = container.firstChild as HTMLElement;

    expect(noteElement.style.left).toBe("100px");
    expect(noteElement.style.top).toBe("200px");
  });

  it("should render the note with correct size", () => {
    const { container } = render(<StickyNote {...defaultProps} />);
    const noteElement = container.firstChild as HTMLElement;

    expect(noteElement.style.width).toBe("300px");
    expect(noteElement.style.height).toBe("250px");
  });

  it("should render the note with correct zIndex", () => {
    const { container } = render(<StickyNote {...defaultProps} />);
    const noteElement = container.firstChild as HTMLElement;

    expect(noteElement.style.zIndex).toBe("1");
  });

  it("should render the textarea with note text", () => {
    render(<StickyNote {...defaultProps} />);
    const textarea = screen.getByPlaceholderText("Type your note here...");

    expect(textarea).toHaveValue("Test note content");
  });

  it("should render minimize button", () => {
    render(<StickyNote {...defaultProps} />);
    expect(screen.getByTitle("Minimize")).toBeInTheDocument();
  });

  it("should render delete button", () => {
    render(<StickyNote {...defaultProps} />);
    expect(screen.getByTitle("Delete note")).toBeInTheDocument();
  });

  it("should call onDelete when delete button is clicked", () => {
    const onDelete = jest.fn();
    render(<StickyNote {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(screen.getByTitle("Delete note"));

    expect(onDelete).toHaveBeenCalledWith("note-1");
  });

  it("should call onUpdate when text is changed", () => {
    const onUpdate = jest.fn();
    render(<StickyNote {...defaultProps} onUpdate={onUpdate} />);

    const textarea = screen.getByPlaceholderText("Type your note here...");
    fireEvent.change(textarea, { target: { value: "New content" } });

    expect(onUpdate).toHaveBeenCalledWith("note-1", { text: "New content" });
  });

  it("should call onBringToFront when note is clicked", () => {
    const onBringToFront = jest.fn();
    const { container } = render(
      <StickyNote {...defaultProps} onBringToFront={onBringToFront} />
    );

    fireEvent.click(container.firstChild as HTMLElement);

    expect(onBringToFront).toHaveBeenCalledWith("note-1");
  });

  describe("minimize functionality", () => {
    it("should toggle minimize state when minimize button is clicked", () => {
      const onUpdate = jest.fn();
      render(<StickyNote {...defaultProps} onUpdate={onUpdate} />);

      fireEvent.click(screen.getByTitle("Minimize"));

      expect(onUpdate).toHaveBeenCalledWith("note-1", { isMinimized: true });
    });

    it("should show Expand title when note is minimized", () => {
      const note = createMockNote({ isMinimized: true });
      render(<StickyNote {...defaultProps} note={note} />);

      expect(screen.getByTitle("Expand")).toBeInTheDocument();
    });

    it("should hide textarea when minimized", () => {
      const note = createMockNote({ isMinimized: true });
      render(<StickyNote {...defaultProps} note={note} />);

      expect(
        screen.queryByPlaceholderText("Type your note here...")
      ).not.toBeInTheDocument();
    });

    it("should show first line preview when minimized", () => {
      const note = createMockNote({
        isMinimized: true,
        text: "First line\nSecond line",
      });
      render(<StickyNote {...defaultProps} note={note} />);

      expect(screen.getByText(/First line/)).toBeInTheDocument();
    });

    it("should show 'Empty note...' when minimized with no text", () => {
      const note = createMockNote({ isMinimized: true, text: "" });
      render(<StickyNote {...defaultProps} note={note} />);

      expect(screen.getByText(/Empty note/)).toBeInTheDocument();
    });

    it("should set height to auto when minimized", () => {
      const note = createMockNote({ isMinimized: true });
      const { container } = render(<StickyNote {...defaultProps} note={note} />);
      const noteElement = container.firstChild as HTMLElement;

      expect(noteElement.style.height).toBe("auto");
    });
  });

  describe("resize handles", () => {
    it("should render 8 resize handles when not minimized", () => {
      const { container } = render(<StickyNote {...defaultProps} />);

      const nwResize = container.querySelector(".cursor-nw-resize");
      const neResize = container.querySelector(".cursor-ne-resize");
      const swResize = container.querySelector(".cursor-sw-resize");
      const seResize = container.querySelector(".cursor-se-resize");
      const nResize = container.querySelector(".cursor-n-resize");
      const sResize = container.querySelector(".cursor-s-resize");
      const wResize = container.querySelector(".cursor-w-resize");
      const eResize = container.querySelector(".cursor-e-resize");

      expect(nwResize).toBeInTheDocument();
      expect(neResize).toBeInTheDocument();
      expect(swResize).toBeInTheDocument();
      expect(seResize).toBeInTheDocument();
      expect(nResize).toBeInTheDocument();
      expect(sResize).toBeInTheDocument();
      expect(wResize).toBeInTheDocument();
      expect(eResize).toBeInTheDocument();
    });

    it("should not render resize handles when minimized", () => {
      const note = createMockNote({ isMinimized: true });
      const { container } = render(<StickyNote {...defaultProps} note={note} />);

      expect(container.querySelector(".cursor-nw-resize")).not.toBeInTheDocument();
      expect(container.querySelector(".cursor-se-resize")).not.toBeInTheDocument();
    });
  });

  describe("color schemes", () => {
    const colors = ["yellow", "pink", "blue", "green", "purple"] as const;

    colors.forEach((color) => {
      it(`should apply correct classes for ${color} color`, () => {
        const note = createMockNote({ color });
        const { container } = render(<StickyNote {...defaultProps} note={note} />);
        const noteElement = container.firstChild as HTMLElement;

        expect(noteElement.className).toContain(`bg-[#`);
        expect(noteElement.className).toContain(`border-[#`);
      });
    });
  });

  describe("drag state", () => {
    it("should apply reduced opacity when dragging", () => {
      (useDragNote as jest.Mock).mockReturnValue({
        isDragging: true,
        handleDragStart: jest.fn(),
      });

      const { container } = render(<StickyNote {...defaultProps} />);
      const noteElement = container.firstChild as HTMLElement;

      expect(noteElement.style.opacity).toBe("0.9");
    });

    it("should apply full opacity when not dragging", () => {
      const { container } = render(<StickyNote {...defaultProps} />);
      const noteElement = container.firstChild as HTMLElement;

      expect(noteElement.style.opacity).toBe("1");
    });

    it("should show grabbing cursor on header when dragging", () => {
      (useDragNote as jest.Mock).mockReturnValue({
        isDragging: true,
        handleDragStart: jest.fn(),
      });

      const { container } = render(<StickyNote {...defaultProps} />);
      const header = container.querySelector("[class*=cursor-grabbing]");

      expect(header).toBeInTheDocument();
    });

    it("should show grab cursor on header when not dragging", () => {
      const { container } = render(<StickyNote {...defaultProps} />);
      const header = container.querySelector("[class*=cursor-grab]");

      expect(header).toBeInTheDocument();
    });
  });

  describe("textarea interactions", () => {
    it("should stop propagation on mousedown to prevent drag", () => {
      render(<StickyNote {...defaultProps} />);
      const textarea = screen.getByPlaceholderText("Type your note here...");

      const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
      const stopPropagationSpy = jest.spyOn(mouseDownEvent, "stopPropagation");

      textarea.dispatchEvent(mouseDownEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it("should call onBringToFront when textarea is focused", () => {
      const onBringToFront = jest.fn();
      render(<StickyNote {...defaultProps} onBringToFront={onBringToFront} />);

      const textarea = screen.getByPlaceholderText("Type your note here...");
      fireEvent.focus(textarea);

      expect(onBringToFront).toHaveBeenCalledWith("note-1");
    });
  });

  describe("hooks integration", () => {
    it("should pass correct props to useDragNote", () => {
      const note = createMockNote();
      render(<StickyNote {...defaultProps} note={note} />);

      expect(useDragNote).toHaveBeenCalledWith(
        expect.objectContaining({
          note,
          onUpdate: defaultProps.onUpdate,
          onBringToFront: defaultProps.onBringToFront,
        })
      );
    });

    it("should pass correct props to useResizeNote", () => {
      const note = createMockNote();
      render(<StickyNote {...defaultProps} note={note} />);

      expect(useResizeNote).toHaveBeenCalledWith(
        expect.objectContaining({
          note,
          onUpdate: defaultProps.onUpdate,
          onBringToFront: defaultProps.onBringToFront,
        })
      );
    });
  });
});
