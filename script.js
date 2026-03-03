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
   UNIVERSAL DRAG SYSTEM (PHONE SAFE)
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

    const boardRect = board.getBoundingClientRect();

    let newLeft = clientX - boardRect.left - offsetX;
    let newTop = clientY - boardRect.top - offsetY;

    const maxLeft = board.scrollWidth - element.offsetWidth;
    const maxTop = board.scrollHeight - element.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

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
   PHOTO SYSTEM (SCRAPBOOK STYLE)
================================= */
document.querySelectorAll(".photo").forEach((photo) => {

  photo.style.position = "absolute";

  // Random placement across full board
  photo.style.left = Math.random() * (board.offsetWidth - 200) + "px";
  photo.style.top = Math.random() * (board.offsetHeight - 250) + "px";

  // Slight random rotation
  photo.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;

  photo.style.cursor = "grab";

  const checkMoved = makeDraggable(photo);

  let tapTimeout = null;
  let lastTapTime = 0;

  const handleTap = () => {

    if (checkMoved()) return;

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 300 && tapLength > 0) {
      clearTimeout(tapTimeout);
      photo.classList.toggle("flipped");
    } else {
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
   STICKER SYSTEM (CLICK ANYWHERE)
================================= */
function spawnSticker(emoji, x, y) {

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

/* ===== CLICK TO PLACE EMOJI ===== */
let currentEmoji = "";

const emojiInput = document.getElementById("emojiInput");

if (emojiInput) {
  emojiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      currentEmoji = e.target.value.trim();
      e.target.value = "";
    }
  });
}

board.addEventListener("click", (e) => {

  if (!currentEmoji) return;

  if (e.target.closest(".photo")) return;

  const boardRect = board.getBoundingClientRect();

  const x = e.clientX - boardRect.left;
  const y = e.clientY - boardRect.top;

  spawnSticker(currentEmoji, x, y);
});

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
