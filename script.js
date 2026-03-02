// --- DARK MODE LOGIC ---
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// Hook up the toggle button (Assuming ID is 'dark-toggle')
const darkBtn = document.getElementById("dark-toggle");
if (darkBtn) darkBtn.addEventListener("click", toggleDarkMode);

// --- GLOBAL STATE ---
let topZ = 1000;

// --- PHOTO LOGIC (DRAG, FLIP, LIGHTBOX) ---
document.querySelectorAll(".photo").forEach((photo) => {
  let clickCount = 0;
  let clickTimer = null;
  let isDragging = false;
  let hasMoved = false;
  let startX, startY, offsetX, offsetY;

  const startDrag = (e) => {
    isDragging = true;
    hasMoved = false; // Reset for every new touch/click

    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    const rect = photo.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    photo.style.zIndex = ++topZ;
    photo.style.cursor = "grabbing";
  };

  const moveDrag = (e) => {
    if (!isDragging) return;

    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

    // Determine if this is a "Move" or just a "Click"
    if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
      hasMoved = true;
    }

    photo.style.left = `${clientX - offsetX}px`;
    photo.style.top = `${clientY - offsetY}px`;
  };

  const endDrag = () => {
    isDragging = false;
    photo.style.cursor = "grab";
  };

  // Event Listeners for Dragging
  photo.addEventListener("mousedown", startDrag);
  photo.addEventListener("touchstart", startDrag, { passive: false });

  window.addEventListener("mousemove", moveDrag);
  window.addEventListener("touchmove", moveDrag, { passive: false });
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  // Click Logic (Lightbox vs Flip)
  photo.addEventListener("click", (e) => {
    if (hasMoved) return; // Don't trigger if the user was dragging

    clickCount++;

    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        if (clickCount === 1) {
          // SINGLE CLICK: Open Lightbox
          const img = photo.querySelector("img");
          if (img) {
            document.getElementById("lightbox-img").src = img.src;
            document.getElementById("lightbox").style.display = "flex";
          }
        }
        clickCount = 0;
      }, 250); // Delay to wait for a potential second click
    } else if (clickCount === 2) {
      // DOUBLE CLICK: Flip Photo
      clearTimeout(clickTimer);
      photo.classList.toggle("flipped");
      clickCount = 0;
    }
  });
});

// --- LIGHTBOX CLOSE ---
const lightbox = document.getElementById("lightbox");
if (lightbox) {
  lightbox.addEventListener("click", () => {
    lightbox.style.display = "none";
  });
}

// --- STICKER LOGIC ---
function spawnSticker(emoji, x, y) {
  const s = document.createElement("div");
  s.className = "draggable-sticker";
  s.innerHTML = emoji;
  s.style.left = x + "px";
  s.style.top = y + "px";
  s.style.position = "absolute";
  s.style.zIndex = ++topZ;
  s.style.fontSize = "2rem";

  s.ondblclick = () => s.remove();
  document.getElementById("board-container").appendChild(s);
  makeDraggable(s);
}

function makeDraggable(el) {
  let p1 = 0,
    p2 = 0,
    p3 = 0,
    p4 = 0;

  const dragStart = (e) => {
    el.style.zIndex = ++topZ;
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
    p3 = clientX;
    p4 = clientY;

    document.onmousemove = dragMove;
    document.ontouchmove = dragMove;
    document.onmouseup = dragEnd;
    document.ontouchend = dragEnd;
  };

  const dragMove = (e) => {
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
    p1 = p3 - clientX;
    p2 = p4 - clientY;
    p3 = clientX;
    p4 = clientY;
    el.style.top = el.offsetTop - p2 + "px";
    el.style.left = el.offsetLeft - p1 + "px";
  };

  function dragEnd() {
    document.onmousemove = null;
    document.ontouchmove = null;
    document.onmouseup = null;
    document.ontouchend = null;
  }

  el.onmousedown = el.ontouchstart = dragStart;
}

// Save & Load Logic
window.onload = () => {
  const savedData = localStorage.getItem("myBoardStickers");
  if (savedData) {
    JSON.parse(savedData).forEach((s) => spawnSticker(s.emoji, s.x, s.y));
  }
};

const emojiInput = document.getElementById("emojiInput");
if (emojiInput) {
  emojiInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const val = e.target.value.trim();
      if (val) {
        spawnSticker(val, 50, 50);
        e.target.value = "";
      }
    }
  });
}
