# figma-ai-wireframe-agent

A clean, minimal **JavaScript-only** Figma plugin that generates mobile wireframe screens from a short app prompt.

This project intentionally avoids TypeScript, React, and build tooling so it can run directly in Figma after importing `manifest.json`.

## Project structure

```text
figma-ai-wireframe-agent
│
├ manifest.json   # Figma plugin manifest (api, main, ui)
├ code.js         # Main plugin runtime that creates Figma frames
├ ui.html         # Plugin UI for entering prompts
├ planner.js      # Prompt -> list of screen names
├ agent.js        # Screen names -> layout instructions
├ styles.css      # Styling for ui.html
├ package.json    # Minimal metadata + local structure check script
└ README.md
```

## How to import the plugin into Figma

1. Open the Figma desktop app.
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select this repository's `manifest.json` file.
4. The plugin appears under your development plugins list.

## How to run the plugin

1. Open any Figma file.
2. Run **Plugins** → **Development** → **figma-ai-wireframe-agent**.
3. In the plugin window, type a prompt.
4. Click **Generate UI**.
5. The plugin creates mobile frames on the canvas.

## Behavior overview

1. `planner.js` maps prompt keywords to a list of screens.
2. `agent.js` maps each screen to wireframe instructions:
   - title text
   - description text
   - primary button
   - optional list items
3. `code.js` renders each screen as a mobile frame using the Figma Plugin API.

Frame/layout settings used:

- Frame size: **390 x 844**
- Element spacing: **24px**
- Frame-to-frame spacing: **120px**
- Elements in each frame are vertically stacked and centered.

## Example prompts

- `food delivery app`
- `language learning app`
- `banking dashboard`
- `login screen`

## Notes

- No build tools are required.
- Files are plain JavaScript and HTML/CSS.
- Importing `manifest.json` is enough to run the plugin.
