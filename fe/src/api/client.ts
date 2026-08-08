const rawBaseUrl = import.meta.env.VITE_API_URL

if (!rawBaseUrl) {
  console.warn('VITE_API_URL is not set; API requests will fail')
}

export const API_BASE_URL = (rawBaseUrl ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(message, response.status)
  }

  return response.json() as Promise<T>
}
