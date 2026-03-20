import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  getDatabase,
  ref,
  onValue,
  get,
  set,
  update,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';

export const DEFAULT_STATE = {
  eventTitle: 'Kicker Turnier',
  teamAName: 'Team A',
  teamBName: 'Team B',
  teamAScore: 0,
  teamBScore: 0,
  updatedAt: Date.now(),
};

function clampScore(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.floor(num));
}

function cleanText(value, fallback, maxLength = 40) {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
  return cleaned || fallback;
}

export function sanitizeState(raw = {}) {
  return {
    eventTitle: cleanText(raw.eventTitle, DEFAULT_STATE.eventTitle, 50),
    teamAName: cleanText(raw.teamAName, DEFAULT_STATE.teamAName, 40),
    teamBName: cleanText(raw.teamBName, DEFAULT_STATE.teamBName, 40),
    teamAScore: clampScore(raw.teamAScore),
    teamBScore: clampScore(raw.teamBScore),
    updatedAt: Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : Date.now(),
  };
}

export function getRoomId() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('room') || 'kicker-live';
  return raw.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40) || 'kicker-live';
}

export function buildPageUrl(page, roomId) {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/[^/]+$/, page);
  url.searchParams.set('room', roomId);
  return url.toString();
}

export function isFirebaseConfigReady() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg) return false;
  const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  return required.every((key) => typeof cfg[key] === 'string' && cfg[key] && cfg[key] !== 'PASTE_HERE');
}

let databaseInstance = null;

function getDatabaseInstance() {
  if (!isFirebaseConfigReady()) {
    throw new Error('Firebase-Konfiguration fehlt. Trage zuerst deine Werte in firebase-config.js ein.');
  }

  if (databaseInstance) return databaseInstance;

  const cfg = window.FIREBASE_CONFIG;
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  databaseInstance = getDatabase(app);
  return databaseInstance;
}

function roomRef(roomId) {
  return ref(getDatabaseInstance(), `scoreboards/${roomId}`);
}

export async function ensureRoom(roomId) {
  const targetRef = roomRef(roomId);
  const snapshot = await get(targetRef);
  if (!snapshot.exists()) {
    await set(targetRef, { ...DEFAULT_STATE, updatedAt: Date.now() });
  }
}

export function subscribeRoom(roomId, callback, onError) {
  const targetRef = roomRef(roomId);
  return onValue(
    targetRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({ ...DEFAULT_STATE });
        return;
      }
      callback(sanitizeState(snapshot.val()));
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
}

export async function setRoomState(roomId, nextState) {
  const safe = sanitizeState(nextState);
  await set(roomRef(roomId), { ...safe, updatedAt: Date.now() });
}

export async function patchRoomState(roomId, patch) {
  const safePatch = sanitizeState({ ...DEFAULT_STATE, ...patch });
  await update(roomRef(roomId), { ...safePatch, updatedAt: Date.now() });
}

export async function resetRoomState(roomId) {
  await setRoomState(roomId, DEFAULT_STATE);
}
