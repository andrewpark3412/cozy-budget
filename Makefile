.DEFAULT_GOAL := help
SHELL := /bin/zsh

.PHONY: help install dev db db-stop db-reset migrate seed type-check lint format

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install

dev: db ## Start Postgres + all apps in watch mode
	pnpm turbo run dev

db: ## Start only the Postgres Docker container
	docker compose up -d postgres
	@echo "Waiting for Postgres to be ready..."
	@until docker compose exec postgres pg_isready -U cozy -d cozy_budget > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "Postgres is ready."

db-stop: ## Stop Docker containers
	docker compose down

db-reset: ## Destroy and recreate the DB volume (WARNING: data loss)
	docker compose down -v
	$(MAKE) db

migrate: ## Run Drizzle migrations against local DB
	pnpm --filter @cozy-budget/api db:migrate

seed: ## Seed predefined categories
	pnpm --filter @cozy-budget/api db:seed

type-check: ## Run TypeScript type check across all packages
	pnpm turbo run type-check

lint: ## Run ESLint across all packages
	pnpm turbo run lint

format: ## Format all files with Prettier
	pnpm format
