type Task = {
  id: number
  title: string
  description: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  createdAt: string
}

type User = {
  id: number
  username: string
  email: string
  passwordHash: string
}

function getUsers(): User[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("users") || "[]")
}

function saveUsers(users: User[]) {
  localStorage.setItem("users", JSON.stringify(users))
}

function getCurrentUserId(): number | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("currentUserId")
  return raw ? parseInt(raw) : null
}

function getTasks(): Task[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("tasks") || "[]")
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

export const api = {
  register: async (username: string, email: string, password: string) => {
    const users = getUsers()
    if (users.find((u) => u.email === email)) {
      throw new Error("El email ya está registrado")
    }
    if (users.find((u) => u.username === username)) {
      throw new Error("El usuario ya existe")
    }
    const user: User = {
      id: Date.now(),
      username,
      email,
      passwordHash: btoa(password),
    }
    saveUsers([...users, user])
    localStorage.setItem("currentUserId", String(user.id))
    return { token: String(user.id) }
  },

  login: async (email: string, password: string) => {
    const users = getUsers()
    const user = users.find((u) => u.email === email && u.passwordHash === btoa(password))
    if (!user) {
      throw new Error("Email o contraseña incorrectos")
    }
    localStorage.setItem("currentUserId", String(user.id))
    return { token: String(user.id) }
  },

  getTasks: async (): Promise<Task[]> => {
    const userId = getCurrentUserId()
    return getTasks().filter((t) => (t as Task & { userId: number }).userId === userId)
  },

  createTask: async (title: string, description: string): Promise<Task> => {
    const userId = getCurrentUserId()
    const task = {
      id: Date.now(),
      title,
      description,
      status: "TODO" as const,
      createdAt: new Date().toISOString(),
      userId,
    }
    saveTasks([...getTasks(), task])
    return task
  },

  updateTask: async (id: number, data: { title?: string; description?: string; status?: Task["status"] }): Promise<Task> => {
    const tasks = getTasks()
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...data } : t))
    saveTasks(updated)
    return updated.find((t) => t.id === id) as Task
  },

  deleteTask: async (id: number) => {
    saveTasks(getTasks().filter((t) => t.id !== id))
  },
}
