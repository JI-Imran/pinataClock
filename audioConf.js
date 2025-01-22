// We'll need a reference to our Howl instance (local variable)
let popSound;

// Create a function that initializes popSound
function initializePopSound() {
  // console.log("initializePopSound started");

  // Create the Howl instance
  popSound = new Howl({
    src: [`https://GamifiedMarketing-PullZone.b-cdn.net/canvasID/${window.CanvasID}/Media${window.MediaID}/MediaVersion${window.MediaVersionID}/pop.mp3`],
    autoplay: false,
    loop: false,
    volume: 1,

    // When the sound finishes loading, fire an event
    onload: () => {
      // console.log("popSound is loaded!");
      // Dispatch a custom event so other code can listen
      document.dispatchEvent(new Event("onAllSoundsReady"));
    },
  });

  // IMPORTANT: Update the global reference with the actual Howl instance
  window.popSound = popSound;
}

// Optionally, a helper function to play the sound
function playSound(sound) {
  // console.log("Playing sound:", sound);
  sound.play();
}

// Expose references on window if needed by inline HTML
window.initializePopSound = initializePopSound;
window.playSound = playSound;

// We do NOT set `window.popSound` here initially,
// because we only have a real Howl object AFTER initializePopSound() is called.
// Instead, we set it inside `initializePopSound`.