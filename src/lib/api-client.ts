// src/lib/api-client.ts
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data as T;
}

export const api = {
  // Projects
  getProjects: () => apiFetch<import("@/types").Project[]>("/api/projects"),
  getProject: (id: string) =>
    apiFetch<import("@/types").Project>(`/api/projects/${id}`),
  createProject: (data: {
    name: string;
    description?: string;
    color?: string;
  }) =>
    apiFetch<import("@/types").Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (
    id: string,
    data: Partial<{ name: string; description: string; color: string }>,
  ) =>
    apiFetch<import("@/types").Project>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    apiFetch<{ message: string }>(`/api/projects/${id}`, { method: "DELETE" }),

  // Members
  addMember: (projectId: string, data: { email: string; role?: string }) =>
    apiFetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeMember: (projectId: string, memberId: string) =>
    apiFetch(`/api/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    }),
  updateMemberRole: (projectId: string, memberId: string, role: string) =>
    apiFetch(`/api/projects/${projectId}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  // Tasks
  getTasks: (projectId: string, filters?: Record<string, string>) => {
    const params = filters ? "?" + new URLSearchParams(filters).toString() : "";
    return apiFetch<import("@/types").Task[]>(
      `/api/projects/${projectId}/tasks${params}`,
    );
  },
  getTask: (projectId: string, taskId: string) =>
    apiFetch<import("@/types").Task>(
      `/api/projects/${projectId}/tasks/${taskId}`,
    ),
  createTask: (
    projectId: string,
    data: Partial<import("@/types").Task> & { title: string },
  ) =>
    apiFetch<import("@/types").Task>(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTask: (
    projectId: string,
    taskId: string,
    data: Partial<import("@/types").Task>,
  ) =>
    apiFetch<import("@/types").Task>(
      `/api/projects/${projectId}/tasks/${taskId}`,
      { method: "PATCH", body: JSON.stringify(data) },
    ),
  deleteTask: (projectId: string, taskId: string) =>
    apiFetch<{ message: string }>(
      `/api/projects/${projectId}/tasks/${taskId}`,
      { method: "DELETE" },
    ),

  // Comments
  getComments: (projectId: string, taskId: string) =>
    apiFetch<import("@/types").Comment[]>(
      `/api/projects/${projectId}/tasks/${taskId}/comments`,
    ),
  addComment: (projectId: string, taskId: string, content: string) =>
    apiFetch<import("@/types").Comment>(
      `/api/projects/${projectId}/tasks/${taskId}/comments`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
    ),

  // Dashboard
  getDashboard: () =>
    apiFetch<import("@/types").DashboardData>("/api/dashboard"),
};
