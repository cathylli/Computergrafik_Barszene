export function createJukeboxUI({ songs, onSongChanged }) {
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

  let open = false;
  let currentAudio = null;

  function buildSongList() {
    songListEl.innerHTML = "";
    for (const s of songs) {
      const btn = document.createElement("button");
      btn.textContent = s.name;
      btn.style.cursor = "pointer";
      btn.onclick = () => playSong(s);
      songListEl.appendChild(btn);
    }
  }


    function playSong(song) {

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(song.url);
    currentAudio.loop = true;

    currentAudio.play().catch(console.warn);

    // Animation/Listener informieren
    onSongChanged?.(song.name);
    }


  function stopSong() {
    if (!currentAudio) return;
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
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
