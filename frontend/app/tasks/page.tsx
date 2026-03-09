"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { clearToken, isLoggedIn } from "@/lib/auth"
import { Plus, Trash2, LogOut } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Task = {
  id: number
  title: string
  description: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  createdAt: string
}

const columns: { key: Task["status"]; label: string }[] = [
  { key: "TODO", label: "Por hacer" },
  { key: "IN_PROGRESS", label: "En progreso" },
  { key: "DONE", label: "Completado" },
]

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login")
      return
    }
    api.getTasks().then(setTasks).catch(() => {
      clearToken()
      router.replace("/login")
    })
  }, [router])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const task = await api.createTask(newTitle, newDesc)
      setTasks([...tasks, task])
      setNewTitle("")
      setNewDesc("")
      setShowForm(false)
    } finally {
      setAdding(false)
    }
  }

  async function changeStatus(task: Task, status: Task["status"]) {
    const updated = await api.updateTask(task.id, { status })
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)))
  }

  async function deleteTask(id: number) {
    await api.deleteTask(id)
    setTasks(tasks.filter((t) => t.id !== id))
  }

  function logout() {
    clearToken()
    router.push("/login")
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 h-14 flex items-center justify-between">
        <h1 className="font-semibold">Task Manager</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nueva tarea
          </button>
          <button
            onClick={logout}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {showForm && (
        <div className="px-6 py-4 border-b border-border bg-card">
          <form onSubmit={addTask} className="flex gap-3 items-end max-w-xl">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Título de la tarea"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors mb-2"
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
            >
              {adding ? "Agregando..." : "Agregar"}
            </button>
          </form>
        </div>
      )}

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {col.label}
              </h2>
              <span className="text-xs bg-secondary text-muted-foreground rounded-full px-2 py-0.5">
                {tasks.filter((t) => t.status === col.key).length}
              </span>
            </div>

            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                    )}

                    <select
                      value={task.status}
                      onChange={(e) => changeStatus(task, e.target.value as Task["status"])}
                      className="text-xs bg-secondary border border-border rounded-md px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="TODO">Por hacer</option>
                      <option value="IN_PROGRESS">En progreso</option>
                      <option value="DONE">Completado</option>
                    </select>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
