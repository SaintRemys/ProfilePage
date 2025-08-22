fetch('https://cors-anywhere.herokuapp.com/https://guns.lol/saintremy', {
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': window.location.origin  // include Origin header
  }
})
  .then(res => res.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Username
    const usernameEl = doc.querySelector('.m0w25B_1b6e8123b898c40378c5 span');
    const username = usernameEl ? usernameEl.textContent.trim() : '';

    // Badges
    const badgeEls = doc.querySelectorAll('.vl3UYF_cc7f47191677333de438 img');
    const badges = Array.from(badgeEls).map(img => img.src);

    // Activity / status
    const activitySpan = doc.querySelector('h3 span.g13pyc_ebb0dc0e558c005bb35c');
    const activityName = activitySpan ? activitySpan.nextSibling.textContent.trim() : '';
    const activityType = activitySpan ? activitySpan.textContent.trim() : '';

    console.log('Username:', username);
    console.log('Badges:', badges);
    console.log('Activity Type:', activityType);
    console.log('Activity Name:', activityName);
  })
  .catch(err => console.error(err));
