async function updateStatus() {
    const statusContainer = document.querySelector('.status.container');

    try {
        const res = await fetch('https://profilepage-t864.onrender.com/status/1237212866445316179');
        const data = await res.json();

        statusContainer.innerHTML = '';

        const statusImg = document.createElement('img');
        statusImg.className = 'status-img';
        const status = data.status || 'offline';
        switch (status.toLowerCase()) {
            case 'online': statusImg.src = 'https://assets.guns.lol/online.png'; break;
            case 'idle': statusImg.src = 'https://assets.guns.lol/idle.png'; break;
            case 'dnd': statusImg.src = 'https://assets.guns.lol/dnd.png'; break;
            default: statusImg.src = 'https://assets.guns.lol/offline.png';
        }
        statusContainer.appendChild(statusImg);

        // render activities
        const activityKeys = Object.keys(data).filter(k => k.startsWith('activity'));
        if (activityKeys.length) {
            activityKeys.forEach(key => {
                const activity = data[key];
                const activityDiv = document.createElement('div');
                activityDiv.className = `activity ${activity.type}`;

                if (activity.image_url) {
                    const imgEl = document.createElement('img');
                    imgEl.className = 'activity-img';
                    imgEl.src = activity.image_url;
                    activityDiv.appendChild(imgEl);
                }

                const nameEl = document.createElement('div');
                nameEl.className = 'activity-name';
                nameEl.textContent = activity.name || 'Unknown';
                activityDiv.appendChild(nameEl);

                if (activity.details) {
                    const detailsEl = document.createElement('div');
                    detailsEl.className = 'activity-details';
                    detailsEl.textContent = activity.details;
                    activityDiv.appendChild(detailsEl);
                }

                if (activity.state) {
                    const stateEl = document.createElement('div');
                    stateEl.className = 'activity-state';
                    stateEl.textContent = activity.state;
                    activityDiv.appendChild(stateEl);
                }

                // spotify progress bar
                if (activity.type === 'listening' && activity.start && activity.end) {
                    const progressWrap = document.createElement('div');
                    progressWrap.className = 'progress-wrap';

                    const progressBar = document.createElement('div');
                    progressBar.className = 'progress-bar';

                    const start = new Date(activity.start).getTime();
                    const end = new Date(activity.end).getTime();
                    const now = Date.now();
                    if (now >= start && now <= end) {
                        const progress = ((now - start) / (end - start)) * 100;
                        progressBar.style.width = `${progress}%`;
                    }

                    progressWrap.appendChild(progressBar);
                    activityDiv.appendChild(progressWrap);
                }

                statusContainer.appendChild(activityDiv);
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
