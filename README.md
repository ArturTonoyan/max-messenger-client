# MAX Messenger Client

Веб-клиент для отправки и получения текстовых сообщений в мессенджере **MAX** через [GREEN-API](https://green-api.com/max).

Тестовое задание на позицию Frontend Developer (React).

## Стек

- React 19 + TypeScript + Vite
- Zustand — сессия и локальная история чатов
- TanStack Query — запросы к GREEN-API
- React Hook Form — формы входа / нового чата / сообщения
- React Icons + Swiper — иконки и карусели в UI
- Tailwind CSS 4

## Возможности

1. Вход по `idInstance` и `apiTokenInstance` из кабинета GREEN-API
2. Создание чата по номеру телефона (`checkAccount`)
3. Отправка текста (`sendMessage`)
4. Приём входящих через HTTP API (`receiveNotification` + `deleteNotification`)
5. Интерфейс в духе [web.max.ru](https://web.max.ru/)

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

### Перед входом

1. Зарегистрируйтесь в [console.green-api.com](https://console.green-api.com)
2. Создайте инстанс для MAX и авторизуйте его по QR
3. Скопируйте `idInstance` и `apiTokenInstance`
4. Убедитесь, что у инстанса пустой `webhookUrl` (клиент сам выставит настройки под HTTP API)

### Сборка

```bash
npm run build
npm run preview
```

## Как устроен polling

После входа клиент в цикле вызывает `receiveNotification` (long-poll ~25 сек).  
Каждое уведомление обрабатывается локально и сразу подтверждается через `deleteNotification`.

## Структура

```
src/
  api/           — клиент GREEN-API и типы
  components/    — UI (логин, сайдбар, чат)
  hooks/         — login / send / create chat / polling
  stores/        — zustand (auth + chats)
  utils/         — телефон, даты, аватар
```

## Замечания

- Поддерживаются только текстовые сообщения (как в ТЗ)
- `apiUrl` можно не указывать: хост собирается как `https://{первые 4 цифры idInstance}.api.green-api.com`
- Данные сессии и чатов сохраняются в `localStorage`

## Ссылки

- [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/)
- [HTTP API receiving](https://green-api.com/v3/docs/api/receiving/technology-http-api/)
- [CheckAccount](https://green-api.com/v3/docs/api/service/CheckAccount/)
