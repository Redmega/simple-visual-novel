import { describe, it, expect, beforeEach } from "vitest";
import { Character, Scene, Script } from "../../src/core/types.js";

describe("Character", () => {
  let character: Character;
  let scene: Scene;

  beforeEach(() => {
    character = new Character("Alice");
    scene = new Scene("scene1");
  });

  describe("creation", () => {
    it("should create character with name", () => {
      expect(character.name).toBe("Alice");
    });

    it("should create character with name and image", () => {
      const characterWithImage = new Character("Bob", "bob.png");
      expect(characterWithImage.name).toBe("Bob");
      expect(characterWithImage.image).toBe("bob.png");
    });

    it("should create character without image", () => {
      expect(character.image).toBeUndefined();
    });
  });

  describe("scene management", () => {
    it("should set current scene", () => {
      character.currentScene = scene;
      // No getter, but we can test by using say() which requires a scene
      scene.add(character);
      character.say("Hello");
      expect(scene.actions.length).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("should throw error when saying dialogue without being in a scene", () => {
      expect(() => {
        character.say("Hello");
      }).toThrow('Character "Alice" must be added to a scene before speaking');
    });

    it("should throw error when showing without being in a scene", () => {
      expect(() => {
        character.show();
      }).toThrow('Character "Alice" must be added to a scene before showing');
    });

    it("should throw error when hiding without being in a scene", () => {
      expect(() => {
        character.hide();
      }).toThrow('Character "Alice" must be added to a scene before hiding');
    });
  });

  describe("action queuing", () => {
    beforeEach(() => {
      scene.add(character);
    });

    it("should queue dialogue with options", () => {
      character.say("Hello", { effect: "fade" });
      
      const actions = scene.actions;
      const dialogueAction = actions.find(a => a.type === "dialogue");
      expect(dialogueAction).toBeDefined();
      expect(dialogueAction?.text).toBe("Hello");
      expect(dialogueAction?.options?.effect).toBe("fade");
    });

    it("should queue show action", () => {
      character.show();
      
      const actions = scene.actions;
      const showActions = actions.filter(a => a.type === "show" && a.character === character);
      // Should have 2: one from add() and one from show()
      expect(showActions.length).toBe(2);
    });

    it("should queue hide action", () => {
      character.hide();
      
      const actions = scene.actions;
      const hideAction = actions.find(a => a.type === "hide" && a.character === character);
      expect(hideAction).toBeDefined();
    });
  });

  describe("position and size", () => {
    beforeEach(() => {
      scene.add(character);
    });

    it("should get and set position with named position", () => {
      character.position = "left";
      expect(character.position).toBe("left");
    });

    it("should get and set position with normalized coordinates", () => {
      character.position = { x: 0.3, y: 0.8 };
      expect(character.position).toEqual({ x: 0.3, y: 0.8 });
    });

    it("should get and set position with pixel values", () => {
      character.position = { x: "100px", y: "50px" };
      expect(character.position).toEqual({ x: "100px", y: "50px" });
    });

    it("should get and set position with percentage strings", () => {
      character.position = { x: "30%", y: "75%" };
      expect(character.position).toEqual({ x: "30%", y: "75%" });
    });

    it("should get and set size with normalized values", () => {
      character.size = { width: 0.3, height: 0.6 };
      expect(character.size).toEqual({ width: 0.3, height: 0.6 });
    });

    it("should get and set size with pixel values", () => {
      character.size = { width: "300px", height: "400px" };
      expect(character.size).toEqual({ width: "300px", height: "400px" });
    });

    it("should get and set size with percentage strings", () => {
      character.size = { width: "50%", height: "60%" };
      expect(character.size).toEqual({ width: "50%", height: "60%" });
    });

    it("should include position and size in show action when using show() options", () => {
      character.show({ position: "left", size: { width: "400px" } });
      
      const actions = scene.actions;
      const showActions = actions.filter(a => a.type === "show" && a.character === character);
      const lastShowAction = showActions[showActions.length - 1];
      expect(lastShowAction.position).toBe("left");
      expect(lastShowAction.size).toEqual({ width: "400px" });
    });

    it("should use character's stored position and size when show() called without options", () => {
      character.position = "center";
      character.size = { width: "300px", height: "400px" };
      character.show();
      
      const actions = scene.actions;
      const showActions = actions.filter(a => a.type === "show" && a.character === character);
      const lastShowAction = showActions[showActions.length - 1];
      expect(lastShowAction.position).toBe("center");
      expect(lastShowAction.size).toEqual({ width: "300px", height: "400px" });
    });

    it("should override stored position/size with show() options", () => {
      character.position = "center";
      character.size = { width: "300px" };
      character.show({ position: "left", size: { width: "500px" } });
      
      const actions = scene.actions;
      const showActions = actions.filter(a => a.type === "show" && a.character === character);
      const lastShowAction = showActions[showActions.length - 1];
      expect(lastShowAction.position).toBe("left");
      expect(lastShowAction.size).toEqual({ width: "500px" });
    });
  });
});

describe("Scene", () => {
  let scene: Scene;
  let character: Character;

  beforeEach(() => {
    scene = new Scene("scene1");
    character = new Character("Alice");
  });

  describe("creation", () => {
    it("should create scene with id", () => {
      expect(scene.id).toBe("scene1");
    });

    it("should create scene with options", () => {
      const sceneWithOptions = new Scene("scene1", { background: "bg.jpg" });
      expect(sceneWithOptions.options.background).toBe("bg.jpg");
    });

    it("should create scene with empty options by default", () => {
      expect(scene.options).toEqual({});
    });
  });

  describe("character management", () => {
    it("should add character and show them automatically", () => {
      scene.add(character);
      
      const actions = scene.actions;
      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe("show");
      expect(actions[0].character).toBe(character);
    });

    it("should add multiple characters", () => {
      const char2 = new Character("Bob");
      scene.add(character);
      scene.add(char2);
      
        const actions = scene.actions;
      expect(actions.length).toBe(2);
      expect(actions[0].character).toBe(character);
      expect(actions[1].character).toBe(char2);
    });

    it("should add character with position and size options", () => {
      scene.add(character, { position: "left", size: { width: "300px" } });
      
      const actions = scene.actions;
      expect(actions[0].position).toBe("left");
      expect(actions[0].size).toEqual({ width: "300px" });
    });

    it("should use character's stored position and size when adding without options", () => {
      character.position = "center";
      character.size = { width: "400px", height: "500px" };
      scene.add(character);
      
      const actions = scene.actions;
      expect(actions[0].position).toBe("center");
      expect(actions[0].size).toEqual({ width: "400px", height: "500px" });
    });

    it("should override character's stored position/size with add() options", () => {
      character.position = "center";
      character.size = { width: "300px" };
      scene.add(character, { position: "right", size: { width: "500px" } });
      
      const actions = scene.actions;
      expect(actions[0].position).toBe("right");
      expect(actions[0].size).toEqual({ width: "500px" });
    });
  });

  describe("action management", () => {
    beforeEach(() => {
      scene.add(character);
    });

    it("should add action", () => {
      scene.addAction({
        type: "dialogue",
        character: character,
        text: "Test",
      });
      
      const actions = scene.actions;
      expect(actions.length).toBe(2);
      expect(actions[1].type).toBe("dialogue");
      expect(actions[1].text).toBe("Test");
    });

    it("should return copy of actions", () => {
      const actions1 = scene.actions;
      const actions2 = scene.actions;
      expect(actions1).not.toBe(actions2);
      actions1.push({ type: "dialogue", character, text: "Test" });
      expect(scene.actions.length).toBe(1);
    });
  });
});

describe("Script", () => {
  let script: Script;
  let scene1: Scene;
  let scene2: Scene;
  let scene3: Scene;

  beforeEach(() => {
    script = new Script();
    scene1 = new Scene("scene1");
    scene2 = new Scene("scene2");
    scene3 = new Scene("scene3");
  });

  describe("creation", () => {
    it("should create empty script", () => {
      expect(script.scenes).toEqual([]);
    });
  });

  describe("scene management", () => {
    it("should add scene to script", () => {
      script.addScene(scene1);
      expect(script.scenes).toHaveLength(1);
      expect(script.scenes[0]).toBe(scene1);
    });

    it("should throw error when adding duplicate scene ID", () => {
      const duplicateScene = new Scene("scene1");
      script.addScene(scene1);
      expect(() => {
        script.addScene(duplicateScene);
      }).toThrow('Scene with id "scene1" already exists');
    });

    it("should maintain scene order", () => {
      script.addScene(scene1);
      script.addScene(scene2);
      script.addScene(scene3);
      
      const scenes = script.scenes;
      expect(scenes[0].id).toBe("scene1");
      expect(scenes[1].id).toBe("scene2");
      expect(scenes[2].id).toBe("scene3");
    });
  });

  describe("scene retrieval", () => {
    beforeEach(() => {
      script.addScene(scene1);
      script.addScene(scene2);
    });

    it("should get scene by ID", () => {
      expect(script.getScene("scene1")).toBe(scene1);
    });

    it("should return undefined for non-existent scene", () => {
      expect(script.getScene("nonexistent")).toBeUndefined();
    });

    it("should get scene by index", () => {
      expect(script.getSceneByIndex(0)).toBe(scene1);
      expect(script.getSceneByIndex(1)).toBe(scene2);
    });

    it("should return undefined for out of bounds index", () => {
      expect(script.getSceneByIndex(2)).toBeUndefined();
      expect(script.getSceneByIndex(-1)).toBeUndefined();
    });

    it("should get scene index by ID", () => {
      expect(script.getSceneIndex("scene1")).toBe(0);
      expect(script.getSceneIndex("scene2")).toBe(1);
    });

    it("should return -1 for non-existent scene index", () => {
      expect(script.getSceneIndex("nonexistent")).toBe(-1);
    });
  });

  describe("return value immutability", () => {
    beforeEach(() => {
      script.addScene(scene1);
    });

    it("should return copy of scenes array", () => {
      const scenes1 = script.scenes;
      const scenes2 = script.scenes;
      expect(scenes1).not.toBe(scenes2);
      scenes1.push(new Scene("scene2"));
      expect(script.scenes.length).toBe(1);
    });
  });
});
