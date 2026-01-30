import { renderHook, act } from "@testing-library/react";
import { useResizeNote } from "@/hooks/useResizeNote";
import { Note } from "@/types/note";

describe("useResizeNote", () => {
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

  it("should return isResizing as false initially", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useResizeNote({ note, onUpdate, onBringToFront })
    );

    expect(result.current.isResizing).toBe(false);
  });

  it("should return handleResizeStart function", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useResizeNote({ note, onUpdate, onBringToFront })
    );

    expect(typeof result.current.handleResizeStart).toBe("function");
  });

  it("should set isResizing to true when resize starts", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useResizeNote({ note, onUpdate, onBringToFront })
    );

    const mockEvent = createMockMouseEvent(600, 650);

    act(() => {
      result.current.handleResizeStart(
        mockEvent as unknown as React.MouseEvent,
        "se"
      );
    });

    expect(result.current.isResizing).toBe(true);
  });

  it("should call onBringToFront when resize starts", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useResizeNote({ note, onUpdate, onBringToFront })
    );

    const mockEvent = createMockMouseEvent(600, 650);

    act(() => {
      result.current.handleResizeStart(
        mockEvent as unknown as React.MouseEvent,
        "se"
      );
    });

    expect(onBringToFront).toHaveBeenCalledWith("note-1");
  });

  it("should prevent default and stop propagation on resize start", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useResizeNote({ note, onUpdate, onBringToFront })
    );

    const mockEvent = createMockMouseEvent(600, 650);

    act(() => {
      result.current.handleResizeStart(
        mockEvent as unknown as React.MouseEvent,
        "se"
      );
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  describe("resize directions", () => {
    it("should resize SE corner (bottom-right)", () => {
      const note = createMockNote({ position: { x: 300, y: 400 } });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(600, 650);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "se"
        );
      });

      // Move to increase size by 100px in each direction
      const moveEvent = new MouseEvent("mousemove", {
        clientX: 700,
        clientY: 750,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 400, height: 350 },
        position: { x: 300, y: 400 },
      });
    });

    it("should resize NW corner (top-left)", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(300, 400);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "nw"
        );
      });

      // Move left and up by 50px each (note anchor is bottom-right)
      const moveEvent = new MouseEvent("mousemove", {
        clientX: 250,
        clientY: 350,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Width: 300 + 300 - 250 = 350
      // Height: 400 + 250 - 350 = 300
      // New X: 300 + 300 - 350 = 250
      // New Y: 400 + 250 - 300 = 350
      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 350, height: 300 },
        position: { x: 250, y: 350 },
      });
    });

    it("should resize NE corner (top-right)", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(600, 400);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "ne"
        );
      });

      // Increase width, decrease y (move up)
      const moveEvent = new MouseEvent("mousemove", {
        clientX: 650,
        clientY: 350,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Width: 650 - 300 = 350
      // Height: 400 + 250 - 350 = 300
      // X stays the same
      // New Y: 400 + 250 - 300 = 350
      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 350, height: 300 },
        position: { x: 300, y: 350 },
      });
    });

    it("should resize SW corner (bottom-left)", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(300, 650);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "sw"
        );
      });

      // Move left and down
      const moveEvent = new MouseEvent("mousemove", {
        clientX: 250,
        clientY: 700,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Width: 300 + 300 - 250 = 350
      // Height: 700 - 400 = 300
      // New X: 300 + 300 - 350 = 250
      // Y stays the same
      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 350, height: 300 },
        position: { x: 250, y: 400 },
      });
    });

    it("should resize E edge (right)", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(600, 500);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "e"
        );
      });

      const moveEvent = new MouseEvent("mousemove", {
        clientX: 700,
        clientY: 500,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 400, height: 250 },
        position: { x: 300, y: 400 },
      });
    });

    it("should resize W edge (left)", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(300, 500);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "w"
        );
      });

      const moveEvent = new MouseEvent("mousemove", {
        clientX: 200,
        clientY: 500,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Width: 300 + 300 - 200 = 400
      // New X: 300 + 300 - 400 = 200
      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 400, height: 250 },
        position: { x: 200, y: 400 },
      });
    });

    it("should resize S edge (bottom)", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(450, 650);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "s"
        );
      });

      const moveEvent = new MouseEvent("mousemove", {
        clientX: 450,
        clientY: 750,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 300, height: 350 },
        position: { x: 300, y: 400 },
      });
    });

    it("should resize N edge (top)", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(450, 400);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "n"
        );
      });

      const moveEvent = new MouseEvent("mousemove", {
        clientX: 450,
        clientY: 300,
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      // Height: 400 + 250 - 300 = 350
      // New Y: 400 + 250 - 350 = 300
      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 300, height: 350 },
        position: { x: 300, y: 300 },
      });
    });
  });

  describe("size constraints", () => {
    it("should enforce minimum size of 150px", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(600, 650);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "se"
        );
      });

      // Try to resize to smaller than minimum
      const moveEvent = new MouseEvent("mousemove", {
        clientX: 350, // Would make width 50
        clientY: 450, // Would make height 50
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 150, height: 150 },
        position: { x: 300, y: 400 },
      });
    });

    it("should enforce maximum size of 600px", () => {
      const note = createMockNote({
        position: { x: 300, y: 400 },
        size: { width: 300, height: 250 },
      });
      const { result } = renderHook(() =>
        useResizeNote({ note, onUpdate, onBringToFront })
      );

      const startEvent = createMockMouseEvent(600, 650);

      act(() => {
        result.current.handleResizeStart(
          startEvent as unknown as React.MouseEvent,
          "se"
        );
      });

      // Try to resize to larger than maximum
      const moveEvent = new MouseEvent("mousemove", {
        clientX: 1200, // Would make width 900
        clientY: 1200, // Would make height 800
      });

      act(() => {
        document.dispatchEvent(moveEvent);
      });

      expect(onUpdate).toHaveBeenCalledWith("note-1", {
        size: { width: 600, height: 600 },
        position: { x: 300, y: 400 },
      });
    });
  });

  it("should set isResizing to false on mouse up", () => {
    const note = createMockNote();
    const { result } = renderHook(() =>
      useResizeNote({ note, onUpdate, onBringToFront })
    );

    const startEvent = createMockMouseEvent(600, 650);

    act(() => {
      result.current.handleResizeStart(
        startEvent as unknown as React.MouseEvent,
        "se"
      );
    });

    expect(result.current.isResizing).toBe(true);

    const mouseUpEvent = new MouseEvent("mouseup");

    act(() => {
      document.dispatchEvent(mouseUpEvent);
    });

    expect(result.current.isResizing).toBe(false);
  });

  it("should clean up event listeners on unmount", () => {
    const note = createMockNote();
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { result, unmount } = renderHook(() =>
      useResizeNote({ note, onUpdate, onBringToFront })
    );

    const startEvent = createMockMouseEvent(600, 650);

    act(() => {
      result.current.handleResizeStart(
        startEvent as unknown as React.MouseEvent,
        "se"
      );
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
});
