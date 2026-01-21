import type { VNEngine } from "../core/engine.js";
import type { SceneAction, Character, Position, Size } from "../core/types.js";
import { typewriter, fadeIn } from "./effects.js";

/**
 * Options for configuring the DOM renderer.
 * @typedef {Object} RendererOptions
 * @property {number} [typewriterSpeed=50] - Characters per second for typewriter effect
 * @property {string} [assetsDirectory] - Base directory for asset paths (e.g., "assets", "/assets", "./assets")
 */
export interface RendererOptions {
  typewriterSpeed?: number; // characters per second
  assetsDirectory?: string; // base directory for asset paths
}

/**
 * Renders the visual novel to the DOM.
 * @class
 */
export class DOMRenderer {
  private container: HTMLElement;
  private engine: VNEngine;
  private options: RendererOptions;
  private backgroundLayer!: HTMLElement;
  private characterLayer!: HTMLElement;
  private dialogueBox!: HTMLElement;
  private speakerName!: HTMLElement;
  private dialogueText!: HTMLElement;
  private currentActionIndex: number = 0;
  private isProcessing: boolean = false;
  private characterElements: Map<Character, HTMLElement> = new Map();
  private currentAnimation: { cancel: () => void } | null = null;

  /**
   * Creates a new DOMRenderer instance.
   * @param {string|HTMLElement} container - CSS selector or DOM element for rendering
   * @param {VNEngine} engine - The VNEngine instance
   * @param {RendererOptions} [options={}] - Renderer configuration options
   * @throws {Error} If container element is not found
   * @constructor
   */
  constructor(
    container: string | HTMLElement,
    engine: VNEngine,
    options: RendererOptions = {}
  ) {
    let containerElement: HTMLElement;
    if (typeof container === "string") {
      containerElement = document.querySelector(container) as HTMLElement;
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
    // Don't call renderCurrentScene() here - let the engine's sceneChange event trigger it
  }

  private setupDOM(): void {
    // Create layers
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

  private setupEventListeners(): void {
    // Listen for scene changes
    this.engine.on("sceneChange", async () => {
      await this.renderCurrentScene();
    });

    // Click to advance dialogue
    this.dialogueBox.addEventListener("click", async () => {
      // If an animation is running, cancel it and show full text immediately
      // User must click again to advance to next dialogue
      if (this.currentAnimation) {
        this.currentAnimation.cancel();
        this.currentAnimation = null;
        this.isProcessing = false;
        // Don't advance - just cancel the animation and show full text
        return;
      }

      // Otherwise, advance normally if not processing
      if (!this.isProcessing) {
        await this.nextAction();
      }
    });
  }

  private async renderCurrentScene(): Promise<void> {
    const scene = this.engine.currentScene;
    if (!scene) {
      return;
    }

    // Reset action index
    this.currentActionIndex = 0;

    // Update background
    const options = scene.options;
    if (options.background) {
      const backgroundUrl = this.resolveAssetPath(options.background);
      this.backgroundLayer.style.backgroundImage = `url(${backgroundUrl})`;
      this.backgroundLayer.style.backgroundSize = "cover";
      this.backgroundLayer.style.backgroundPosition = "center";
    }

    // Clear character layer
    this.characterLayer.innerHTML = "";
    this.characterElements.clear();

    // Process first action
    await this.processActions();
  }

  private async processActions(): Promise<void> {
    const scene = this.engine.currentScene;
    if (!scene) {
      return;
    }

    const actions = scene.actions;
    if (this.currentActionIndex >= actions.length) {
      // All actions processed, wait for next scene
      return;
    }

    this.isProcessing = true;
    const action = actions[this.currentActionIndex];
    await this.processAction(action);

    this.isProcessing = false;
  }

  private async processAction(action: SceneAction): Promise<void> {
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

  private showCharacter(
    character: Character,
    position?: Position,
    size?: Size
  ): void {
    let element = this.characterElements.get(character);
    if (!element) {
      element = document.createElement("div");
      element.className = "vn-character";
      element.dataset.characterName = character.name;
      element.style.display = "none";
      element.style.position = "absolute";

      // Add character image if available
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

    // Apply positioning
    if (position) {
      const { x, y } = this.resolvePosition(position);
      element.style.left = x;
      element.style.bottom = y;

      // For percentage-based x positioning, center the element
      if (x.endsWith("%")) {
        element.style.transform = "translateX(-50%)";
      } else {
        element.style.transform = "";
      }
    }

    // Apply sizing
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

  private hideCharacter(character: Character): void {
    const element = this.characterElements.get(character);
    if (element) {
      element.style.display = "none";
    }
  }

  private async displayDialogue(
    character: Character,
    text: string,
    options?: { effect?: "fade" | "typewriter" }
  ): Promise<void> {
    this.speakerName.textContent = character.name;

    const effect = options?.effect;

    if (effect === "typewriter") {
      this.dialogueText.textContent = "";
      const speed = this.options.typewriterSpeed || 50;
      this.currentAnimation = typewriter(this.dialogueText, text, { speed });
      await this.currentAnimation;
      this.currentAnimation = null;
    } else if (effect === "fade") {
      // Set text first, ensure it's invisible, then fade it in smoothly
      this.dialogueText.textContent = text;
      this.dialogueText.style.opacity = "0";
      this.dialogueText.style.transition = "none";
      // Force reflow to ensure opacity is applied before transition
      void this.dialogueText.offsetHeight;
      // Now apply the fade transition
      this.currentAnimation = fadeIn(this.dialogueText);
      await this.currentAnimation;
      this.currentAnimation = null;
    } else {
      // No effect, display immediately
      this.dialogueText.textContent = text;
      this.dialogueText.style.opacity = "1";
    }
  }

  private async nextAction(): Promise<void> {
    const scene = this.engine.currentScene;
    if (!scene) {
      return;
    }

    const actions = scene.actions;
    this.currentActionIndex++;

    if (this.currentActionIndex >= actions.length) {
      // Move to next scene
      const hasNext = this.engine.next();
      if (!hasNext) {
        // No more scenes
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
  private resolveAssetPath(path: string): string {
    // If path is already absolute (starts with http://, https://, or /), return as-is
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("/")
    ) {
      return path;
    }

    // If no assets directory is configured, return path as-is
    if (!this.options.assetsDirectory) {
      return path;
    }

    // Normalize the assets directory (remove trailing slash if present)
    const assetsDir = this.options.assetsDirectory.replace(/\/$/, "");

    // Combine assets directory with path, ensuring proper slash
    return `${assetsDir}/${path}`;
  }

  /** Named position lookup table */
  private static readonly NAMED_POSITIONS: Record<
    string,
    { x: string; y: string }
  > = {
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
    "bottom-right": { x: "75%", y: "0" },
  };

  /**
   * Resolves a position to CSS values.
   * @param {Position} position - The position to resolve
   * @returns {{x: string, y: string}} Resolved x and y CSS values
   * @private
   */
  private resolvePosition(position: Position): { x: string; y: string } {
    let newPosition;
    // Named positions
    if (typeof position === "string") {
      newPosition = DOMRenderer.NAMED_POSITIONS[position] ?? {
        x: "50%",
        y: "0",
      };
    } else {
      // Coordinate object - convert number to percentage, pass string through
      const toCSS = (val: number | string | undefined, fallback: string) =>
        val === undefined
          ? fallback
          : typeof val === "number"
          ? `${val * 100}%`
          : val;

      newPosition = {
        x: toCSS(position.x, "50%"),
        y: toCSS(position.y, "0"),
      };
    }

    // Offset the 0 y position to the height of the dialogue box
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
  private resolveSize(size: Size): { width?: string; height?: string } {
    // Convert number to percentage, pass string through, undefined stays undefined
    const toCSS = (val: number | string | undefined) =>
      val === undefined
        ? undefined
        : typeof val === "number"
        ? `${val * 100}%`
        : val;

    return {
      width: toCSS(size.width),
      height: toCSS(size.height),
    };
  }
}
