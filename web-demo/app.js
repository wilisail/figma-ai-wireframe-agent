function generate() {

  const container = document.getElementById("screens");
  container.innerHTML = "";

  const screens = [
    {
      title: "Welcome",
      desc: "Welcome to Linguadrama. Learn languages through interactive drama scenes.",
      button: "Start"
    },
    {
      title: "Choose Language",
      desc: "Select the language you want to practice today.",
      button: "Continue"
    },
    {
      title: "Drama Scene",
      desc: "Watch a short scene and understand the conversation.",
      button: "Practice Dialogue"
    },
    {
      title: "Dialogue Practice",
      desc: "Play a role and respond to the character.",
      button: "Next Scene"
    },
    {
      title: "Progress",
      desc: "Track vocabulary and performance from your drama lessons.",
      button: "Finish"
    }
  ];

  screens.forEach(screen => {

    const frame = document.createElement("div");
    frame.className = "phone";

    frame.innerHTML = `
      <h2>${screen.title}</h2>
      <p>${screen.desc}</p>
      <button>${screen.button}</button>
    `;

    container.appendChild(frame);

  });

}
