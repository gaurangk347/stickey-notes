import {
  NOTE_COLORS,
  DEFAULT_NOTE_SIZE,
  MIN_NOTE_SIZE,
  MAX_NOTE_SIZE,
  HEADER_HEIGHT,
} from "@/utils/constants";

describe("constants", () => {
  describe("NOTE_COLORS", () => {
    const expectedColors = ["yellow", "pink", "blue", "green", "purple"];

    it("should have all expected color keys", () => {
      const colorKeys = Object.keys(NOTE_COLORS);
      expect(colorKeys).toEqual(expect.arrayContaining(expectedColors));
      expect(colorKeys.length).toBe(expectedColors.length);
    });

    expectedColors.forEach((color) => {
      describe(`${color} color`, () => {
        it("should have a body class", () => {
          expect(NOTE_COLORS[color as keyof typeof NOTE_COLORS].body).toBeDefined();
          expect(NOTE_COLORS[color as keyof typeof NOTE_COLORS].body).toMatch(/^bg-/);
        });

        it("should have a header class", () => {
          expect(NOTE_COLORS[color as keyof typeof NOTE_COLORS].header).toBeDefined();
          expect(NOTE_COLORS[color as keyof typeof NOTE_COLORS].header).toMatch(/^bg-/);
        });

        it("should have a border class", () => {
          expect(NOTE_COLORS[color as keyof typeof NOTE_COLORS].border).toBeDefined();
          expect(NOTE_COLORS[color as keyof typeof NOTE_COLORS].border).toMatch(/^border-/);
        });
      });
    });

    it("yellow should have correct CSS classes", () => {
      expect(NOTE_COLORS.yellow).toEqual({
        body: "bg-[#FFF9C4]",
        header: "bg-[#FFF59D]",
        border: "border-[#F9A825]",
      });
    });

    it("pink should have correct CSS classes", () => {
      expect(NOTE_COLORS.pink).toEqual({
        body: "bg-[#FCE4EC]",
        header: "bg-[#F8BBD0]",
        border: "border-[#E91E63]",
      });
    });

    it("blue should have correct CSS classes", () => {
      expect(NOTE_COLORS.blue).toEqual({
        body: "bg-[#E1F5FE]",
        header: "bg-[#B3E5FC]",
        border: "border-[#0288D1]",
      });
    });

    it("green should have correct CSS classes", () => {
      expect(NOTE_COLORS.green).toEqual({
        body: "bg-[#F1F8E9]",
        header: "bg-[#DCEDC8]",
        border: "border-[#689F38]",
      });
    });

    it("purple should have correct CSS classes", () => {
      expect(NOTE_COLORS.purple).toEqual({
        body: "bg-[#F3E5F5]",
        header: "bg-[#E1BEE7]",
        border: "border-[#7B1FA2]",
      });
    });
  });

  describe("DEFAULT_NOTE_SIZE", () => {
    it("should have width of 300", () => {
      expect(DEFAULT_NOTE_SIZE.width).toBe(300);
    });

    it("should have height of 250", () => {
      expect(DEFAULT_NOTE_SIZE.height).toBe(250);
    });
  });

  describe("MIN_NOTE_SIZE", () => {
    it("should have width of 150", () => {
      expect(MIN_NOTE_SIZE.width).toBe(150);
    });

    it("should have height of 150", () => {
      expect(MIN_NOTE_SIZE.height).toBe(150);
    });

    it("should be smaller than DEFAULT_NOTE_SIZE", () => {
      expect(MIN_NOTE_SIZE.width).toBeLessThan(DEFAULT_NOTE_SIZE.width);
      expect(MIN_NOTE_SIZE.height).toBeLessThan(DEFAULT_NOTE_SIZE.height);
    });
  });

  describe("MAX_NOTE_SIZE", () => {
    it("should have width of 600", () => {
      expect(MAX_NOTE_SIZE.width).toBe(600);
    });

    it("should have height of 600", () => {
      expect(MAX_NOTE_SIZE.height).toBe(600);
    });

    it("should be larger than DEFAULT_NOTE_SIZE", () => {
      expect(MAX_NOTE_SIZE.width).toBeGreaterThan(DEFAULT_NOTE_SIZE.width);
      expect(MAX_NOTE_SIZE.height).toBeGreaterThan(DEFAULT_NOTE_SIZE.height);
    });

    it("should be larger than MIN_NOTE_SIZE", () => {
      expect(MAX_NOTE_SIZE.width).toBeGreaterThan(MIN_NOTE_SIZE.width);
      expect(MAX_NOTE_SIZE.height).toBeGreaterThan(MIN_NOTE_SIZE.height);
    });
  });

  describe("HEADER_HEIGHT", () => {
    it("should be 40", () => {
      expect(HEADER_HEIGHT).toBe(40);
    });

    it("should be a positive number", () => {
      expect(HEADER_HEIGHT).toBeGreaterThan(0);
    });
  });

  describe("size constraints relationship", () => {
    it("DEFAULT size should be between MIN and MAX", () => {
      expect(DEFAULT_NOTE_SIZE.width).toBeGreaterThanOrEqual(MIN_NOTE_SIZE.width);
      expect(DEFAULT_NOTE_SIZE.width).toBeLessThanOrEqual(MAX_NOTE_SIZE.width);
      expect(DEFAULT_NOTE_SIZE.height).toBeGreaterThanOrEqual(MIN_NOTE_SIZE.height);
      expect(DEFAULT_NOTE_SIZE.height).toBeLessThanOrEqual(MAX_NOTE_SIZE.height);
    });
  });
});
