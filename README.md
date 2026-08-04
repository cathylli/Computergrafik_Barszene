# Projektdokumentation – Barszene

> ## ⚠️ Hinweis zu den Songs und zum Projektstatus
>
> **Dieses Projekt ist ein prototypischer Studienentwurf** und dient ausschließlich der
> Demonstration grafischer und interaktiver Features im Rahmen des Moduls Computergrafik.
> Es ist kein fertiges oder veröffentlichungsreifes Produkt.
>
> **Die vier Jukebox-Songs sind urheberrechtlich geschützt und daher nicht Teil dieses
> Repositories.** Im Ordner `Songs/` liegt lediglich die frei lizenzierte Ambientemusik
> (`groovy-vibe.mp3`, Pixabay Content License).
>
> Um die Jukebox vollständig nutzen zu können, müssen die Musikdateien **lokal ergänzt**
> werden – aus einer eigenen, rechtmäßig erworbenen Quelle. Sie gehören in den Ordner
> `Songs/` und benötigen exakt diese Dateinamen (so sind sie in `barscene.js` referenziert):
>
> | Dateiname | Titel | Interpret*in | Jahr |
> |-----------|-------|--------------|------|
> | `Bruce Springsteen - I'm On Fire.m4a` | I'm On Fire | Bruce Springsteen | 1984 |
> | `Lionel Richie - All Night Long (All Night).mp3` | All Night Long (All Night) | Lionel Richie | 1983 |
> | `MACKLEMORE & RYAN LEWIS - THRIFT SHOP FEAT. WANZ.mp3` | Thrift Shop (feat. Wanz) | Macklemore & Ryan Lewis | 2012 |
> | `The Black Eyed Peas - Let's Get It Started.mp3` | Let's Get It Started | The Black Eyed Peas | 2003 |
>
> Alternativ können in `barscene.js` (Array `songs`) eigene, frei lizenzierte Tracks
> eingetragen werden. Dann sollten auch die Jahreszahlen (`era`) und das Animations-Mapping
> in `danceController.setSongClipMapping({ ... })` entsprechend angepasst werden.
>
> **Ohne die Songdateien bleibt die Jukebox stumm – Szene, Steuerung, Avatar und Quiz
> funktionieren weiterhin.**

## Autoren / Mitwirkende
- Linda Schinkels (594191)
- Catharina Hoppensack (594129)

## Technologien
- JavaScript  
- Three.js  
- WebGL
- HTML5 Canvas
- CSS3
- HTML

### Three.js Module
- THREE.Clock
- THREE.WebGLRenderer
- THREE.PerspectiveCamera
- THREE.Scene
- THREE.Color
- THREE.FogExp2
- THREE.TextureLoader
- THREE.RepeatWrapping
- THREE.NearestFilter
- THREE.PlaneGeometry
- THREE.SphereGeometry
- THREE.CylinderGeometry
- THREE.BoxGeometry
- THREE.Mesh
- THREE.MeshStandardMaterial
- THREE.MeshBasicMaterial
- THREE.DoubleSide
- THREE.CubeCamera
- THREE.Box3
- THREE.Vector3
- THREE.Group
- THREE.Object3D
- THREE.Raycaster
- THREE.DirectionalLight
- THREE.AmbientLight
- THREE.PointLight
- THREE.SpotLight
- THREE.SpotLightHelper
- THREE.AnimationMixer
- THREE.LoopRepeat
- THREE.AnimationAction
- THREE.GLTFLoader
- THREE.OBJLoader

## Beschreibung
Das Projektvorhaben lag in der Entwicklung einer atmosphärischen, interaktiven Bar-Szene. Ein Schwerpunkt lag dabei auf der technischen Umsetzung bestimmter grafischer Features, die wir zuvor in einem Katalog festgeschrieben hatten. Diese Features sind:

**Allgemeine Pflichtfeatures**
- Kamera
- Kamerasteuerung
- Responsive Canvas (automatisches Anpassen an Bildschirmgröße)

**Objekthierarchien**
- Eltern-Kind-Beziehung (Kindobjekt bewegt sich mit Elternobjekt)
- Transformationen (scale, position, rotation)
einfache Animation (rotieren)

**Beleuchtung & Schatten**
- DirectionalLight und PointLight/SpotLight
- Schattenwurf von Objekten und
- Schattenempfang der Plane und Schattenerzeugen

**Materialien und Texturen**
- Textur mittels mehrerer Textur-Maps
- UV-Mapping

**Interaktionen**
- Mit Maus auf Objekt klicken (durch Raycast)
- Collider lösen Events aus
- Events: Audio abspielen, Interface Overlay, Änderung von Material/Farbe/Position

**Animationen**
- Animationsschnipsel von Mixamo

**3D-Modelle**
- .gltf Dateien laden mit GLTFLoader
- Animationsdaten verwenden (AnimationMixer)


Gleichzeitig soll Nutzer*innen durch die Anwendung ein niedrigschwelliger und spielerischer Anreiz geboten werden, sich mit popkultureller Musikgeschichte auseinanderzusetzen.

Der User befindet sich in den Räumlichkeiten einer Bar. Er kann sich dort frei bewegen, d.h. laufen und sich umsehen. In der Bar ist eine Jukebox und ein tanzender Avatar. Wenn der User die Jukebox ansteuert, kann er ein Lied auswählen. Der Avatar passt seine Bewegungen an die ausgewählte Musik an. Anschließend öffnet sich ein Musikquiz, bei dem nach dem Erscheinungsjahr des ausgewählten Tracks gefragt wird.

**Ziel:** Technische Umsetzung grafischer Features und Entwicklung einer interaktiven, kurzweiligen Anwendung mit musikgeschichtlichem Hintergrund.

