#!/usr/bin/env bash
# Обновление сайта и бота на сервере: bash /opt/orion/deploy/update.sh
set -euo pipefail

cd /opt/orion
git pull --ff-only
npm ci

# Собираем в соседнюю папку и подменяем разом — сайт не пропадает на время сборки.
npx tsc -b
npx vite build --outDir dist-next --emptyOutDir
rm -rf dist-prev
if [ -d dist ]; then mv dist dist-prev; fi
mv dist-next dist

sudo systemctl restart orion-bot
echo "Готово: сайт обновлён, бот перезапущен."
