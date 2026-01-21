// Scene action types
export type SceneActionType = "dialogue" | "show" | "hide";

/**
 * Options for dialogue display.
 * @typedef {Object} DialogueOptions
 * @property {("fade"|"typewriter")} [effect] - Text effect to apply
 */
export interface DialogueOptions {
  effect?: "fade" | "typewriter";
}

/**
 * Character position - can be a named position or coordinate object.
 * @typedef {string|Object} Position
 * @property {("left"|"center"|"right"|"far-left"|"far-right")} [named] - Named position
 * @property {Object} [coordinates] - Coordinate object with x and y
 * @property {number|string} [coordinates.x] - X coordinate (0.0-1.0 normalized, "100px", or "30%")
 * @property {number|string} [coordinates.y] - Y coordinate (0.0-1.0 normalized, "50px", or "80%")
 */
export type Position =
  | "left"
  | "center"
  | "right"
  | "far-left"
  | "far-right"
  | { x?: number | string; y?: number | string };

/**
 * Character size - width and height dimensions.
 * @typedef {Object} Size
 * @property {number|string} [width] - Width (0.0-1.0 normalized, "300px", or "50%")
 * @property {number|string} [height] - Height (0.0-1.0 normalized, "400px", or "60%")
 */
export interface Size {
  width?: number | string;
  height?: number | string;
}

export interface SceneAction {
  type: SceneActionType;
  character?: Character;
  text?: string;
  options?: DialogueOptions;
  position?: Position;
  size?: Size;
}

/**
 * Options for scene configuration.
 * @typedef {Object} SceneOptions
 * @property {string} [background] - Background image URL
 */
export interface SceneOptions {
  background?: string;
}

/**
 * Represents a character in the visual novel.
 * @class
 */
export class Character {
  private _name: string;
  private _image?: string;
  private _position?: Position;
  private _size?: Size;
  private _currentScene: Scene | null = null;

  /**
   * Creates a new Character instance.
   * @param {string} name - The character's name
   * @param {string} [image] - Optional image/sprite URL for the character
   * @constructor
   */
  constructor(name: string, image?: string) {
    this._name = name;
    this._image = image;
  }

  /**
   * Gets the character's name.
   * @returns {string} The character's name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Gets the character's image/sprite URL.
   * @returns {string|undefined} The character's image URL, if set
   */
  get image(): string | undefined {
    return this._image;
  }

  /**
   * Gets the character's position.
   * @returns {Position|undefined} The character's position, if set
   */
  get position(): Position | undefined {
    return this._position;
  }

  /**
   * Sets the character's position.
   * @param {Position|undefined} value - The position to set
   */
  set position(value: Position | undefined) {
    this._position = value;
  }

  /**
   * Gets the character's size.
   * @returns {Size|undefined} The character's size, if set
   */
  get size(): Size | undefined {
    return this._size;
  }

  /**
   * Sets the character's size.
   * @param {Size|undefined} value - The size to set
   */
  set size(value: Size | undefined) {
    this._size = value;
  }

  set currentScene(scene: Scene | null) {
    this._currentScene = scene;
  }

  /**
   * Queues dialogue for the character to speak.
   * @param {string} text - The dialogue text
   * @param {DialogueOptions} [options] - Optional dialogue options
   * @param {("fade"|"typewriter")} [options.effect] - Text effect to apply
   * @throws {Error} If character is not added to a scene
   */
  say(text: string, options?: DialogueOptions): void {
    if (!this._currentScene) {
      throw new Error(
        `Character "${this._name}" must be added to a scene before speaking`
      );
    }
    this._currentScene.addAction({
      type: "dialogue",
      character: this,
      text,
      options,
    });
  }