**Ausblick:** Das Musikquiz ließe sich gut um weitere Songs und Hintergrundinformationen zu den Liedern ergänzen. Zudem könnte die Barszene noch lebendiger gestaltet werden. Die Bewegungen des Avatars könnten an die Tanzstile aus der jeweiligen Zeit angepasst werden. 

## Anwendung starten

**Voraussetzung:** Für „Open with Live Server“ muss die VS-Code-Erweiterung `ritwickdey.LiveServer` installiert sein.

```bash
# VS Code: Rechtsklick auf index.html → "Open with Live Server"
# Oder Terminal - Mac/Linux:
python3 -m http.server 8000
# Browser: http://localhost:8000
# Terminal - Windows:
python py -m http.server 8000
# Dann: http://localhost:8000
```  

## Steuerung und Interaktion

- Bewegung: WASD + Maus zum Umsehen 
- UI schließen: `Esc` oder `X`-Button
- Jukebox: Zur Jukebox laufen, auf `Press E` achten, `E` drücken, Song auswählen, Song mit Stopp-Taste pausieren  
- Quiz: öffnet sich automatisch bei Song-Auswahl → Antworten per Mausklick, Quiz beenden per Mausklick auf `X`-Button

---

## Code
### Haupt- und UI-Dateien

| Datei | Beschreibung |
|-------|--------------|
| **index.html** | Entry Point, HTML + Retro-UI (Jukebox/Quiz) + Three.js Setup |
| **barscene.js** | Haupt-Scene-Setup, Renderer/Update-Loop, Kamera, Beleuchtung, Erstellung und Laden der 3D-Objekte, UI instanziieren (Jukebox+Quiz), Inputlogik (PointerLock+WASD), Kollisionsdetektion |
| **quizUI.js** | Quizlogik + User Interface |
| **jukeboxUI.js** | Jukebox-UI, Song-Management/Audiosteuerung |
| **characterDanceController.js** | Animation des tanzenden Avatars, Song mapping auf AnimationClips |
| **interactions.js** | Raycasting und Objekt-Interaktionen, verwaltet `inRange`-Zustände (Distanz zum Ziel, hier Jukebox) und UI-Trigger |

### Assets und Ressourcen

| Ordner | Inhalt | Verwendung |
|--------|--------|------------|
| **Assets/** | 3D-Modelle | `Bar/scene.gltf`, `Jukebox/scene.gltf` |
| **Songs/** | Audio-Dateien | Ambientemusik `groovy-vibe.mp3` (frei lizenziert, im Repo enthalten). Die vier Jukebox-Songs sind urheberrechtlich geschützt und **nicht im Repo** – sie müssen lokal ergänzt werden, siehe [Hinweis zu den Songs](#️-hinweis-zu-den-songs-und-zum-projektstatus) |
| **textures/** |  Boden- und Wand-Texturen | `floor2/4K/Poliigon_SlateFloorTile_7657_BaseColor.jpg`,  `floor2/4K/Poliigon_SlateFloorTile_7657_Normal.png`, `floor2/4K/Poliigon_SlateFloorTile_7657_Roughness.jpg`, `wall/RammedEarth018_COL_2K_METALNESS.png`, `wall/RammedEarth018_NRM_2K_METALNESS.png` |
| **Characters/** | Charakter Michelle | Tanzende Bar-Besucherin `Michelle2idle.glb` |
| **FromThreeBook/** | Three.js Libs | siehe oben [Three.js Module](#threejs-module) |

## Quellen
### Codeinspiration
- [Kollisionserkennung](https://sbcode.net/threejs/raycaster2/)
### Audios
Die folgenden vier Titel wurden im Prototyp verwendet, sind aber **nicht Bestandteil dieses
Repositories** (siehe [Hinweis zu den Songs](#️-hinweis-zu-den-songs-und-zum-projektstatus)).
Sie sind hier ausschließlich als Quellenangabe aufgeführt.

- [Ambiente Musik](https://pixabay.com/music/beats-groovy-vibe-427121/) (Pixabay Content License – im Repo enthalten)
- Springsteen, B. (1984). I'm on fire [Song]. On Born in the U.S.A. Columbia Records.
- Macklemore, & Lewis, R. (2012). Thrift shop (feat. Wanz) [Song]. On The Heist. Macklemore, LLC.
- Richie, L. (1983). All night long (All night) [Song]. On Can't slow down. Motown.
- Black Eyed Peas. (2004). Let's get it started [Song]. On Elephunk. A&M Records; Interscope Records.
### Assets
- [Charakter Michelle](https://www.mixamo.com/#/?page=1&query=michelle&type=Character)
- [Jukebox](https://sketchfab.com/3d-models/jukebox-188e71ce378f4b6786054d9f74dd3a25)
- [Bar](https://sketchfab.com/3d-models/bar-842754f23a384d7e86aca94d12aa34ca)
### Texturen
- [Spiegeltextur (Code)](https://threejs.org/examples/webgl_animation_skinning_ik.html)
- [Bodentextur](https://www.poliigon.com/texture/square-slate-raw-tile-texture-black/7657)
- [Wandtextur](https://www.poliigon.com/texture/adobe-plaster-wall-texture/7584)
### Animationen
- [3D Modelle mit Animationen aus Blender exportieren](https://www.youtube.com/watch?v=GByT8ActvDk)
- [Animationen von Mixamo (Twist Dance, Salsa Dancing, Rumba Dancing)](https://www.mixamo.com/#/?page=1&query=dance&type=Motion%2CMotionPack)
### Weitere Hilfsmittel
- [Perplexity](https://www.perplexity.ai/)
- [ChatGPT](https://chatgpt.com/)
