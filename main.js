fetch('https://your-render-url.onrender.com/profile')
  .then(res => res.json())
  .then(data => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.html, 'text/html');

    // Username
    const usernameEl = doc.querySelector('.m0w25B_1b6e8123b898c40378c5 span');
    const username = usernameEl ? usernameEl.textContent.trim() : '';

    // Status image
    const statusImg = doc.querySelector('img.xOYpNl_123666a39835a15d8188');
    let status = 'offline';
    if (statusImg) {
      switch(statusImg.src) {
        case 'https://assets.guns.lol/idle.png': status = 'idle'; break;
        case 'https://assets.guns.lol/online.png': status = 'online'; break;
        case 'https://assets.guns.lol/dnd.png': status = 'dnd'; break;
        case 'https://assets.guns.lol/offline.png': status = 'offline'; break;
        default: status = 'unknown';
      }
    }

    console.log({ username, status });
  })
  .catch(err => console.error(err));
