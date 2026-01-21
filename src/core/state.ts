import type { GameState } from "./types.js";

/**
 * Manages game state including variables and scene history.
 * @class
 */
export class StateManager {
  private _state: GameState;

  /**
   * Creates a new StateManager instance.
   * @param {string|null} [initialSceneId=null] - Initial scene ID
   * @constructor
   */
  constructor(initialSceneId: string | null = null) {
    this._state = {
      variables: {},
      _currentSceneId: initialSceneId,
      sceneHistory: [],
    };
  }

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

  get currentSceneId() {
    return this._state._currentSceneId;
  }

  get sceneHistory() {
    return [...this._state.sceneHistory];
  }

  clearHistory(): void {
    this._state.sceneHistory = [];
  }
}
