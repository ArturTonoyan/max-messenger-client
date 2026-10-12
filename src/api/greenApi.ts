import type {
  CheckAccountResponse,
  ChatHistoryItem,
  GetSettingsResponse,
  InstanceCredentials,
  ReceiveNotificationResponse,
  SendMessageResponse,
  StateInstanceResponse,
} from './types'

export class GreenApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

/** Реальный хост API из консоли GREEN-API (или по первым 4 цифрам idInstance). */
export function resolveApiHost(idInstance: string, override?: string): string {
  const trimmed = override?.trim().replace(/\/$/, '')
  if (trimmed) return trimmed

  const prefix = idInstance.trim().slice(0, 4)
  if (/^\d{4}$/.test(prefix)) {
    return `https://${prefix}.api.green-api.com`
  }

  return 'https://api.green-api.com'
}

/**
 * В dev ходим через Vite-прокси (/ga-proxy/...), чтобы обойти CORS.
 * В production — напрямую на apiUrl.
 */
export function buildApiUrl(idInstance: string, override?: string): string {
  const hostUrl = resolveApiHost(idInstance, override)

  if (import.meta.env.DEV) {
    const host = hostUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return `/ga-proxy/${host}`
  }

  return hostUrl
}

function endpoint(
  credentials: InstanceCredentials,
  method: string,
  extra = '',
): string {
  const { apiUrl, idInstance, apiTokenInstance } = credentials
  return `${apiUrl}/waInstance${idInstance}/${method}/${apiTokenInstance}${extra}`
}

async function parseError(response: Response): Promise<never> {
  let detail = response.statusText
  try {
    const raw = await response.text()
    if (raw) {
      try {
        const json = JSON.parse(raw) as { message?: string; error?: string }
        detail = json.message || json.error || raw
      } catch {
        detail = raw
      }
    }
  } catch {
    /* ignore */
  }

  throw new GreenApiError(detail || 'Ошибка запроса к GREEN-API', response.status)
}

async function request<T>(
  url: string,
  init?: RequestInit,
  options?: { allowEmpty?: boolean },
): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new GreenApiError(
      'Не удалось связаться с GREEN-API. Проверьте интернет и что apiUrl в консоли совпадает с указанным. Если открываете локально — перезапустите npm run dev.',
      0,
    )
  }

  if (!response.ok) {
    await parseError(response)
  }

  const text = await response.text()
  if (!text) {
    if (options?.allowEmpty) return null as T
    throw new GreenApiError('Пустой ответ сервера', response.status)
  }

  return JSON.parse(text) as T
}

export async function getStateInstance(
  credentials: InstanceCredentials,
): Promise<StateInstanceResponse> {
  return request(endpoint(credentials, 'getStateInstance'))
}

export async function getSettings(
  credentials: InstanceCredentials,
): Promise<GetSettingsResponse> {
  return request(endpoint(credentials, 'getSettings'))
}

export async function prepareHttpReceiving(
  credentials: InstanceCredentials,
): Promise<void> {
  await request(endpoint(credentials, 'setSettings'), {
    method: 'POST',
    body: JSON.stringify({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'yes',
      stateWebhook: 'yes',
      outgoingAPIMessageWebhook: 'yes',
      outgoingMessageWebhook: 'yes',
    }),
  })
}

export async function checkAccount(
  credentials: InstanceCredentials,
  phoneNumber: number,
): Promise<CheckAccountResponse> {
  return request(endpoint(credentials, 'checkAccount'), {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  })
}

export async function sendMessage(
  credentials: InstanceCredentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  return request(endpoint(credentials, 'sendMessage'), {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  })
}

export async function receiveNotification(
  credentials: InstanceCredentials,
  receiveTimeout = 20,
  signal?: AbortSignal,
): Promise<ReceiveNotificationResponse> {
  const url = `${endpoint(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`
  return request(url, { method: 'GET', signal }, { allowEmpty: true })
}

export async function deleteNotification(
  credentials: InstanceCredentials,
  receiptId: number,
): Promise<void> {
  await request(endpoint(credentials, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
  })
}

export async function getChatHistory(
  credentials: InstanceCredentials,
  chatId: string,
  count = 50,
): Promise<ChatHistoryItem[]> {
  return request(endpoint(credentials, 'getChatHistory'), {
    method: 'POST',
    body: JSON.stringify({ chatId, count }),
  })
}
