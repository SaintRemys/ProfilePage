async function updateStatus() {
    const statusEl = document.querySelector('.status-text');
    const trackEl = document.querySelector('.track-text');

    try {
        const res = await fetch('https://profilepage-t864.onrender.com/status/1237212866445316179');
        const data = await res.json();

        // Update Discord status
        statusEl.textContent = data.status || 'unknown';

        // Update Spotify track info if available
        if (data.activity && data.activity.name === 'Spotify') {
            const details = data.activity.details || '';
            const artists = (data.activity.state || '').replace(/;/g, ', ');
            trackEl.textContent = `${details} by ${artists}`;
        } else {
            trackEl.textContent = 'Nothing';
        }
    } catch (err) {
        console.error('Failed to fetch status:', err);
        statusEl.textContent = 'Error';
        trackEl.textContent = 'Error';
    }
}

// Initial fetch
updateStatus();

// Update every 15 seconds
setInterval(updateStatus, 15000);
