// Thin REST client for the Express/Prisma backend in /server.
// Not wired into App.jsx yet (App.jsx currently persists through the
// storageShim/localStorage). Use this once you're ready to move state
// off the client and onto the real database — see server/src/routes.
//
// Example:
//   import { api } from "./services/api";
//   const products = await api.get("/api/products");

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};
