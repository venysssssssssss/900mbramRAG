# 🚀 Guia Rápido - Docker Setup

## Pré-requisitos
- Docker 20.10+
- Docker Compose 2.0+

## Setup em 3 Passos

### 1️⃣ Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite e adicione suas API keys
nano .env  # ou vim, code, etc.
```

### 2️⃣ Inicie a aplicação

**Opção A - Script automático:**
```bash
./start.sh
```

**Opção B - Makefile:**
```bash
make build
make up
```

**Opção C - Docker Compose:**
```bash
docker-compose up -d --build
```

### 3️⃣ Acesse a aplicação

- 🌐 Frontend: http://localhost
- 🔧 API Backend: http://localhost:8000
- 📚 Documentação: http://localhost:8000/docs

## 📊 Comandos Úteis

### Com Makefile (recomendado)

```bash
make help          # Listar todos os comandos
make up            # Iniciar aplicação
make down          # Parar aplicação
make logs          # Ver logs
make stats         # Monitorar recursos
make restart       # Reiniciar
make clean         # Limpar tudo
```

### Com Docker Compose

```bash
docker-compose ps              # Status
docker-compose logs -f         # Logs
docker-compose down            # Parar
docker-compose restart         # Reiniciar
docker stats                   # Monitorar recursos
```

## 🔍 Verificação de Saúde

```bash
# Verificar status
docker-compose ps

# Health check manual
curl http://localhost/health
curl http://localhost:8000/health

# Usar o Makefile
make health
```

## 📈 Monitoramento

```bash
# Ver uso de recursos em tempo real
docker stats

# Deve mostrar:
# - rag_frontend: ~50-100 MB (limite: 200 MB)
# - rag_backend: ~200-400 MB (limite: 500 MB)
```

## 🎯 Limites de Recursos

| Serviço  | Limite RAM | Reserva RAM | Porta |
|----------|-----------|-------------|-------|
| Frontend | 200 MB    | 64 MB       | 80    |
| Backend  | 500 MB    | 256 MB      | 8000  |

## 🐛 Troubleshooting

### Containers não iniciam

```bash
# Ver logs detalhados
docker-compose logs

# Rebuild completo
make rebuild
# ou
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Erro de memória

```bash
# Verificar uso
docker stats

# Se necessário, ajustar limites no docker-compose.yml
```

### Porta já em uso

```bash
# Verificar portas ocupadas
sudo lsof -i :80
sudo lsof -i :8000

# Parar processo ou alterar portas no docker-compose.yml
```

### Verificar API keys

```bash
# Verificar se estão configuradas
cat .env | grep API_KEY
```

## 📁 Estrutura de Arquivos Docker

```
.
├── Dockerfile              # Container backend (Python/FastAPI)
├── Dockerfile.frontend     # Container frontend (Nginx)
├── docker-compose.yml      # Orquestração dos serviços
├── nginx.conf             # Configuração do Nginx
├── .dockerignore          # Arquivos ignorados no build
├── .env.example           # Template de variáveis
├── start.sh               # Script de inicialização
├── Makefile               # Comandos facilitados
└── README.Docker.md       # Documentação completa
```

## 🔒 Segurança

- ✅ API keys em variáveis de ambiente
- ✅ Rede isolada entre containers
- ✅ Health checks automáticos
- ✅ Limites de recursos configurados
- ✅ .dockerignore para arquivos sensíveis

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [README.Docker.md](README.Docker.md) - Documentação completa
- [Makefile](Makefile) - Todos os comandos disponíveis

## 💡 Dicas

1. Use `make help` para ver todos os comandos
2. Use `make logs` para debugar problemas
3. Use `make stats` para monitorar recursos
4. Dados são persistidos no volume `./data`
5. Backend suporta hot-reload em desenvolvimento

---

**🎉 Pronto! Sua aplicação RAG está rodando em containers Docker!**
