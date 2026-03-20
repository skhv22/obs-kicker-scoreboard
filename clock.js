const timeEl = document.getElementById('clockTime');
const dateEl = document.getElementById('clockDate');
const query = new URLSearchParams(window.location.search);
const locale = query.get('locale') || 'de-DE';
const timezone = query.get('tz') || 'Europe/Berlin';

const timeFormatter = new Intl.DateTimeFormat(locale, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: timezone,
});

const dateFormatter = new Intl.DateTimeFormat(locale, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: timezone,
});

function renderClock() {
  const now = new Date();
  timeEl.textContent = timeFormatter.format(now);
  dateEl.textContent = dateFormatter.format(now).replace(/\//g, '.');
}

renderClock();
window.setInterval(renderClock, 1000);
