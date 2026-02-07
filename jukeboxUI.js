export function createJukeboxUI({ songs, onSongChanged, onSongStarted }) {
    console.log("UI elements:", {
        promptEl: document.getElementById("prompt"),
        uiEl: document.getElementById("jukeboxUI"),
        songListEl: document.getElementById("songList"),
        closeBtn: document.getElementById("closeJukebox"),
        stopBtn: document.getElementById("stopSong"),
    });
  const promptEl = document.getElementById("prompt");
  const uiEl = document.getElementById("jukeboxUI");
  const songListEl = document.getElementById("songList");
  const closeBtn = document.getElementById("closeJukebox");
  const stopBtn = document.getElementById("stopSong");
  const playBtn = document.getElementById("playSong");

  let open = false;
  let currentAudio = null;
  let currentSongButton = null; 

  function buildSongList() {
    songListEl.innerHTML = "";
    for (const s of songs) {
      const btn = document.createElement("button");
      btn.textContent = s.name;
      btn.style.cursor = "pointer";
      btn.onclick = () => {
            // alle Buttons "deaktivieren"
            Array.from(songListEl.children).forEach(b => b.classList.remove("active"));

            // den geklickten Button aktiv setzen
            btn.classList.add("active");

            playSong(s, btn); // Song starten
        };
      songListEl.appendChild(btn);
    }
  }


    function playSong(song, btn) {

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(song.url);
    currentAudio.loop = true;

    currentAudio.play().catch(console.warn);
    currentSongButton = btn

    // Animation/Listener informieren
    onSongChanged?.(song.name);
    stopBtn.style.display = "inline-block";   // Stop sichtbar
    playBtn.style.display = "none";           // Play versteckt

    onSongStarted?.(song);
    }

    

  function stopSong() {
    if (!currentAudio) return;
    currentAudio.pause();


    // Play-Button sichtbar machen, Stop ausblenden
    stopBtn.style.display = "none";
    playBtn.style.display = "inline-block";

     onSongChanged?.(null);
     onSongStarted?.(null);
  }

  function resumeSong() {
    if (!currentAudio || !currentSongButton) return;

    // Weiterlaufen lassen
    currentAudio.play().catch(console.warn);

    // Stop sichtbar, Play nicht
    stopBtn.style.display = "inline-block";
    playBtn.style.display = "none";

    // Hervorhebung bleibt 
    currentSongButton.classList.add("active");
    onSongChanged?.(currentSongButton.textContent);
  }

  function showPrompt(text) {
    promptEl.textContent = text;
    promptEl.style.display = "block";
  }

  function hidePrompt() {
    promptEl.style.display = "none";
  }

  function openUI() {
    open = true;
    uiEl.style.display = "block";
    hidePrompt();
  }

  function closeUI() {
    open = false;
    uiEl.style.display = "none";
  }

  closeBtn.onclick = closeUI;
  stopBtn.onclick = stopSong;
  playBtn.onclick = resumeSong;

  buildSongList();

  return {
    isOpen: () => open,
    openUI,
    closeUI,
    showPrompt,
    hidePrompt,
    playSong,
    stopSong,
  };
}
