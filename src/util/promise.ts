/**
 * A promise that can be cancelled before completion.
 *
 * Extends the native Promise class to add cancellation support. When cancelled,
 * the promise resolves (not rejects) and calls an optional cleanup callback.
 *
 * This is useful for animations and effects that need to be interruptible,
 * allowing the final state to be shown immediately instead of waiting.
 *
 * @class CancellablePromise
 * @extends Promise
 * @template T - The type of value the promise resolves to (default: void)
 *
 * @example
 * ```typescript
 * const promise = new CancellablePromise(
 *   (resolve) => {
 *     setTimeout(resolve, 5000); // Would take 5 seconds
 *   },
 *   () => {
 *     console.log("Cancelled! Cleaning up...");
 *   }
 * );
 *
 * // Cancel after 1 second
 * setTimeout(() => promise.cancel(), 1000);
 * ```
 */
export class CancellablePromise<T = void> extends Promise<T> {
  /** Whether this promise has been cancelled */
  private _cancelled: boolean = false;
  /** Cleanup callback invoked on cancellation */
  private _onCancel?: () => void;
  /** Stored resolve function for cancellation */
  private _resolve!: (value: T | PromiseLike<T>) => void;
  /** Stored reject function (unused but captured) */
  private _reject!: (reason?: any) => void;

  /**
   * Creates a new CancellablePromise.
   *
   * @param {Function} executor - The executor function, same as native Promise.
   *   Receives `resolve` and `reject` callbacks.
   * @param {Function} [onCancel] - Optional cleanup callback invoked when `cancel()` is called.
   *   This runs before the promise resolves, allowing cleanup of timers, intervals, etc.
   */
  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
    ) => void,
    onCancel?: () => void,
  ) {
    let capturedResolve: (value: T | PromiseLike<T>) => void;
    let capturedReject: (reason?: any) => void;

    super((resolve, reject) => {
      capturedResolve = resolve;
      capturedReject = reject;
      // Execute the user's executor with these resolve/reject
      executor(resolve, reject);
    });

    this._onCancel = onCancel;
    this._resolve = capturedResolve!;
    this._reject = capturedReject!;
  }

  /**
   * Gets whether the promise has been cancelled.
   * @returns {boolean} True if cancelled, false otherwise
   */
  get cancelled(): boolean {
    return this._cancelled;
  }

  /**
   * Sets whether the promise has been cancelled.
   * @param {boolean} value - The cancelled state
   */
  set cancelled(value: boolean) {
    this._cancelled = value;
  }

  /**
   * Cancels the promise, invoking the cleanup callback and resolving immediately.
   *
   * This method:
   * 1. Marks the promise as cancelled
   * 2. Calls the `onCancel` callback (if provided) for cleanup
   * 3. Resolves the promise with the provided value (or undefined for void promises)
   *
   * Calling `cancel()` multiple times has no effect after the first call.
   *
   * @param {T} [value] - Optional value to resolve the promise with.
   *   For void promises (default), this can be omitted.
   */
  cancel(value?: T): void {
    if (this._cancelled) {
      return;
    }
    this._cancelled = true;
    this._onCancel?.();
    // Resolve with the provided value, or undefined for void promises
    this._resolve((value ?? undefined) as T);
  }
}
