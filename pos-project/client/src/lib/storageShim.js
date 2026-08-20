// Lightweight localStorage-backed implementation of the window.storage API
// used by App.jsx. In the hosted artifact environment this API is provided
// by the platform; here we polyfill it so the exact same app code runs as a
// standalone Vite project, persisting data in the browser's localStorage.
//
// Swap this out for real API calls (see src/services/api.js) once the
// Express/Prisma backend in /server is wired up.

const PREFIX = "pos_db:";

function keyFor(key, shared) {
  return `${PREFIX}${shared ? "shared:" : "user:"}${key}`;
}

async function get(key, shared = false) {
  const raw = localStorage.getItem(keyFor(key, shared));
  if (raw === null) throw new Error(`Key not found: ${key}`);
  return { key, value: raw, shared };
}

async function set(key, value, shared = false) {
  localStorage.setItem(keyFor(key, shared), value);
  return { key, value, shared };
}

async function del(key, shared = false) {
  localStorage.removeItem(keyFor(key, shared));
  return { key, deleted: true, shared };
}

async function list(prefix = "", shared = false) {
  const p = keyFor(prefix, shared);
  const keys = Object.keys(localStorage)
    .filter((k) => k.startsWith(p))
    .map((k) => k.slice(keyFor("", shared).length));
  return { keys, prefix, shared };
}

export function installStorageShim() {
  if (typeof window !== "undefined" && !window.storage) {
    window.storage = { get, set, delete: del, list };
  }
}
