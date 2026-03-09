import { getToken } from "./auth"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Error en la solicitud")
  }
  return res.json()
}

export const api = {
  register: (username: string, email: string, password: string) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify({ username, email, password }) }),

  login: (email: string, password: string) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getTasks: () => request("/api/tasks"),

  createTask: (title: string, description: string) =>
    request("/api/tasks", { method: "POST", body: JSON.stringify({ title, description }) }),

  updateTask: (id: number, data: { title?: string; description?: string; status?: string }) =>
    request(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteTask: (id: number) =>
    request(`/api/tasks/${id}`, { method: "DELETE" }),
}
