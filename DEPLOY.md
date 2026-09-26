# Запуск сайта и бота на своём сервере

Как это устроено:

```
посетитель ──► nginx ──► /            сайт (готовые файлы из /opt/orion/dist)
                    └──► /api/lead    ┐
Gmail (Apps Script) ──► /api/mail     ├─► бот: служба orion-bot (Node.js, 127.0.0.1:8787)
                                      ┘         └──► Telegram (сам забирает сообщения)
```

- Сайт и бот живут на одном домене. Боту не нужны ни отдельный адрес, ни свой сертификат.
- Бот запускается обычным Node.js: ни сборки, ни установки пакетов.
- Токен бота хранится в `/etc/orion-bot.env`, прочитать этот файл может только root.
- Заявки и настройки бот хранит в `/var/lib/orion-bot/kv.json`.

Гайд рассчитан на сервер с **Ubuntu или Debian**, где у вас есть `sudo`. Во всех командах
замените `example.ru` на свой домен.

---

## Шаг 1. Создать бота в Telegram

1. Откройте [@BotFather](https://t.me/BotFather) → `/newbot`.
2. Имя, например «ORION Studio», и username, заканчивающийся на `bot`.
3. BotFather пришлёт токен вида `123456789:AA...`. **Не пересылайте его никому.** Он понадобится
   на шаге 6.
4. По желанию: `/setuserpic` → загрузите `public/icon-512.png` из проекта.

## Шаг 2. Подключиться к серверу и поставить нужное

```bash
ssh user@IP-сервера
```

Проверьте систему и Node.js:

```bash
cat /etc/os-release | head -2
node -v
```

Нужен **Node.js 22.18 или новее**. Если `node` не найден или версия старее, поставьте его:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx
node -v
```

## Шаг 3. Посмотреть, как работает старый сайт, и сохранить его

```bash
sudo nginx -T 2>/dev/null | grep -E "server_name|root |proxy_pass|listen"
```

Команда покажет, из какой папки nginx отдаёт старый сайт (строка `root`) и в каком файле
лежит его конфиг. Список конфигов:

```bash
ls /etc/nginx/sites-enabled/ /etc/nginx/conf.d/
```

Сохраните копию старого сайта и его конфига — к ним можно будет вернуться:

```bash
sudo cp -r ПАПКА_ИЗ_СТРОКИ_root ~/old-site-backup
sudo cp /etc/nginx/sites-enabled/ИМЯ_КОНФИГА ~/old-nginx-backup.conf
```

> Если `nginx -T` ничего не показал, сайт отдаёт что-то другое. Проверьте `pm2 ls`,
> `docker ps` и `sudo ss -tlnp | grep -E ':80|:443'` и пришлите мне вывод: подскажу, что делать.

## Шаг 4. Скачать проект

```bash
sudo mkdir -p /opt/orion
sudo chown $USER /opt/orion
git clone https://github.com/Sp1r3t/orion_web.git /opt/orion
```

## Шаг 5. Собрать сайт

Адрес для заявок и домен сайта:

```bash
cd /opt/orion
cat > .env.production <<'EOF'
VITE_LEAD_ENDPOINT=/api/lead
VITE_SITE_URL=https://example.ru
EOF
```

Сборка (займёт минуту):

```bash
npm ci
npm run build
ls dist
```

В `dist` должны появиться `index.html`, `assets`, `portfolio`, иконки.

## Шаг 6. Запустить бота

**6.1. Настройки и токен.** Скопируйте шаблон в системную папку и закройте его от чужих глаз:

```bash
sudo cp /opt/orion/bot/.env.example /etc/orion-bot.env
sudo chmod 600 /etc/orion-bot.env
```

Сгенерируйте секрет для почты и скопируйте его, он понадобится ещё на шаге 10:

```bash
openssl rand -hex 32
```

Откройте файл настроек:

```bash
sudo nano /etc/orion-bot.env
```

Заполните:

- `BOT_TOKEN=` — токен от BotFather;
- `MAIL_SECRET=` — строка из `openssl`;
- `ALLOWED_ORIGINS=https://example.ru,https://www.example.ru` и `SITE_URL=https://example.ru` — ваш домен;
- `ADMIN_CHAT_ID=` — пока оставьте пустым.

Сохраните файл: `Ctrl+O`, `Enter`, затем `Ctrl+X`.

**6.2. Служба.** Бот будет запускаться сам, в том числе после перезагрузки сервера:

```bash
sudo cp /opt/orion/deploy/orion-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now orion-bot
sudo systemctl status orion-bot --no-pager
```

В статусе должно быть `active (running)` и строка `Бот @имя_бота слушает Telegram`.

**6.3. Кто владелец.** Напишите своему боту `/start`, он пришлёт ваш chat_id. Впишите его в
`ADMIN_CHAT_ID=` (`sudo nano /etc/orion-bot.env`) и перезапустите бота:

```bash
sudo systemctl restart orion-bot
```

Снова `/start` — откроется панель студии 🪐.

## Шаг 7. Подключить новый сайт в nginx

**Вариант А — у старого сайта был свой конфиг (обычно так).** Откройте его:

```bash
sudo nano /etc/nginx/sites-enabled/ИМЯ_КОНФИГА
```

Внутри блока `server { ... }` вашего домена сделайте три правки. Если блоков два (для
`listen 80` и для `listen 443`), правьте тот, где `443`:

1. `root` замените на `root /opt/orion/dist;`
2. Добавьте блок для бота:

   ```nginx
   location /api/ {
       proxy_pass http://127.0.0.1:8787/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       client_max_body_size 100k;
   }
   ```

3. Блок `location / { ... }` приведите к виду:

   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

**Вариант Б — настроить с нуля.** Готовый конфиг лежит в проекте:

```bash
sudo cp /opt/orion/deploy/nginx-orion.conf /etc/nginx/sites-available/orion
sudo sed -i 's/example.ru/ВАШ-ДОМЕН/g' /etc/nginx/sites-available/orion
sudo ln -s /etc/nginx/sites-available/orion /etc/nginx/sites-enabled/orion
```

Старый конфиг для того же домена при этом нужно убрать из `sites-enabled`, копия у вас уже есть
с шага 3.

Проверьте конфиг и примените:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Шаг 8. HTTPS

Если старый сайт уже открывался по `https://`, этот шаг пропустите. Иначе:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.ru -d www.example.ru
```

## Шаг 9. Проверить

```bash
curl https://example.ru/api/
```

Должно ответить `ORION bot is running 🪐`.

Дальше:

1. Откройте сайт — должна быть новая версия. Если видите старую, обновите страницу с
   `Ctrl+F5`.
2. Отправьте тестовую заявку с формы, в Telegram придёт карточка 🟢 Заявка #1. Потом её можно
   удалить кнопкой 🗑.

## Шаг 10. Письма с почты в Telegram

1. Войдите в браузере в `orion.company.web@gmail.com` и откройте
   [script.google.com](https://script.google.com) → «Новый проект».
2. Вставьте весь код из файла `bot/gmail/Code.gs`, в строке `WORKER_URL` впишите
   `'https://example.ru/api'`. Сохраните (💾).
3. ⚙️ «Настройки проекта» → внизу «Свойства скрипта» → «Добавить»: имя `MAIL_SECRET`, значение —
   та же строка из `openssl`, что и в `/etc/orion-bot.env`.
4. Вверху выберите функцию `setup` → «Выполнить». Google попросит доступ к Gmail: «Разрешить».
   Если появится «Приложение не проверено», нажмите «Дополнительно» → «Перейти».
   Скрипт ваш, так что это нормально.
5. Проверка: выберите `sendTest` → «Выполнить». Последнее письмо из «Входящих» придёт в бота.

Дальше новые письма приходят сами, в течение минуты.

**Необязательно: кнопки «Прочитано» и «В архив» в самом Gmail.** В Apps Script:
«Начать развёртывание» → «Новое развёртывание» → тип «Веб-приложение», «Запуск от имени: я»,
«Доступ: все» → «Развернуть». Скопируйте URL в `GMAIL_ACTION_URL=` в `/etc/orion-bot.env` и
перезапустите бота: `sudo systemctl restart orion-bot`.

---

## Как обновлять потом

После изменений в репозитории:

```bash
bash /opt/orion/deploy/update.sh
```

Скрипт скачает свежий код, пересоберёт сайт без простоя и перезапустит бота.

## Если что-то не работает

| Что                         | Где смотреть                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Бот не отвечает             | `sudo journalctl -u orion-bot -n 50 --no-pager`                                              |
| Заявка не уходит с сайта    | тот же журнал; проверьте `ALLOWED_ORIGINS` — там должен быть точный адрес сайта с `https://` |
| Сайт не открывается или 502 | `sudo nginx -t`, `sudo tail -n 30 /var/log/nginx/error.log`                                  |
| Письма не приходят          | Apps Script → «Выполнения», ошибки там; `MAIL_SECRET` должен совпадать в обоих местах        |
| Вернуть старый сайт         | верните старый конфиг из `~/old-nginx-backup.conf` и `sudo systemctl reload nginx`           |

Логи бота в реальном времени: `sudo journalctl -u orion-bot -f`.
