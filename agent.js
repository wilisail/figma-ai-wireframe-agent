/**
 * agent.js
 *
 * Turns each planned screen into plain layout instructions that code.js
 * can render as Figma layers.
 */

/**
 * Creates one wireframe instruction object for a screen name.
 * @param {string} screenName
 * @param {string} appPrompt
 * @returns {{title: string, description: string, button: string, listItems: string[]}}
 */
function createScreenInstruction(screenName, appPrompt) {
  var normalizedPrompt = (appPrompt || "your app").trim();
  var title = screenName;
  var description = "Wireframe concept for " + normalizedPrompt + ".";
  var button = "Continue";
  var listItems = [];

  if (screenName.toLowerCase().includes("dashboard") || screenName.toLowerCase().includes("home")) {
    description = "Summary view with key content and quick actions.";
    button = "Open";
    listItems = ["Section 1", "Section 2", "Section 3"];
  } else if (screenName.toLowerCase().includes("lesson")) {
    description = "Learning content, progress, and next activity.";
    button = "Start Lesson";
    listItems = ["Topic", "Exercise", "Quiz"];
  } else if (screenName.toLowerCase().includes("login")) {
    description = "Entry point for returning users.";
    button = "Sign In";
    listItems = ["Email field", "Password field"];
  } else if (screenName.toLowerCase().includes("checkout") || screenName.toLowerCase().includes("payment")) {
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

/**
 * Builds instructions for all screens.
 * @param {string[]} screenList
 * @param {string} prompt
 * @returns {Array<{title: string, description: string, button: string, listItems: string[]}>}
 */
function generateLayoutPlan(screenList, prompt) {
  return screenList.map(function (name) {
    return createScreenInstruction(name, prompt);
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    createScreenInstruction: createScreenInstruction,
    generateLayoutPlan: generateLayoutPlan
  };
}
