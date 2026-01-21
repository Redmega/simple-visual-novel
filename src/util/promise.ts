/**
 * A promise that can be cancelled.
 * @class
 */
export class CancellablePromise<T = void> extends Promise<T> {
  private _cancelled: boolean = false;
  private _onCancel?: () => void;
  private _resolve!: (value: T | PromiseLike<T>) => void;
  private _reject!: (reason?: any) => void;

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
   * Cancels the promise. Calls the onCancel callback and resolves the promise.
   * For void promises, resolves with undefined. For typed promises, resolves with the provided value.
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
