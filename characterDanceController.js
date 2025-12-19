// characterDanceController.js
// ES-Module: steuert Character-Animationen abhängig vom aktuell abgespielten Song

export function createCharacterDanceController({ THREE, fadeDuration = 0.25 } = {}) {
  if (!THREE) throw new Error("createCharacterDanceController: THREE is required");

  let mixer = null;
  let characterRoot = null;

  /** @type {THREE.AnimationAction|null} */
  let currentAction = null;

  // Song-Key -> AnimationClip-Name ODER Index (in gltf.animations)
  // Passe das Mapping an deine Songs/Clips an.
  const songToClip = new Map();

  /** @type {THREE.AnimationClip[]} */
  let clips = [];

  function attachCharacter({ root, animations }) {
    if (!root) throw new Error("attachCharacter: root is required (gltf.scene)");
    if (!animations || !animations.length) {
      console.warn("attachCharacter: no animations provided");
    }

    characterRoot = root;
    clips = animations || [];
    mixer = new THREE.AnimationMixer(characterRoot);

    return mixer;
  }

  //mapped einen Song auf eine Animation
  function setSongClipMapping(mappingObj) {
    songToClip.clear();
    Object.entries(mappingObj || {}).forEach(([songKey, clipRef]) => {
      songToClip.set(songKey, clipRef);
    });
  }

  function _resolveClip(clipRef) {
    if (!clips.length) return null;

    if (typeof clipRef === "number") {
      return clips[clipRef] || null;
    }
    if (typeof clipRef === "string") {
      // Suche nach exaktem Namen
      const exact = clips.find((c) => c.name === clipRef);
      if (exact) return exact;

      // Fallback: partial match (hilft, wenn Blender/Export Namen variiert)
      const partial = clips.find((c) => c.name.toLowerCase().includes(clipRef.toLowerCase()));
      return partial || null;
    }
    return null;
  }

  function playClip(clip) {
    if (!mixer || !clip) return;

    const nextAction = mixer.clipAction(clip);
    nextAction.reset();
    nextAction.setLoop(THREE.LoopRepeat, Infinity);
    nextAction.clampWhenFinished = false;
    nextAction.enabled = true;

    if (!currentAction) {
      nextAction.play();
      currentAction = nextAction;
      return;
    }

    // Weiches Überblenden
    nextAction.play();
    currentAction.crossFadeTo(nextAction, fadeDuration, false);
    currentAction = nextAction;
  }

  function onSongChanged(songKey) {
    if (!mixer) {
      console.warn("onSongChanged called before attachCharacter()");
      return;
    }

    // 1) Song-spezifisch
    let clipRef = songToClip.get(songKey);

    // 2) Fallback "default"
    if (clipRef === undefined) clipRef = songToClip.get("default");

    // 3) Falls immer noch nichts: nimm Clip 0
    if (clipRef === undefined) clipRef = 0;

    const clip = _resolveClip(clipRef);
    if (!clip) {
      console.warn("No clip found for song:", songKey, "clipRef:", clipRef, "available:", clips.map(c => c.name));
      return;
    }

    playClip(clip);
  }

  function stop() {
    if (!mixer) return;
    mixer.stopAllAction();
    currentAction = null;
  }

  function update(delta) {
    if (!mixer) return;
    mixer.update(delta);
  }

  return {
    attachCharacter,         // ({ root: gltf.scene, animations: gltf.animations })
    setSongClipMapping,      // ({ "Song 1": 2, "Song 2": "Dance02", "default": 0 })
    onSongChanged,           // (songName) => ...
    update,                  // (delta) in deinem draw-loop
    stop,
    getMixer: () => mixer,
    getClips: () => clips,
  };
}
