fetch('https://profilepage-7jmr.onrender.com/https://guns.lol/saintremy', {
  headers: { 
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': window.location.origin
  }
})
.then(res => res.text())
.then(html => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // --- Username ---
  const usernameEl = doc.querySelector('.m0w25B_1b6e8123b898c40378c5 span');
  const username = usernameEl ? usernameEl.textContent.trim() : '';

  // --- Badges ---
  const badges = Array.from(doc.querySelectorAll('img[alt="Discord Badge"]'))
                      .map(img => img.src);

  // --- Activity ---
  const activitySpan = doc.querySelector('h3 span.g13pyc_ebb0dc0e558c005bb35c');
  const activityType = activitySpan ? activitySpan.textContent.trim() : '';
  const activityName = activitySpan ? activitySpan.nextSibling.textContent.trim() : '';

  // --- Status image ---
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

  console.log({
    username,
    badges,
    activityType,
    activityName,
    status
  });
})
.catch(err => console.error(err));
