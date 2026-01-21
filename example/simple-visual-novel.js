"use strict";
var SimpleVN = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    CancellablePromise: () => CancellablePromise,
    Character: () => Character,
    DOMRenderer: () => DOMRenderer,
    Scene: () => Scene,
    Script: () => Script,
    StateManager: () => StateManager,
    VNEngine: () => VNEngine,
    fadeIn: () => fadeIn,
    fadeOut: () => fadeOut,
    typewriter: () => typewriter
  });

  // src/core/state.ts
  var _StateManager = class _StateManager {
    /**
     * Creates a new StateManager instance.
     * @param {string|null} [initialSceneId=null] - Initial scene ID
     * @constructor
     */
    constructor(initialSceneId = null) {
      this._state = {
        variables: {},
        _currentSceneId: initialSceneId,
        sceneHistory: []
      };
    }
    get state() {
      return { ...this._state };
    }
    /**
     * Sets a game variable.
     * @param {string} key - Variable name
     * @param {*} value - Variable value
     */
    setVariable(key, value) {
      this._state.variables[key] = value;
    }
    /**
     * Gets a game variable.
     * @param {string} key - Variable name
     * @returns {*} The variable value, or undefined if not set
     */
    getVariable(key) {
      return this._state.variables[key];
    }
    /**
     * Gets all game variables.
     * @returns {Object<string, *>} Copy of all variables
     */
    get allVariables() {
      return { ...this._state.variables };
    }
    /**
     * Sets the current scene ID and adds previous scene to history.
     * @param {string|null} sceneId - The scene ID to set
     */
    set currentSceneId(sceneId) {
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
    clearHistory() {
      this._state.sceneHistory = [];
    }
  };
  __name(_StateManager, "StateManager");
  var StateManager = _StateManager;

  // src/util/promise.ts
  var _CancellablePromise = class _CancellablePromise extends Promise {
    constructor(executor, onCancel) {
      let capturedResolve;
      let capturedReject;
      super((resolve, reject) => {
        capturedResolve = resolve;
        capturedReject = reject;
        executor(resolve, reject);
      });
      this._cancelled = false;
      this._onCancel = onCancel;
      this._resolve = capturedResolve;
      this._reject = capturedReject;
    }
    /**
     * Gets whether the promise has been cancelled.
     * @returns {boolean} True if cancelled, false otherwise
     */
    get cancelled() {
      return this._cancelled;
    }
    /**
     * Sets whether the promise has been cancelled.
     * @param {boolean} value - The cancelled state
     */
    set cancelled(value) {
      this._cancelled = value;
    }
    /**
     * Cancels the promise. Calls the onCancel callback and resolves the promise.
     * For void promises, resolves with undefined. For typed promises, resolves with the provided value.
     */
    cancel(value) {
      if (this._cancelled) {
        return;
      }
      this._cancelled = true;
      this._onCancel?.();
      this._resolve(value ?? void 0);
    }
  };
  __name(_CancellablePromise, "CancellablePromise");
  var CancellablePromise = _CancellablePromise;

  // src/renderer/effects.ts
  function typewriter(element, text, options = {}) {
    const speed = options.speed || 50;
    const delay = 1e3 / speed;
    let interval = null;
    let index = 0;
    element.textContent = "";
    const promise = new CancellablePromise(
      (resolve) => {
        interval = setInterval(() => {
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
      }
    );
    return promise;
  }
  __name(typewriter, "typewriter");
  function fadeIn(element, options = {}) {
    const duration = options.duration || 500;
    let timeout = null;
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
        element.style.transition = "none";
        element.style.opacity = "1";
        options.onComplete?.();
      }
    );
    return promise;
  }
  __name(fadeIn, "fadeIn");
  function fadeOut(element, options = {}) {
    const duration = options.duration || 500;
    let timeout = null;
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
        element.style.transition = "none";
        element.style.opacity = "0";
        options.onComplete?.();
      }
    );
    return promise;
  }
  __name(fadeOut, "fadeOut");

  // src/renderer/renderer.ts
  var _DOMRenderer = class _DOMRenderer {
    /**
     * Creates a new DOMRenderer instance.
     * @param {string|HTMLElement} container - CSS selector or DOM element for rendering
     * @param {VNEngine} engine - The VNEngine instance
     * @param {RendererOptions} [options={}] - Renderer configuration options
     * @throws {Error} If container element is not found
     * @constructor
     */
    constructor(container, engine, options = {}) {
      this.currentActionIndex = 0;
      this.isProcessing = false;
      this.characterElements = /* @__PURE__ */ new Map();
      this.currentAnimation = null;
      let containerElement;
      if (typeof container === "string") {
        containerElement = document.querySelector(container);
        if (!containerElement) {
          throw new Error(`Container element "${container}" not found`);
        }
      } else {
        containerElement = container;
      }
      this.container = containerElement;
      this.engine = engine;
      this.options = options;
      this.setupDOM();
      this.setupEventListeners();
    }
    setupDOM() {
      this.backgroundLayer = document.createElement("div");
      this.backgroundLayer.className = "vn-background-layer";
      this.characterLayer = document.createElement("div");
      this.characterLayer.className = "vn-character-layer";
      this.dialogueBox = document.createElement("div");
      this.dialogueBox.className = "vn-dialogue-box";
      this.speakerName = document.createElement("div");
      this.speakerName.className = "vn-speaker-name";
      this.dialogueText = document.createElement("div");
      this.dialogueText.className = "vn-dialogue-text";
      this.dialogueBox.appendChild(this.speakerName);
      this.dialogueBox.appendChild(this.dialogueText);
      this.container.appendChild(this.backgroundLayer);
      this.container.appendChild(this.characterLayer);
      this.container.appendChild(this.dialogueBox);
    }
    setupEventListeners() {
      this.engine.on("sceneChange", async () => {
        await this.renderCurrentScene();
      });
      this.dialogueBox.addEventListener("click", async () => {
        if (this.currentAnimation) {
          this.currentAnimation.cancel();
          this.currentAnimation = null;
          this.isProcessing = false;
          return;
        }
        if (!this.isProcessing) {
          await this.nextAction();
        }
      });
    }
    async renderCurrentScene() {
      const scene = this.engine.currentScene;
      if (!scene) {
        return;
      }
      this.currentActionIndex = 0;
      const options = scene.options;
      if (options.background) {
        const backgroundUrl = this.resolveAssetPath(options.background);
        this.backgroundLayer.style.backgroundImage = `url(${backgroundUrl})`;
        this.backgroundLayer.style.backgroundSize = "cover";
        this.backgroundLayer.style.backgroundPosition = "center";
      }
      this.characterLayer.innerHTML = "";
      this.characterElements.clear();
      await this.processActions();
    }
    async processActions() {
      const scene = this.engine.currentScene;
      if (!scene) {
        return;
      }
      const actions = scene.actions;
      if (this.currentActionIndex >= actions.length) {
        return;
      }
      this.isProcessing = true;
      const action = actions[this.currentActionIndex];
      await this.processAction(action);
      this.isProcessing = false;
    }
    async processAction(action) {
      switch (action.type) {
        case "show":
          if (action.character) {
            this.showCharacter(action.character, action.position, action.size);
            return this.nextAction();
          }
          break;
        case "hide":
          if (action.character) {
            this.hideCharacter(action.character);
            return this.nextAction();
          }
          break;
        case "dialogue":
          if (action.character && action.text) {
            return this.displayDialogue(
              action.character,
              action.text,
              action.options
            );
          }
          break;
      }
    }
    showCharacter(character, position, size) {
      let element = this.characterElements.get(character);
      if (!element) {
        element = document.createElement("div");
        element.className = "vn-character";
        element.dataset.characterName = character.name;
        element.style.display = "none";
        element.style.position = "absolute";
        const imageUrl = character.image;
        if (imageUrl) {
          const img = document.createElement("img");
          img.src = this.resolveAssetPath(imageUrl);
          img.alt = character.name;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "contain";
          element.appendChild(img);
        }
        this.characterLayer.appendChild(element);
        this.characterElements.set(character, element);
      }
      if (position) {
        const { x, y } = this.resolvePosition(position);
        element.style.left = x;
        element.style.bottom = y;
        if (x.endsWith("%")) {
          element.style.transform = "translateX(-50%)";
        } else {
          element.style.transform = "";
        }
      }
      if (size) {
        const { width, height } = this.resolveSize(size);
        if (width) {
          element.style.width = width;
        }
        if (height) {
          element.style.height = height;
        }
      }
      element.style.display = "block";
      fadeIn(element);
    }
    hideCharacter(character) {
      const element = this.characterElements.get(character);
      if (element) {
        element.style.display = "none";
      }
    }
    async displayDialogue(character, text, options) {
      this.speakerName.textContent = character.name;
      const effect = options?.effect;
      if (effect === "typewriter") {
        this.dialogueText.textContent = "";
        const speed = this.options.typewriterSpeed || 50;
        this.currentAnimation = typewriter(this.dialogueText, text, { speed });
        await this.currentAnimation;
        this.currentAnimation = null;
      } else if (effect === "fade") {
        this.dialogueText.textContent = text;
        this.dialogueText.style.opacity = "0";
        this.dialogueText.style.transition = "none";
        void this.dialogueText.offsetHeight;
        this.currentAnimation = fadeIn(this.dialogueText);
        await this.currentAnimation;
        this.currentAnimation = null;
      } else {
        this.dialogueText.textContent = text;
        this.dialogueText.style.opacity = "1";
      }
    }
    async nextAction() {
      const scene = this.engine.currentScene;
      if (!scene) {
        return;
      }
      const actions = scene.actions;
      this.currentActionIndex++;
      if (this.currentActionIndex >= actions.length) {
        const hasNext = this.engine.next();
        if (!hasNext) {
          this.dialogueText.textContent = "";
          this.speakerName.textContent = "";
        }
        return;
      }
      await this.processActions();
    }
    /**
     * Resolves an asset path using the configured assets directory.
     * @param {string} path - The asset path (relative or absolute)
     * @returns {string} The resolved asset path
     * @private
     */
    resolveAssetPath(path) {
      if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
        return path;
      }
      if (!this.options.assetsDirectory) {
        return path;
      }
      const assetsDir = this.options.assetsDirectory.replace(/\/$/, "");
      return `${assetsDir}/${path}`;
    }
    /**
     * Resolves a position to CSS values.
     * @param {Position} position - The position to resolve
     * @returns {{x: string, y: string}} Resolved x and y CSS values
     * @private
     */
    resolvePosition(position) {
      let newPosition;
      if (typeof position === "string") {
        newPosition = _DOMRenderer.NAMED_POSITIONS[position] ?? {
          x: "50%",
          y: "0"
        };
      } else {
        const toCSS = /* @__PURE__ */ __name((val, fallback) => val === void 0 ? fallback : typeof val === "number" ? `${val * 100}%` : val, "toCSS");
        newPosition = {
          x: toCSS(position.x, "50%"),
          y: toCSS(position.y, "0")
        };
      }
      if (newPosition.y === "0") {
        newPosition.y = this.dialogueBox.offsetHeight + "px";
      }
      return newPosition;
    }
    /**
     * Resolves a size to CSS values.
     * @param {Size} size - The size to resolve
     * @returns {{width?: string, height?: string}} Resolved width and height CSS values
     * @private
     */
    resolveSize(size) {
      const toCSS = /* @__PURE__ */ __name((val) => val === void 0 ? void 0 : typeof val === "number" ? `${val * 100}%` : val, "toCSS");
      return {
        width: toCSS(size.width),
        height: toCSS(size.height)
      };
    }
  };
  __name(_DOMRenderer, "DOMRenderer");
  /** Named position lookup table */
  _DOMRenderer.NAMED_POSITIONS = {
    // Horizontal positions (bottom aligned)
    "far-left": { x: "10%", y: "0" },
    left: { x: "25%", y: "0" },
    center: { x: "50%", y: "0" },
    right: { x: "75%", y: "0" },
    "far-right": { x: "90%", y: "0" },
    // Vertical positions (center aligned horizontally)
    top: { x: "50%", y: "100%" },
    bottom: { x: "50%", y: "0" },
    // Combined positions
    "top-left": { x: "25%", y: "100%" },
    "top-center": { x: "50%", y: "100%" },
    "top-right": { x: "75%", y: "100%" },
    "bottom-left": { x: "25%", y: "0" },
    "bottom-center": { x: "50%", y: "0" },
    "bottom-right": { x: "75%", y: "0" }
  };
  var DOMRenderer = _DOMRenderer;

  // src/core/engine.ts
  var _VNEngine = class _VNEngine {
    /**
     * Creates a new VNEngine instance.
     * @param {VNEngineOptions} options - Engine configuration options
     * @throws {Error} If the start scene is not found in the script
     * @constructor
     */
    constructor(options) {
      this.listeners = /* @__PURE__ */ new Map();
      this._renderer = null;
      this._script = options.script;
      const scene = this._script.getScene(options.startScene);
      if (!scene) {
        throw new Error(`Scene with id "${options.startScene}" not found`);
      }
      this._stateManager = new StateManager(options.startScene);
      if (typeof document !== "undefined") {
        this._renderer = new DOMRenderer(options.container, this, options.renderer || {});
      }
      this.emitEvent({ type: "sceneChange", data: { sceneId: options.startScene } });
    }
    /**
     * Gets the script instance.
     * @type {Script}
     */
    get script() {
      return this._script;
    }
    /**
     * Gets the current scene.
     * @type {Scene|undefined}
     */
    get currentScene() {
      const sceneId = this._stateManager.currentSceneId;
      if (!sceneId) {
        return void 0;
      }
      return this._script.getScene(sceneId);
    }
    /**
     * Jumps to a specific scene by ID.
     * @param {string} sceneId - The scene ID to jump to
     * @throws {Error} If the scene is not found
     */
    jumpTo(sceneId) {
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
    next() {
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
    setVariable(key, value) {
      this._stateManager.setVariable(key, value);
      this.emitEvent({ type: "variableChange", data: { key, value } });
    }
    /**
     * Gets a game variable.
     * @param {string} key - Variable name
     * @returns {*} The variable value, or undefined if not set
     */
    getVariable(key) {
      return this._stateManager.getVariable(key);
    }
    /**
     * Gets all game variables.
     * @type {Object<string, *>}
     */
    get allVariables() {
      return this._stateManager.allVariables;
    }
    /**
     * Gets the state manager instance.
     * @type {StateManager}
     */
    get stateManager() {
      return this._stateManager;
    }
    /**
     * Gets the renderer instance.
     * @type {DOMRenderer|null}
     */
    get renderer() {
      return this._renderer;
    }
    /**
     * Registers an event listener.
     * @param {EngineEventType} eventType - The event type to listen for
     * @param {EngineEventListener} listener - The callback function
     */
    on(eventType, listener) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, /* @__PURE__ */ new Set());
      }
      this.listeners.get(eventType).add(listener);
    }
    /**
     * Removes an event listener.
     * @param {EngineEventType} eventType - The event type
     * @param {EngineEventListener} listener - The callback function to remove
     */
    off(eventType, listener) {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(listener);
      }
    }
    emitEvent(event) {
      const listeners = this.listeners.get(event.type);
      if (listeners) {
        listeners.forEach((listener) => listener(event));
      }
    }
  };
  __name(_VNEngine, "VNEngine");
  var VNEngine = _VNEngine;

  // src/core/types.ts
  var _Character = class _Character {
    /**
     * Creates a new Character instance.
     * @param {string} name - The character's name
     * @param {string} [image] - Optional image/sprite URL for the character
     * @constructor
     */
    constructor(name, image) {
      this._currentScene = null;
      this._name = name;
      this._image = image;
    }
    /**
     * Gets the character's name.
     * @returns {string} The character's name
     */
    get name() {
      return this._name;
    }
    /**
     * Gets the character's image/sprite URL.
     * @returns {string|undefined} The character's image URL, if set
     */
    get image() {
      return this._image;
    }
    /**
     * Gets the character's position.
     * @returns {Position|undefined} The character's position, if set
     */
    get position() {
      return this._position;
    }
    /**
     * Sets the character's position.
     * @param {Position|undefined} value - The position to set
     */
    set position(value) {
      this._position = value;
    }
    /**
     * Gets the character's size.
     * @returns {Size|undefined} The character's size, if set
     */
    get size() {
      return this._size;
    }
    /**
     * Sets the character's size.
     * @param {Size|undefined} value - The size to set
     */
    set size(value) {
      this._size = value;
    }
    set currentScene(scene) {
      this._currentScene = scene;
    }
    /**
     * Queues dialogue for the character to speak.
     * @param {string} text - The dialogue text
     * @param {DialogueOptions} [options] - Optional dialogue options
     * @param {("fade"|"typewriter")} [options.effect] - Text effect to apply
     * @throws {Error} If character is not added to a scene
     */
    say(text, options) {
      if (!this._currentScene) {
        throw new Error(
          `Character "${this._name}" must be added to a scene before speaking`
        );
      }
      this._currentScene.addAction({
        type: "dialogue",
        character: this,
        text,
        options
      });
    }
    /**
     * Shows the character in the current scene.
     * @param {Object} [options] - Optional show options
     * @param {Position} [options.position] - Override position for this show action
     * @param {Size} [options.size] - Override size for this show action
     * @throws {Error} If character is not added to a scene
     */
    show(options) {
      if (!this._currentScene) {
        throw new Error(
          `Character "${this._name}" must be added to a scene before showing`
        );
      }
      this._currentScene.addAction({
        type: "show",
        character: this,
        position: options?.position ?? this._position,
        size: options?.size ?? this._size
      });
    }
    /**
     * Hides the character in the current scene.
     * @throws {Error} If character is not added to a scene
     */
    hide() {
      if (!this._currentScene) {
        throw new Error(
          `Character "${this._name}" must be added to a scene before hiding`
        );
      }
      this._currentScene.addAction({
        type: "hide",
        character: this
      });
    }
  };
  __name(_Character, "Character");
  var Character = _Character;
  var _Scene = class _Scene {
    /**
     * Creates a new Scene instance.
     * @param {string} id - Unique identifier for the scene
     * @param {SceneOptions} [options={}] - Scene configuration options
     * @param {string} [options.background] - Background image URL
     * @constructor
     */
    constructor(id, options = {}) {
      this._actions = [];
      this.characters = /* @__PURE__ */ new Set();
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
    add(character, options) {
      this.characters.add(character);
      character.currentScene = this;
      this.addAction({
        type: "show",
        character,
        position: options?.position ?? character.position,
        size: options?.size ?? character.size
      });
    }
    addAction(action) {
      this._actions.push(action);
    }
  };
  __name(_Scene, "Scene");
  var Scene = _Scene;
  var _Script = class _Script {
    constructor() {
      this._scenes = [];
      this.sceneMap = /* @__PURE__ */ new Map();
    }
    /**
     * Adds a scene to the script. Scenes are played in the order they are added.
     * @param {Scene} scene - The scene to add
     * @throws {Error} If a scene with the same ID already exists
     */
    addScene(scene) {
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
    getScene(id) {
      return this.sceneMap.get(id);
    }
    /**
     * Gets a scene by its index in the script.
     * @param {number} index - The scene index
     * @returns {Scene|undefined} The scene, or undefined if index is out of bounds
     */
    getSceneByIndex(index) {
      return this._scenes[index];
    }
    /**
     * Gets the index of a scene by its ID.
     * @param {string} id - The scene ID
     * @returns {number} The scene index, or -1 if not found
     */
    getSceneIndex(id) {
      return this._scenes.findIndex((scene) => scene.id === id);
    }
  };
  __name(_Script, "Script");
  var Script = _Script;
  return __toCommonJS(index_exports);
})();
