import { render, screen, fireEvent } from "@testing-library/react";
import { Toolbar } from "@/components/Toolbar";
import { NoteColor } from "@/types/note";

describe("Toolbar", () => {
  const defaultProps = {
    selectedColor: "yellow" as NoteColor,
    onColorSelect: jest.fn(),
    onCreateNote: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the toolbar title", () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText("Sticky Notes")).toBeInTheDocument();
  });

  it("should render color selection label", () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText("Select Color:")).toBeInTheDocument();
  });

  it("should render all 5 color buttons", () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.getByTitle("Yellow")).toBeInTheDocument();
    expect(screen.getByTitle("Pink")).toBeInTheDocument();
    expect(screen.getByTitle("Blue")).toBeInTheDocument();
    expect(screen.getByTitle("Green")).toBeInTheDocument();
    expect(screen.getByTitle("Purple")).toBeInTheDocument();
  });

  it("should render Create Note button", () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText("+ Create Note")).toBeInTheDocument();
  });

  it("should render auto-save indicator", () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText("Auto-save enabled")).toBeInTheDocument();
  });

  it("should render usage instructions", () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText("Click to create note")).toBeInTheDocument();
    expect(screen.getByText("Drag header to move")).toBeInTheDocument();
    expect(screen.getByText("Drag edges to resize")).toBeInTheDocument();
  });

  it("should call onColorSelect when a color button is clicked", () => {
    const onColorSelect = jest.fn();
    render(<Toolbar {...defaultProps} onColorSelect={onColorSelect} />);

    fireEvent.click(screen.getByTitle("Pink"));
    expect(onColorSelect).toHaveBeenCalledWith("pink");

    fireEvent.click(screen.getByTitle("Blue"));
    expect(onColorSelect).toHaveBeenCalledWith("blue");

    fireEvent.click(screen.getByTitle("Green"));
    expect(onColorSelect).toHaveBeenCalledWith("green");

    fireEvent.click(screen.getByTitle("Purple"));
    expect(onColorSelect).toHaveBeenCalledWith("purple");
  });

  it("should call onCreateNote when Create Note button is clicked", () => {
    const onCreateNote = jest.fn();
    render(<Toolbar {...defaultProps} onCreateNote={onCreateNote} />);

    fireEvent.click(screen.getByText("+ Create Note"));
    expect(onCreateNote).toHaveBeenCalledTimes(1);
  });

  it("should apply selected styling to the selected color", () => {
    const { rerender } = render(<Toolbar {...defaultProps} selectedColor="yellow" />);
    const yellowButton = screen.getByTitle("Yellow");
    expect(yellowButton.className).toContain("scale-110");

    rerender(<Toolbar {...defaultProps} selectedColor="pink" />);
    const pinkButton = screen.getByTitle("Pink");
    expect(pinkButton.className).toContain("scale-110");
  });

  it("should have correct positioning styles", () => {
    render(<Toolbar {...defaultProps} />);
    const toolbar = screen.getByText("Sticky Notes").closest("div");
    expect(toolbar).toHaveClass("absolute");
    expect(toolbar).toHaveClass("top-6");
    expect(toolbar).toHaveClass("left-6");
  });

  describe("color button interactions", () => {
    const colors: NoteColor[] = ["yellow", "pink", "blue", "green", "purple"];

    colors.forEach((color) => {
      it(`should call onColorSelect with "${color}" when ${color} button is clicked`, () => {
        const onColorSelect = jest.fn();
        render(<Toolbar {...defaultProps} onColorSelect={onColorSelect} />);

        const colorTitle = color.charAt(0).toUpperCase() + color.slice(1);
        fireEvent.click(screen.getByTitle(colorTitle));

        expect(onColorSelect).toHaveBeenCalledWith(color);
      });
    });
  });

  it("should handle multiple Create Note clicks", () => {
    const onCreateNote = jest.fn();
    render(<Toolbar {...defaultProps} onCreateNote={onCreateNote} />);

    const createButton = screen.getByText("+ Create Note");

    fireEvent.click(createButton);
    fireEvent.click(createButton);
    fireEvent.click(createButton);

    expect(onCreateNote).toHaveBeenCalledTimes(3);
  });
});
