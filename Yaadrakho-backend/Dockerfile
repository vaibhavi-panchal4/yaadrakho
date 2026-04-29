FROM php:8.2-cli

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y \
    git unzip curl libzip-dev zip \
    && docker-php-ext-install zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN composer install

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000