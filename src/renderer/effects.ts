import { CancellablePromise } from "../util/promise.js";

export interface TypewriterOptions {
  speed?: number; // characters per second
  onComplete?: () => void;
}

/**
 * Displays text character by character with a typewriter effect.
 * @param {HTMLElement} element - The DOM element to display text in
 * @param {string} text - The text to display
 * @param {TypewriterOptions} [options={}] - Typewriter options
 * @param {number} [options.speed=50] - Characters per second
 * @param {Function} [options.onComplete] - Callback when animation completes
 * @returns {Promise<void>} Promise that resolves when animation completes
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

export interface FadeOptions {
  duration?: number; // milliseconds
  onComplete?: () => void;
}

/**
 * Fades in an element by animating its opacity from 0 to 1.
 * @param {HTMLElement} element - The DOM element to fade in
 * @param {FadeOptions} [options={}] - Fade options
 * @param {number} [options.duration=500] - Animation duration in milliseconds
 * @param {Function} [options.onComplete] - Callback when animation completes
 * @returns {Promise<void>} Promise that resolves when animation completes
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
 * @param {HTMLElement} element - The DOM element to fade out
 * @param {FadeOptions} [options={}] - Fade options
 * @param {number} [options.duration=500] - Animation duration in milliseconds
 * @param {Function} [options.onComplete] - Callback when animation completes
 * @returns {Promise<void>} Promise that resolves when animation completes
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
