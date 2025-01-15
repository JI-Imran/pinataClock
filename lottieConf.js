// lottieConf.js (classic script style)
console.log("lottieConf is on");

// 1) Keep a global object for dotlottie-player elements
window.lottiePlayers = {};  // was `export const lottiePlayers = {}`

// We'll separately track which ones are "ready" so we don't mix readiness with the actual element.
const readinessMap = {};

/**
 * This config array describes what <div> to create and which .lottie file to load.
 */


const playersConfig = [


  {
    key: "EntryDancePlayer1",
    wrapperId: "EntryDancePlayer1Wrapper",
    src: `https://GamifiedMarketing-PullZone.b-cdn.net/canvasID/${window.CanvasID}/Media${window.MediaID}/MediaVersion${window.MediaVersionID}/pinata1.lottie`,
  },
  {
    key: "pointer",
    wrapperId: "pointerWrapper",
    src: `https://GamifiedMarketing-PullZone.b-cdn.net/canvasID/${window.CanvasID}/Media${window.MediaID}/MediaVersion${window.MediaVersionID}/clickPinata.lottie`,
  },
  {
    key: "textCTA",
    wrapperId: "textCTAWrapper",
    src: `https://GamifiedMarketing-PullZone.b-cdn.net/canvasID/${window.CanvasID}/Media${window.MediaID}/MediaVersion${window.MediaVersionID}/textCTA.lottie`,
  },

  {
    key: "clock",
    wrapperId: "clockWrapper",
    src: `https://GamifiedMarketing-PullZone.b-cdn.net/canvasID/${window.CanvasID}/Media${window.MediaID}/MediaVersion${window.MediaVersionID}/clockAnimation.lottie`,
  },

  {
    key: "textAlert",
    wrapperId: "textAlertWrapper",
    src: `https://GamifiedMarketing-PullZone.b-cdn.net/canvasID/${window.CanvasID}/Media${window.MediaID}/MediaVersion${window.MediaVersionID}/textAlertTime.lottie`,
  },
  
];


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Create the <div> + <dotlottie-player> elements right away
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.log("Creating <dotlottie-player> elements...");

// 2) Get a container in which to create the elements
const lottieContainer = document.querySelector(".lottie-container");
if (!lottieContainer) {
  console.warn("No .lottie-container found on the page!");
} else {
  // 3) Build each wrapper & player from our config
  playersConfig.forEach(({ wrapperId, key, src }) => {
    // (a) Create wrapper <div>
    const wrapperDiv = document.createElement("div");
    wrapperDiv.id = wrapperId;
    lottieContainer.appendChild(wrapperDiv);

    // (b) Create <dotlottie-player>
    const player = document.createElement("dotlottie-player");
    player.id = key;
    player.loop = true;  // or false, if you prefer
    player.setAttribute("playMode", "normal");
    if (src) {
      player.src = src;
    }
    // Append player to the wrapper
    wrapperDiv.appendChild(player);

    // (c) Store the DOM element in window.lottiePlayers
    window.lottiePlayers[key] = player;
    readinessMap[key] = false;
  });

  console.log("All <dotlottie-player> elements created. Checking readiness...");

  // Kick off the readiness polling
  checkLottieReadinessAndFireEvent();
}

/**
 * Periodically checks whether each <dotlottie-player> is fully "ready."
 * Dispatches "allEntryLottiesReady" when *all* are ready.
 */
function checkLottieReadinessAndFireEvent(intervalMs = 100) {
  console.log("Starting Lottie readiness check...");

  const startTime = Date.now();
  const checkInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    let allReady = true;

    // Loop over all players
    Object.entries(window.lottiePlayers).forEach(([key, player]) => {
      if (readinessMap[key]) return; // skip if already flagged ready

      if (!player || typeof player.getState !== "function") {
        allReady = false;
        return;
      }

      // Check the current state
      const state = player.getState().currentState;
      if (state === "ready") {
        readinessMap[key] = true;
        console.log(`✅ ${key} is ready after ${elapsed}ms`);
      } else {
        allReady = false;
        console.log(`⏳ ${key} NOT ready yet (${state}). Elapsed: ${elapsed}ms`);
      }
    });

    if (allReady) {
      clearInterval(checkInterval);
      console.log("All Lottie players are ready!");
      document.body.classList.add("loaded");

      // Dispatch a custom event so other scripts can continue
      document.dispatchEvent(new Event(`${window.MediaID}-${window.MediaVersionID}-allLottiesReady`));
    }
  }, intervalMs);
}

/**
 * A universal function to play an array of segments (e.g. [[start,end],[...]])
 * on a single <dotlottie-player>.
 */
function playSegments(player, segments, loop = false, destroy = false) {
  console.log("player inside playSegments =>", player);

  // Cancel any previous segment-play tasks
  if (player._currentPlaySegmentsTask) {
    player._currentPlaySegmentsTask.cancel();
  }

  let currentSegmentIndex = 0;
  let frameListener;
  let canceled = false;

  player._currentPlaySegmentsTask = {
    cancel: () => {
      canceled = true;
      if (frameListener) {
        player.removeEventListener("frame", frameListener);
      }
    },
  };

  function playCurrentSegment() {
    if (canceled) {
      player.pause();
      return;
    }

    const [startFrame, endFrame] = segments[currentSegmentIndex];
    console.log(`${player.id}: Playing segment #${currentSegmentIndex + 1} from ${startFrame} to ${endFrame}`);

    player.pause();
    player.seek(startFrame);
    player.play();

    if (frameListener) {
      player.removeEventListener("frame", frameListener);
    }

    frameListener = () => {
      if (canceled) {
        player.pause();
        player.removeEventListener("frame", frameListener);
        return;
      }
      const currentFrame = player.getState().frame;
      if (currentFrame >= endFrame - 1) {
        player.pause();

        if (currentSegmentIndex < segments.length - 1) {
          currentSegmentIndex++;
          playCurrentSegment();
        } else if (loop) {
          player.seek(startFrame);
          player.play();
        } else {
          player.removeEventListener("frame", frameListener);
        }
      } else if (destroy && currentFrame >= endFrame - 3) {
        // e.g. remove from DOM or hide
        player.style.display = "none";
      }
    };
    player.addEventListener("frame", frameListener);
  }

  // Start the first segment
  playCurrentSegment();

  // If user manually pauses
  player.addEventListener("pause", () => {
    if (frameListener) {
      player.removeEventListener("frame", frameListener);
    }
  });
}

// Attach these functions to window so they're usable by other scripts
window.checkLottieReadinessAndFireEvent = checkLottieReadinessAndFireEvent;
window.playSegments = playSegments;