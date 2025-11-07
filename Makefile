.PHONY: help build up down logs restart clean status stats

help: ## Mostrar esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir os containers
	docker-compose build

up: ## Iniciar a aplicação
	docker-compose up -d
	@echo "✅ Aplicação iniciada!"
	@echo "🌐 Frontend: http://localhost"
	@echo "🔧 Backend: http://localhost:8000"
	@echo "📚 Docs: http://localhost:8000/docs"

down: ## Parar a aplicação
	docker-compose down

logs: ## Ver logs de todos os serviços
	docker-compose logs -f

logs-backend: ## Ver logs do backend
	docker-compose logs -f backend

logs-frontend: ## Ver logs do frontend
	docker-compose logs -f frontend

restart: down up ## Reiniciar a aplicação

rebuild: ## Rebuild completo dos containers
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

clean: ## Parar e remover containers, redes e volumes
	docker-compose down -v
	@echo "⚠️  Volumes removidos! Os dados do banco foram perdidos."

status: ## Ver status dos containers
	docker-compose ps

stats: ## Monitorar uso de recursos dos containers
	docker stats

shell-backend: ## Abrir shell no container backend
	docker-compose exec backend bash

shell-frontend: ## Abrir shell no container frontend
	docker-compose exec frontend sh

dev: ## Modo desenvolvimento com rebuild
	docker-compose up --build

health: ## Verificar health dos serviços
	@echo "Verificando backend..."
	@curl -f http://localhost:8000/health || echo "❌ Backend não está respondendo"
	@echo "\nVerificando frontend..."
	@curl -f http://localhost/ > /dev/null || echo "❌ Frontend não está respondendo"
	@echo "✅ Health check completo"
