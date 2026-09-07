import { describe, expect, it } from "vitest";
import { type MouseEvent } from "react";
import { isPlainLeftClick } from "./is-plain-left-click";

function fakeEvent(overrides: Partial<MouseEvent<HTMLElement>> = {}): MouseEvent<HTMLElement> {
  return {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  } as MouseEvent<HTMLElement>;
}

describe("isPlainLeftClick", () => {
  it("is true for a plain primary-button click with no modifier keys", () => {
    expect(isPlainLeftClick(fakeEvent())).toBe(true);
  });

  it("is false when the event was already prevented", () => {
    expect(isPlainLeftClick(fakeEvent({ defaultPrevented: true }))).toBe(false);
  });

  it("is false for a non-primary button (e.g. middle click)", () => {
    expect(isPlainLeftClick(fakeEvent({ button: 1 }))).toBe(false);
  });

  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"] as const)("is false when %s is held", (key) => {
    expect(isPlainLeftClick(fakeEvent({ [key]: true }))).toBe(false);
  });
});
