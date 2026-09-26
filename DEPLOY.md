# Запуск сайта и бота на своём сервере

Как это устроено:

```
посетитель ──► nginx ──► /            сайт (готовые файлы из /opt/orion/dist)
                    └──► /api/lead    ┐
Gmail (Apps Script) ──► /api/mail     ├─► бот: служба orion-bot (Node.js, 127.0.0.1:8787)
                                      ┘         └──► Telegram (сам забирает сообщения)
```

Гайд рассчитан на сервер с **Ubuntu или Debian**, где у вас есть `sudo`.

**Как пользоваться.** Копируйте блоки команд по очереди и вставляйте в терминал сервера.
Строки, начинающиеся с `#`, — пояснения, их тоже можно вставлять, терминал их пропустит.
Если команда что-то спрашивает, ответ описан рядом с ней.

---

## Шаг 1. Создать бота в Telegram (на телефоне)

1. Откройте [@BotFather](https://t.me/BotFather) → `/newbot`.
2. Имя, например «ORION Studio», и username, заканчивающийся на `bot`.
3. BotFather пришлёт токен вида `123456789:AA...`. Держите его под рукой (шаг 6) и **не
   пересылайте никому**.

## Шаг 2. Подключиться к серверу

На своём компьютере:

```bash
ssh ПОЛЬЗОВАТЕЛЬ@IP-СЕРВЕРА
```

Дальше все команды — **на сервере**. Первым делом задайте свой домен, без `https://` и без `www`.
Остальные команды подставят его сами:

```bash
DOMAIN=example.ru
```

> Если отключились от сервера и зашли снова, выполните эту строку ещё раз. С шага 6 вместе с ней
> нужна и строка `setenv() { ... }` из начала шага 6.

## Шаг 3. Поставить Node.js, git и nginx

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx
node -v
```

`node -v` должен показать `v22.18` или новее.

## Шаг 4. Сохранить старый сайт

Найти конфиг nginx, который сейчас отвечает за ваш домен:

```bash
OLD_CONF=$(sudo grep -lsE "server_name[^;]*[[:space:]]$DOMAIN" /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf)
echo "Конфиг старого сайта: ${OLD_CONF:-не найден}"
```

Сохранить копию конфига и файлов старого сайта в `~/old-site`:

```bash
mkdir -p ~/old-site/enabled
printf '%s\n' $OLD_CONF > ~/old-site/paths.txt
for f in $OLD_CONF; do sudo cp -L "$f" ~/old-site/; done
OLD_ROOT=$(sudo grep -hE "^[[:space:]]*root " $OLD_CONF 2>/dev/null | head -1 | awk '{print $2}' | tr -d ';')
echo "Папка старого сайта: ${OLD_ROOT:-не найдена}"
[ -n "$OLD_ROOT" ] && sudo cp -r "$OLD_ROOT" ~/old-site/files
ls ~/old-site
```

Проверьте, что в этом конфиге нет других сайтов:

```bash
sudo grep -h server_name $OLD_CONF
```

Если там только ваш домен, продолжайте. Если есть чужие домены, или конфиг «не найден»,
пришлите мне вывод этих команд: подскажу, как поступить.

## Шаг 5. Скачать и собрать сайт

```bash
sudo mkdir -p /opt/orion
sudo chown $USER /opt/orion
git clone https://github.com/Sp1r3t/orion_web.git /opt/orion
cd /opt/orion

cat > .env.production <<EOF
VITE_LEAD_ENDPOINT=/api/lead
VITE_SITE_URL=https://$DOMAIN
EOF

npm ci
npm run build
ls dist
```

В конце должен появиться список файлов: `index.html`, `assets`, `portfolio`, иконки.

## Шаг 6. Запустить бота

Файл настроек, закрытый от всех, кроме root, и вспомогательная команда для записи в него:

```bash
sudo cp /opt/orion/bot/.env.example /etc/orion-bot.env
sudo chmod 600 /etc/orion-bot.env
setenv() { sudo sed -i "s|^$1=.*|$1=$2|" /etc/orion-bot.env; }
```

**Токен бота.** Команда попросит вставить токен. Вставьте (правой кнопкой мыши или
`Ctrl+Shift+V`) и нажмите `Enter`. На экране он не отобразится — так и должно быть:

```bash
read -rsp "Вставьте токен бота и нажмите Enter: " TOKEN; echo
setenv BOT_TOKEN "$TOKEN"; unset TOKEN
```

Секрет для почты, адрес сайта:

```bash
setenv MAIL_SECRET "$(openssl rand -hex 32)"
setenv ALLOWED_ORIGINS "https://$DOMAIN,https://www.$DOMAIN"
setenv SITE_URL "https://$DOMAIN"
```

Установить и запустить службу. Бот будет запускаться сам, в том числе после перезагрузки:

```bash
sudo cp /opt/orion/deploy/orion-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now orion-bot
sleep 3
sudo journalctl -u orion-bot -n 5 --no-pager
```

В выводе должна быть строка `Бот @имя_бота слушает Telegram`.

**Владелец.** Напишите своему боту в Telegram `/start`, он ответит вашим chat_id. Вставьте его:

```bash
read -rp "chat_id из ответа бота: " CHAT_ID
setenv ADMIN_CHAT_ID "$CHAT_ID"
sudo systemctl restart orion-bot
```

Снова напишите боту `/start` — откроется панель студии 🪐.

## Шаг 7. Переключить домен на новый сайт

```bash
# Новый конфиг с вашим доменом.
sudo cp /opt/orion/deploy/nginx-orion.conf /etc/nginx/sites-available/orion
sudo sed -i "s/example.ru/$DOMAIN/g" /etc/nginx/sites-available/orion

# Старый конфиг убираем (копия в ~/old-site), новый включаем.
while read -r f; do [ -n "$f" ] && sudo mv "$f" ~/old-site/enabled/; done < ~/old-site/paths.txt
sudo ln -sf /etc/nginx/sites-available/orion /etc/nginx/sites-enabled/orion

sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` должен написать `syntax is ok` и `test is successful`. Если старый сайт был на `https`,
до шага 8 он откроется только по `http` — это на пару минут.

## Шаг 8. HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect
```

Что отвечать на вопросы certbot:

- **почта** — любая ваша;
- **условия** — `Y`;
- **рассылка** — `N`;
- **если спросит про уже выпущенный сертификат** — выберите `1` (reinstall).

> **Домен за Cloudflare** (в ответах сервера есть `server: cloudflare`)? После certbot сайт уйдёт в
> бесконечное перенаправление, пока в Cloudflare стоит SSL-режим «Flexible». Откройте
> dash.cloudflare.com → домен → **SSL/TLS** → **Overview** → **Configure** → **Full (strict)** → **Save**.

Если certbot ругается на `www`, значит, у домена нет адреса с www. Повторите без него:

```bash
sudo certbot --nginx -d $DOMAIN --redirect
```

## Шаг 9. Проверить

```bash
curl -s https://$DOMAIN/api/
```

Должно ответить `ORION bot is running 🪐`.

Затем в браузере:

1. Откройте сайт — должна быть новая версия. Если видите старую, обновите страницу через
   `Ctrl+F5`.
2. Отправьте тестовую заявку с формы — в Telegram придёт карточка 🟢 Заявка #1. Потом её можно
   удалить кнопкой 🗑.

## Шаг 10. Письма с почты в Telegram

Секрет для почты понадобится в Apps Script. Покажите его и скопируйте:

```bash
sudo grep MAIL_SECRET /etc/orion-bot.env
```

Дальше в браузере:

1. Войдите в `orion.company.web@gmail.com` и откройте [script.google.com](https://script.google.com) →
   «Новый проект».
2. Сотрите пример и вставьте весь код из
   [bot/gmail/Code.gs](https://github.com/Sp1r3t/orion_web/blob/main/bot/gmail/Code.gs).
3. В строке `const WORKER_URL = ...` впишите `'https://ваш-домен/api'`. Сохраните (💾).
4. ⚙️ «Настройки проекта» → внизу «Свойства скрипта» → «Добавить свойство»: имя
   `MAIL_SECRET`, значение — строка после `MAIL_SECRET=` из команды выше.
5. Вернитесь в редактор, в списке функций выберите `setup` → «Выполнить». Google попросит доступ
   к Gmail: «Разрешить». Если появится «Приложение не проверено» — «Дополнительно» → «Перейти».
   Скрипт ваш, так что это нормально.
6. Проверка: выберите `sendTest` → «Выполнить». Последнее письмо из «Входящих» придёт в бота.

Дальше новые письма приходят сами, в течение минуты.

**Необязательно: кнопки «Прочитано» и «В архив» в самом Gmail.**

1. В Apps Script нажмите «Начать развёртывание» → «Новое развёртывание».
2. Тип — «Веб-приложение», «Запуск от имени: я», «Доступ: все» → «Развернуть».
3. Скопируйте выданный URL и выполните на сервере:

```bash
setenv() { sudo sed -i "s|^$1=.*|$1=$2|" /etc/orion-bot.env; }
read -rp "URL веб-приложения: " GMAIL_URL
setenv GMAIL_ACTION_URL "$GMAIL_URL"
sudo systemctl restart orion-bot
```

---

## Как обновлять потом

После изменений в репозитории:

```bash
bash /opt/orion/deploy/update.sh
```

Скрипт скачает свежий код, пересоберёт сайт без простоя и перезапустит бота.

## Если что-то не работает

Журнал бота — сюда попадают ошибки заявок и писем:

```bash
sudo journalctl -u orion-bot -n 50 --no-pager
```

Проверка nginx, если сайт не открывается или пишет 502:

```bash
sudo nginx -t
sudo tail -n 30 /var/log/nginx/error.log
sudo systemctl status orion-bot --no-pager
```

Посмотреть настройки бота (там же видно, правильный ли домен в `ALLOWED_ORIGINS`):

```bash
sudo cat /etc/orion-bot.env
```

Если письма не приходят, откройте в Apps Script раздел «Выполнения» — ошибки будут там.

**Вернуть старый сайт:**

```bash
sudo rm /etc/nginx/sites-enabled/orion
while read -r f; do sudo mv ~/old-site/enabled/"$(basename "$f")" "$f"; done < ~/old-site/paths.txt
sudo nginx -t && sudo systemctl reload nginx
```