  /**
   * Shows the character in the current scene.
   * @param {Object} [options] - Optional show options
   * @param {Position} [options.position] - Override position for this show action
   * @param {Size} [options.size] - Override size for this show action
   * @throws {Error} If character is not added to a scene
   */
  show(options?: { position?: Position; size?: Size }): void {
    if (!this._currentScene) {
      throw new Error(
        `Character "${this._name}" must be added to a scene before showing`
      );
    }
    this._currentScene.addAction({
      type: "show",
      character: this,
      position: options?.position ?? this._position,
      size: options?.size ?? this._size,
    });
  }

  /**
   * Hides the character in the current scene.
   * @throws {Error} If character is not added to a scene
   */
  hide(): void {
    if (!this._currentScene) {
      throw new Error(
        `Character "${this._name}" must be added to a scene before hiding`
      );
    }
    this._currentScene.addAction({
      type: "hide",
      character: this,
    });
  }
}

/**
 * Represents a scene in the visual novel.
 * @class
 */
export class Scene {
  private _id: string;
  private _options: SceneOptions;
  private _actions: SceneAction[] = [];
  private characters: Set<Character> = new Set();

  /**
   * Creates a new Scene instance.
   * @param {string} id - Unique identifier for the scene
   * @param {SceneOptions} [options={}] - Scene configuration options
   * @param {string} [options.background] - Background image URL
   * @constructor
   */
  constructor(id: string, options: SceneOptions = {}) {
    this._id = id;
    this._options = options;
  }

  /**
   * Gets the scene's unique identifier.
   * @returns {string} The scene ID
   */
  get id() {
    return this._id;
  }

  /**
   * Gets the scene's options.
   * @returns {SceneOptions} The scene options
   */
  get options() {
    return this._options;
  }

  /**
   * Gets all actions in the scene.
   * @returns {SceneAction[]} Array of scene actions
   */
  get actions() {
    return [...this._actions];
  }

  /**
   * Adds a character to the scene. The character will be shown automatically.
   * @param {Character} character - The character to add
   * @param {Object} [options] - Optional add options
   * @param {Position} [options.position] - Position for the character
   * @param {Size} [options.size] - Size for the character
   */
  add(
    character: Character,
    options?: { position?: Position; size?: Size }
  ): void {
    this.characters.add(character);
    character.currentScene = this;
    // Show character by default when added
    this.addAction({
      type: "show",
      character,
      position: options?.position ?? character.position,
      size: options?.size ?? character.size,
    });
  }

  addAction(action: SceneAction): void {
    this._actions.push(action);
  }
}

/**
 * Manages the complete story script with all scenes.
 * @class
 */
export class Script {
  private _scenes: Scene[] = [];
  private sceneMap: Map<string, Scene> = new Map();

  /**
   * Adds a scene to the script. Scenes are played in the order they are added.
   * @param {Scene} scene - The scene to add
   * @throws {Error} If a scene with the same ID already exists
   */
  addScene(scene: Scene): void {
    if (this.sceneMap.has(scene.id)) {
      throw new Error(`Scene with id "${scene.id}" already exists`);
    }
    this._scenes.push(scene);
    this.sceneMap.set(scene.id, scene);
  }

  /**
   * Gets all scenes in the script.
   * @returns {Scene[]} Array of all scenes
   */
  get scenes() {
    return [...this._scenes];
  }

  /**
   * Gets a scene by its ID.
   * @param {string} id - The scene ID
   * @returns {Scene|undefined} The scene, or undefined if not found
   */
  getScene(id: string): Scene | undefined {
    return this.sceneMap.get(id);
  }

  /**
   * Gets a scene by its index in the script.
   * @param {number} index - The scene index
   * @returns {Scene|undefined} The scene, or undefined if index is out of bounds
   */
  getSceneByIndex(index: number): Scene | undefined {
    return this._scenes[index];
  }

  /**
   * Gets the index of a scene by its ID.
   * @param {string} id - The scene ID
   * @returns {number} The scene index, or -1 if not found
   */
  getSceneIndex(id: string): number {
    return this._scenes.findIndex((scene) => scene.id === id);
  }
}

// Game state interface
export interface GameState {
  variables: Record<string, any>;
  _currentSceneId: string | null;
  sceneHistory: string[];
}
