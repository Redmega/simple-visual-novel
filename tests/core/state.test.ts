import { describe, it, expect, beforeEach } from "vitest";
import { StateManager } from "../../src/core/state.js";

describe("StateManager", () => {
  let state: StateManager;

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const defaultState = new StateManager();
      expect(defaultState.currentSceneId).toBeNull();
      expect(defaultState.allVariables).toEqual({});
      expect(defaultState.sceneHistory).toEqual([]);
    });

    it("should initialize with initial scene ID", () => {
      const stateWithScene = new StateManager("scene1");
      expect(stateWithScene.currentSceneId).toBe("scene1");
    });
  });

  describe("variable management", () => {
    beforeEach(() => {
      state = new StateManager();
    });

    it("should set and get variables", () => {
      state.setVariable("testKey", "testValue");
      expect(state.getVariable("testKey")).toBe("testValue");
    });

    it("should return undefined for non-existent variable", () => {
      expect(state.getVariable("nonExistent")).toBeUndefined();
    });

    it("should set multiple variables", () => {
      state.setVariable("key1", "value1");
      state.setVariable("key2", 42);
      state.setVariable("key3", true);

      expect(state.getVariable("key1")).toBe("value1");
      expect(state.getVariable("key2")).toBe(42);
      expect(state.getVariable("key3")).toBe(true);
    });

    it("should update existing variables", () => {
      state.setVariable("key", "value1");
      state.setVariable("key", "value2");
      expect(state.getVariable("key")).toBe("value2");
    });

    it("should return a copy of variables", () => {
      state.setVariable("key", "value");
      const vars = state.allVariables;
      vars.newKey = "newValue";
      expect(state.getVariable("newKey")).toBeUndefined();
    });
  });

  describe("scene history", () => {
    beforeEach(() => {
      state = new StateManager("scene1");
    });

    it("should track scene history when changing scenes", () => {
      state.currentSceneId = "scene2";
      expect(state.currentSceneId).toBe("scene2");
      expect(state.sceneHistory).toEqual(["scene1"]);
    });

    it("should track multiple scene changes", () => {
      state.currentSceneId = "scene2";
      state.currentSceneId = "scene3";
      expect(state.currentSceneId).toBe("scene3");
      expect(state.sceneHistory).toEqual(["scene1", "scene2"]);
    });

    it("should clear history", () => {
      state.currentSceneId = "scene2";
      state.currentSceneId = "scene3";
      state.clearHistory();
      expect(state.sceneHistory).toEqual([]);
    });

    it("should return a copy of scene history", () => {
      state.currentSceneId = "scene2";
      const history = state.sceneHistory;
      history.push("scene3");
      expect(state.sceneHistory).toEqual(["scene1"]);
    });
  });

  describe("edge cases", () => {
    it("should not add to history when initial scene is null", () => {
      const nullState = new StateManager();
      nullState.currentSceneId = "scene1";
      expect(nullState.sceneHistory).toEqual([]);
    });

    it("should return a copy of state", () => {
      const stateWithData = new StateManager("scene1");
      stateWithData.setVariable("key", "value");
      const stateCopy = stateWithData.state;

      stateCopy._currentSceneId = "modified";
      stateCopy.sceneHistory = ["modified"];

      // Top-level properties should be separate
      expect(stateWithData.currentSceneId).toBe("scene1");
      expect(stateWithData.sceneHistory).toEqual([]);

      // But nested objects (variables, sceneHistory array) are still references
      // This is expected behavior for shallow copy
      expect(stateCopy.variables).toBe(stateWithData.state.variables);
    });
  });
});
