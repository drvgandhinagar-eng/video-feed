const feed = document.getElementById("feed");

const videos = [
  "videos/v1.mp4",
  "videos/v2.mp4",
  "videos/v3.mp4",
  "videos/v4.mp4",
  "videos/v5.mp4",
  "videos/v6.mp4",
  "videos/v7.mp4"
];

const AUTO_SCROLL_DELAY = 10000; // 10 seconds

let index = 0;
let videoSinceAd = 0;
let autoScrollEnabled = true;
let soundEnabled = false;

let activeCard = null;
let autoScrollTimer = null;

/* ---------- CORE AUTO SCROLL ENGINE ---------- */
function startAutoScroll(card) {
  clearAutoScroll();

  if (!autoScrollEnabled) return;

  activeCard = card;
  autoScrollTimer = setTimeout(() => {
    scrollToNext(card);
  }, AUTO_SCROLL_DELAY);
}

function clearAutoScroll() {
  if (autoScrollTimer) {
    clearTimeout(autoScrollTimer);
    autoScrollTimer = null;
  }
}

function scrollToNext(card) {
  if (!autoScrollEnabled) return;

  clearAutoScroll();
  card.nextElementSibling?.scrollIntoView({ behavior: "smooth" });
}

/* ---------- OBSERVER (KNOW WHICH CARD IS ACTIVE) ---------- */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        startAutoScroll(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

/* ---------- VIDEO CARD ---------- */
function createVideoCard(src) {
  const card = document.createElement("div");
  card.className = "card";

  const video = document.createElement("video");
  video.src = src;
  video.muted = !soundEnabled;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = "auto";

  /* UI */
  const ui = document.createElement("div");
  ui.className = "ui";

  const likeBtn = document.createElement("button");
  likeBtn.innerHTML = "❤️";
  likeBtn.onclick = () => likeBtn.classList.toggle("active");

  const soundBtn = document.createElement("button");
  soundBtn.innerHTML = soundEnabled ? "🔊" : "🔇";
  soundBtn.onclick = () => {
    soundEnabled = !soundEnabled;
    video.muted = !soundEnabled;
    soundBtn.innerHTML = soundEnabled ? "🔊" : "🔇";
  };

  const autoBtn = document.createElement("button");
  autoBtn.innerHTML = autoScrollEnabled ? "🔁" : "⏸️";
  autoBtn.onclick = () => {
    autoScrollEnabled = !autoScrollEnabled;
    autoBtn.innerHTML = autoScrollEnabled ? "🔁" : "⏸️";
    if (!autoScrollEnabled) clearAutoScroll();
  };

  ui.append(likeBtn, soundBtn, autoBtn);

  /* Video end = request scroll (NOT timer) */
  video.onended = () => scrollToNext(card);

  card.append(video, ui);
  observer.observe(card);

  return card;
}

/* ---------- AD CARD ---------- */
function createAdCard() {
  const card = document.createElement("div");
  card.className = "card ad-card";

  card.innerHTML = `
  <div class="ad-box">
    <div class="ad-label">Sponsored</div>
  </div>
`;


  observer.observe(card);
  return card;
}

/* ---------- FEED ENGINE ---------- */
function addNextItem() {
  if (videoSinceAd === 4) {
    feed.appendChild(createAdCard());
    videoSinceAd = 0;
    return;
  }

  const src = videos[index % videos.length];
  feed.appendChild(createVideoCard(src));
  index++;
  videoSinceAd++;
}

/* Initial load */
for (let i = 0; i < 7; i++) {
  addNextItem();
}

/* Infinite feed */
feed.addEventListener("scroll", () => {
  if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 200) {
    addNextItem();
  }
});
