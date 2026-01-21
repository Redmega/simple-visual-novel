import { describe, it, expect } from "vitest";
import { createTestScript, createMinimalScene, createTestCharacter } from "./test-utils.js";

describe("test-utils", () => {
  describe("createTestScript", () => {
    it("should create a test script with scenes", () => {
      const script = createTestScript();
      expect(script.scenes).toHaveLength(2);
      expect(script.getScene("scene1")).toBeDefined();
      expect(script.getScene("scene2")).toBeDefined();
    });
  });

  describe("createMinimalScene", () => {
    it("should create a minimal scene", () => {
      const scene = createMinimalScene();
      expect(scene.id).toBe("test-scene");
      expect(scene.options).toEqual({});
    });
  });

  describe("createTestCharacter", () => {
    it("should create a test character with default name", () => {
      const character = createTestCharacter();
      expect(character.name).toBe("TestCharacter");
    });

    it("should create a test character with custom name", () => {
      const character = createTestCharacter("CustomName");
      expect(character.name).toBe("CustomName");
    });
  });
});
