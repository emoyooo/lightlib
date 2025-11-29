#!/bin/sh

# Устанавливаем порт, который передаёт Railway
export PORT=${PORT:-3000}

# Запускаем Node.js сервер
node src/app.js
