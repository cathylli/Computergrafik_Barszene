export function createProximityInteract({
  THREE,
  camera,
  getTargetObject,
  distance = 10,
  onEnterRange,
  onExitRange,
  onInteract,
  isUIOpen,
}) {
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();

  let inRange = false;

  function update() {
    const target = getTargetObject();
    if (!target) return;

    a.copy(camera.position);
    target.getWorldPosition(b);

    const d = a.distanceTo(b);
    const nowInRange = d <= distance;

    if (Math.random() < 0.02) console.log("distance to jukebox:", d);

    if (nowInRange && !inRange) {
      inRange = true;
      onEnterRange?.();
    } else if (!nowInRange && inRange) {
      inRange = false;
      onExitRange?.();
    }

    // Wenn UI offen und rausgelaufen: optional schließen
    if (!nowInRange && isUIOpen?.()) {
      onExitRange?.();
    }
  }

  function handleKeyDown(e) {
    if (e.code === "KeyE") {
      if (inRange && !isUIOpen?.()) onInteract?.();
    }
    if (e.code === "Escape") {
      if (isUIOpen?.()) onExitRange?.();
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return {
    update,
    dispose() {
      window.removeEventListener("keydown", handleKeyDown);
    },
  };
}
