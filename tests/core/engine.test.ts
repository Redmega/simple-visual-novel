import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VNEngine } from "../../src/core/engine.js";
import { createTestScript } from "../helpers/test-utils.js";
import { Script, Scene } from "../../src/core/types.js";

describe("VNEngine", () => {
  let script: Script;
  let engine: VNEngine;
  let container: HTMLElement;

  beforeEach(() => {
    script = createTestScript();
    // Create a dummy container for tests
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
    engine = new VNEngine({
      script: script,
      container: "#test-container",
      startScene: "scene1",
    });
  });

  afterEach(() => {
    const containerElement = document.getElementById("test-container");
    if (containerElement) {
      document.body.removeChild(containerElement);
    }
  });

  describe("initialization", () => {
    it("should initialize with script and start scene", () => {
      expect(engine.currentScene?.id).toBe("scene1");
    });

    it("should throw error when start scene doesn't exist", () => {
      const emptyScript = new Script();
      const testContainer = document.createElement("div");
      expect(() => {
        new VNEngine({
          script: emptyScript,
          container: testContainer,
          startScene: "nonexistent",
        });
      }).toThrow();
    });

    it("should work in SSR environment without document (renderer should be null)", () => {
      // Save original document
      const originalDocument = global.document;
      
      // Mock SSR environment by removing document
      // @ts-expect-error - Intentionally removing document for SSR test
      delete global.document;
      
      try {
        const testScript = createTestScript();
        // In SSR, container can be a string or we can pass a mock object
        // The engine should still initialize without throwing
        const ssrEngine = new VNEngine({
          script: testScript,
          container: "#test-container", // String is fine, renderer won't be created
          startScene: "scene1",
        });
        
        // Renderer should be null in SSR
        expect(ssrEngine.renderer).toBeNull();
        
        // Engine should still function - can get current scene
        expect(ssrEngine.currentScene?.id).toBe("scene1");
        
        // Engine should still function - can navigate scenes
        const result = ssrEngine.next();
        expect(result).toBe(true);
        expect(ssrEngine.currentScene?.id).toBe("scene2");
        
        // Engine should still function - can set/get variables
        ssrEngine.setVariable("test", "value");
        expect(ssrEngine.getVariable("test")).toBe("value");
        
        // Engine should still function - can jump to scenes
        ssrEngine.jumpTo("scene1");
        expect(ssrEngine.currentScene?.id).toBe("scene1");
      } finally {
        // Restore document
        global.document = originalDocument;
      }
    });

    it("should get current scene", () => {
      const scene = engine.currentScene;
      expect(scene).toBeDefined();
      expect(scene?.id).toBe("scene1");
    });

    it("should return undefined for current scene when scene ID is null", () => {
      const emptyScript = new Script();
      const scene = new Scene("test");
      emptyScript.addScene(scene);
      const testContainer = document.createElement("div");
      const testEngine = new VNEngine({
        script: emptyScript,
        container: testContainer,
        startScene: "test",
      });
      testEngine.stateManager.currentSceneId = null;
      expect(testEngine.currentScene).toBeUndefined();
    });
  });

  describe("scene navigation", () => {
    it("should jump to a specific scene", () => {
      engine.jumpTo("scene2");
      expect(engine.currentScene?.id).toBe("scene2");
    });

    it("should throw error when jumping to non-existent scene", () => {
      expect(() => {
        engine.jumpTo("nonexistent");
      }).toThrow('Scene with id "nonexistent" not found');
    });

    it("should move to next scene", () => {
      const result = engine.next();
      expect(result).toBe(true);
      expect(engine.currentScene?.id).toBe("scene2");
    });

    it("should return false when no next scene exists", () => {
      engine.next(); // Move to scene2
      const result = engine.next(); // Try to move past last scene
      expect(result).toBe(false);
      expect(engine.currentScene?.id).toBe("scene2");
    });

    it("should return false when next() is called with null currentSceneId", () => {
      const emptyScript = new Script();
      const scene = new Scene("test");
      emptyScript.addScene(scene);
      const testContainer = document.createElement("div");
      const testEngine = new VNEngine({
        script: emptyScript,
        container: testContainer,
        startScene: "test",
      });
      testEngine.stateManager.currentSceneId = null;
      expect(testEngine.next()).toBe(false);
    });

    it("should return false when next() is called with scene ID not in script", () => {
      const emptyScript = new Script();
      const scene = new Scene("test");
      emptyScript.addScene(scene);
      const testContainer = document.createElement("div");
      const testEngine = new VNEngine({
        script: emptyScript,
        container: testContainer,
        startScene: "test",
      });
      // Manually set a scene ID that doesn't exist in the script
      testEngine.stateManager.currentSceneId = "nonexistent";
      expect(testEngine.next()).toBe(false);
    });
  });

  describe("variable management", () => {
    it("should set and get variables", () => {
      engine.setVariable("testKey", "testValue");
      expect(engine.getVariable("testKey")).toBe("testValue");
    });

    it("should get all variables", () => {
      engine.setVariable("key1", "value1");
      engine.setVariable("key2", 42);
      const vars = engine.allVariables;
      expect(vars.key1).toBe("value1");
      expect(vars.key2).toBe(42);
    });

    it("should return a copy of variables", () => {
      engine.setVariable("key", "value");
      const vars = engine.allVariables;
      vars.newKey = "newValue";
      expect(engine.getVariable("newKey")).toBeUndefined();
    });
  });

  describe("events", () => {
    it("should emit sceneChange event when jumping", () => {
      let eventReceived = false;
      let eventData: any = null;

      engine.on("sceneChange", (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      engine.jumpTo("scene2");
      expect(eventReceived).toBe(true);
      expect(eventData.sceneId).toBe("scene2");
    });

    it("should emit sceneChange event when moving to next", () => {
      let eventReceived = false;
      let eventData: any = null;

      engine.on("sceneChange", (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      engine.next();
      expect(eventReceived).toBe(true);
      expect(eventData.sceneId).toBe("scene2");
    });

    it("should emit variableChange event when setting variable", () => {
      let eventReceived = false;
      let eventData: any = null;

      engine.on("variableChange", (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      engine.setVariable("testKey", "testValue");
      expect(eventReceived).toBe(true);
      expect(eventData.key).toBe("testKey");
      expect(eventData.value).toBe("testValue");
    });

    it("should allow removing event listeners", () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      engine.on("sceneChange", listener);
      engine.jumpTo("scene2");
      expect(callCount).toBe(1);

      engine.off("sceneChange", listener);
      engine.jumpTo("scene1");
      expect(callCount).toBe(1); // Should not increment
    });

    it("should handle multiple event listeners for same event", () => {
      let callCount1 = 0;
      let callCount2 = 0;
      const listener1 = () => { callCount1++; };
      const listener2 = () => { callCount2++; };

      engine.on("sceneChange", listener1);
      engine.on("sceneChange", listener2);
      engine.jumpTo("scene2");

      expect(callCount1).toBe(1);
      expect(callCount2).toBe(1);
    });

    it("should handle removing non-existent event listener", () => {
      const listener = () => {};
      // Should not throw
      expect(() => {
        engine.off("sceneChange", listener);
      }).not.toThrow();
    });

    it("should handle removing listener from event type with no listeners", () => {
      const listener = () => {};
      // Should not throw
      expect(() => {
        engine.off("variableChange", listener);
      }).not.toThrow();
    });
  });

  describe("getters", () => {
    it("should get script instance", () => {
      expect(engine.script).toBe(script);
    });

    it("should get state manager", () => {
      const stateManager = engine.stateManager;
      expect(stateManager).toBeDefined();
      expect(stateManager.currentSceneId).toBe("scene1");
    });

    it("should get renderer instance", () => {
      expect(engine.renderer).toBeDefined();
      expect(engine.renderer).not.toBeNull();
    });
  });
});
