# Sticky Notes App

A fully-featured draggable, resizable sticky notes application built with Next.js, React, and TypeScript. Create, organize, and manage notes with an intuitive interface and smooth interactions.

## Features

### Core Functionality

- **Create Notes**: Add sticky notes in 5 vibrant colors (yellow, pink, blue, green, purple)
- **Drag & Drop**: Smooth dragging by grabbing the note header
- **8-Direction Resize**: Resize from any corner or edge (N, S, E, W, NE, NW, SE, SW)
- **Minimize/Expand**: Collapse notes to show just the first line of text
- **Delete Notes**: Remove notes with a single click
- **Auto-save**: All changes persist automatically to localStorage
- **Z-index Management**: Click any note to bring it to the front

### User Experience

- **Toolbar Protection**: Notes can't overlap the toolbar area
- **Size Constraints**: Min size (150px) and max size (600px) for optimal viewing
- **Visual Feedback**: Hover effects, shadow transitions, and cursor changes
- **Loading State**: Smooth loading from localStorage on app start
- **Empty State**: Helpful message when no notes exist

### Architecture

- **Custom Hooks**: Clean separation of concerns with reusable hooks
- **TypeScript**: Full type safety across the entire codebase
- **Responsive Design**: Works seamlessly across different screen sizes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Persistence**: Browser localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository or download the source code

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Create a Note**: Select a color and click "Create Note"
2. **Move a Note**: Click and drag the header bar
3. **Resize a Note**: Drag any edge or corner
4. **Edit Text**: Click inside the note and start typing
5. **Minimize**: Click the dash icon in the header
6. **Delete**: Click the X icon in the header
7. **Bring to Front**: Click anywhere on the note

## Project Structure

```
sticky-notes/
├── app/
│   ├── globals.css          # Global styles and scrollbar customization
│   ├── layout.tsx            # Root layout with font configuration
│   └── page.tsx              # Main page component (renders Board)
│
├── components/
│   ├── Board.tsx             # Main board container, manages all notes
│   ├── StickyNote.tsx        # Individual note component with interactions
│   └── Toolbar.tsx           # Color picker and create button
│
├── hooks/
│   ├── useDragNote.ts        # Custom hook for drag functionality
│   ├── useResizeNote.ts      # Custom hook for resize functionality
│   └── useLocalStorage.ts    # Custom hook for localStorage persistence
│
├── types/
│   └── note.ts               # TypeScript interfaces (Note, Position, Size, etc.)
│
├── utils/
│   ├── constants.ts          # Color schemes and configuration constants
│   └── noteUtils.ts          # Utility functions (createNote, getFirstLine)
│
├── public/                   # Static assets
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## Key Components

### Board Component

- Manages global state for all notes
- Handles note creation, updates, and deletion
- Manages z-index ordering
- Provides localStorage persistence via custom hook
- Renders toolbar and all sticky notes

### StickyNote Component

- Individual note with header, textarea, and resize handles
- Uses `useDragNote` and `useResizeNote` hooks
- Handles minimize/expand functionality
- Manages text input and updates
- Visual feedback for dragging state

### Toolbar Component

- Color selection interface
- Create note button
- Auto-save indicator
- Usage instructions

## Custom Hooks

### useDragNote

- Handles mouse down, move, and up events for dragging
- Calculates position with toolbar collision detection
- Manages drag state and offset calculations
- Returns `isDragging` state and `handleDragStart` function

### useResizeNote

- Handles 8-directional resizing (corners + edges)
- Enforces min/max size constraints
- Calculates new dimensions and positions
- Returns `handleResizeStart` function

### useLocalStorage

- Syncs state with localStorage
- Handles loading and saving automatically
- Provides loading state for initial render
- Generic type support for any data structure

## Type Definitions

```typescript
interface Note {
  id: string;
  position: Position; // { x, y }
  size: Size; // { width, height }
  text: string;
  color: NoteColor; // "yellow" | "pink" | "blue" | "green" | "purple"
  zIndex: number;
  isMinimized: boolean;
  createdAt: number;
  updatedAt: number;
}
```

## Styling

- **Tailwind CSS**: Utility-first styling approach
- **Custom Scrollbar**: Styled scrollbars for better aesthetics
- **Color Schemes**: Predefined color palettes for each note color
- **Responsive**: Mobile-friendly design
- **Dark Mode**: Respects system preferences

## Performance Optimizations

- Event listener cleanup in hooks
- Efficient re-renders with proper dependencies
- localStorage debouncing via React state

## Future Enhancements

- Export/Import notes (JSON)
- Rich text formatting
- Note categories/tags
- Search and filter
- Keyboard shortcuts
- Cloud sync
- Collaborative editing
