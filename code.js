/**
 * code.js
 *
 * Main Figma plugin runtime.
 * 1) Receives prompt from ui.html
 * 2) Uses planner.js to produce screens
 * 3) Uses agent.js to build layout instructions
 * 4) Draws wireframe frames in the current page
 */

// Inline copies of planner + agent logic so the plugin runs directly
// in Figma without any bundler/build step.
function normalizePrompt(prompt) {
  return (prompt || "").trim().toLowerCase();
}

function planScreens(prompt) {
  var text = normalizePrompt(prompt);

  if (!text) return ["Onboarding", "Login", "Home", "Details", "Profile"];
  if (text.includes("food")) return ["Onboarding", "Login", "Home Feed", "Restaurant", "Cart", "Checkout"];
  if (text.includes("language")) return ["Onboarding", "Login", "Course Dashboard", "Lesson Screen", "Progress Page"];
  if (text.includes("bank") || text.includes("finance")) return ["Welcome", "Login", "Account Overview", "Transactions", "Payments"];
  if (text.includes("login")) return ["Welcome", "Login", "Forgot Password", "Success"];

  return ["Onboarding", "Login", "Home", "Details", "Settings"];
}

function createScreenInstruction(screenName, appPrompt) {
  var normalizedPrompt = (appPrompt || "your app").trim();
  var title = screenName;
  var description = "Wireframe concept for " + normalizedPrompt + ".";
  var button = "Continue";
  var listItems = [];

  var lower = screenName.toLowerCase();
  if (lower.includes("dashboard") || lower.includes("home")) {
    description = "Summary view with key content and quick actions.";
    button = "Open";
    listItems = ["Section 1", "Section 2", "Section 3"];
  } else if (lower.includes("lesson")) {
    description = "Learning content, progress, and next activity.";
    button = "Start Lesson";
    listItems = ["Topic", "Exercise", "Quiz"];
  } else if (lower.includes("login")) {
    description = "Entry point for returning users.";
    button = "Sign In";
    listItems = ["Email field", "Password field"];
  } else if (lower.includes("checkout") || lower.includes("payment")) {
    description = "Review details before completing the action.";
    button = "Confirm";
    listItems = ["Item summary", "Address", "Payment method"];
  }

  return {
    title: title,
    description: description,
    button: button,
    listItems: listItems
  };
}

function generateLayoutPlan(screenList, prompt) {
  return screenList.map(function (name) {
    return createScreenInstruction(name, prompt);
  });
}

// Plugin constants from the requirement.
var FRAME_WIDTH = 390;
var FRAME_HEIGHT = 844;
var ELEMENT_SPACING = 24;
var FRAME_SPACING = 120;

figma.showUI(__html__, { width: 360, height: 220 });

figma.ui.onmessage = async function (msg) {
  if (!msg || msg.type !== "generate-ui") return;

  var prompt = msg.prompt || "";
  var screens = planScreens(prompt);
  var instructions = generateLayoutPlan(screens, prompt);

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  var startX = figma.viewport.center.x;
  var startY = figma.viewport.center.y;

  instructions.forEach(function (item, index) {
    var frame = figma.createFrame();
    frame.resize(FRAME_WIDTH, FRAME_HEIGHT);
    frame.name = item.title;
    frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    frame.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }];
    frame.strokeWeight = 1;

    frame.layoutMode = "VERTICAL";
    frame.counterAxisSizingMode = "FIXED";
    frame.primaryAxisSizingMode = "FIXED";
    frame.primaryAxisAlignItems = "CENTER";
    frame.counterAxisAlignItems = "CENTER";
    frame.itemSpacing = ELEMENT_SPACING;
    frame.paddingTop = 80;
    frame.paddingBottom = 80;
    frame.paddingLeft = 32;
    frame.paddingRight = 32;

    frame.x = startX + index * (FRAME_WIDTH + FRAME_SPACING);
    frame.y = startY;

    var title = figma.createText();
    title.characters = item.title;
    title.fontName = { family: "Inter", style: "Bold" };
    title.fontSize = 28;
    title.textAlignHorizontal = "CENTER";

    var description = figma.createText();
    description.characters = item.description;
    description.fontName = { family: "Inter", style: "Regular" };
    description.fontSize = 16;
    description.textAlignHorizontal = "CENTER";
    description.resize(300, description.height);

    frame.appendChild(title);
    frame.appendChild(description);

    if (item.listItems && item.listItems.length) {
      item.listItems.forEach(function (entry) {
        var row = figma.createFrame();
        row.layoutMode = "HORIZONTAL";
        row.counterAxisSizingMode = "AUTO";
        row.primaryAxisSizingMode = "FIXED";
        row.resize(300, 44);
        row.cornerRadius = 8;
        row.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
        row.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }];
        row.paddingLeft = 12;
        row.paddingRight = 12;
        row.primaryAxisAlignItems = "CENTER";
        row.counterAxisAlignItems = "CENTER";

        var listText = figma.createText();
        listText.characters = entry;
        listText.fontName = { family: "Inter", style: "Regular" };
        listText.fontSize = 14;

        row.appendChild(listText);
        frame.appendChild(row);
      });
    }

    var button = figma.createFrame();
    button.layoutMode = "HORIZONTAL";
    button.counterAxisSizingMode = "AUTO";
    button.primaryAxisSizingMode = "FIXED";
    button.resize(220, 52);
    button.cornerRadius = 10;
    button.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    button.primaryAxisAlignItems = "CENTER";
    button.counterAxisAlignItems = "CENTER";

    var buttonLabel = figma.createText();
    buttonLabel.characters = item.button;
    buttonLabel.fontName = { family: "Inter", style: "Bold" };
    buttonLabel.fontSize = 16;
    buttonLabel.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

    button.appendChild(buttonLabel);
    frame.appendChild(button);

    figma.currentPage.appendChild(frame);
  });

  figma.notify("Generated " + instructions.length + " wireframe screens.");
};
