import type { Script, Scene } from "./types.js";
import { StateManager } from "./state.js";
import type { RendererOptions } from "../renderer/renderer.js";
import { DOMRenderer } from "../renderer/renderer.js";

/**
 * Types of events emitted by the VNEngine.
 *
 * - `"sceneChange"` - Emitted when the current scene changes (includes `sceneId` in data)
 * - `"variableChange"` - Emitted when a game variable is set (includes `key` and `value` in data)
 *
 * @typedef {string} EngineEventType
 */
export type EngineEventType = "sceneChange" | "variableChange";

/**
 * Event object passed to engine event listeners.
 *
 * @interface EngineEvent
 * @property {EngineEventType} type - The type of event that occurred
 * @property {any} [data] - Event-specific data (e.g., `{ sceneId }` for scene changes)
 */
export interface EngineEvent {
  type: EngineEventType;
  data?: any;
}

/**
 * Callback function type for engine event listeners.
 *
 * @callback EngineEventListener
 * @param {EngineEvent} event - The event object containing type and data
 * @returns {void}
 */
export type EngineEventListener = (event: EngineEvent) => void;

/**
 * Options for creating a VNEngine instance.
 * @typedef {Object} VNEngineOptions
 * @property {Script} script - The story script
 * @property {string|HTMLElement} container - CSS selector or DOM element for rendering
 * @property {string} startScene - ID of the starting scene
 * @property {RendererOptions} [renderer] - Optional renderer configuration
 * @property {string} [renderer.assetsDirectory] - Base directory for asset paths (e.g., "assets", "/assets", "./assets")
 */
export interface VNEngineOptions {
  script: Script;
  container: string | HTMLElement;
  startScene: string;
  renderer?: RendererOptions;
}

/**
 * Main engine class for running visual novels.
 *
 * The VNEngine orchestrates the visual novel experience by managing the script,
 * game state, rendering, and event system. It provides methods for scene navigation,
 * variable management, and event handling.
 *
 * When created in a browser environment, it automatically instantiates a DOMRenderer
 * to display the visual novel.
 *
 * @class VNEngine
 * @example
 * ```typescript
 * const script = new Script();
 * // ... add scenes to script ...
 *
 * const engine = new VNEngine({
 *   script,
 *   container: "#game-container",
 *   startScene: "intro",
 *   renderer: {
 *     assetsDirectory: "assets",
 *     typewriterSpeed: 50
 *   }
 * });
 *
 * // Listen for events
 * engine.on("sceneChange", (event) => {
 *   console.log("Scene changed to:", event.data.sceneId);
 * });
 *
 * // Use game variables
 * engine.setVariable("playerName", "Alex");
 * ```
 */
export class VNEngine {
  private _script: Script;
  private _stateManager: StateManager;
  private listeners: Map<EngineEventType, Set<EngineEventListener>> = new Map();
  private _renderer: DOMRenderer | null = null;

  /**
   * Creates a new VNEngine instance.
   * @param {VNEngineOptions} options - Engine configuration options
   * @throws {Error} If the start scene is not found in the script
   *
   */
  constructor(options: VNEngineOptions) {
    this._script = options.script;
    const scene = this._script.getScene(options.startScene);
    if (!scene) {
      throw new Error(`Scene with id "${options.startScene}" not found`);
    }
    this._stateManager = new StateManager(options.startScene);

    // Create renderer if we're in a browser environment
    if (typeof document !== "undefined") {
      this._renderer = new DOMRenderer(
        options.container,
        this,
        options.renderer || {}
      );
    }

    this.emitEvent({
      type: "sceneChange",
      data: { sceneId: options.startScene },
    });
  }

  /**
   * Gets the script instance.
   * @type {Script}
   */
  get script(): Script {
    return this._script;
  }

  /**
   * Gets the current scene.
   * @type {Scene|undefined}
   */
  get currentScene(): Scene | undefined {
    const sceneId = this._stateManager.currentSceneId;
    if (!sceneId) {
      return undefined;
    }
    return this._script.getScene(sceneId);
  }

  /**
   * Jumps to a specific scene by ID.
   * @param {string} sceneId - The scene ID to jump to
   * @throws {Error} If the scene is not found
   */
  jumpTo(sceneId: string): void {
    const scene = this._script.getScene(sceneId);
    if (!scene) {
      throw new Error(`Scene with id "${sceneId}" not found`);
    }
    this._stateManager.currentSceneId = sceneId;
    this.emitEvent({ type: "sceneChange", data: { sceneId } });
  }

  /**
   * Moves to the next scene in the script order.
   * @returns {boolean} True if moved to next scene, false if no next scene exists
   */
  next(): boolean {
    const currentSceneId = this._stateManager.currentSceneId;
    if (!currentSceneId) {
      return false;
    }

    const currentIndex = this._script.getSceneIndex(currentSceneId);
    if (currentIndex === -1) {
      return false;
    }

    const nextScene = this._script.getSceneByIndex(currentIndex + 1);
    if (!nextScene) {
      return false;
    }

    this.jumpTo(nextScene.id);
    return true;
  }

  /**
   * Sets a game variable.
   * @param {string} key - Variable name
   * @param {*} value - Variable value
   */
  setVariable(key: string, value: any): void {
    this._stateManager.setVariable(key, value);
    this.emitEvent({ type: "variableChange", data: { key, value } });
  }

  /**
   * Gets a game variable.
   * @param {string} key - Variable name
   * @returns {*} The variable value, or undefined if not set
   */
  getVariable(key: string): any {
    return this._stateManager.getVariable(key);
  }

  /**
   * Gets all game variables.
   * @type {Object<string, *>}
   */
  get allVariables(): Record<string, any> {
    return this._stateManager.allVariables;
  }

  /**
   * Gets the state manager instance.
   * @type {StateManager}
   */
  get stateManager(): StateManager {
    return this._stateManager;
  }

  /**
   * Gets the renderer instance.
   * @type {DOMRenderer|null}
   */
  get renderer(): DOMRenderer | null {
    return this._renderer;
  }

  /**
   * Registers an event listener.
   * @param {EngineEventType} eventType - The event type to listen for
   * @param {EngineEventListener} listener - The callback function
   */
  on(eventType: EngineEventType, listener: EngineEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  /**
   * Removes an event listener.
   * @param {EngineEventType} eventType - The event type
   * @param {EngineEventListener} listener - The callback function to remove
   */
  off(eventType: EngineEventType, listener: EngineEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emits an event to all registered listeners for that event type.
   *
   * @param {EngineEvent} event - The event to emit
   * @internal
   */
  private emitEvent(event: EngineEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }
}
