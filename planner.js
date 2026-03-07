/**
 * planner.js
 *
 * Converts a short app prompt into a small sequence of mobile screens.
 * This is intentionally simple and deterministic so the plugin can run
 * fully offline inside Figma with no build tools or external services.
 */

function normalizePrompt(prompt) {
  return (prompt || "").trim().toLowerCase();
}

/**
 * Returns a list of screen names based on keywords in the prompt.
 * @param {string} prompt
 * @returns {string[]}
 */
function planScreens(prompt) {
  var text = normalizePrompt(prompt);

  if (!text) {
    return ["Onboarding", "Login", "Home", "Details", "Profile"];
  }

  if (text.includes("food")) {
    return ["Onboarding", "Login", "Home Feed", "Restaurant", "Cart", "Checkout"];
  }

  if (text.includes("language")) {
    return ["Onboarding", "Login", "Course Dashboard", "Lesson Screen", "Progress Page"];
  }

  if (text.includes("bank") || text.includes("finance")) {
    return ["Welcome", "Login", "Account Overview", "Transactions", "Payments"];
  }

  if (text.includes("login")) {
    return ["Welcome", "Login", "Forgot Password", "Success"];
  }

  return ["Onboarding", "Login", "Home", "Details", "Settings"];
}

if (typeof module !== "undefined") {
  module.exports = {
    planScreens: planScreens
  };
}
