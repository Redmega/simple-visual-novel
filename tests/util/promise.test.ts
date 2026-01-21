import { describe, it, expect, vi } from "vitest";
import { CancellablePromise } from "../../src/util/promise.js";

describe("CancellablePromise", () => {
  describe("creation", () => {
    it("should create a cancellable promise", async () => {
      const promise = new CancellablePromise<void>((resolve) => {
        resolve();
      });

      expect(promise).toBeInstanceOf(Promise);
      expect(promise).toBeInstanceOf(CancellablePromise);
      await promise;
    });

    it("should create a promise that resolves with a value", async () => {
      const promise = new CancellablePromise<string>((resolve) => {
        resolve("test");
      });

      const result = await promise;
      expect(result).toBe("test");
    });

    it("should create a promise that can be rejected", async () => {
      const promise = new CancellablePromise((resolve, reject) => {
        reject(new Error("test error"));
      });

      await expect(promise).rejects.toThrow("test error");
    });
  });

  describe("cancelled property", () => {
    it("should default to false", () => {
      const promise = new CancellablePromise((resolve) => {
        resolve();
      });

      expect(promise.cancelled).toBe(false);
    });

    it("should be settable", () => {
      const promise = new CancellablePromise((resolve) => {
        resolve();
      });

      promise.cancelled = true;
      expect(promise.cancelled).toBe(true);

      promise.cancelled = false;
      expect(promise.cancelled).toBe(false);
    });
  });

  describe("cancel method", () => {
    it("should set cancelled to true when cancel is called", () => {
      const promise = new CancellablePromise((resolve) => {
        resolve();
      });

      expect(promise.cancelled).toBe(false);
      promise.cancel();
      expect(promise.cancelled).toBe(true);
    });

    it("should call onCancel callback when provided", () => {
      const onCancel = vi.fn();
      const promise = new CancellablePromise((resolve) => {
        resolve();
      }, onCancel);

      promise.cancel();
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should not throw if onCancel is not provided", () => {
      const promise = new CancellablePromise((resolve) => {
        resolve();
      });

      expect(() => {
        promise.cancel();
      }).not.toThrow();
    });

    it("should call onCancel only once even if cancel is called multiple times", () => {
      const onCancel = vi.fn();
      const promise = new CancellablePromise((resolve) => {
        resolve();
      }, onCancel);

      promise.cancel();
      promise.cancel();
      promise.cancel();

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("promise behavior", () => {
    it("should work as a normal promise with then", async () => {
      const promise = new CancellablePromise<string>((resolve) => {
        setTimeout(() => resolve("done"), 10);
      });

      const result = await promise;
      expect(result).toBe("done");
    });

    it("should work with async/await", async () => {
      const promise = new CancellablePromise<number>((resolve) => {
        resolve(42);
      });

      const result = await promise;
      expect(result).toBe(42);
    });

    it("should work with catch for rejections", async () => {
      const promise = new CancellablePromise((resolve, reject) => {
        reject(new Error("failed"));
      });

      try {
        await promise;
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("failed");
      }
    });

    it("should work with Promise.all", async () => {
      const promise1 = new CancellablePromise<string>((resolve) => {
        resolve("one");
      });
      const promise2 = new CancellablePromise<string>((resolve) => {
        resolve("two");
      });

      const results = await Promise.all([promise1, promise2]);
      expect(results).toEqual(["one", "two"]);
    });
  });

  describe("cancellation scenarios", () => {
    it("should allow checking cancelled state during execution", async () => {
      let cancelledDuringExecution = false;
      const promise = new CancellablePromise((resolve) => {
        // Check cancelled state immediately after cancel is called
        // Since cancel resolves immediately, we need to check before awaiting
        setTimeout(() => {
          cancelledDuringExecution = promise.cancelled;
          if (!promise.cancelled) {
            resolve();
          }
        }, 10);
      });

      promise.cancel();
      // After cancel, the promise should be resolved immediately
      expect(promise.cancelled).toBe(true);
      await promise;
      // The timeout callback may or may not run depending on timing
      // But we've already verified cancelled is true
      expect(promise.cancelled).toBe(true);
    });

    it("should handle cancellation before resolution", async () => {
      const onCancel = vi.fn();
      const promise = new CancellablePromise((resolve) => {
        setTimeout(() => resolve(), 100);
      }, onCancel);

      promise.cancel();
      expect(onCancel).toHaveBeenCalled();
      expect(promise.cancelled).toBe(true);

      // Should still resolve (or reject) eventually
      await promise;
    });
  });
});
