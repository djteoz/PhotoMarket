#!/bin/bash
set -e

echo "=== Настройка сервера PhotoMarket ==="

# Swap
echo ">>> Добавляем swap 2GB..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Docker
echo ">>> Устанавливаем Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

# Git
echo ">>> Устанавливаем Git..."
apt-get install -y git

# Проект
echo ">>> Клонируем проект..."
if [ ! -d /opt/photomarket ]; then
  git clone https://github.com/djteoz/PhotoMarket.git /opt/photomarket
else
  cd /opt/photomarket && git pull
fi

cd /opt/photomarket

# .env
if [ ! -f .env ]; then
  echo ">>> Создаём .env файл..."
  cat > .env << 'EOF'
DATABASE_URL=postgresql://neondb_owner:npg_CO2WrPXwasE9@ep-snowy-mode-ah9ehuea-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
CLERK_SECRET_KEY=sk_test_pGuK6zn3LyXEL5CORulS30ftN8JSAcbFyLB2gS7LQd
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d2VhbHRoeS1jaGltcC04NS5jbGVyay5hY2NvdW50cy5kZXYk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_APP_URL=https://photomarket.tech
NEXT_PUBLIC_YANDEX_MAP_KEY=7c6f6023-20b7-477e-99f2-ed41dc2791bf
NEXT_PUBLIC_YANDEX_METRIKA_ID=106095108
UPLOADTHING_TOKEN=eyJhcGlLZXkiOiJza19saXZlX2JkNGM0NmE1YzIxYWMwNjc0MzcxMjQyOTgyZmIyYzc5MjNhYWZiMmQ5OThmYmJmNGU3YWU1YWU5ZDZlMWU0ZDciLCJhcHBJZCI6IjY5ZG43cXF4MXgiLCJyZWdpb25zIjpbInNlYTEiXX0=
NEXT_PUBLIC_SENTRY_DSN=https://9f86ab4daec1c2aeeca1c7e9fd7fd6a2@o4510719885049856.ingest.de.sentry.io/4510719889178704
YOOKASSA_SHOP_ID=1251850
YOOKASSA_SECRET_KEY=live_Vs38GBmC9fOQVRDYhDCMncuFEzbOdAdU0QcW47HPbIc
EOF
fi

# Nginx
echo ">>> Устанавливаем Nginx..."
apt-get install -y nginx certbot python3-certbot-nginx

cp /opt/photomarket/nginx-photomarket.conf /etc/nginx/sites-available/photomarket
ln -sf /etc/nginx/sites-available/photomarket /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "=== Готово! ==="
echo "Когда GitHub Actions соберёт образ, запусти:"
echo "  cd /opt/photomarket && docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "Затем SSL:"
echo "  certbot --nginx -d photomarket.tech -d www.photomarket.tech"
