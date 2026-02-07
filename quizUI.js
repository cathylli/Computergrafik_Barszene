export function createQuizUI({ songs }) {
  const quizUI = document.getElementById("quizUI");
  const quizOptions = document.getElementById("quizOptions");
  const quizFeedback = document.getElementById("quizFeedback");
  const closeQuiz = document.getElementById("closeQuiz");

   // Close-Button 
  closeQuiz.onclick = () => {
    quizUI.style.display = "none";
  };

  function showQuizForSong(song) {
    // Mögliche Antworten 
    const allEras = ["1957", "1962", "1966", "1972", "1978", "1989", "1992", "1995", "1996", "2005", "2010", "2011", "2015", "2021"];
    // Richtige Antwort aus Meta-Daten des Songs holen
    const correct = song.era;
    // Falsche Antworten herausfiltern
    const wrong = allEras.filter(e => e !== correct);
    shuffleArray(wrong);
    // Multiple Choice Antworten generieren (1 richtige und 2 Falsche)
    const options = shuffleArray([correct, ...wrong.slice(0, 2)]);

    // Frage setzen und alten Kram löschen
    document.getElementById("quizQuestion").textContent = 
      `🎵 "${song.name}" - Aus welcher Zeit?`;

    quizOptions.innerHTML = "";
    quizFeedback.textContent = "";
    options.forEach(era => {
      const btn = document.createElement("button");
      btn.textContent = era;
      btn.onclick = () => {
        if (era === correct) {
          quizFeedback.textContent = "Richtig! 🎉";
          quizFeedback.style.color = "lime";
        } else {
          quizFeedback.textContent = `Falsch! Richtig wäre: ${correct}`;
          quizFeedback.style.color = "orange";
        }
      };
      quizOptions.appendChild(btn);
    });

    quizUI.style.display = "block";
  }

  function hideQuiz() {
    quizUI.style.display = "none";
  }

  return { showQuizForSong, hideQuiz };
}

function shuffleArray(arr) {
  return arr
    .map(v => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(obj => obj.v);
}
