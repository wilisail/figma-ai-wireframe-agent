const screens = [
  {
    title: "Welcome",
    description:
      "Introduce Linguadrama with a cinematic lesson theme and invite the learner to begin.",
    button: "Start Learning"
  },
  {
    title: "Choose Language",
    description:
      "Let the learner pick a target language and set speaking confidence for this session.",
    button: "Continue"
  },
  {
    title: "Drama Scene",
    description:
      "Show a story setup with character goals, setting, and key phrases for immersion.",
    button: "Enter Scene"
  },
  {
    title: "Dialogue Practice",
    description:
      "Guide the learner through role-play exchanges with hints and pronunciation prompts.",
    button: "Practice Line"
  },
  {
    title: "Progress",
    description:
      "Summarize vocabulary mastered, speaking streak, and next recommended drama chapter.",
    button: "View Next Lesson"
  }
];

function createFrame(screen, promptText) {
  const frame = document.createElement("article");
  frame.className = "mobile-frame";

  const title = document.createElement("h3");
  title.textContent = screen.title;

  const description = document.createElement("p");
  const promptLine = promptText
    ? `Prompt focus: ${promptText}.`
    : "Prompt focus: General conversational lesson.";
  description.textContent = `${screen.description} ${promptLine}`;

  const button = document.createElement("button");
  button.className = "primary-btn";
  button.type = "button";
  button.textContent = screen.button;

  frame.append(title, description, button);
  return frame;
}

function renderScreens() {
  const promptInput = document.getElementById("prompt");
  const framesRoot = document.getElementById("frames");
  const promptText = promptInput.value.trim();

  framesRoot.innerHTML = "";
  screens.forEach((screen) => framesRoot.appendChild(createFrame(screen, promptText)));
}

document.getElementById("generateBtn").addEventListener("click", renderScreens);

renderScreens();
