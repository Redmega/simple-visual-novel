/**
 * Simple Visual Novel Engine
 *
 * A minimal TypeScript visual novel engine with vanilla DOM rendering.
 * Supports dialogue with text effects, character management, scene transitions,
 * and game state management.
 *
 * @module simple-visual-novel
 *
 * @example
 * ```typescript
 * import { Script, Scene, Character, VNEngine } from "simple-visual-novel";
 *
 * // Create a script with scenes
 * const script = new Script();
 *
 * // Create characters
 * const narrator = new Character("Narrator");
 * const alice = new Character("Alice", "alice.png");
 *
 * // Build a scene
 * const scene1 = new Scene("intro", { background: "park.png" });
 * scene1.add(narrator);
 * scene1.add(alice, { position: "center" });
 * narrator.say("It was a beautiful day.", { effect: "fade" });
 * alice.say("Hello!", { effect: "typewriter" });
 * script.addScene(scene1);
 *
 * // Initialize and run
 * const engine = new VNEngine({
 *   script,
 *   container: "#game",
 *   startScene: "intro",
 *   renderer: { assetsDirectory: "assets" }
 * });
 * ```
 */

// Core engine and types
export { VNEngine } from "./core/engine.js";
export { Script, Scene, Character } from "./core/types.js";
export { StateManager } from "./core/state.js";

// Renderer
export { DOMRenderer } from "./renderer/renderer.js";
export { typewriter, fadeIn, fadeOut } from "./renderer/effects.js";

// Utilities
export { CancellablePromise } from "./util/promise.js";

// Re-export types for consumers
export type { VNEngineOptions, EngineEvent, EngineEventType, EngineEventListener } from "./core/engine.js";
export type { RendererOptions } from "./renderer/renderer.js";
export type { TypewriterOptions, FadeOptions } from "./renderer/effects.js";
export type { SceneAction, SceneActionType, SceneOptions, DialogueOptions, Position, Size, GameState } from "./core/types.js";
