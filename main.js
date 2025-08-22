fetch('https://profilepage-7jmr.onrender.com/https://guns.lol/saintremy', {
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})
  .then(res => res.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const usernameEl = doc.querySelector('.m0w25B_1b6e8123b898c40378c5 span');
    const username = usernameEl ? usernameEl.textContent.trim() : '';

    const badges = Array.from(doc.querySelectorAll('img[alt="Discord Badge"]'))
                        .map(img => img.src);

    const activitySpan = doc.querySelector('h3 span.g13pyc_ebb0dc0e558c005bb35c');
    const activityType = activitySpan ? activitySpan.textContent.trim() : '';
    const activityName = activitySpan ? activitySpan.nextSibling.textContent.trim() : '';

    console.log({ username, badges, activityType, activityName });
  })
  .catch(err => console.error(err));
