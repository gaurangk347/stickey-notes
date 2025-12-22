"use client";

import { NoteColor } from "@/types/note";
import { NOTE_COLORS } from "@/utils/constants";

interface ToolbarProps {
  selectedColor: NoteColor;
  onColorSelect: (color: NoteColor) => void;
  onCreateNote: () => void;
}

export const Toolbar = ({
  selectedColor,
  onColorSelect,
  onCreateNote,
}: ToolbarProps) => {
  const colors: NoteColor[] = ["yellow", "pink", "blue", "green", "purple"];

  return (
    <div className="absolute top-6 left-6 bg-white rounded-xl shadow-xl p-5 z-9999 border border-gray-200">
      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
        Sticky Notes
      </h3>

      {/* Color picker */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          Select Color:
        </label>
        <div className="flex gap-2">
          {colors.map((color) => {
            const colorClass = NOTE_COLORS[color].body;
            const borderClass = NOTE_COLORS[color].border;
            return (
              <button
                key={color}
                onClick={() => onColorSelect(color)}
                className={`w-9 h-9 rounded-lg border-2 transition-all duration-200 ${colorClass} ${
                  selectedColor === color
                    ? `${borderClass} border-4 scale-110 shadow-md`
                    : "border-gray-300 hover:scale-105 hover:shadow-sm"
                }`}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            );
          })}
        </div>
      </div>

      {/* Create button */}
      <button
        onClick={onCreateNote}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
      >
        + Create Note
      </button>

      {/* Auto-save indicator */}
      <div className="mt-3 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center gap-2">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Auto-save enabled</span>
      </div>

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <p className="flex items-center gap-2">
          <span className="text-blue-500">•</span>
          Click to create note
        </p>
        <p className="flex items-center gap-2">
          <span className="text-blue-500">•</span>
          Drag header to move
        </p>
        <p className="flex items-center gap-2">
          <span className="text-blue-500">•</span>
          Drag edges to resize
        </p>
      </div>
    </div>
  );
};
