# Docker Compose Configuration - Advanced Examples

## Diferentes Cenários de Deploy

### 1. Desenvolvimento Local

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: development  # Se usar multi-stage build
    volumes:
      - ./backend:/app/backend
      - ./main.py:/app/main.py
      # Hot reload habilitado
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    deploy:
      resources:
        limits:
          memory: 1G  # Mais memória para dev
```

**Uso:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 2. Produção com Escalabilidade

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 500M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
    healthcheck:
      interval: 10s
      timeout: 5s
      retries: 5
```

### 3. Com Monitoramento (Prometheus + Grafana)

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    deploy:
      resources:
        limits:
          memory: 200M

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    deploy:
      resources:
        limits:
          memory: 200M

volumes:
  prometheus_data:
  grafana_data:
```

### 4. Com Redis para Cache

```yaml
# docker-compose.cache.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    deploy:
      resources:
        limits:
          memory: 200M
    command: redis-server --maxmemory 150mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  backend:
    environment:
      - REDIS_URL=redis://redis:6379

volumes:
  redis_data:
```

## Comandos Avançados

### Build e Deploy

```bash
# Build com argumentos
docker-compose build --build-arg PYTHON_VERSION=3.11 backend

# Build sem cache
docker-compose build --no-cache

# Pull das imagens base atualizadas
docker-compose pull

# Up com rebuild
docker-compose up --build -d

# Escalar serviço
docker-compose up -d --scale backend=3
```

### Logs e Debug

```bash
# Logs com timestamp
docker-compose logs -f -t

# Últimas 100 linhas
docker-compose logs --tail=100

# Logs desde determinado tempo
docker-compose logs --since 2024-01-01T00:00:00

# Logs apenas de erros (grep)
docker-compose logs backend 2>&1 | grep -i error

# Logs em arquivo
docker-compose logs > logs_$(date +%Y%m%d_%H%M%S).txt
```

### Manutenção

```bash
# Restart de serviço específico
docker-compose restart backend

# Stop graceful
docker-compose stop

# Kill forçado
docker-compose kill

# Remover containers órfãos
docker-compose down --remove-orphans

# Remover volumes não utilizados
docker volume prune

# Limpeza completa do sistema
docker system prune -a --volumes
```

### Inspeção

```bash
# Ver configuração efetiva
docker-compose config

# Ver variáveis de ambiente
docker-compose exec backend env

# Ver processos
docker-compose top

# Estatísticas de um container
docker stats rag_backend

# Inspecionar container
docker inspect rag_backend

# Ver rede
docker network inspect rag1_rag_network
```

### Execução de Comandos

```bash
# Executar comando no backend
docker-compose exec backend python -c "import sys; print(sys.version)"

# Executar como root
docker-compose exec -u root backend apt-get update

# Executar comando sem terminal interativo
docker-compose exec -T backend python script.py < input.txt

# Copiar arquivo para container
docker cp local_file.txt rag_backend:/app/

# Copiar arquivo do container
docker cp rag_backend:/app/data/docs.db ./backup/
```

### Backup e Restore

```bash
# Backup do volume de dados
docker run --rm \
  -v rag1_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/data_backup_$(date +%Y%m%d).tar.gz -C /data .

# Restore do volume
docker run --rm \
  -v rag1_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar xzf /backup/data_backup_20240101.tar.gz -C /data

# Backup do banco DuckDB
docker-compose exec backend cp /app/data/docs.db /app/data/docs.db.backup
docker cp rag_backend:/app/data/docs.db.backup ./backup/
```

### Performance e Otimização

```bash
# Análise de tamanho de imagens
docker images | grep rag

# Análise de layers da imagem
docker history rag1_backend

# Remover layers intermediários
docker-compose build --pull --no-cache

# Ver uso de disco
docker system df

# Limitar logs (adicionar ao docker-compose.yml)
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Configurações de Rede

### Port Binding Customizado

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Alterar porta externa
  
  backend:
    ports:
      - "127.0.0.1:8000:8000"  # Apenas localhost
```

### Rede Externa

```yaml
networks:
  rag_network:
    external: true
    name: my_existing_network
```

### Múltiplas Redes

```yaml
services:
  backend:
    networks:
      - frontend_network
      - backend_network
  
  database:
    networks:
      - backend_network

networks:
  frontend_network:
  backend_network:
    internal: true  # Sem acesso externo
```

## Variáveis de Ambiente Avançadas

```yaml
services:
  backend:
    env_file:
      - .env
      - .env.local
      - .env.${ENVIRONMENT}
    environment:
      - DEBUG=${DEBUG:-false}
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - DATABASE_URL=duckdb:///app/data/${DB_NAME:-docs.db}
```

## Health Checks Avançados

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
  frontend:
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 20s
      timeout: 5s
      retries: 3
```

## Estratégias de Update

```bash
# Update sem downtime (recreate)
docker-compose up -d --no-deps --build backend

# Rolling update manual
docker-compose scale backend=2
docker-compose up -d --no-deps --build backend
docker-compose scale backend=1

# Update com pull de nova imagem
docker-compose pull
docker-compose up -d
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Copy files to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: "."
          target: "/app"
      
      - name: Deploy with docker-compose
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d --build
```

## Troubleshooting Avançado

```bash
# Ver todos os processos em todos os containers
docker-compose top

# Analisar uso de recursos histórico
docker stats --no-stream

# Ver eventos do Docker
docker events

# Debug de networking
docker-compose exec backend ping frontend
docker-compose exec backend nslookup frontend

# Verificar portas abertas
docker-compose exec backend netstat -tuln

# Testar conectividade HTTP
docker-compose exec backend curl -v http://frontend/

# Memory leak detection
docker stats --no-stream | grep rag_

# CPU profiling
docker-compose exec backend py-spy top --pid 1
```
