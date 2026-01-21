# Example Visual Novel: "The Nexus"

This is a complete example visual novel demonstrating the capabilities of the Simple Visual Novel Engine.

## Story Overview

"The Nexus" tells the story of Alex, a person living an ordinary life who encounters Sam, a mysterious stranger who reveals that our world is not the only one. Through a series of encounters, Alex discovers they have the ability to travel between dimensions and must make a choice: remain in their ordinary life or step into an extraordinary new world.

## Story Structure

The novel consists of 8 scenes:

1. **The Beginning** - Alex contemplates life in the park
2. **The Encounter** - Meeting Sam for the first time
3. **The Conversation Deepens** - Sam reveals there's more to the world
4. **The Decision** - Alex decides whether to meet Sam at midnight
5. **The Clock Tower** - The mysterious meeting place
6. **The Revelation** - The truth about parallel worlds is revealed
7. **The Choice** - Alex must decide to step through the portal
8. **The End (or Beginning)** - Alex enters a new world

## Features Demonstrated

- **Multiple Characters**: Narrator, Alex, Sam, and Mysterious Voice
- **Character Visibility**: Characters appear and disappear throughout scenes
- **Dialogue Effects**: 
  - Fade effect for dramatic moments
  - Typewriter effect for character dialogue
  - Instant display for narration
- **Scene Transitions**: Automatic progression through 8 connected scenes
- **Narrative Arc**: Complete story with beginning, middle, and end

## Running the Example

### ES Modules Version

1. Build the project:
   ```bash
   npm run build
   ```

2. Open `example/index.html` in a web browser

3. Click through the dialogue to progress the story

The browser version uses a single bundled JavaScript file (`dist/simple-visual-novel.js`) that can be included via a `<script>` tag, making it easy to use without a build system.

## Background Images

The example references several background images:
- `park.jpg` - The city park setting
- `alex-room.jpg` - Alex's room
- `clock-tower.jpg` - The old clock tower
- `portal.jpg` - The dimensional portal
- `other-world.jpg` - The Nexus world

You can add placeholder images to the `example/assets/` directory, or use any images you prefer. The engine will work even without images - the backgrounds will simply be empty.

## Customization

Feel free to modify the story, add more scenes, or change the dialogue to create your own visual novel!
