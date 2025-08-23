let lastData = null;
let lastUpdate = Date.now();

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

async function updateStatus() {
    const statusContainer = document.querySelector('.status.container');
    const profileWrapper = document.querySelector('.profile-wrapper');

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
                        if (!act.end || now < new Date(act.end).getTime()) act.start = new Date(startTime - delta * 1000).toISOString();
                    }
                }
            }
        });
        lastUpdate = Date.now();
    }

    statusContainer.innerHTML = '';

    let statusImg = profileWrapper.querySelector('.status-img');
    const status = lastData.status || 'offline';
    switch (status.toLowerCase()) {
        case 'online': statusImg.src = 'https://assets.guns.lol/online.png'; break;
        case 'idle': statusImg.src = 'https://assets.guns.lol/idle.png'; break;
        case 'dnd': statusImg.src = 'https://assets.guns.lol/dnd.png'; break;
        default: statusImg.src = 'https://assets.guns.lol/offline.png';
    }

    const activityKeys = Object.keys(lastData).filter(k => k.startsWith('activity'));
    if (activityKeys.length) {
        activityKeys.forEach(key => {
            const activity = lastData[key];

            if (activity.type === 'listening' && activity.name === 'Spotify') {
                const spotifyCard = document.createElement('div');
                spotifyCard.innerHTML = `
                  <div class="spotify-card sss">
                    <div class="spotify-header">
                      <span>Listening to Spotify</span>
                    </div>
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
                  </div>
                `;

                if (activity.start && activity.end) {
                    const start = new Date(activity.start).getTime();
                    const end = new Date(activity.end).getTime();
                    const now = Date.now();
                    const fill = spotifyCard.querySelector('.progress-bar-fill');
                    const startSpan = spotifyCard.querySelector('.start-time');
                    const endSpan = spotifyCard.querySelector('.end-time');

                    const elapsed = Math.min(Math.floor((now - start) / 1000), Math.floor((end - start) / 1000));
                    const total = Math.floor((end - start) / 1000);
                    const progress = (elapsed / total) * 100;

                    fill.style.width = `${progress}%`;
                    const format = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
                    startSpan.textContent = format(elapsed);
                    endSpan.textContent = format(total);
                }

                statusContainer.appendChild(spotifyCard);

            } else if (activity.type === 'playing') {
                const gameCard = document.createElement('div');

                let gameIcon = '';
                if (activity.name.toLowerCase() === 'roblox') {
                    gameIcon = 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Roblox_Logo_2025.png';
                } else if (activity.name.toLowerCase() === 'valorant') {
                    gameIcon = 'https://cdn.discordapp.com/app-icons/700136079562375258/e55fc8259df1548328f977d302779ab7.png?size=160&keep_aspect_ratio=false';
                }

                gameCard.innerHTML = `
                    <div class="game-card sss">
                        <div class="game-header">
                            <span>Playing Game</span>
                        </div>
                        <div class="game-content">
                            <img class="game-cover" src="${gameIcon || activity.image_url || ''}" alt="cover">
                            <div class="game-info">
                                <p class="game-title">${activity.name || 'Unknown Game'}</p>
                                <div class="progress-container">
                                    <span class="playtime">${formatDuration(activity.duration_seconds)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                statusContainer.appendChild(gameCard);
            }
        });
    } else {
        const noActivity = document.createElement('div');
        noActivity.className = 'activity none';
        noActivity.textContent = 'Nothing';
        statusContainer.appendChild(noActivity);
    }
}

updateStatus();
setInterval(updateStatus, 1000);
