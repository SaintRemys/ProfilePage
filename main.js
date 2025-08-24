let lastData = null;
let lastUpdate = Date.now();
let cachedActivities = {};

function formatDuration(seconds) {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / 86400);
    seconds %= 86400;
    const h = Math.floor(seconds / 3600);
    seconds %= 3600;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${d ? d + 'd ' : ''}${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s}s`;
}

const online = `:root { --bg:#0a0a0a;--surface:#111111;--surface-alt:#0f0f0f;--border:#222222;--text:#e0e0e0;--text-dim:#888888;--accent:#4ade80;--accent-strong:#16a34a;--accent-alt:#10b981;--accent-alt2:#06d6a0;--profile-shadow:rgba(74,222,128,0.4);--profile-shadow2:rgba(74,222,128,0.1);--glow1:rgba(74,222,128,0.3);--glow2:rgba(74,222,128,0.5);--white-soft:rgba(255,255,255,0.1);--white-bright:rgba(255,255,255,0.8);--white-glow1:rgba(197,197,197,0.5);--white-glow2:rgba(255,255,255,0.7);--black-shadow:rgba(0,0,0,0.3);--black-shadow-strong:rgba(0,0,0,0.4);--radius:8px;--font-mono:'SF Mono','Monaco','Inconsolata',monospace;--font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }`;
const idle = `:root { --bg:#0a0a0a;--surface:#111111;--surface-alt:#0f0f0f;--border:#222222;--text:#e0e0e0;--text-dim:#888888;--accent:#facc15;--accent-strong:#ca8a04;--accent-alt:#eab308;--accent-alt2:#fcd34d;--profile-shadow:rgba(250,204,21,0.4);--profile-shadow2:rgba(250,204,21,0.1);--glow1:rgba(250,204,21,0.3);--glow2:rgba(250,204,21,0.5);--white-soft:rgba(255,255,255,0.1);--white-bright:rgba(255,255,255,0.8);--white-glow1:rgba(197,197,197,0.5);--white-glow2:rgba(255,255,255,0.7);--black-shadow:rgba(0,0,0,0.3);--black-shadow-strong:rgba(0,0,0,0.4);--radius:8px;--font-mono:'SF Mono','Monaco','Inconsolata',monospace;--font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }`;
const dnd = `:root { --bg:#0a0a0a;--surface:#111111;--surface-alt:#0f0f0f;--border:#222222;--text:#e0e0e0;--text-dim:#888888;--accent:#ef4444;--accent-strong:#b91c1c;--accent-alt:#dc2626;--accent-alt2:#f87171;--profile-shadow:rgba(239,68,68,0.4);--profile-shadow2:rgba(239,68,68,0.1);--glow1:rgba(239,68,68,0.3);--glow2:rgba(239,68,68,0.5);--white-soft:rgba(255,255,255,0.1);--white-bright:rgba(255,255,255,0.8);--white-glow1:rgba(197,197,197,0.5);--white-glow2:rgba(255,255,255,0.7);--black-shadow:rgba(0,0,0,0.3);--black-shadow-strong:rgba(0,0,0,0.4);--radius:8px;--font-mono:'SF Mono','Monaco','Inconsolata',monospace;--font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }`;
const offline = `:root { --bg:#0a0a0a;--surface:#111111;--surface-alt:#0f0f0f;--border:#222222;--text:#e0e0e0;--text-dim:#888888;--accent:#9ca3af;--accent-strong:#6b7280;--accent-alt:#4b5563;--accent-alt2:#d1d5db;--profile-shadow:rgba(156,163,175,0.4);--profile-shadow2:rgba(156,163,175,0.1);--glow1:rgba(156,163,175,0.3);--glow2:rgba(156,163,175,0.5);--white-soft:rgba(255,255,255,0.1);--white-bright:rgba(255,255,255,0.8);--white-glow1:rgba(197,197,197,0.5);--white-glow2:rgba(255,255,255,0.7);--black-shadow:rgba(0,0,0,0.3);--black-shadow-strong:rgba(0,0,0,0.4);--radius:8px;--font-mono:'SF Mono','Monaco','Inconsolata',monospace;--font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }`;

function applyTheme(css) {
    let themeTag = document.getElementById('status-theme');
    if (!themeTag) {
        themeTag = document.createElement('style');
        themeTag.id = 'status-theme';
        document.head.appendChild(themeTag);
    }
    themeTag.textContent = css;
}

async function updateStatus() {
    const statusContainer = document.querySelector('.status.container');
    const profileWrapper = document.querySelector('.profile-wrapper');
    if (!statusContainer || !profileWrapper) return;

    try {
        const res = await fetch('https://profilepage-t864.onrender.com/status/1237212866445316179');
        const data = await res.json();
        lastData = data;
        lastUpdate = Date.now();
    } catch {
        if (!lastData) return;
        const delta = Math.floor((Date.now() - lastUpdate) / 1000);
        lastData = JSON.parse(JSON.stringify(lastData));
        Object.keys(lastData).forEach(key => {
            if (key.startsWith('activity')) {
                const act = lastData[key];
                if (act.type === 'listening' || act.type === 'playing') {
                    if (act.duration_seconds) act.duration_seconds += delta;
                    if (act.start) {
                        const startTime = new Date(act.start).getTime();
                        const now = Date.now();
                        if (!act.end || now < new Date(act.end).getTime()) {
                            act.start = new Date(startTime - delta * 1000).toISOString();
                        }
                    }
                }
            }
        });
        lastUpdate = Date.now();
    }

    let statusImg = profileWrapper.querySelector('.status-img');
    const status = (lastData.status || 'offline').toLowerCase();

    switch (status) {
        case 'online':
            statusImg.src = 'https://assets.guns.lol/online.png';
            applyTheme(online);
            break;
        case 'idle':
            statusImg.src = 'https://assets.guns.lol/idle.png';
            applyTheme(idle);
            break;
        case 'dnd':
            statusImg.src = 'https://assets.guns.lol/dnd.png';
            applyTheme(dnd);
            break;
        default:
            statusImg.src = 'https://assets.guns.lol/offline.png';
            applyTheme(offline);
    }

    const activityKeys = Object.keys(lastData).filter(k => k.startsWith('activity'));
    if (!activityKeys.length) {
        if (!cachedActivities.empty) {
            statusContainer.innerHTML = '';
            const noActivity = document.createElement('div');
            noActivity.className = 'activity none';
            noActivity.textContent = 'Nothing';
            statusContainer.appendChild(noActivity);
            cachedActivities = {};
            cachedActivities.empty = true;
        }
        return;
    }

    cachedActivities.empty = false;

    for (const key of activityKeys) {
        const activity = lastData[key];
        let card = cachedActivities[key];

        if (!card) {
            if (activity.type === 'listening' && activity.name === 'Spotify') {
                card = document.createElement('div');
                card.innerHTML = `
                  <div class="spotify-card sss">
                    <div class="spotify-header"><span>Listening to Spotify</span></div>
                    <div class="spotify-content">
                      <img class="spotify-cover" src="${activity.image_url || ''}" alt="cover">
                      <div class="spotify-info">
                        <p class="spotify-title">${activity.details || 'Unknown Track'}</p>
                        <p class="spotify-artist">${activity.state || 'Unknown Artist'}</p>
                        <div class="progress-container">
                          <span class="start-time">00:00</span>
                          <div class="progress-bar"><div class="progress-bar-fill"></div></div>
                          <span class="end-time">00:00</span>
                        </div>
                      </div>
                    </div>
                  </div>`;
            } else if (activity.type === 'playing') {
                let gameIcon = '';
                if (activity.name.toLowerCase() === 'roblox') gameIcon = 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Roblox_Logo_2025.png';
                else if (activity.name.toLowerCase() === 'valorant') gameIcon = 'https://cdn.discordapp.com/app-icons/700136079562375258/e55fc8259df1548328f977d302779ab7.png?size=160&keep_aspect_ratio=false';

                card = document.createElement('div');
                card.innerHTML = `
                    <div class="game-card sss">
                        <div class="game-header"><span>Playing Game</span></div>
                        <div class="game-content">
                            <img class="game-cover" src="${gameIcon || activity.image_url || ''}" alt="cover">
                            <div class="game-info">
                                <p class="game-title">${activity.name || 'Unknown Game'}</p>
                                <div class="progress-container">
                                    <span class="playtime">${formatDuration(activity.duration_seconds)}</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
            }

            statusContainer.appendChild(card);
            cachedActivities[key] = card;
        }

        if (activity.type === 'listening' && activity.start && activity.end) {
            const start = new Date(activity.start).getTime();
            const end = new Date(activity.end).getTime();
            const now = Date.now();
            const elapsed = Math.min(Math.floor((now - start) / 1000), Math.floor((end - start) / 1000));
            const total = Math.floor((end - start) / 1000);
            const progress = (elapsed / total) * 100;

            const fill = card.querySelector('.progress-bar-fill');
            const startSpan = card.querySelector('.start-time');
            const endSpan = card.querySelector('.end-time');
            fill.style.width = `${progress}%`;

            const format = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
            startSpan.textContent = format(elapsed);
            endSpan.textContent = format(total);
        } else if (activity.type === 'playing') {
            const playtimeSpan = card.querySelector('.playtime');
            playtimeSpan.textContent = formatDuration(activity.duration_seconds);
        }
    }
}


document.getElementById('time').textContent = new Date().toLocaleTimeString();
setInterval(() => {
  document.getElementById('time').textContent = new Date().toLocaleTimeString();
}, 1000);


updateStatus();
setInterval(updateStatus, 1000);
