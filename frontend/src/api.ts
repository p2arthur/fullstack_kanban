const BASE = (import.meta.env.VITE_API_URL as string) || ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string }
    throw new Error(err.error || res.statusText)
  }
  return res.json() as Promise<T>
}

export interface ApiCard {
  id: number
  column_id: number
  title: string
  description: string
  position: number
}

export interface ApiColumn {
  id: number
  title: string
  cards: ApiCard[]
}

export interface ApiBoard {
  id: number
  title: string
  columns: ApiColumn[]
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ username: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
    me: () => request<{ username: string }>('/api/auth/me'),
  },
  boards: {
    getDefault: () => request<{ boardId: number }>('/api/boards'),
    get: (boardId: number) => request<ApiBoard>(`/api/boards/${boardId}`),
    renameColumn: (boardId: number, columnId: number, title: string) =>
      request<{ ok: boolean }>(`/api/boards/${boardId}/columns/${columnId}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  },
  cards: {
    create: (column_id: number, title: string, description: string) =>
      request<ApiCard>('/api/cards', { method: 'POST', body: JSON.stringify({ column_id, title, description }) }),
    update: (id: number, data: Partial<{ title: string; description: string; column_id: number; position: number }>) =>
      request<ApiCard>(`/api/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ ok: boolean }>(`/api/cards/${id}`, { method: 'DELETE' }),
  },
  ai: {
    chat: (board_id: number, message: string) =>
      request<{ message: string; board_update?: unknown }>('/api/ai/chat', { method: 'POST', body: JSON.stringify({ board_id, message }) }),
  },
}
