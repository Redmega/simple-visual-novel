import { CancellablePromise } from "../util/promise.js";

/**
 * Options for configuring the typewriter text effect.
 *
 * @interface TypewriterOptions
 * @property {number} [speed=50] - Characters per second. Higher values mean faster typing.
 * @property {Function} [onComplete] - Callback function invoked when the animation completes
 *   (either naturally or when cancelled).
 */
export interface TypewriterOptions {
  /** Characters per second (default: 50) */
  speed?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * Displays text character by character with a typewriter effect.
 *
 * The text is revealed one character at a time, creating a typing animation.
 * The returned promise can be cancelled to immediately show the full text.
 *
 * @param {HTMLElement} element - The DOM element to display text in
 * @param {string} text - The text to display
 * @param {TypewriterOptions} [options={}] - Typewriter options
 * @param {number} [options.speed=50] - Characters per second
 * @param {Function} [options.onComplete] - Callback when animation completes
 * @returns {CancellablePromise} A cancellable promise that resolves when animation completes.
 *   Call `.cancel()` to immediately show the full text.
 *
 * @example
 * ```typescript
 * const element = document.getElementById("dialogue");
 * const animation = typewriter(element, "Hello, world!", { speed: 75 });
 *
 * // Optionally cancel to show full text immediately
 * animation.cancel();
 * ```
 */
export function typewriter(
  element: HTMLElement,
  text: string,
  options: TypewriterOptions = {},
): CancellablePromise {
  const speed = options.speed || 50; // default 50 chars per second
  const delay = 1000 / speed; // milliseconds per character

  let interval: ReturnType<typeof setInterval> | null = null;
  let index = 0;

  element.textContent = "";
  const promise = new CancellablePromise(
    (resolve) => {
      interval = setInterval(() => {
        // Check if cancelled before adding more characters
        if (promise.cancelled) {
          return;
        }
        if (index < text.length) {
          element.textContent += text[index];
          index++;
        } else {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          options.onComplete?.();
          resolve();
        }
      }, delay);
    },
    () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      element.textContent = text;
      options.onComplete?.();
    },
  );

  return promise;
}

/**
 * Options for configuring fade effects.
 *
 * @interface FadeOptions
 * @property {number} [duration=500] - Animation duration in milliseconds.
 * @property {Function} [onComplete] - Callback function invoked when the animation completes
 *   (either naturally or when cancelled).
 */
export interface FadeOptions {
  /** Animation duration in milliseconds (default: 500) */
  duration?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * Fades in an element by animating its opacity from 0 to 1.
 *
 * Uses CSS transitions for smooth animation. The returned promise can be
 * cancelled to immediately show the element at full opacity.
 *
 * @param {HTMLElement} element - The DOM element to fade in
 * @param {FadeOptions} [options={}] - Fade options
 * @param {number} [options.duration=500] - Animation duration in milliseconds
 * @param {Function} [options.onComplete] - Callback when animation completes
 * @returns {CancellablePromise} A cancellable promise that resolves when animation completes.
 *   Call `.cancel()` to immediately show the element at full opacity.
 *
 * @example
 * ```typescript
 * const element = document.getElementById("character");
 * const animation = fadeIn(element, { duration: 300 });
 *
 * // Optionally cancel to show immediately
 * animation.cancel();
 * ```
 */
export function fadeIn(
  element: HTMLElement,
  options: FadeOptions = {},
): CancellablePromise {
  const duration = options.duration || 500; // default 500ms

  let timeout: ReturnType<typeof setTimeout> | null = null;
  const promise = new CancellablePromise(
    (resolve) => {
      element.style.opacity = "0";
      element.style.transition = `opacity ${duration}ms ease-in`;
      element.style.opacity = "1";
      setTimeout(() => {
        resolve();
        options.onComplete?.();
      }, duration);
    },
    () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      // Immediately show the element at full opacity
      element.style.transition = "none";
      element.style.opacity = "1";
      options.onComplete?.();
    },
  );
  return promise;
}

/**
 * Fades out an element by animating its opacity from 1 to 0.
 *
 * Uses CSS transitions for smooth animation. The returned promise can be
 * cancelled to immediately hide the element.
 *
 * @param {HTMLElement} element - The DOM element to fade out
 * @param {FadeOptions} [options={}] - Fade options
 * @param {number} [options.duration=500] - Animation duration in milliseconds
 * @param {Function} [options.onComplete] - Callback when animation completes
 * @returns {CancellablePromise} A cancellable promise that resolves when animation completes.
 *   Call `.cancel()` to immediately hide the element.
 *
 * @example
 * ```typescript
 * const element = document.getElementById("character");
 * const animation = fadeOut(element, { duration: 300 });
 *
 * // Optionally cancel to hide immediately
 * animation.cancel();
 * ```
 */
export function fadeOut(
  element: HTMLElement,
  options: FadeOptions = {},
): Promise<void> {
  const duration = options.duration || 500; // default 500ms

  let timeout: ReturnType<typeof setTimeout> | null = null;
  const promise = new CancellablePromise(
    (resolve) => {
      element.style.opacity = "1";
      element.style.transition = `opacity ${duration}ms ease-out`;
      element.style.opacity = "0";
      setTimeout(() => {
        resolve();
        options.onComplete?.();
      }, duration);
    },
    () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      // Immediately show the element at full opacity
      element.style.transition = "none";
      element.style.opacity = "0";
      options.onComplete?.();
    },
  );
  return promise;
}
