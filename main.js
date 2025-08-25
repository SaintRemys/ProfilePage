let lastData = null,
  lastUpdate = Date.now(),
  cachedActivities = {},
  finishedSongs = new Set(),
  themes = null;

async function loadThemes() {
  try {
    const response = await fetch('themes.json');
    if (!response.ok) throw new Error('Failed to load themes');
    themes = await response.json();
  } catch (error) {
    console.error('Failed to load themes:', error);

    themes = {
      online: { accent: "#4ade80", "accent-strong": "#16a34a", "accent-alt": "#10b981", "accent-alt2": "#06d6a0" },
      idle: { accent: "#facc15", "accent-strong": "#ca8a04", "accent-alt": "#eab308", "accent-alt2": "#fcd34d" },
      dnd: { accent: "#ef4444", "accent-strong": "#b91c1c", "accent-alt": "#dc2626", "accent-alt2": "#f87171" },
      offline: { accent: "#9ca3af", "accent-strong": "#6b7280", "accent-alt": "#4b5563", "accent-alt2": "#d1d5db" }
    };
  }
}

function generateThemeCSS(themeData) {
  if (!themeData) return '';

  let css = ':root{';
  for (const [key, value] of Object.entries(themeData)) {
    css += `--${key}:${value};`;
  }
  css += '}';
  return css;
}

function applyTheme(themeKey) {
  if (!themes || !themes[themeKey]) return;

  let t = document.getElementById("status-theme");
  if (!t) {
    t = document.createElement("style");
    t.id = "status-theme";
    document.head.appendChild(t);
  }
  t.textContent = generateThemeCSS(themes[themeKey]);
}

async function fetchStatus() {
  try {
    const res = await fetch("https://profilepage-t864.onrender.com/status/1237212866445316179");
    if (!res.ok) throw new Error();
    const newData = await res.json();
    lastData = newData;
    lastUpdate = Date.now();

    finishedSongs.clear();
  } catch {
    lastData = null;
  }
}

function fillNoneIfEmpty(container) {
  if (!Array.from(container.children).some(c => c.className.includes("activity") && !c.className.includes("none"))) {
    container.innerHTML = "";
    const n = document.createElement("div");
    n.className = "activity none";
    n.textContent = "Nothing";
    container.appendChild(n);
  }
}

function formatDuration(s) {
  if (!s) return "0s";
  const d = Math.floor(s / 86400);
  s %= 86400;
  const h = Math.floor(s / 3600);
  s %= 3600;
  const m = Math.floor(s / 60);
  const sec = s;
  return `${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m " : ""}${sec}s`;
}

function removeFinishedActivities() {
  const container = document.querySelector(".status.container");
  if (!container) return;

  Object.keys(cachedActivities).forEach(key => {
    if (!lastData || !lastData[key]) {
      const card = cachedActivities[key];
      if (card && card.parentNode) {
        card.parentNode.removeChild(card);
      }
      delete cachedActivities[key];
    }
  });
}

function renderActivity(container, key, activity) {
  if (!activity) return;

  let card = cachedActivities[key];
  if (!card) {
    card = document.createElement("div");
    cachedActivities[key] = card;
    container.appendChild(card);
  }

  if (activity.type === "listening") {
    card.className = "activity spotify-card sss";
    card.dataset.start = activity.start;
    card.dataset.end = activity.end;
    card.innerHTML = `<div class="spotify-header"><span>Listening to Spotify</span></div><div class="spotify-content"><img class="spotify-cover" src="${activity.image_url||''}" alt="cover"><div class="spotify-info"><p class="spotify-title">${activity.details||'Unknown Track'}</p><p class="spotify-artist">${activity.state||'Unknown Artist'}</p><div class="progress-container"><span class="start-time">00:00</span><div class="progress-bar"><div class="progress-bar-fill"></div></div><span class="end-time">00:00</span></div></div></div>`;
  } else if (activity.type === "playing") {
    card.className = "activity game-card sss";
    card.dataset.start = activity.start;
    let g = "";
    if (activity.name?.toLowerCase() === "roblox") g = "https://upload.wikimedia.org/wikipedia/commons/1/1e/Roblox_Logo_2025.png";
    else if (activity.name?.toLowerCase() === "valorant") g = "https://cdn.discordapp.com/app-icons/700136079562375258/e55fc8259df1548328f977d302779ab7.png?size=160&keep_aspect_ratio=false";
    card.innerHTML = `<div class="game-header"><span>Playing Game</span></div><div class="game-content"><img class="game-cover" src="${g||activity.image_url||''}" alt="cover"><div class="game-info"><p class="game-title">${activity.name||'Unknown Game'}</p><div class="progress-container"><span class="playtime">00:00</span></div></div></div>`;
  }
}

