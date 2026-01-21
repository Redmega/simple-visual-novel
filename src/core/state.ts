import type { GameState } from "./types.js";

/**
 * Manages game state including variables and scene history.
 *
 * The StateManager handles all persistent game state, including:
 * - Custom game variables (flags, counters, player choices, etc.)
 * - Current scene tracking
 * - Scene navigation history for back functionality
 *
 * State is stored in memory and can be accessed for save/load functionality.
 *
 * @class StateManager
 * @example
 * ```typescript
 * const stateManager = new StateManager("intro");
 *
 * // Set and get variables
 * stateManager.setVariable("hasKey", true);
 * stateManager.setVariable("gold", 100);
 *
 * const hasKey = stateManager.getVariable("hasKey"); // true
 * const allVars = stateManager.allVariables; // { hasKey: true, gold: 100 }
 *
 * // Scene navigation
 * stateManager.currentSceneId = "chapter1";
 * const history = stateManager.sceneHistory; // ["intro"]
 * ```
 */
export class StateManager {
  private _state: GameState;

  /**
   * Creates a new StateManager instance.
   * @param {string|null} [initialSceneId=null] - Initial scene ID
   */
  constructor(initialSceneId: string | null = null) {
    this._state = {
      variables: {},
      _currentSceneId: initialSceneId,
      sceneHistory: [],
    };
  }

  /**
   * Gets a shallow copy of the current game state.
   *
   * This returns a copy to prevent external mutation of the internal state.
   * Useful for save functionality or debugging.
   *
   * @returns {GameState} A copy of the current game state
   */
  get state(): GameState {
    return { ...this._state };
  }

  /**
   * Sets a game variable.
   * @param {string} key - Variable name
   * @param {*} value - Variable value
   */
  setVariable(key: string, value: any): void {
    this._state.variables[key] = value;
  }

  /**
   * Gets a game variable.
   * @param {string} key - Variable name
   * @returns {*} The variable value, or undefined if not set
   */
  getVariable(key: string): any {
    return this._state.variables[key];
  }

  /**
   * Gets all game variables.
   * @returns {Object<string, *>} Copy of all variables
   */
  get allVariables(): Record<string, any> {
    return { ...this._state.variables };
  }

  /**
   * Sets the current scene ID and adds previous scene to history.
   * @param {string|null} sceneId - The scene ID to set
   */
  set currentSceneId(sceneId: string | null) {
    if (this._state._currentSceneId) {
      this._state.sceneHistory.push(this._state._currentSceneId);
    }
    this._state._currentSceneId = sceneId;
  }

  /**
   * Gets the current scene ID.
   *
   * @returns {string|null} The ID of the currently active scene, or null if none
   */
  get currentSceneId(): string | null {
    return this._state._currentSceneId;
  }

  /**
   * Gets a copy of the scene navigation history.
   *
   * The history contains scene IDs in the order they were visited,
   * with the most recently visited scene at the end.
   *
   * @returns {string[]} Array of previously visited scene IDs
   */
  get sceneHistory(): string[] {
    return [...this._state.sceneHistory];
  }

  /**
   * Clears the scene navigation history.
   *
   * This can be useful when starting a new game or when you don't want
   * players to be able to navigate back to previous scenes.
   */
  clearHistory(): void {
    this._state.sceneHistory = [];
  }
}
