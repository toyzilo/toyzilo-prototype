function openCategory(id) {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");
}

function goBack() {
  document.getElementById("brain-quiz").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function openQuiz(name) {
  document.getElementById("brain-quiz").classList.add("hidden");
  document.getElementById("quiz-section").classList.remove("hidden");
  document.getElementById("quiz-title").textContent = name + " Quiz";

  // Placeholder: will load real quiz questions later
  let container = document.getElementById("quiz-container");
  container.innerHTML = `
    <p>This is a placeholder for the <b>${name}</b> quiz.</p>
    <p>10 questions will appear here.</p>
  `;
}

function goBackToBrainQuiz() {
  document.getElementById("quiz-section").classList.add("hidden");
  document.getElementById("brain-quiz").classList.remove("hidden");
}
