// Main entry point for the Simple Visual Novel Engine
// This file exports the core engine components for use in other projects

export { VNEngine } from "./core/engine.js";
export { DOMRenderer } from "./renderer/renderer.js";
export { Script, Scene, Character } from "./core/types.js";
export { StateManager } from "./core/state.js";
export { typewriter, fadeIn, fadeOut } from "./renderer/effects.js";
export { CancellablePromise } from "./util/promise.js";
