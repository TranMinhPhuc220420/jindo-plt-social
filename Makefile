# Makefile

.PHONY: start build clear redis redis-stop test migrate seed seed-local migrate_and_seed deploy run_xampp format pre-commit pre-deploy ci-check

# Start the development server
start:
	cp .env.example .env
	composer run dev

# Build the production assets
build:
	# Copy .env.production to .env
	cp .env.production .env
	# Clear the cache
	make clear

	# Run the tests
	php artisan test

	# Run the build
	npm run build

# Local Redis (required when CACHE_STORE / QUEUE_CONNECTION=redis)
redis:
	docker compose up -d redis

redis-stop:
	docker compose stop redis

clear:
	php artisan config:clear
	php artisan cache:clear
	php artisan route:clear
	php artisan view:clear
	php artisan optimize:clear

# Run the tests
test:
	php artisan test

# Migrate the database
migrate:
	php artisan migrate

# Seed — default is local full demo
seed: seed-local

# Local / non-production: full demo (DatabaseSeeder). Do not seed on production.
seed-local:
	php artisan db:seed

migrate_and_seed:
	make clear
	php artisan migrate:refresh --seed

# Deploy the application
deploy:
	php artisan deploy

run_xampp:
	sudo /opt/lampp/lampp start

# ---------------------------------------------------------------------------
# Pre-commit / CI helpers
# ---------------------------------------------------------------------------

# Auto-fix Prettier, ESLint, and Pint (fixes the usual format:check CI failure)
format:
	npm run format
	npm run lint
	composer lint

pre-commit: format
	composer ci:check

pre-deploy: pre-commit

ci-check:
	composer ci:check
