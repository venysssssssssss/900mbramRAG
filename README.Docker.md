# RAG Application - Docker Setup

Este documento explica como executar a aplicação RAG usando Docker Compose.

## Requisitos

- Docker 20.10+
- Docker Compose 2.0+

## Estrutura dos Containers

A aplicação é composta por 2 serviços:

1. **Frontend** (Nginx) - Limite de memória: 200 MB
   - Serve arquivos estáticos
   - Faz proxy das requisições da API para o backend
   - Porta: 80

2. **Backend** (FastAPI) - Limite de memória: 500 MB
   - API REST com FastAPI
   - Processamento de documentos
   - Embeddings e LLM
   - Porta: 8000

## Configuração

1. **Crie o arquivo `.env`** com base no `.env.example`:

```bash
cp .env.example .env
```

2. **Edite o arquivo `.env`** e adicione suas chaves de API:

```env
GEMINI_API_KEY=sua_chave_gemini_aqui
JINA_API_KEY=sua_chave_jina_aqui
```

## Executar a Aplicação

### Iniciar os containers

```bash
docker-compose up -d
```

### Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

### Verificar status

```bash
docker-compose ps
```

### Parar os containers

```bash
docker-compose down
```

### Parar e remover volumes

```bash
docker-compose down -v
```

## Acessar a Aplicação

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost/health ou http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs

## Limites de Recursos

Os containers são configurados com os seguintes limites:

### Frontend
- **Limite de memória**: 200 MB
- **Reserva de memória**: 64 MB

### Backend
- **Limite de memória**: 500 MB
- **Reserva de memória**: 256 MB

## Monitoramento de Recursos

Para monitorar o uso de recursos dos containers:

```bash
docker stats
```

## Desenvolvimento

### Rebuild dos containers

```bash
docker-compose up -d --build
```

### Executar comandos dentro do container

```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh
```

### Montar volumes para desenvolvimento

Os volumes já estão configurados no `docker-compose.yml` para permitir desenvolvimento em tempo real:

- `./data:/app/data` - Persistência do banco de dados
- `./backend:/app/backend` - Hot reload do código backend
- `./main.py:/app/main.py` - Hot reload do arquivo principal

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend
docker-compose logs frontend
```

### Rebuild completo

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Verificar health checks

```bash
docker-compose ps
```

### Limpar tudo (cuidado: remove volumes)

```bash
docker-compose down -v
docker system prune -a
```

## Produção

Para produção, considere:

1. Usar um arquivo `.env` específico de produção
2. Configurar HTTPS com certificados SSL
3. Adicionar rate limiting
4. Configurar logs externos (ELK, CloudWatch, etc.)
5. Aumentar os limites de recursos conforme necessário
6. Usar Docker secrets para credenciais sensíveis
7. Implementar backup automático do volume de dados

## Arquitetura

```
┌─────────────────┐
│   Navegador     │
└────────┬────────┘
         │ HTTP :80
         ▼
┌─────────────────┐
│  Frontend       │
│  (Nginx)        │
│  200 MB RAM     │
└────────┬────────┘
         │ Proxy /api/*
         ▼
┌─────────────────┐
│  Backend        │
│  (FastAPI)      │
│  500 MB RAM     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DuckDB         │
│  (Volume)       │
└─────────────────┘
```

## Segurança

- As chaves de API são passadas via variáveis de ambiente
- O `.dockerignore` evita copiar arquivos sensíveis
- Os containers rodam em uma rede isolada
- Health checks garantem disponibilidade
