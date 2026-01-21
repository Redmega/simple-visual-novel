import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DOMRenderer } from "../../src/renderer/renderer.js";
import { VNEngine } from "../../src/core/engine.js";
import { Script, Scene, Character } from "../../src/core/types.js";

describe("DOMRenderer", () => {
  let container: HTMLElement;
  let script: Script;
  let engine: VNEngine;
  let renderer: DOMRenderer;

  let getDialogueText: () => string;
  let getSpeakerName: () => string;

  beforeEach(() => {
    vi.useFakeTimers();

    // Setup DOM
    container = document.createElement("div");
    container.id = "game-container";
    document.body.appendChild(container);
    getDialogueText = () =>
      (document.querySelector(".vn-dialogue-text") as HTMLElement)
        ?.textContent || "";
    getSpeakerName = () =>
      (document.querySelector(".vn-speaker-name") as HTMLElement)
        ?.textContent || "";
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe("DOM structure", () => {
    it("should create DOM structure", () => {
      const backgroundLayer = container.querySelector(".vn-background-layer");
      const characterLayer = container.querySelector(".vn-character-layer");
      const dialogueBox = container.querySelector(".vn-dialogue-box");

      expect(backgroundLayer).toBeDefined();
      expect(characterLayer).toBeDefined();
      expect(dialogueBox).toBeDefined();
    });

    it("should create dialogue box elements", () => {
      const speakerName = container.querySelector(".vn-speaker-name");
      const dialogueText = container.querySelector(".vn-dialogue-text");

      expect(speakerName).toBeDefined();
      expect(dialogueText).toBeDefined();
    });
  });

  describe("initialization", () => {
    beforeEach(() => {
      // Setup script
      script = new Script();
      const scene = new Scene("scene1", { background: "test.jpg" });
      const character = new Character("TestCharacter");
      scene.add(character);
      character.say("Test dialogue");
      script.addScene(scene);

      engine = new VNEngine({
        script: script,
        container: "#game-container",
        startScene: "scene1",
      });
      renderer = engine.renderer!;
    });

    afterEach(() => {
      vi.restoreAllMocks();
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    });

    it("should create renderer with container", () => {
      expect(renderer).toBeDefined();
      expect(renderer).not.toBeNull();
    });

    it("should throw error when container not found", () => {
      expect(() => {
        new VNEngine({
          script: script,
          container: "#nonexistent",
          startScene: "scene1",
        });
      }).toThrow('Container element "#nonexistent" not found');
    });
  });

  describe("background rendering", () => {
    it("should set background image from scene options", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene", { background: "test.jpg" });
      testScript.addScene(testScene);
      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const backgroundLayer = container.querySelector(
        ".vn-background-layer"
      ) as HTMLElement;
      expect(backgroundLayer.style.backgroundImage).toContain("test.jpg");
    });

    it("should handle scene without background", async () => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene"); // no background
      testScript.addScene(testScene);
      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const backgroundLayer = container.querySelector(
        ".vn-background-layer"
      ) as HTMLElement;
      expect(backgroundLayer.style.backgroundImage).toBe("");
    });
  });

  describe("assets directory", () => {
    const createTestEngineWithAssets = async (
      background: string,
      assetsDirectory: string
    ) => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene", { background });
      testScript.addScene(testScene);
      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
        renderer: {
          assetsDirectory,
        },
      });

      await vi.runAllTimersAsync();
      return testEngine;
    };

    it("should prefix relative background paths with assetsDirectory", async () => {
      await createTestEngineWithAssets("image.png", "assets");

      const backgroundLayer = container.querySelector(
        ".vn-background-layer"
      ) as HTMLElement;
      expect(backgroundLayer.style.backgroundImage).toContain(
        "assets/image.png"
      );
    });

    it("should handle assetsDirectory with trailing slash", async () => {
      await createTestEngineWithAssets("image.png", "assets/");

      const backgroundLayer = container.querySelector(
        ".vn-background-layer"
      ) as HTMLElement;
      expect(backgroundLayer.style.backgroundImage).toContain(
        "assets/image.png"
      );
    });

    it("should not modify absolute URLs when assetsDirectory is set", async () => {
      await createTestEngineWithAssets(
        "https://example.com/image.png",
        "assets"
      );

      const backgroundLayer = container.querySelector(
        ".vn-background-layer"
      ) as HTMLElement;
      expect(backgroundLayer.style.backgroundImage).toContain(
        "https://example.com/image.png"
      );
      expect(backgroundLayer.style.backgroundImage).not.toContain("assets/");
    });

    it("should not modify paths starting with / when assetsDirectory is set", async () => {
      await createTestEngineWithAssets("/images/image.png", "assets");

      const backgroundLayer = container.querySelector(
        ".vn-background-layer"
      ) as HTMLElement;
      expect(backgroundLayer.style.backgroundImage).toContain(
        "/images/image.png"
      );
      expect(backgroundLayer.style.backgroundImage).not.toContain("assets/");
    });
  });

  describe("dialogue rendering", () => {
    it("renders dialogue with speaker name to the DOM", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say("Test dialogue");
      testScript.addScene(testScene);
      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      expect(getSpeakerName()).toBe("TestCharacter");
      expect(getDialogueText()).toBe("Test dialogue");
    });

    it("should handle dialogue with fade effect", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say("Fade dialogue", { effect: "fade" });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const dialogueText = container.querySelector(
        ".vn-dialogue-text"
      ) as HTMLElement;
      expect(dialogueText.textContent).toBe("Fade dialogue");
      // After fade completes, opacity should be 1
      expect(dialogueText.style.opacity).toBe("1");
    });

    it("should handle dialogue with typewriter effect", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say("Typewriter dialogue", { effect: "typewriter" });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const dialogueText = container.querySelector(
        ".vn-dialogue-text"
      ) as HTMLElement;
      expect(dialogueText.textContent).toBe("Typewriter dialogue");
    });
  });

  describe("scene navigation", () => {
    it("should handle multiple scenes", async () => {
      const testScript = new Script();
      const scene1 = new Scene("scene1", { background: "test1.jpg" });
      const character1 = new Character("Character1");
      scene1.add(character1);
      character1.say("Scene 1 dialogue");
      testScript.addScene(scene1);

      const scene2 = new Scene("scene2", { background: "test2.jpg" });
      const character2 = new Character("Character2");
      scene2.add(character2);
      character2.say("Scene 2 dialogue");
      testScript.addScene(scene2);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "scene1",
      });

      await vi.runAllTimersAsync();

      // Move to next scene
      testEngine.next();
      // Fast-forward timers to allow scene change and rendering
      await vi.runAllTimersAsync();

      const backgroundLayer = container.querySelector(
        ".vn-background-layer"
      ) as HTMLElement;
      expect(backgroundLayer.style.backgroundImage).toContain("test2.jpg");
    });
  });

  describe("renderer options", () => {
    it("should accept renderer options", () => {
      // Create a new engine for this test to avoid conflicts
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      testScript.addScene(testScene);
      const testEngine = new VNEngine({
        script: testScript,
        container: "#game-container",
        startScene: "test-scene",
        renderer: {
          typewriterSpeed: 100,
        },
      });

      const testRenderer = testEngine.renderer;
      expect(testRenderer).toBeDefined();
      expect(testRenderer).not.toBeNull();
    });
  });

  describe("character management", () => {
    const createTestEngineWithCharacter = async (
      characterActions: (character: Character, scene: Scene) => void
    ) => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      characterActions(character, testScene);
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();
      return { testEngine, character };
    };

    it("should handle hideCharacter when character element doesn't exist", async () => {
      const { testEngine } = await createTestEngineWithCharacter(
        (character) => {
          character.hide(); // Hide before showing
        }
      );

      // Should not crash
      expect(testEngine.currentScene).toBeDefined();
    });

    it("should handle showCharacter when element already exists", async () => {
      const { testEngine } = await createTestEngineWithCharacter(
        (character) => {
          character.show(); // Show again
        }
      );

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement).toBeDefined();
      expect(characterElement.style.display).toBe("block");
    });

    it("should display character image when character has image", async () => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter", "character.png");
      testScene.add(character);
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement).toBeDefined();

      const img = characterElement.querySelector("img") as HTMLImageElement;
      expect(img).toBeDefined();
      expect(img.src).toContain("character.png");
      expect(img.alt).toBe("TestCharacter");
    });

    it("should not display image when character has no image", async () => {
      const { testEngine } = await createTestEngineWithCharacter(() => {
        // Character created without image
      });

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement).toBeDefined();

      const img = characterElement.querySelector("img");
      expect(img).toBeNull();
    });

    it("should update character image when image property is set", async () => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter", "original.png");
      testScene.add(character);
      character.image = "updated.png";
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      const img = characterElement.querySelector("img") as HTMLImageElement;
      expect(img.src).toContain("updated.png");
      expect(character.image).toBe("updated.png");
    });

    it("should add image element when image is set on character without initial image", async () => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter"); // No initial image
      testScene.add(character);
      character.image = "new-image.png";
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      const img = characterElement.querySelector("img") as HTMLImageElement;
      expect(img).toBeDefined();
      expect(img.src).toContain("new-image.png");
      expect(img.alt).toBe("TestCharacter");
    });

    it("should resolve image path with assets directory when image is set", async () => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter", "original.png");
      testScene.add(character);
      character.image = "updated.png";
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
        renderer: {
          assetsDirectory: "assets",
        },
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      const img = characterElement.querySelector("img") as HTMLImageElement;
      expect(img.src).toContain("assets/updated.png");
    });

    it("should resolve character image path with assets directory", async () => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter", "character.png");
      testScene.add(character);
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
        renderer: {
          assetsDirectory: "assets",
        },
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      const img = characterElement.querySelector("img") as HTMLImageElement;
      expect(img.src).toContain("assets/character.png");
    });
  });

  describe("character positioning and sizing", () => {
    it("should position character at named position", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { position: "left" });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.left).toBe("25%");
      expect(characterElement.style.bottom).toBe("0px"); // CSS normalizes "0" to "0px"
      expect(characterElement.style.transform).toBe("translateX(-50%)");
    });

    it("should position character at normalized coordinates", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { position: { x: 0.3, y: 0.8 } });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.left).toBe("30%");
      expect(characterElement.style.bottom).toBe("80%");
      expect(characterElement.style.transform).toBe("translateX(-50%)");
    });

    it("should position character at pixel values", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { position: { x: "100px", y: "50px" } });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.left).toBe("100px");
      expect(characterElement.style.bottom).toBe("50px");
      expect(characterElement.style.transform).toBe("");
    });

    it("should position character at percentage strings", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { position: { x: "30%", y: "75%" } });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.left).toBe("30%");
      expect(characterElement.style.bottom).toBe("75%");
      expect(characterElement.style.transform).toBe("translateX(-50%)");
    });

    it("should size character with normalized values", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { size: { width: 0.3, height: 0.6 } });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.width).toBe("30%");
      expect(characterElement.style.height).toBe("60%");
    });

    it("should size character with pixel values", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { size: { width: "300px", height: "400px" } });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.width).toBe("300px");
      expect(characterElement.style.height).toBe("400px");
    });

    it("should size character with percentage strings", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { size: { width: "50%", height: "60%" } });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.width).toBe("50%");
      expect(characterElement.style.height).toBe("60%");
    });

    it("should update position when character is shown again with different position", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { position: "left" });
      character.show({ position: "right" });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      // Click to advance past first show action
      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;
      dialogueBox.click();
      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.left).toBe("75%");
    });

    it("should update size when character is shown again with different size", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, { size: { width: "300px" } });
      character.show({ size: { width: "500px" } });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      // Click to advance past first show action
      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;
      dialogueBox.click();
      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.width).toBe("500px");
    });

    it("should use default positioning when not specified", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      // Should have position: absolute but no left/bottom set (or undefined)
      expect(characterElement.style.position).toBe("absolute");
    });

    it("should handle mixed coordinate types", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character, {
        position: { x: "30%", y: "50px" },
        size: { width: "300px", height: "60%" },
      });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.left).toBe("30%");
      expect(characterElement.style.bottom).toBe("50px");
      expect(characterElement.style.width).toBe("300px");
      expect(characterElement.style.height).toBe("60%");
    });

    it("should use character's stored position and size when show() called without options", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      character.position = "center";
      character.size = { width: "400px", height: "500px" };
      testScene.add(character);
      character.show(); // Should use stored position and size
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      // Click to advance past first show action
      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;
      dialogueBox.click();
      await vi.runAllTimersAsync();

      const characterElement = container.querySelector(
        '[data-character-name="TestCharacter"]'
      ) as HTMLElement;
      expect(characterElement.style.left).toBe("50%");
      expect(characterElement.style.width).toBe("400px");
      expect(characterElement.style.height).toBe("500px");
    });
  });

  describe("action processing", () => {
    const createTestEngineWithAction = async (
      action: (scene: Scene) => void
    ) => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("test-scene");
      action(testScene);
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();
      return testEngine;
    };

    it("should handle nextAction when scene is null", async () => {
      // Create engine and manually set scene to null
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say("Test");
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      // Manually set current scene to null by manipulating state
      testEngine.stateManager.currentSceneId = null;

      // Click to advance - should handle null scene gracefully
      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;
      dialogueBox.click();

      await vi.runAllTimersAsync();

      // Should not crash
      expect(testEngine.currentScene).toBeUndefined();
    });

    it("should automatically advance to first dialogue on scene load", async () => {
      const testScript = new Script();
      const testScene = new Scene("scene1", { background: "park.png" });
      const narrator = new Character("Narrator");
      testScene.add(narrator);
      narrator.say("It was a crisp autumn morning in the city park.", {
        effect: "fade",
      });
      narrator.say(
        "The leaves had just begun to turn, painting the world in shades of gold and crimson."
      );
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "scene1",
      });

      await vi.runAllTimersAsync();

      // Verify the first dialogue is automatically displayed
      const dialogueText = container.querySelector(
        ".vn-dialogue-text"
      ) as HTMLElement;
      expect(dialogueText).toBeDefined();
      // Should show the first dialogue, not the second
      expect(dialogueText.textContent).toBe(
        "It was a crisp autumn morning in the city park."
      );

      // Verify the speaker name is set
      const speakerName = container.querySelector(
        ".vn-speaker-name"
      ) as HTMLElement;
      expect(speakerName.textContent).toBe("Narrator");

      // Verify character is shown
      const characterElement = container.querySelector(
        '[data-character-name="Narrator"]'
      ) as HTMLElement;
      expect(characterElement).toBeDefined();
      expect(characterElement.style.display).toBe("block");
    });

    it("should automatically advance through multiple show actions to first dialogue", async () => {
      container.innerHTML = "";

      const testScript = new Script();
      const testScene = new Scene("scene1", { background: "park.png" });
      const narrator = new Character("Narrator");
      const alex = new Character("Alex", "alex.png");

      // Add multiple characters (each creates a "show" action)
      testScene.add(narrator);
      testScene.add(alex);

      // First dialogue should be automatically displayed
      narrator.say("It was a crisp autumn morning in the city park.", {
        effect: "fade",
      });
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "scene1",
      });

      await vi.runAllTimersAsync();

      // Should have advanced through both "show" actions and displayed the first dialogue
      const dialogueText = container.querySelector(
        ".vn-dialogue-text"
      ) as HTMLElement;
      expect(dialogueText.textContent).toBe(
        "It was a crisp autumn morning in the city park."
      );

      // Both characters should be shown
      const narratorElement = container.querySelector(
        '[data-character-name="Narrator"]'
      ) as HTMLElement;
      const alexElement = container.querySelector(
        '[data-character-name="Alex"]'
      ) as HTMLElement;
      expect(narratorElement).toBeDefined();
      expect(alexElement).toBeDefined();
      expect(narratorElement.style.display).toBe("block");
      expect(alexElement.style.display).toBe("block");
    });

    it("should cancel typewriter animation and advance on click", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say(
        "This is a long typewriter text that should be cancelled.",
        { effect: "typewriter" }
      );
      character.say("Second dialogue");
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      const dialogueText = container.querySelector(
        ".vn-dialogue-text"
      ) as HTMLElement;
      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;

      // Wait a bit for typewriter to start
      await vi.advanceTimersByTime(20);

      // Verify typewriter is in progress (text is partial)
      const partialText = dialogueText.textContent;
      expect(partialText).toBe("T");

      // Click to cancel animation and advance
      dialogueBox.click();

      await vi.runAllTimersAsync();

      // Should have cancelled animation and progressed to full text.
      expect(dialogueText.textContent).toBe(
        "This is a long typewriter text that should be cancelled."
      );
    });

    it("should cancel fade animation and advance on click", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say("First dialogue with fade", { effect: "fade" });
      character.say("Second dialogue");
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      const dialogueText = container.querySelector(
        ".vn-dialogue-text"
      ) as HTMLElement;
      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;

      // Verify fade has started (text is set, opacity should be transitioning from 0)
      expect(dialogueText.textContent).toBe("First dialogue with fade");

      // Click to cancel animation (should NOT advance to next dialogue)
      dialogueBox.click();

      // Should have cancelled animation, but stayed on same dialogue
      expect(dialogueText.textContent).toBe("First dialogue with fade");
      expect(dialogueText.style.opacity).toBe("1");

      // Now click again to advance to next dialogue
      dialogueBox.click();

      // Should now be on second dialogue
      expect(dialogueText.textContent).toBe("Second dialogue");
    });

    it("should not process next action when isProcessing is true and no animation", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say("First");
      character.say("Second");
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      // Manually set isProcessing to true (simulating processing state)
      // This is a bit of a hack, but tests the case where isProcessing is true without animation
      const renderer = testEngine.renderer!;
      (renderer as any).isProcessing = true;

      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;
      dialogueBox.click(); // Should be ignored when isProcessing is true and no animation

      await vi.runAllTimersAsync();

      // Should still be on first dialogue
      const dialogueText = container.querySelector(
        ".vn-dialogue-text"
      ) as HTMLElement;
      expect(dialogueText.textContent).toBe("First");
    });

    it("should handle processAction with missing character", async () => {
      const testEngine = await createTestEngineWithAction((scene) => {
        // Manually add an action without character
        scene.addAction({
          type: "show",
          // character is undefined
        });
      });

      // Should not crash
      expect(testEngine.currentScene).toBeDefined();
    });

    it("should handle processAction with missing text in dialogue", async () => {
      const testEngine = await createTestEngineWithAction((scene) => {
        const character = new Character("TestCharacter");
        scene.add(character);
        // Manually add dialogue action without text
        scene.addAction({
          type: "dialogue",
          character: character,
          // text is undefined
        });
      });

      // Should not crash
      expect(testEngine.currentScene).toBeDefined();
    });

    it("should handle nextAction when scene is null", async () => {
      // Create engine and manually set scene to null
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say("Test");
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      // Manually set current scene to null by manipulating state
      testEngine.stateManager.currentSceneId = null;

      // Click to advance - should handle null scene gracefully
      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;
      dialogueBox.click();

      await vi.runAllTimersAsync();

      // Should not crash
      expect(testEngine.currentScene).toBeUndefined();
    });

    it("should display nothing when no more scenes exist", async () => {
      const testScript = new Script();
      const testScene = new Scene("test-scene");
      const character = new Character("TestCharacter");
      testScene.add(character);
      character.say("Last dialogue");
      testScript.addScene(testScene);

      const testEngine = new VNEngine({
        script: testScript,
        container: container,
        startScene: "test-scene",
      });

      await vi.runAllTimersAsync();

      // First click advances past the show action, second click advances past dialogue
      const dialogueBox = container.querySelector(
        ".vn-dialogue-box"
      ) as HTMLElement;
      dialogueBox.click(); // Advance past show action
      await vi.runAllTimersAsync();
      dialogueBox.click(); // Advance past dialogue action
      await vi.runAllTimersAsync();

      const dialogueText = container.querySelector(
        ".vn-dialogue-text"
      ) as HTMLElement;
      const speakerName = container.querySelector(
        ".vn-speaker-name"
      ) as HTMLElement;

      expect(dialogueText.textContent).toBe("");
      expect(speakerName.textContent).toBe("");
    });
  });
});