async function updateStatus() {
  await fetchStatus();
  const w = document.querySelector(".profile-wrapper"), c = document.querySelector(".status.container");
  if (!w || !c) return;

  const s = w.querySelector(".status-img"), status = (lastData?.status||"offline").toLowerCase();
  switch(status){
    case"online":
      if(s) s.src="https://assets.guns.lol/online.png";
      applyTheme("online");
      break;
    case"idle":
      if(s) s.src="https://assets.guns.lol/idle.png";
      applyTheme("idle");
      break;
    case"dnd":
      if(s) s.src="https://assets.guns.lol/dnd.png";
      applyTheme("dnd");
      break;
    default:
      if(s) s.src="https://assets.guns.lol/offline.png";
      applyTheme("offline");
  }

  removeFinishedActivities();

  Object.keys(lastData||{}).filter(k=>k.startsWith("activity")).forEach(k=>renderActivity(c,k,lastData[k]));
  fillNoneIfEmpty(c);
}

function updateTimers() {
  if (!lastData) return;

  let needsRefresh = false;

  Object.entries(cachedActivities).forEach(([k, card]) => {
    const a = lastData[k];
    if (!a) return;

    if (a.type === "listening" && a.start && a.end) {
      const start = new Date(a.start).getTime();
      const end = new Date(a.end).getTime();
      const now = Date.now();
      const total = Math.floor((end - start) / 1000);
      let elapsed = Math.floor((now - start) / 1000);

      if (elapsed >= total) {
        if (!finishedSongs.has(k)) {
          finishedSongs.add(k);
          needsRefresh = true;
        }
        elapsed = total; 
      }

      const f = card.querySelector(".progress-bar-fill");
      const st = card.querySelector(".start-time");
      const et = card.querySelector(".end-time");

      if (f) f.style.width = `${Math.min((elapsed / total) * 100, 100)}%`;
      if (st) st.textContent = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
      if (et) et.textContent = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

    } else if (a.type === "playing") {
      const pt = card.querySelector(".playtime");
      if (pt && a.start) {

        const start = new Date(a.start).getTime();
        const now = Date.now();
        let elapsed = Math.floor((now - start) / 1000);
        if (elapsed < 0) elapsed = 0;
        pt.textContent = formatDuration(elapsed);
      }
    }
  });

  if (needsRefresh && Date.now() - lastUpdate > 10000) { 
    updateStatus();
  }
}

function updateTime() {
  const now = new Date();
  let h = now.getHours(), m = String(now.getMinutes()).padStart(2, "0"), s = String(now.getSeconds()).padStart(2, "0"), ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const timeElement = document.getElementById("time");
  if (timeElement) {
    timeElement.textContent = `${h}:${m}:${s} ${ampm}`;
  }
}

async function init() {
  await loadThemes();
  updateTime();
  setInterval(updateTime, 1000);
  applyTheme("offline"); 
  await updateStatus();
  setInterval(updateTimers, 1000);
  setInterval(updateStatus, 15000); 
}

init();