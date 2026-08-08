import { describe, expect, it } from "vitest";
import { classifyAttendance } from "./index";

describe("attendance classification", () => {
  it("marks at least 80 percent as present", () => {
    expect(classifyAttendance(48 * 60, 60 * 60)).toBe("PRESENT");
  });

  it("marks non-zero attendance under threshold as partial", () => {
    expect(classifyAttendance(20 * 60, 60 * 60)).toBe("PARTIAL");
  });

  it("marks zero attendance as absent", () => {
    expect(classifyAttendance(0, 60 * 60)).toBe("ABSENT");
  });
});

