import { useEffect, useRef } from 'react'
import {
  deleteNotification,
  receiveNotification,
} from '../api/greenApi'
import type { NotificationBody } from '../api/types'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { formatPhoneDisplay } from '../utils/phone'

function extractText(body: NotificationBody): string | null {
  const data = body.messageData
  if (!data) return null

  if (data.typeMessage === 'textMessage') {
    return data.textMessageData?.textMessage?.trim() || null
  }

  if (data.typeMessage === 'extendedTextMessage') {
    return data.extendedTextMessageData?.text?.trim() || null
  }

  // остальные типы в тестовом задании не требуются
  return data.typeMessage ? `[${data.typeMessage}]` : null
}

function resolveTitle(body: NotificationBody): string {
  const sender = body.senderData
  if (!sender) return body.chatId || 'Чат'

  if (sender.senderContactName) return sender.senderContactName
  if (sender.senderName) return sender.senderName
  if (sender.chatName) return sender.chatName
  if (sender.senderPhoneNumber) {
    return formatPhoneDisplay(String(sender.senderPhoneNumber))
  }

  return sender.chatId
}

function handleNotification(body: NotificationBody) {
  const store = useChatStore.getState()

  if (body.typeWebhook === 'incomingMessageReceived') {
    const chatId = body.senderData?.chatId
    const text = extractText(body)
    if (!chatId || !text || !body.idMessage) return

    store.upsertChat({
      chatId,
      title: resolveTitle(body),
      phone: body.senderData?.senderPhoneNumber
        ? String(body.senderData.senderPhoneNumber)
        : undefined,
    })

    store.addMessage(
      {
        id: body.idMessage,
        chatId,
        text,
        timestamp: body.timestamp,
        direction: 'incoming',
        senderName: resolveTitle(body),
      },
      { bumpUnread: true },
    )
    return
  }

  if (
    body.typeWebhook === 'outgoingMessageReceived' ||
    body.typeWebhook === 'outgoingAPIMessageReceived'
  ) {
    const chatId = body.senderData?.chatId || body.chatId
    const text = extractText(body)
    if (!chatId || !text || !body.idMessage) return

    store.upsertChat({
      chatId,
      title: store.chats[chatId]?.title || resolveTitle(body),
    })

    store.addMessage({
      id: body.idMessage,
      chatId,
      text,
      timestamp: body.timestamp,
      direction: 'outgoing',
      status: 'sent',
    })
    return
  }

  if (body.typeWebhook === 'outgoingMessageStatus' && body.idMessage) {
    const chatId = body.chatId || body.senderData?.chatId
    if (!chatId || !body.status) return

    const statusMap: Record<string, 'sent' | 'delivered' | 'read' | 'failed'> = {
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
    }

    const mapped = statusMap[body.status]
    if (mapped) {
      store.updateMessageStatus(chatId, body.idMessage, mapped)
    }
  }
}

export function useNotificationPolling(enabled: boolean) {
  const credentials = useAuthStore((state) => state.credentials)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled || !credentials) return

    let alive = true
    const controller = new AbortController()
    abortRef.current = controller

    const loop = async () => {
      while (alive) {
        try {
          const notification = await receiveNotification(
            credentials,
            25,
            controller.signal,
          )

          if (!alive) break

          if (notification?.receiptId && notification.body) {
            handleNotification(notification.body)
            await deleteNotification(credentials, notification.receiptId)
          }
        } catch (error) {
          if (!alive || controller.signal.aborted) break

          // короткая пауза при сетевых сбоях, чтобы не долбить API
          console.warn('[polling]', error)
          await new Promise((resolve) => setTimeout(resolve, 2500))
        }
      }
    }

    void loop()

    return () => {
      alive = false
      controller.abort()
      abortRef.current = null
    }
  }, [enabled, credentials])
}
