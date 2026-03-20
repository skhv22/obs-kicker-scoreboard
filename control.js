import {
  DEFAULT_STATE,
  buildPageUrl,
  ensureRoom,
  getRoomId,
  isFirebaseConfigReady,
  resetRoomState,
  setRoomState,
  subscribeRoom,
} from './firebase-core.js';

const roomId = getRoomId();
let currentState = { ...DEFAULT_STATE };
let nameDebounce = null;

const el = {
  roomInput: document.getElementById('roomInput'),
  roomOpenBtn: document.getElementById('roomOpenBtn'),
  displayUrl: document.getElementById('displayUrl'),
  controlUrl: document.getElementById('controlUrl'),
  copyDisplayBtn: document.getElementById('copyDisplayBtn'),
  copyControlBtn: document.getElementById('copyControlBtn'),
  connectionBadge: document.getElementById('connectionBadge'),
  eventTitleInput: document.getElementById('eventTitleInput'),
  teamANameInput: document.getElementById('teamANameInput'),
  teamBNameInput: document.getElementById('teamBNameInput'),
  leftPreviewName: document.getElementById('leftPreviewName'),
  rightPreviewName: document.getElementById('rightPreviewName'),
  leftPreviewScore: document.getElementById('leftPreviewScore'),
  rightPreviewScore: document.getElementById('rightPreviewScore'),
  saveNamesBtn: document.getElementById('saveNamesBtn'),
  resetBtn: document.getElementById('resetBtn'),
  swapBtn: document.getElementById('swapBtn'),
};

function setConnection(text, stateClass = '') {
  el.connectionBadge.textContent = text;
  el.connectionBadge.className = `badge ${stateClass}`.trim();
}

function render(state) {
  currentState = { ...state };
  el.eventTitleInput.value = state.eventTitle;
  el.teamANameInput.value = state.teamAName;
  el.teamBNameInput.value = state.teamBName;
  el.leftPreviewName.textContent = state.teamAName;
  el.rightPreviewName.textContent = state.teamBName;
  el.leftPreviewScore.textContent = state.teamAScore;
  el.rightPreviewScore.textContent = state.teamBScore;
  el.roomInput.value = roomId;
  el.displayUrl.value = buildPageUrl('display.html', roomId);
  el.controlUrl.value = buildPageUrl('control.html', roomId);
}

async function pushState(nextState) {
  const merged = { ...currentState, ...nextState };
  await setRoomState(roomId, merged);
}

async function adjustScore(side, delta) {
  const next = {
    ...currentState,
    teamAScore: side === 'A' ? Math.max(0, currentState.teamAScore + delta) : currentState.teamAScore,
    teamBScore: side === 'B' ? Math.max(0, currentState.teamBScore + delta) : currentState.teamBScore,
  };
  await setRoomState(roomId, next);
}

function scheduleNamesSave() {
  window.clearTimeout(nameDebounce);
  nameDebounce = window.setTimeout(async () => {
    try {
      await pushState({
        eventTitle: el.eventTitleInput.value,
        teamAName: el.teamANameInput.value,
        teamBName: el.teamBNameInput.value,
      });
    } catch (error) {
      console.error(error);
      setConnection('Speichern fehlgeschlagen', 'error');
    }
  }, 250);
}

async function copyText(value, button) {
  try {
    await navigator.clipboard.writeText(value);
    const old = button.textContent;
    button.textContent = 'Kopiert';
    setTimeout(() => { button.textContent = old; }, 1200);
  } catch {
    alert(value);
  }
}

function bindControls() {
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.action;
      try {
        if (action === 'plusA') await adjustScore('A', 1);
        if (action === 'minusA') await adjustScore('A', -1);
        if (action === 'plusB') await adjustScore('B', 1);
        if (action === 'minusB') await adjustScore('B', -1);
      } catch (error) {
        console.error(error);
        setConnection('Aktion fehlgeschlagen', 'error');
      }
    });
  });

  el.eventTitleInput.addEventListener('input', scheduleNamesSave);
  el.teamANameInput.addEventListener('input', scheduleNamesSave);
  el.teamBNameInput.addEventListener('input', scheduleNamesSave);

  el.saveNamesBtn.addEventListener('click', async () => {
    try {
      await pushState({
        eventTitle: el.eventTitleInput.value,
        teamAName: el.teamANameInput.value,
        teamBName: el.teamBNameInput.value,
      });
    } catch (error) {
      console.error(error);
      setConnection('Speichern fehlgeschlagen', 'error');
    }
  });

  el.resetBtn.addEventListener('click', async () => {
    try {
      await resetRoomState(roomId);
    } catch (error) {
      console.error(error);
      setConnection('Reset fehlgeschlagen', 'error');
    }
  });

  el.swapBtn.addEventListener('click', async () => {
    try {
      await pushState({
        teamAName: currentState.teamBName,
        teamBName: currentState.teamAName,
        teamAScore: currentState.teamBScore,
        teamBScore: currentState.teamAScore,
      });
    } catch (error) {
      console.error(error);
      setConnection('Tauschen fehlgeschlagen', 'error');
    }
  });

  el.roomOpenBtn.addEventListener('click', () => {
    const nextRoom = (el.roomInput.value || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
    if (!nextRoom) return;
    const url = new URL(window.location.href);
    url.searchParams.set('room', nextRoom);
    window.location.href = url.toString();
  });

  el.copyDisplayBtn.addEventListener('click', () => copyText(el.displayUrl.value, el.copyDisplayBtn));
  el.copyControlBtn.addEventListener('click', () => copyText(el.controlUrl.value, el.copyControlBtn));

  window.addEventListener('keydown', async (event) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    const key = event.key.toLowerCase();
    try {
      if (key === 'a') await adjustScore('A', 1);
      if (key === 'l') await adjustScore('B', 1);
      if (key === 'z') await adjustScore('A', -1);
      if (key === 'm') await adjustScore('B', -1);
      if (key === 'r') await resetRoomState(roomId);
    } catch (error) {
      console.error(error);
      setConnection('Tastenkürzel fehlgeschlagen', 'error');
    }
  });
}

async function start() {
  render(DEFAULT_STATE);

  if (!isFirebaseConfigReady()) {
    setConnection('Firebase nicht eingerichtet', 'error');
    return;
  }

  try {
    setConnection('Verbinde...', 'warning');
    await ensureRoom(roomId);
    subscribeRoom(roomId, (state) => {
      render(state);
      setConnection('Live verbunden', 'success');
    }, () => {
      setConnection('Verbindung fehlgeschlagen', 'error');
    });
  } catch (error) {
    console.error(error);
    setConnection(error?.message || 'Unbekannter Firebase-Fehler', 'error');
  }
}

bindControls();
start();
