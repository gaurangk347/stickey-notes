import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "sticky-notes";
const DEBOUNCE_DELAY = 300; // 300ms debounce

export function useLocalStorage<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        setValue(parsed);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage with debouncing
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    // Clear existing timeout
    if (timeoutRef?.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch (error) {
        console.error("Error saving to localStorage:", error);

        // Handle quota exceeded error
        if (
          error instanceof DOMException &&
          error.name === "QuotaExceededError"
        ) {
          console.warn(
            "localStorage quota exceeded. Consider clearing old notes."
          );
        }
      }
    }, DEBOUNCE_DELAY);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, isLoaded]);

  return [value, setValue, isLoaded] as const;
}
