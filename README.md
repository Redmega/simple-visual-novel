# Simple Visual Novel Engine

A minimal TypeScript visual novel engine with vanilla DOM rendering, supporting dialogue, character visibility, and scene transitions.

[![](https://img.shields.io/npm/v/simple-visual-novel
)](https://www.npmjs.com/package/simple-visual-novel) ![](https://img.shields.io/depfu/dependencies/github/Redmega%2Fsimple-visual-novel
)

## Features

- **Class-based Script API** - Build stories using a fluent, type-safe API
- **Dialogue System** - Per-dialogue effects (fade, typewriter)
- **Character Management** - Show/hide characters dynamically
- **Scene Navigation** - Automatic progression through scenes
- **Game State** - Variable management for flags and counters
- **Event System** - Listen to scene changes and variable updates

## Installation

### npm (for ES modules)

```bash
npm install simple-visual-novel
```

### Browser Bundle

A browser bundle is available via unpkg:

https://unpkg.com/simple-visual-novel@latest

Or build it yourself:
```bash
npm install
npm run build
# The bundle will be in dist/simple-visual-novel.js
```

## Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run dev

# Run tests
npm test
```

## Usage

### Browser (Script Tag)

Include the bundled version in your HTML. The bundle is available in `dist/simple-visual-novel.js` after building:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Visual Novel</title>
</head>
<body>
  <div id="game-container"></div>
  
  <!-- Include the bundled library -->
  <script src="path/to/simple-visual-novel.js"></script>
  
  <script>
    // Access the library via the SimpleVN global
    const { Script, Scene, Character, VNEngine } = SimpleVN;
    
    // Create your story
    const script = new Script();
    const narrator = new Character("Narrator");
    const scene1 = new Scene("scene1", { background: "park.png" });
    scene1.add(narrator);
    narrator.say("Hello, world!");
    script.addScene(scene1);
    
    // Initialize the engine
    const engine = new VNEngine({
      script: script,
      container: "#game-container",
      startScene: "scene1",
      renderer: {
        assetsDirectory: "assets", // Optional: base directory for asset paths
        // With assetsDirectory set, "park.jpg" becomes "assets/park.jpg"
      },
    });
  </script>
</body>
</html>
```

**Note:** After installing via npm, the browser bundle will be in `node_modules/simple-visual-novel/dist/simple-visual-novel.js`. You can copy it to your project or use a bundler.

### ES Modules

```typescript
import { Script, Scene, Character, VNEngine } from "simple-visual-novel";

// Create script
const script = new Script();

const narrator = new Character("Narrator");
const protagonist = new Character("Protagonist", "protagonist.png"); // Character with sprite image

const scene1 = new Scene("scene1", { background: "park.png" });
scene1.add(narrator); // narrator is shown automatically
narrator.say("It was a sunny day.", { effect: "fade" });
narrator.say("The birds were chirping.");
scene1.add(protagonist); // protagonist is shown automatically
protagonist.say("I wonder what will happen?", { effect: "typewriter" });
script.addScene(scene1);

// Initialize engine (renderer is created automatically)
const engine = new VNEngine({
  script: script,
  container: "#game-container", // or a DOM element
  startScene: "scene1",
  renderer: {
    typewriterSpeed: 50, // characters per second
    assetsDirectory: "assets", // Optional: base directory for asset paths
  },
});
```

## Story Script Format

Scenes progress automatically in the order they are added to the script. No explicit `nextScene` is needed.

```typescript
const script = new Script();

const narrator = new Character("Narrator");
const protagonist = new Character("Protagonist");

const scene1 = new Scene("scene1", { background: "park.png" });
scene1.add(narrator);
narrator.say("It was a sunny day.");
narrator.say("The birds were chirping.");
scene1.add(protagonist);
protagonist.say("I wonder what will happen?");
narrator.hide();
script.addScene(scene1);

const scene2 = new Scene("scene2", { background: "cafe.png" });
scene2.add(protagonist);
protagonist.say("Let's go to the cafe!");
script.addScene(scene2);
// scene2 automatically follows scene1
```

