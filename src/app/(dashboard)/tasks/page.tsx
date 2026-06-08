"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Calendar,
  MoreHorizontal,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  type: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate: string;
  assignee: { name: string; avatar?: string };
  creator: string;
};

const priorityConfig = {
  low: {
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: Flag,
    label: "Baixa",
  },
  medium: {
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    icon: Flag,
    label: "Média",
  },
  high: {
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    icon: AlertTriangle,
    label: "Alta",
  },
  urgent: {
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    icon: AlertTriangle,
    label: "Urgente",
  },
};

const statusConfig = {
  pending: { color: "text-gray-500", icon: Circle, label: "Pendente" },
  in_progress: { color: "text-blue-400", icon: Clock, label: "Em Andamento" },
  completed: {
    color: "text-emerald-400",
    icon: CheckCircle2,
    label: "Concluída",
  },
  cancelled: { color: "text-gray-400", icon: Circle, label: "Cancelada" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function mapTask(t: Record<string, unknown>): Task {
    return {
      id: t.id as string,
      title: t.title as string,
      type: (t.type as string) || "task",
      priority: (t.priority as Task["priority"]) || "medium",
      status: (t.status as Task["status"]) || "pending",
      dueDate: t.dueDate
        ? new Date(t.dueDate as string).toISOString().split("T")[0]
        : "",
      assignee: {
        name:
          ((t.assignee as Record<string, unknown>)?.name as string) ||
          "AIFLUENT",
      },
      creator:
        ((t.creator as Record<string, unknown>)?.name as string) || "AIFLUENT",
    };
  }

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.tasks)) setTasks(data.tasks.map(mapTask));
      })
      .catch(() => {
        /* mantém vazio */
      });
  }, []);

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  async function toggleStatus(id: string) {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const next = current.status === "completed" ? "pending" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: next } : t)),
    );
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: current.status } : t)),
      );
    }
  }

  async function addTask() {
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    setShowNewTask(false);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTasks((prev) => [mapTask(created), ...prev]);
    } catch {
      alert("Não foi possível criar a tarefa. Tente novamente.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Tarefas
          </h1>
          <p className="text-gray-500 mt-1">
            {counts.pending} pendentes · {counts.in_progress} em andamento
          </p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[
          { key: "all", label: "Todas" },
          { key: "pending", label: "Pendentes" },
          { key: "in_progress", label: "Em Andamento" },
          { key: "completed", label: "Concluídas" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            {f.label}
            <span className="ml-2 text-xs opacity-60">
              {counts[f.key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showNewTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <Circle className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Título da tarefa..."
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none"
                autoFocus
              />
              <button
                onClick={addTask}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowNewTask(false)}
                className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((task, i) => {
            const StatusIcon = statusConfig[task.status].icon;
            const PriorityIcon = priorityConfig[task.priority].icon;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer",
                  task.status === "completed" && "opacity-60",
                )}
              >
                <button
                  onClick={() => toggleStatus(task.id)}
                  className="shrink-0"
                >
                  <StatusIcon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      statusConfig[task.status].color,
                    )}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium text-gray-900 truncate",
                      task.status === "completed" &&
                        "line-through text-gray-400",
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        priorityConfig[task.priority].color,
                      )}
                    >
                      <PriorityIcon className="w-3 h-3" />
                      {priorityConfig[task.priority].label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-900">
                        {task.assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 hidden lg:block">
                      {task.assignee.name.split(" ")[0]}
                    </span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-900" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-400">Nenhuma tarefa encontrada</p>
            <p className="text-xs text-gray-300 mt-1">
              Crie uma tarefa para comecar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
