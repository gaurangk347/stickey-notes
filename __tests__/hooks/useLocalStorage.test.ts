import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  const STORAGE_KEY = "sticky-notes";
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    jest.useFakeTimers();

    const localStorageGetItem = jest.fn((key: string) => localStorageMock[key] || null);
    const localStorageSetItem = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    const localStorageRemoveItem = jest.fn((key: string) => {
      delete localStorageMock[key];
    });

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: localStorageGetItem,
        setItem: localStorageSetItem,
        removeItem: localStorageRemoveItem,
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("should return initial value when localStorage is empty", async () => {
    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true); // isLoaded
    });

    expect(result.current[0]).toEqual([]);
  });

  it("should load existing data from localStorage", async () => {
    const existingData = [{ id: "note-1", text: "Test note" }];
    localStorageMock[STORAGE_KEY] = JSON.stringify(existingData);

    const { result } = renderHook(() => useLocalStorage<typeof existingData>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toEqual(existingData);
  });

  it("should return isLoaded as false initially, then true after loading", async () => {
    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    // After the effect runs, isLoaded should be true
    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });
  });

  it("should update the value when setValue is called", async () => {
    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    act(() => {
      result.current[1](["new item"]);
    });

    expect(result.current[0]).toEqual(["new item"]);
  });

  it("should debounce saves to localStorage", async () => {
    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    act(() => {
      result.current[1](["item 1"]);
    });

    // localStorage should not be updated immediately
    expect(window.localStorage.setItem).not.toHaveBeenCalled();

    // Fast-forward debounce timer (300ms)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(["item 1"])
    );
  });

  it("should cancel previous debounce when new value is set", async () => {
    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    // Set first value
    act(() => {
      result.current[1](["first"]);
    });

    // Advance time but not enough to trigger save
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Set second value (should cancel first debounce)
    act(() => {
      result.current[1](["second"]);
    });

    // Advance full debounce time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Only the second value should be saved
    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(["second"])
    );
  });

  it("should handle localStorage parsing errors gracefully", async () => {
    localStorageMock[STORAGE_KEY] = "invalid json {{{";
    const consoleError = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    // Should use initial value when parsing fails
    expect(result.current[0]).toEqual([]);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("should handle localStorage setItem errors gracefully", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    act(() => {
      result.current[1](["test"]);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("should handle QuotaExceededError specifically", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const quotaError = new DOMException("Quota exceeded", "QuotaExceededError");
    (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw quotaError;
    });

    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    act(() => {
      result.current[1](["test"]);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("quota exceeded")
    );

    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it("should save loaded data after debounce delay", async () => {
    localStorageMock[STORAGE_KEY] = JSON.stringify(["existing"]);

    const { result } = renderHook(() => useLocalStorage<string[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    // Before debounce completes, setItem should not be called
    expect(window.localStorage.setItem).not.toHaveBeenCalled();

    // Advance timer past debounce delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // After debounce, setItem should be called with the loaded data
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(["existing"])
    );
  });

  it("should work with complex objects", async () => {
    const complexObject = {
      id: "note-1",
      position: { x: 100, y: 200 },
      size: { width: 300, height: 250 },
      text: "Hello World",
      color: "yellow",
    };
    localStorageMock[STORAGE_KEY] = JSON.stringify([complexObject]);

    const { result } = renderHook(() => useLocalStorage<typeof complexObject[]>([]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toEqual([complexObject]);
  });
});
