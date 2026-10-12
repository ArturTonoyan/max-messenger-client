export type InstanceCredentials = {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export type MessageDirection = 'incoming' | 'outgoing'

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export type ChatMessage = {
  id: string
  chatId: string
  text: string
  timestamp: number
  direction: MessageDirection
  status?: MessageStatus
  senderName?: string
}

export type ChatPreview = {
  chatId: string
  title: string
  phone?: string
  lastMessage?: string
  lastTimestamp?: number
  unreadCount: number
}

export type CheckAccountResponse = {
  exist?: boolean
  chatId?: string
  fromCache?: boolean
  status?: boolean
  reason?: string
}

export type SendMessageResponse = {
  idMessage: string
}

export type GetSettingsResponse = {
  wid: string
  typeInstance: string
  webhookUrl: string
  incomingWebhook: string
  outgoingWebhook: string
  stateWebhook: string
  outgoingAPIMessageWebhook: string
  outgoingMessageWebhook: string
}

export type StateInstanceResponse = {
  stateInstance: string
}

export type NotificationBody = {
  typeWebhook: string
  timestamp: number
  idMessage?: string
  senderData?: {
    chatId: string
    chatName?: string
    sender?: string
    senderName?: string
    senderContactName?: string
    senderPhoneNumber?: number
  }
  messageData?: {
    typeMessage: string
    textMessageData?: {
      textMessage: string
    }
    extendedTextMessageData?: {
      text: string
    }
  }
  status?: string
  chatId?: string
}

export type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
} | null

export type ChatHistoryItem = {
  type: MessageDirection
  idMessage: string
  timestamp: number
  typeMessage: string
  chatId: string
  textMessage?: string
  statusMessage?: string
  senderName?: string
  senderContactName?: string
}
