async function updateStatus() {
    const statusContainer = document.querySelector('.status.container');
    const profileWrapper = document.querySelector('.profile-wrapper')

    try {
        const res = await fetch('https://profilepage-t864.onrender.com/status/1237212866445316179');
        const data = await res.json();

        statusContainer.innerHTML = '';

        let statusImg = profileWrapper.querySelector('.status-img');

        const status = data.status || 'offline';
        switch (status.toLowerCase()) {
            case 'online': statusImg.src = 'https://assets.guns.lol/online.png'; break;
            case 'idle': statusImg.src = 'https://assets.guns.lol/idle.png'; break;
            case 'dnd': statusImg.src = 'https://assets.guns.lol/dnd.png'; break;
            default: statusImg.src = 'https://assets.guns.lol/offline.png';
        }


        const activityKeys = Object.keys(data).filter(k => k.startsWith('activity'));
        if (activityKeys.length) {
            activityKeys.forEach(key => {
                const activity = data[key];

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

                        if (now >= start && now <= end) {
                            const progress = ((now - start) / (end - start)) * 100;
                            fill.style.width = `${progress}%`;

                            const elapsed = Math.floor((now - start) / 1000);
                            const total = Math.floor((end - start) / 1000);

                            const format = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
                            startSpan.textContent = format(elapsed);
                            endSpan.textContent = format(total);
                        }
                    }

                    statusContainer.appendChild(spotifyCard);

                } else if (activity.type === 'playing') {
                    const gameCard = document.createElement('div');
                    gameCard.innerHTML = `
                      <div class="game-card sss">
                        <div class="game-header">
                          <span>Playing Game</span>
                        </div>
                        <div class="game-content">
                          <img class="game-cover" src="${activity.image_url || ''}" alt="cover">
                          <div class="game-info">
                            <p class="game-title">${activity.name || 'Unknown Game'}</p>
                            <div class="progress-container">
                              <span class="playtime">${activity.details || 'In Game'}</span>
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

    } catch (err) {
        statusContainer.innerHTML = `
            <img class="status-img" src="https://assets.guns.lol/offline.png">
            <div class="activity error">Error loading status</div>
        `;
    }
}

updateStatus();
setInterval(updateStatus, 1000);
