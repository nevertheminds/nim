/* =================================
   DARK MODE
================================= */

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}


/* =================================
   GLOBAL STATE
================================= */

let topZ = 1000;
const board = document.getElementById("board-container");


/* =================================
   UNIVERSAL DRAG SYSTEM
================================= */

function makeDraggable(element) {

  let isDragging = false;
  let hasMoved = false;
  let offsetX, offsetY;
  let startX, startY;

  const startDrag = (e) => {
    e.preventDefault();
    isDragging = true;
    hasMoved = false;

    const clientX = e.type.includes("touch")
      ? e.touches[0].clientX
      : e.clientX;

    const clientY = e.type.includes("touch")
      ? e.touches[0].clientY
      : e.clientY;

    startX = clientX;
    startY = clientY;

    const rect = element.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    element.style.zIndex = ++topZ;
    element.style.cursor = "grabbing";
  };

  const moveDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.type.includes("touch")
      ? e.touches[0].clientX
      : e.clientX;

    const clientY = e.type.includes("touch")
      ? e.touches[0].clientY
      : e.clientY;

    if (
      Math.abs(clientX - startX) > 5 ||
      Math.abs(clientY - startY) > 5
    ) {
      hasMoved = true;
    }

    let newLeft = clientX - offsetX;
    let newTop = clientY - offsetY;

    /* ===== BOUNDARY LOCK ===== */
    const boardRect = board.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();

    const maxLeft = boardRect.width - elRect.width;
    const maxTop = boardRect.height - elRect.height;

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft > maxLeft) newLeft = maxLeft;
    if (newTop > maxTop) newTop = maxTop;

    element.style.left = newLeft + "px";
    element.style.top = newTop + "px";
  };

  const endDrag = () => {
    isDragging = false;
    element.style.cursor = "grab";
  };

  element.addEventListener("mousedown", startDrag);
  element.addEventListener("touchstart", startDrag, { passive: false });

  window.addEventListener("mousemove", moveDrag);
  window.addEventListener("touchmove", moveDrag, { passive: false });

  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  return () => hasMoved;
}


/* =================================
   PHOTO SYSTEM
================================= */

document.querySelectorAll(".photo").forEach((photo) => {

  photo.style.position = "absolute";
  photo.style.left = Math.random() * 400 + "px";
  photo.style.top = Math.random() * 300 + "px";
  photo.style.cursor = "grab";

  const checkMoved = makeDraggable(photo);

  let tapTimeout = null;
  let lastTapTime = 0;

  const handleTap = () => {

    if (checkMoved()) return;

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 300 && tapLength > 0) {
      // DOUBLE TAP → FLIP
      clearTimeout(tapTimeout);
      photo.classList.toggle("flipped");
    } else {
      // SINGLE TAP → LIGHTBOX
      tapTimeout = setTimeout(() => {
        const img = photo.querySelector("img");
        const lightbox = document.getElementById("lightbox");
        const lightboxImg = document.getElementById("lightbox-img");

        if (img && lightbox && lightboxImg) {
          lightboxImg.src = img.src;
          lightbox.style.display = "flex";
        }
      }, 300);
    }

    lastTapTime = currentTime;
  };

  photo.addEventListener("mouseup", handleTap);
  photo.addEventListener("touchend", handleTap);
});


/* =================================
   LIGHTBOX CLOSE
================================= */

const lightbox = document.getElementById("lightbox");

if (lightbox) {
  lightbox.addEventListener("click", () => {
    lightbox.style.display = "none";
  });
}


/* =================================
   STICKERS
================================= */

function spawnSticker(emoji, x, y) {

  if (!board) return;

  const sticker = document.createElement("div");
  sticker.className = "draggable-sticker";
  sticker.innerHTML = emoji;

  sticker.style.position = "absolute";
  sticker.style.left = x + "px";
  sticker.style.top = y + "px";
  sticker.style.zIndex = ++topZ;

  sticker.ondblclick = () => sticker.remove();

  board.appendChild(sticker);
  makeDraggable(sticker);
}


/* =================================
   SAVE / LOAD
================================= */

function saveBoard() {

  const stickers = document.querySelectorAll(".draggable-sticker");
  const data = [];

  stickers.forEach((s) => {
    data.push({
      emoji: s.innerHTML,
      x: s.offsetLeft,
      y: s.offsetTop
    });
  });

  localStorage.setItem("myBoardStickers", JSON.stringify(data));
  alert("Board Saved 💾");
}

function clearStickers() {

  document.querySelectorAll(".draggable-sticker")
    .forEach((s) => s.remove());

  localStorage.removeItem("myBoardStickers");
}

window.addEventListener("load", () => {

  const savedData = localStorage.getItem("myBoardStickers");

  if (savedData) {
    JSON.parse(savedData).forEach((s) => {
      spawnSticker(s.emoji, s.x, s.y);
    });
  }
});


/* =================================
   EMOJI INPUT
================================= */

const emojiInput = document.getElementById("emojiInput");

if (emojiInput) {
  emojiInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {

      const val = e.target.value.trim();

      if (val) {
        spawnSticker(val, 120, 120);
        e.target.value = "";
      }
    }
  });
}
