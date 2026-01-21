import { Script, Scene, Character } from "../../src/core/types.js";

export function createTestScript(): Script {
  const script = new Script();
  const narrator = new Character("Narrator");
  const protagonist = new Character("Protagonist");

  const scene1 = new Scene("scene1", { background: "test.jpg" });
  scene1.add(narrator);
  narrator.say("Test dialogue 1");
  script.addScene(scene1);

  const scene2 = new Scene("scene2", { background: "test2.jpg" });
  scene2.add(protagonist);
  protagonist.say("Test dialogue 2");
  script.addScene(scene2);

  return script;
}

export function createMinimalScene(): Scene {
  const scene = new Scene("test-scene");
  return scene;
}

export function createTestCharacter(name: string = "TestCharacter"): Character {
  return new Character(name);
}
