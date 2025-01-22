// game.js (classic style, no import/export)

// console.log("game.js is loaded");

// Pull references from the global window objects that were defined in lottieConf.js and audioConf.js
// const { EntryDancePlayer1, pointer, textCTA } = window.lottiePlayers;
const { EntryDancePlayer1, pointer, textCTA, clock, textAlert } = window.lottiePlayers;
// e.g. if you have more players, destructure them similarly

let onAllSoundsReady = false;
let onAllLottieReady = false;
let started = false;
let allowClick = true;

// We'll store our timeout ID here so we can cancel it upon click
let noClickTimeout = null;

// Listen for the custom event from lottieConf.js
document.addEventListener(`${window.MediaID}-${window.MediaVersionID}-allLottiesReady`, function() {
  onAllLottieReady = true;
  checkEvents();
});

// Listen for the custom event from audioConf.js
document.addEventListener("onAllSoundsReady", function() {
  // console.log("onAllSoundsReady!", onAllSoundsReady);
  onAllSoundsReady = true;
  checkEvents();
});

// console.log("1");

// Kick off the readiness checks + sound loading
// (Both functions come from your global scripts: lottieConf.js + audioConf.js)
window.checkLottieReadinessAndFireEvent();
window.initializePopSound();

function checkEvents() {
  // console.log("onAllLottieReady", onAllLottieReady);
  // console.log("onAllSoundsReady", onAllSoundsReady);
  // console.log("started", started);

  if (onAllLottieReady && onAllSoundsReady && !started) {

    document.dispatchEvent(new Event(`${window.MediaID}-${window.MediaVersionID}-STARTED`));
    window.parent.postMessage(`${window.MediaID}-${window.MediaVersionID}-STARTED`, "*");
    // console.log(`${window.MediaID}-${window.MediaVersionID}-STARTED 🟢-> was fired!🚀`);

    started = true;

    setTimeout(() => {
      // console.log("started after setTimeout !");

      // 1) Once we reach this point, set up a one-time click handler
      document.addEventListener('click', handleFirstClick);

      // Play initial segment [0..300]
      window.playSegments(EntryDancePlayer1, [[0, 305]], false);


      setTimeout(() => {
        // console.log("started after setTimeout ! (inner)");
        window.playSegments(pointer, [[0, 1000]], false);
        window.playSegments(textCTA, [[0, 100]], false);
        window.playSegments(clock, [[0, 1920]], false);


        // Disable clicking after the clock finishes
        setTimeout(()=>{
          // console.log("Clock event finished. Disabling clicks.");
          allowClick = false; // Prevent further clicks
        }, 1920 * 16.67); // Assuming 60fps (16.67ms per frame)
      }, 1000);

      // Play a sound if needed...

    }, 500);

    // Dispatch FINISHED after 2.5 seconds (if needed)...
  }
}

// 2) One-time click function
function handleFirstClick() {
  if (!allowClick) {
    // console.log("Click disabled. Exploding event not allowed.");
    return; // Do nothing if clicks are disabled
  }
  
  // console.log("User clicked! Playing [300..500] segment now.");



  // Play the next segment
  window.playSound(window.popSound);
  window.playSegments(clock, [[0, 0]], false);
  window.playSegments(EntryDancePlayer1, [[310, 500]], false);
  window.playSegments(textCTA, [[120, 150]], false);

  window.playSegments(pointer, [[30000, 30000]], false);


  setTimeout(() => {
    document.dispatchEvent(new Event(`${window.MediaID}-${window.MediaVersionID}-FINISHED`));
    window.parent.postMessage(`${window.MediaID}-${window.MediaVersionID}-FINISHED`, "*");
    // console.log(`${window.MediaID}-${window.MediaVersionID}-FINISHED 🏁 -> was fired!🚀`);
  }, 1500);

  // Remove this event listener so it won't happen again
  document.removeEventListener('click', handleFirstClick);
}