## Dialogue Effects

Dialogue can have optional effects:

- `{ effect: "typewriter" }` - Character-by-character animation
- `{ effect: "fade" }` - Fade in animation
- No effect - Display immediately

## Character Positioning and Sizing

Characters can be positioned and sized using various methods:

### Position Types

- **Named positions**: `"left"`, `"center"`, `"right"`, `"far-left"`, `"far-right"`
- **Normalized coordinates** (0.0-1.0): `{ x: 0.5, y: 1.0 }` - Converted to percentages
- **Pixel values**: `{ x: "100px", y: "50px" }`
- **Percentage strings**: `{ x: "30%", y: "75%" }`

### Size Types

- **Normalized values** (0.0-1.0): `{ width: 0.3, height: 0.6 }` - Converted to percentages
- **Pixel values**: `{ width: "300px", height: "400px" }`
- **Percentage strings**: `{ width: "50%", height: "60%" }`

### Usage Examples

```typescript
const character = new Character("Alice", "alex.png");

// Method 1: Using getters/setters
character.position = "left";
character.size = { width: "300px", height: "400px" };
character.show();

// Method 2: When adding to scene
scene.add(character, { position: "left", size: { width: "300px" } });

// Method 3: Normalized coordinates (0.0-1.0)
character.position = { x: 0.3, y: 0.8 };
character.size = { width: 0.3, height: 0.6 };
scene.add(character, { position: { x: 0.7, y: 1.0 }, size: { width: 0.4, height: 0.7 } });

// Method 4: Pixel values
character.position = { x: "100px", y: "50px" };
character.size = { width: "200px", height: "300px" };
scene.add(character, { position: { x: "200px", y: "0" }, size: { width: "250px" } });

// Method 5: Mixed (percentage strings)
character.position = { x: "30%", y: "80%" };
character.size = { width: "50%", height: "60%" };

// Method 6: Override in show() or scene.add()
character.position = "center";
character.show({ position: "left", size: { width: "400px" } }); // Overrides position to left, size to 400px width
```

### Position Coordinate System

- **X-axis**: 0.0 = left edge, 0.5 = center, 1.0 = right edge
- **Y-axis**: 0.0 = top edge, 1.0 = bottom edge (characters are typically bottom-aligned)
- Characters are positioned using CSS `left` and `bottom` properties
- Percentage-based x positioning uses `transform: translateX(-50%)` for center alignment
- Default position when not specified: center-bottom

### Named Position Mappings

- `"far-left"`: x = 10% from left
- `"left"`: x = 25% from left
- `"center"`: x = 50% from left (centered)
- `"right"`: x = 75% from left
- `"far-right"`: x = 90% from left
- All named positions default to y = 0 (bottom-aligned)

## HTML Structure

The renderer creates the following DOM structure:

```html
<div id="game-container">
  <div class="vn-background-layer"></div>
  <div class="vn-character-layer">
    <div class="vn-character" data-character-name="..."></div>
  </div>
  <div class="vn-dialogue-box">
    <div class="vn-speaker-name"></div>
    <div class="vn-dialogue-text"></div>
  </div>
</div>
```

## Project Structure

```
simple-visual-novel/
├── src/
│   ├── core/
│   │   ├── engine.ts          # Main engine class
│   │   ├── types.ts           # TypeScript interfaces and classes
│   │   └── state.ts           # Game state management
│   ├── renderer/
│   │   ├── renderer.ts        # DOM rendering logic
│   │   └── effects.ts         # Text effects (typewriter, fade)
│   ├── examples/
│   │   └── exampleNovel.ts    # Example story script
│   └── index.ts               # Entry point
├── tests/                      # Test files
├── example/
│   ├── index.html             # Main HTML file
│   └── styles.css             # Styling
└── package.json
```

## License

MIT
