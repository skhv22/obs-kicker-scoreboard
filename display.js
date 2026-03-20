import {
  DEFAULT_STATE,
  ensureRoom,
  getRoomId,
  isFirebaseConfigReady,
  subscribeRoom,
} from './firebase-core.js';

const roomId = getRoomId();
const elements = {
  teamAName: document.getElementById('teamAName'),
  teamBName: document.getElementById('teamBName'),
  teamAScore: document.getElementById('teamAScore'),
  teamBScore: document.getElementById('teamBScore'),
  status: document.getElementById('statusMessage'),
};

function render(state) {
  const safe = state || DEFAULT_STATE;
  elements.teamAName.textContent = safe.teamAName;
  elements.teamBName.textContent = safe.teamBName;
  elements.teamAScore.textContent = safe.teamAScore;
  elements.teamBScore.textContent = safe.teamBScore;
}

function showStatus(message) {
  elements.status.textContent = message;
  elements.status.hidden = false;
}

async function start() {
  render(DEFAULT_STATE);

  if (!isFirebaseConfigReady()) {
    showStatus('Firebase ist noch nicht eingerichtet. Trage deine Daten in firebase-config.js ein.');
    return;
  }

  try {
    await ensureRoom(roomId);
    subscribeRoom(roomId, (state) => {
      render(state);
      elements.status.hidden = true;
    }, () => {
      showStatus('Verbindung zur Datenbank fehlgeschlagen.');
    });
  } catch (error) {
    console.error(error);
    showStatus(error?.message || 'Unbekannter Firebase-Fehler.');
  }
}

start();
