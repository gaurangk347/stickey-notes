import { renderHook, act } from "@testing-library/react";
import { useDragNote } from "@/hooks/useDragNote";
import { Note } from "@/types/note";

describe("useDragNote", () => {
  const createMockNote = (overrides?: Partial<Note>): Note => ({
    id: "note-1",
    position: { x: 300, y: 400 },
    size: { width: 300, height: 250 },
    text: "Test note",
    color: "yellow",
    zIndex: 1,
    isMinimized: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  const createMockMouseEvent = (clientX: number, clientY: number) => ({
    clientX,
    clientY,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  });

  let onUpdate: jest.Mock;
  let onBringToFront: jest.Mock;

  beforeEach(() => {
    onUpdate = jest.fn();
    onBringToFront = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return isDragging as false initially", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    expect(result.current.isDragging).toBe(false);
  });

  it("should return handleDragStart function", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    expect(typeof result.current.handleDragStart).toBe("function");
  });

  it("should set isDragging to true when drag starts", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    const mockEvent = createMockMouseEvent(400, 450);

    act(() => {
      result.current.handleDragStart(mockEvent as unknown as React.MouseEvent);
    });

    expect(result.current.isDragging).toBe(true);
  });

  it("should call onBringToFront when drag starts", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    const mockEvent = createMockMouseEvent(400, 450);

    act(() => {
      result.current.handleDragStart(mockEvent as unknown as React.MouseEvent);
    });

    expect(onBringToFront).toHaveBeenCalledWith("note-1");
  });

  it("should prevent default and stop propagation on drag start", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    const mockEvent = createMockMouseEvent(400, 450);

    act(() => {
      result.current.handleDragStart(mockEvent as unknown as React.MouseEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it("should update position on mouse move while dragging", () => {
    const note = createMockNote({ position: { x: 300, y: 400 } });
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    // Start drag at position (350, 420) - which is 50,20 from note position
    const startEvent = createMockMouseEvent(350, 420);

    act(() => {
      result.current.handleDragStart(startEvent as unknown as React.MouseEvent);
    });

    // Move mouse to (500, 500)
    const moveEvent = new MouseEvent("mousemove", {
      clientX: 500,
      clientY: 500,
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    // New position should be (500 - 50, 500 - 20) = (450, 480)
    expect(onUpdate).toHaveBeenCalledWith("note-1", {
      position: { x: 450, y: 480 },
    });
  });

  it("should constrain position to positive values", () => {
    // Position note outside toolbar area (y > 330)
    const note = createMockNote({ position: { x: 50, y: 400 } });
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    // Start drag with offset (25, 25)
    const startEvent = createMockMouseEvent(75, 425);

    act(() => {
      result.current.handleDragStart(startEvent as unknown as React.MouseEvent);
    });

    // Move to position that would result in negative coordinates
    // but still below toolbar area
    const moveEvent = new MouseEvent("mousemove", {
      clientX: 10, // Would result in x = -15, constrained to 0
      clientY: 400, // Keep y outside toolbar area
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    // Position x should be constrained to 0 minimum
    expect(onUpdate).toHaveBeenCalledWith("note-1", {
      position: expect.objectContaining({ x: 0 }),
    });
  });

  it("should set isDragging to false on mouse up", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    const startEvent = createMockMouseEvent(350, 420);

    act(() => {
      result.current.handleDragStart(startEvent as unknown as React.MouseEvent);
    });

    expect(result.current.isDragging).toBe(true);

    const mouseUpEvent = new MouseEvent("mouseup");

    act(() => {
      document.dispatchEvent(mouseUpEvent);
    });

    expect(result.current.isDragging).toBe(false);
  });

  it("should clean up event listeners on unmount", () => {
    const note = createMockNote();
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { result, unmount } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    const startEvent = createMockMouseEvent(350, 420);

    act(() => {
      result.current.handleDragStart(startEvent as unknown as React.MouseEvent);
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it("should not add event listeners when not dragging", () => {
    const note = createMockNote();
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    renderHook(() => useDragNote({ note, onUpdate, onBringToFront }));

    // Only useEffect setup runs, but should not add listeners yet
    const moveListenerCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === "mousemove"
    );

    expect(moveListenerCalls.length).toBe(0);

    addEventListenerSpy.mockRestore();
  });

  it("should push note to right of toolbar when overlapping", () => {
    // Note positioned at origin which overlaps toolbar area
    const note = createMockNote({
      position: { x: 0, y: 0 },
      size: { width: 300, height: 250 },
    });
    const { result } = renderHook(() =>
      useDragNote({ note, onUpdate, onBringToFront })
    );

    const startEvent = createMockMouseEvent(50, 50);

    act(() => {
      result.current.handleDragStart(startEvent as unknown as React.MouseEvent);
    });

    // Move to position inside toolbar area (x < 280, y < 330)
    const moveEvent = new MouseEvent("mousemove", {
      clientX: 100,
      clientY: 100,
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    // Should push x to 280 (toolbar right edge)
    expect(onUpdate).toHaveBeenCalledWith(
      "note-1",
      expect.objectContaining({
        position: expect.objectContaining({ x: 280 }),
      })
    );
  });
});
