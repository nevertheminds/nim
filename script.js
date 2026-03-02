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
   PHOTO SYSTEM (DRAG + FLIP + LIGHTBOX)
================================= */

document.querySelectorAll(".photo").forEach((photo) => {

  // Make photos draggable layout-ready
  photo.style.position = "absolute";
  photo.style.left = Math.random() * 400 + "px";
  photo.style.top = Math.random() * 300 + "px";
  photo.style.cursor = "grab";

  let clickCount = 0;
  let clickTimer = null;
  let isDragging = false;
  let hasMoved = false;
  let startX, startY, offsetX, offsetY;

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

    const rect = photo.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    photo.style.zIndex = ++topZ;
    photo.style.cursor = "grabbing";
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

    photo.style.left = clientX - offsetX + "px";
    photo.style.top = clientY - offsetY + "px";
  };

  const endDrag = () => {
    isDragging = false;
    photo.style.cursor = "grab";
  };

  photo.addEventListener("mousedown", startDrag);
  photo.addEventListener("touchstart", startDrag, { passive: false });

  window.addEventListener("mousemove", moveDrag);
  window.addEventListener("touchmove", moveDrag, { passive: false });

  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);


  /* CLICK SYSTEM */

  photo.addEventListener("click", () => {
    if (hasMoved) return;

    clickCount++;

    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        if (clickCount === 1) {
          const img = photo.querySelector("img");
          if (img) {
            document.getElementById("lightbox-img").src = img.src;
            document.getElementById("lightbox").style.display = "flex";
          }
        }
        clickCount = 0;
      }, 250);
    }

    else if (clickCount === 2) {
      clearTimeout(clickTimer);
      photo.classList.toggle("flipped");
      clickCount = 0;
    }
  });

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
  const s = document.createElement("div");
  s.className = "draggable-sticker";
  s.innerHTML = emoji;

  s.style.left = x + "px";
  s.style.top = y + "px";
  s.style.position = "absolute";
  s.style.zIndex = ++topZ;

  s.ondblclick = () => s.remove();

  board.appendChild(s);
  makeDraggable(s);
}

function makeDraggable(el) {

  let p1 = 0, p2 = 0, p3 = 0, p4 = 0;

  const dragStart = (e) => {
    e.preventDefault();

    el.style.zIndex = ++topZ;

    const clientX = e.type.includes("touch")
      ? e.touches[0].clientX
      : e.clientX;

    const clientY = e.type.includes("touch")
      ? e.touches[0].clientY
      : e.clientY;

    p3 = clientX;
    p4 = clientY;

    document.onmousemove = dragMove;
    document.ontouchmove = dragMove;

    document.onmouseup = dragEnd;
    document.ontouchend = dragEnd;
  };

  const dragMove = (e) => {
    const clientX = e.type.includes("touch")
      ? e.touches[0].clientX
      : e.clientX;

    const clientY = e.type.includes("touch")
      ? e.touches[0].clientY
      : e.clientY;

    p1 = p3 - clientX;
    p2 = p4 - clientY;

    p3 = clientX;
    p4 = clientY;

    el.style.top = el.offsetTop - p2 + "px";
    el.style.left = el.offsetLeft - p1 + "px";
  };

  const dragEnd = () => {
    document.onmousemove = null;
    document.ontouchmove = null;
    document.onmouseup = null;
    document.ontouchend = null;
  };

  el.onmousedown = dragStart;
  el.ontouchstart = dragStart;
}


/* =================================
   SAVE / LOAD SYSTEM
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


/* LOAD ON START */

window.onload = () => {
  const savedData = localStorage.getItem("myBoardStickers");

  if (savedData) {
    JSON.parse(savedData).forEach((s) => {
      spawnSticker(s.emoji, s.x, s.y);
    });
  }
};


/* =================================
   EMOJI INPUT
================================= */

const emojiInput = document.getElementById("emojiInput");

if (emojiInput) {
  emojiInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const val = e.target.value.trim();

      if (val) {
        spawnSticker(val, 100, 100);
        e.target.value = "";
      }
    }
  });
}
