import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { typewriter, fadeIn, fadeOut } from "../../src/renderer/effects.js";

describe("effects", () => {
  let element: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement("div");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("typewriter", () => {
    it("should display text character by character", async () => {
      const text = "Hello";
      const speed = 10; // 10 chars per second = 100ms per char

      const promise = typewriter(element, text, { speed });

      await vi.advanceTimersByTimeAsync(100);

      expect(element.textContent).toBe("H");

      await vi.advanceTimersByTimeAsync(100);

      expect(element.textContent).toBe("He");

      // Fast-forward through all timers
      await vi.runAllTimersAsync();

      await promise;

      expect(element.textContent).toBe("Hello");
    });

    it("should use default speed if not specified", async () => {
      const text = "Test";

      const promise = typewriter(element, text);

      // default speed is 50 chars per second = 20ms per char

      await vi.advanceTimersByTimeAsync(20);
      expect(element.textContent).toBe("T");

      await vi.advanceTimersByTimeAsync(20);
      expect(element.textContent).toBe("Te");

      await vi.advanceTimersByTimeAsync(20);
      expect(element.textContent).toBe("Tes");

      await vi.advanceTimersByTimeAsync(20);
      expect(element.textContent).toBe("Test");

      await vi.runAllTimersAsync();
      await promise;

      expect(element.textContent).toBe("Test");
    });

    it("should call onComplete callback", async () => {
      const text = "Test";
      const onComplete = vi.fn();

      const promise = typewriter(element, text, { onComplete });

      await vi.runAllTimersAsync();
      await promise;

      expect(onComplete).toHaveBeenCalled();
    });

    it("should start with empty text content", async () => {
      element.textContent = "Initial";
      const text = "Test";

      const promise = typewriter(element, text);

      // Check immediately after starting
      expect(element.textContent).toBe("");

      await vi.runAllTimersAsync();
      await promise;
    });

    it("should handle cancellation during interval callback execution", async () => {
      const text = "Hello World";
      const speed = 10; // 10 chars per second = 100ms per char

      const promise = typewriter(element, text, { speed });

      await vi.advanceTimersByTimeAsync(200); // Should have displayed "He"

      expect(element.textContent).toBe("He");

      promise.cancel();

      expect(promise.cancelled).toBe(true);

      await vi.advanceTimersByTimeAsync(100);

      expect(element.textContent).toBe(text);

      // Wait for promise to resolve
      await promise;

      expect(element.textContent).toBe(text);
    });
  });

  describe("fadeIn", () => {
    beforeEach(() => {
      element.style.opacity = "0";
    });

    it("should fade in element", async () => {
      const promise = fadeIn(element);

      // Fast-forward timers (CSS transitions may not work with fake timers, but timeout will)
      await vi.runAllTimersAsync();
      await promise;

      // The opacity should be set to "1" even if transition doesn't complete
      expect(element.style.opacity).toBe("1");
    });

    it("should use default duration if not specified", async () => {
      const promise = fadeIn(element);

      await vi.runAllTimersAsync();
      await promise;

      expect(element.style.opacity).toBe("1");
    });

    it("should call onComplete callback", async () => {
      const onComplete = vi.fn();

      const promise = fadeIn(element, { onComplete });

      await vi.runAllTimersAsync();
      await promise;

      expect(onComplete).toHaveBeenCalled();
    });

    it("should set transition style", async () => {
      const promise = fadeIn(element, { duration: 300 });

      // Check transition is set immediately
      expect(element.style.transition).toContain("opacity");

      await vi.runAllTimersAsync();
      await promise;
    });

    it("should handle transitionend event cleanup", async () => {
      const promise = fadeIn(element, { duration: 300 });

      // Wait a bit for the event listener to be attached
      await vi.runAllTimersAsync();

      // Trigger transitionend event to test cleanup
      const transitionEndEvent = new Event("transitionend", { bubbles: true });
      element.dispatchEvent(transitionEndEvent);

      await vi.runAllTimersAsync();
      await promise;

      // Should complete successfully
      expect(element.style.opacity).toBe("1");
    });
  });

  describe("fadeOut", () => {
    beforeEach(() => {
      element.style.opacity = "1";
    });

    it("should fade out element", async () => {
      const promise = fadeOut(element);

      await vi.runAllTimersAsync();
      await promise;

      expect(element.style.opacity).toBe("0");
    });

    it("should use default duration if not specified", async () => {
      const promise = fadeOut(element);

      await vi.runAllTimersAsync();
      await promise;

      expect(element.style.opacity).toBe("0");
    });

    it("should call onComplete callback", async () => {
      const onComplete = vi.fn();

      const promise = fadeOut(element, { onComplete });

      await vi.runAllTimersAsync();
      await promise;

      expect(onComplete).toHaveBeenCalled();
    });

    it("should handle transitionend event cleanup", async () => {
      const promise = fadeOut(element, { duration: 300 });

      // Wait a bit for the event listener to be attached
      await vi.runAllTimersAsync();

      // Trigger transitionend event to test cleanup
      const transitionEndEvent = new Event("transitionend", { bubbles: true });
      element.dispatchEvent(transitionEndEvent);

      await vi.runAllTimersAsync();
      await promise;

      // Should complete successfully
      expect(element.style.opacity).toBe("0");
    });
  });
});
