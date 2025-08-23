async function updateStatus() {
    const statusImg = document.querySelector('.status-img');
    const trackNameEl = document.querySelector('.track-name');
    const trackArtistEl = document.querySelector('.track-artist');
    const trackImgEl = document.querySelector('.track-img');
    const progressBar = document.querySelector('.progress-bar');

    try {
        const res = await fetch('https://profilepage-t864.onrender.com/status/1237212866445316179');
        const data = await res.json();

        const status = data.status || 'offline';
        switch (status.toLowerCase()) {
            case 'online': statusImg.src = 'https://assets.guns.lol/online.png'; break;
            case 'idle': statusImg.src = 'https://assets.guns.lol/idle.png'; break;
            case 'dnd': statusImg.src = 'https://assets.guns.lol/dnd.png'; break;
            default: statusImg.src = 'https://assets.guns.lol/offline.png';
        }

        if (data.activity && data.activity.name === 'Spotify') {
            trackNameEl.textContent = data.activity.details || 'Unknown Track';
            trackArtistEl.textContent = data.activity.state || 'Unknown Artist';
            trackImgEl.src = data.activity.image_url || '';

            const start = data.activity.start ? new Date(data.activity.start).getTime() : 0;
            const end = data.activity.end ? new Date(data.activity.end).getTime() : 0;
            const now = Date.now();
            if (start && end && now >= start && now <= end) {
                const progress = ((now - start) / (end - start)) * 100;
                progressBar.style.width = `${progress}%`;
            } else {
                progressBar.style.width = '0%';
            }
        } else {
            trackNameEl.textContent = 'Nothing';
            trackArtistEl.textContent = '—';
            trackImgEl.src = '';
            progressBar.style.width = '0%';
        }
    } catch (err) {
        statusImg.src = 'https://assets.guns.lol/offline.png';
        trackNameEl.textContent = 'Error';
        trackArtistEl.textContent = 'Error';
        trackImgEl.src = '';
        progressBar.style.width = '0%';
    }
}

updateStatus();
setInterval(updateStatus, 1000);
