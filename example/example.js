const { Script, Scene, Character, VNEngine } = SimpleVN;

function createExampleNovel() {
  const script = new Script();

  // Characters (with optional sprite images)
  const narrator = new Character("Narrator");
  const alex = new Character("Alex", "alex.png");
  const sam = new Character("Sam", "sam.png");
  const mysteriousVoice = new Character("Mysterious Voice");

  // Scene 1: The Beginning
  const scene1 = new Scene("scene1", { background: "park.png" });
  scene1.add(narrator);
  narrator.say("It was a crisp autumn morning in the city park.", { effect: "fade" });
  narrator.say("The leaves had just begun to turn, painting the world in shades of gold and crimson.");
  // Add Alex on the left side
  scene1.add(alex, { position: "left", size: { width: "300px", height: "400px" } });
  alex.say("Another day, another routine...", { effect: "typewriter" });
  alex.say("I never expected today would be different.");
  alex.hide();
  narrator.say("Alex sat on the familiar park bench, watching the world go by.");
  // Show Alex in center when they appear again
  alex.show({ position: "center" });
  alex.say("Something feels off today. I can't quite put my finger on it.");
  narrator.hide();
  script.addScene(scene1);

  // Scene 2: The Encounter
  const scene2 = new Scene("scene2", { background: "park.png" });
  scene2.add(narrator);
  narrator.say("As Alex pondered this strange feeling, a figure approached.");
  // Add Sam on the right side
  scene2.add(sam, { position: "right", size: { width: "350px" } });
  sam.say("Excuse me, is this seat taken?", { effect: "typewriter" });
  // Add Alex on the left side
  scene2.add(alex, { position: "left", size: { width: "300px" } });
  alex.say("Oh! No, please, have a seat.");
  sam.say("Thanks. I'm Sam, by the way.");
  alex.say("Alex. Nice to meet you, Sam.");
  narrator.say("There was something intriguing about Sam's presence.");
  sam.say("You know, I've seen you here before. You always seem... contemplative.");
  alex.say("I guess I am. There's just so much to think about, you know?");
  narrator.hide();
  script.addScene(scene2);

  // Scene 3: The Conversation Deepens
  const scene3 = new Scene("scene3", { background: "park.png" });
  // Use normalized coordinates for positioning
  scene3.add(sam, { position: { x: 0.75, y: 1.0 }, size: { width: 0.35, height: 0.7 } });
  sam.say("What if I told you that everything you think you know about this world is only half the story?", { effect: "fade" });
  scene3.add(alex, { position: { x: 0.25, y: 1.0 }, size: { width: 0.3, height: 0.7 } });
  alex.say("What do you mean?");
  sam.say("There are forces at work beyond what most people can see.");
  alex.say("You're talking about... magic? Conspiracies? What exactly?");
  sam.say("Something far more interesting. But I can't explain it here.");
  scene3.add(narrator);
  narrator.say("Sam stood up, looking around cautiously.");
  sam.say("Meet me tonight. At the old clock tower. Midnight.");
  alex.say("The clock tower? But that place has been abandoned for years!");
  sam.say("Exactly. Will you come?");
  narrator.say("Alex hesitated, but something in Sam's eyes was compelling.");
  alex.say("...Yes. I'll be there.");
  sam.say("Good. Don't tell anyone. And trust your instincts.");
  sam.hide();
  narrator.say("Sam walked away, leaving Alex alone with their thoughts.");
  narrator.hide();
  script.addScene(scene3);

  // Scene 4: The Decision
  const scene4 = new Scene("scene4", { background: "alex-room.png" });
  scene4.add(narrator);
  narrator.say("Later that evening, Alex sat in their room, staring at the clock.");
  scene4.add(alex);
  alex.say("11:30 PM. Should I really go?", { effect: "typewriter" });
  alex.say("This could be dangerous. Or it could be nothing.");
  alex.say("But Sam seemed so serious... and there was something genuine about them.");
  narrator.say("The minutes ticked by slowly.");
  alex.say("I have to know. I have to see what this is about.");
  narrator.say("Alex grabbed a jacket and headed for the door.");
  narrator.hide();
  script.addScene(scene4);

  // Scene 5: The Clock Tower
  const scene5 = new Scene("scene5", { background: "clock-tower.png" });
  scene5.add(narrator);
  narrator.say("The old clock tower stood silhouetted against the full moon.", { effect: "fade" });
  narrator.say("Its ancient stones seemed to whisper secrets of times long past.");
  // Use pixel values for precise positioning
  scene5.add(alex, { position: { x: "100px", y: "0" }, size: { width: "250px", height: "400px" } });
  alex.say("I'm here. Now what?");
  scene5.add(sam, { position: "right", size: { width: "300px" } });
  sam.say("You came. I wasn't sure you would.");
  alex.say("I had to. You've got me curious, Sam.");
  sam.say("Good. Because what I'm about to show you will change everything.");
  narrator.say("Sam reached into their pocket and pulled out a small, glowing crystal.");
  alex.say("What is that?");
  sam.say("A key. To a world you never knew existed.");
  narrator.hide();
  script.addScene(scene5);

  // Scene 6: The Revelation
  const scene6 = new Scene("scene6", { background: "clock-tower.png" });
  // Use far-left and far-right positions
  scene6.add(sam, { position: "far-right", size: { width: "400px", height: "600px" } });
  sam.say("This world we live in... it's not the only one.", { effect: "typewriter" });
  scene6.add(alex, { position: "far-left", size: { width: "350px", height: "550px" } });
  alex.say("You mean parallel universes? Alternate dimensions?");
  sam.say("Something like that. But more. These worlds are connected, and some people can move between them.");
  alex.say("And you're one of them?");
  sam.say("I am. And I believe you could be too.");
  scene6.add(narrator);
  narrator.say("The crystal in Sam's hand began to pulse with light.");
  scene6.add(mysteriousVoice);
  mysteriousVoice.say("The time has come, child of two worlds.", { effect: "fade" });
  alex.say("Who said that?");
  sam.say("The crystal. It's... it's speaking to you.");
  mysteriousVoice.say("You have been chosen, Alex. Your destiny awaits beyond the veil.");
  alex.say("I don't understand. What does this mean?");
  mysteriousVoice.say("All will be revealed in time. For now, you must choose: step into the unknown, or return to your ordinary life.");
  narrator.say("The crystal's light grew brighter, and a portal began to form in the air.");
  narrator.hide();
  script.addScene(scene6);

  // Scene 7: The Choice
  const scene7 = new Scene("scene7", { background: "portal.png" });
  scene7.add(narrator);
  narrator.say("Before Alex stood a shimmering gateway to another world.", { effect: "fade" });
  // Center Sam for dramatic effect
  scene7.add(sam, { position: "center", size: { width: "500px", height: "700px" } });
  sam.say("This is it, Alex. Your moment of truth.");
  // Position Alex on the left
  scene7.add(alex, { position: { x: "20%", y: "0" }, size: { width: "400px" } });
  alex.say("If I go through... will I be able to come back?");
  sam.say("Yes. But once you've seen what's on the other side, you'll never be the same.");
  alex.say("And if I don't?");
  sam.say("You can walk away. Forget this ever happened. Live your normal life.");
  narrator.say("Alex looked at the portal, then at Sam, then back at the portal.");
  alex.say("I've spent my whole life wondering if there was something more...");
  alex.say("I can't turn away now.");
  narrator.say("Alex took a deep breath and stepped forward.");
  // Move Alex to center as they step forward
  alex.show({ position: "center", size: { width: "450px" } });
  alex.say("Let's see what's on the other side.");
  sam.say("Welcome to the beginning of your real adventure, Alex.");
  narrator.say("And with that, they stepped through the portal together...");
  narrator.hide();
  script.addScene(scene7);

  // Scene 8: The End (or Beginning)
  const scene8 = new Scene("scene8", { background: "other-world.png" });
  scene8.add(narrator);
  narrator.say("On the other side, a world unlike any Alex had ever imagined stretched out before them.", { effect: "fade" });
  narrator.say("Towers of crystal reached toward a sky filled with two moons.");
  narrator.say("Strange creatures moved through streets that seemed to shift and change.");
  scene8.add(alex);
  alex.say("This is... incredible.", { effect: "typewriter" });
  scene8.add(sam);
  sam.say("Welcome to the Nexus, Alex. Your new home, if you choose it to be.");
  alex.say("I think... I think I'm ready for whatever comes next.");
  narrator.say("And so began the greatest adventure of Alex's life.");
  narrator.say("But that, as they say, is another story...");
  narrator.hide();
  script.addScene(scene8);

  return script;
}

// Initialize the visual novel
function init() {
  const script = createExampleNovel();
  const engine = new VNEngine({
    script,
    container: "#game-container",
    startScene: "scene1",
    renderer: {
      assetsDirectory: "assets",
      typewriterSpeed: 50,
    },
  });

  // Expose engine to window for debugging (optional)
  /** @type {VNEngine} */
  window.vnEngine = engine;
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
