document.addEventListener("DOMContentLoaded", () => {

  const button = document.getElementById("generateBtn")
  const frames = document.getElementById("frames")

  button.addEventListener("click", generate)

  function generate() {

    frames.innerHTML = ""

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
        desc: "Watch a short drama scene and understand the conversation.",
        button: "Practice Dialogue"
      },
      {
        title: "Dialogue Practice",
        desc: "Respond to the character and practice speaking.",
        button: "Next Scene"
      },
      {
        title: "Progress",
        desc: "Track your vocabulary and completed scenes.",
        button: "Finish"
      }
    ]

    screens.forEach(screen => {

      const frame = document.createElement("div")
      frame.className = "phone"

      frame.innerHTML = `
        <h3>${screen.title}</h3>
        <p>${screen.desc}</p>
        <button>${screen.button}</button>
      `

      frames.appendChild(frame)

    })

  }

})
