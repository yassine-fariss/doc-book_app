#!/bin/bash
set -e

echo "Starting deployment script..."

# Install dependencies if not already installed (usually done in Dockerfile, but safe to run here)
composer install --no-dev --optimize-autoloader

# Cache configuration, routes, and views for production performance
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force || true

# Storage link
php artisan storage:link || true

echo "Starting Nginx and PHP-FPM..."
# Start php-fpm in background
php-fpm -D

# Start Nginx in foreground to keep container running
nginx -g "daemon off;"
