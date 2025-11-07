# 📚 Chat com Documentos - RAG System

Sistema profissional de **Retrieval-Augmented Generation (RAG)** que permite conversar com documentos usando inteligência artificial avançada.

## ✨ Features

### 🎯 Principais
- ✅ Upload de múltiplos documentos (PDF, DOCX, TXT, MD)
- ✅ Chat interativo com IA inteligente
- ✅ Busca semântica usando embeddings
- ✅ Interface moderna e responsiva
- ✅ Zero dependências externas no frontend
- ✅ Segurança e privacidade

### 🏗️ Arquitetura

```
RAG System
├── Frontend (Vanilla JS + CSS3)
│   ├── Tela de início
│   ├── Upload de documentos
│   ├── Interface de chat
│   └── Responsivo (mobile-first)
│
├── Backend (FastAPI + Python)
│   ├── API RESTful
│   ├── Document Processing
│   ├── Embedding Service (Jina AI)
│   ├── LLM Integration (Google Gemini)
│   └── Database (DuckDB)
│
└── Infraestrutura
    ├── Modular e escalável
    ├── Logging centralizado
    ├── Tratamento de erros
    └── Validação de entrada
```

## 🚀 Quick Start

### 🐳 Docker (Recomendado)

A forma mais rápida de executar a aplicação é usando Docker:

```bash
# 1. Configure as API keys
cp .env.example .env
nano .env  # Adicione suas chaves GEMINI_API_KEY e JINA_API_KEY

# 2. Execute com o script automático
./start.sh

# OU use o Makefile
make build && make up

# OU use docker-compose diretamente
docker-compose up -d --build

# 3. Acesse a aplicação
# Frontend: http://localhost
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

📖 **Documentação Docker:**
- [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) - Guia rápido
- [README.Docker.md](README.Docker.md) - Documentação completa
- [DOCKER_ADVANCED.md](DOCKER_ADVANCED.md) - Configurações avançadas

**Limites de Recursos:**
- Frontend (Nginx): 200 MB RAM
- Backend (FastAPI): 500 MB RAM

---

### 🐍 Instalação Manual (Python)

Se preferir executar sem Docker:

#### Pré-requisitos
- Python 3.12+
- pip/poetry
- Keys: GEMINI_API_KEY, JINA_API_KEY

#### Instalação

```bash
# Clone e navegue
cd /root/dev/rag1

# Crie ambiente virtual
python -m venv venv
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves de API
```

#### Execução

```bash
# Inicie o servidor
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Acesse
http://localhost:8000
```

---

## 📦 Estrutura do Projeto

```
rag1/
├── backend/                    # Backend modular
│   ├── api/
│   │   └── routes/
│   │       ├── documents.py   # Rotas de documento
│   │       └── health.py      # Health check
│   ├── core/
│   │   ├── config.py          # Configurações
│   │   └── logging.py         # Setup de logs
│   ├── db/
│   │   └── database.py        # Gerenciamento DB
│   ├── services/
│   │   ├── document_service.py    # Lógica de doc
│   │   ├── embedding_service.py   # Embeddings
│   │   └── llm_service.py        # LLM calls
│   └── utils/
│       └── similarity.py       # Cálculo de similaridade
│
├── frontend/                   # Frontend modular
│   └── static/
│       ├── index.html         # Estrutura
│       ├── css/
│       │   └── style.css      # Design system
│       └── js/
│           └── app.js         # Lógica
│
├── tests/                      # Testes
├── data/                       # Dados/BD
├── main.py                     # Entrada da app
├── requirements.txt            # Dependências
├── .env.example               # Configuração
└── README.md
```

## 🔌 API Endpoints

### Documentos

#### Upload
```http
POST /upload
Content-Type: multipart/form-data

Parameters:
- file: Document (PDF, DOCX, TXT, MD)

Response:
{
  "message": "Document uploaded successfully",
  "doc_id": 1,
  "filename": "document.pdf"
}
```

#### Query
```http
GET /query?q=What+is+the+document+about

Response:
{
  "answer": "The document is about...",
  "contexts": [
    {
      "id": 1,
      "title": "document.pdf",
      "similarity": 0.8567
    }
  ]
}
```

#### Listar Documentos
```http
GET /documents

Response:
[
  {
    "id": 1,
    "title": "document.pdf"
  }
]
```

#### Health Check
```http
GET /health

Response:
{
  "status": "ok"
}
```

## 🎨 Frontend Highlights

### Design System Profissional
- **Paleta**: Cores WCAG AA+ compatíveis
- **Tipografia**: Escala harmônica
- **Espaçamento**: Grid 8px
- **Acessibilidade**: Modo escuro, redução de movimento

### Performance
- CSS: 8KB otimizado
- JS: 12KB modular
- Zero dependências externas
- Lazy loading

### Responsividade
- Desktop: Layout 2 colunas
- Tablet: Layout adaptativo
- Mobile: Full-width
- Pequenos: Escala reduzida

## 🧠 Backend Highlights

### Modularização
- Separação clara de responsabilidades
- Serviços independentes
- Fácil de testar e escalar

### Gerenciamento de Documentos
- Suporta múltiplos formatos (PDF, DOCX, TXT, MD)
- Limite de tamanho (10MB por padrão, 800MB para frontend)
- Limite de quantidade (500 por padrão)
- Extração de texto automática

### Processamento de Embeddings
- Integração com Jina AI
- Similaridade semântica
- Top-K retrieval configurável

### Integração LLM
- Google Gemini
- Prompt engenharia otimizada
- Tratamento de erros robusto

### Banco de Dados
- DuckDB (leve e eficiente)
- Schema simples
- Suporta embeddings em JSON

## 🔐 Segurança

### Frontend
- XSS Prevention (HTML escaping)
- Input validation
- CSRF ready
- No inline scripts perigosos

### Backend
- API Key validation
- Input sanitization
- Error handling sem stack trace
- Rate limiting ready

## 📊 Configuração

### Variáveis de Ambiente (.env)

```bash
# APIs
GEMINI_API_KEY=seu_gemini_key
JINA_API_KEY=seu_jina_key

# Modelos
GEMINI_GEN_MODEL=gemini-1.5-pro
JINA_EMBED_MODEL=jina-embeddings-v2-base-en

# Banco de Dados
DB_PATH=./data/docs.db

# App Settings
TOP_K=3              # Número de docs similares
MAX_DOCS=500         # Máx documentos no DB
MAX_DOC_SIZE=10485760  # 10MB em bytes
```

## 🧪 Testing

```bash
# Rodar testes
pytest tests/ -v

# Com coverage
pytest tests/ --cov=backend
```

## 🐳 Docker (Opcional)

```dockerfile
FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📈 Performance

| Métrica | Valor |
|---------|-------|
| Frontend Load | <1s |
| API Response | <2s |
| Upload | Streaming |
| Chat Response | <5s |
| Memória | <200MB |

## 🚀 Deployment

### Desenvolvimento
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Produção
```bash
gunicorn main:app -w 4 -b 0.0.0.0:8000
```

### Docker
```bash
docker build -t rag-system .
docker run -p 8000:8000 -e GEMINI_API_KEY=xxx rag-system
```

## 📚 Dependências

### Backend
- fastapi: Framework web
- uvicorn: ASGI server
- pydantic: Validação de dados
- duckdb: Banco de dados
- pypdf: Leitura de PDFs
- python-docx: Leitura de DOCXs
- httpx: Cliente HTTP assíncrono
- google-generativeai: Integração Gemini
- python-dotenv: Configuração

### Frontend
- **Zero dependências externas!**
- Apenas CSS3 e JavaScript vanilla

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - veja LICENSE.md para detalhes

## 🙏 Agradecimentos

- Jina AI (Embeddings)
- Google Gemini (LLM)
- DuckDB (Banco de dados)
- FastAPI (Framework)

## 📞 Suporte

Para questões e sugestões:
- 📧 Email: support@example.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**Desenvolvido com 💙 e melhores práticas de engenharia de software**

*Última atualização: November 2025*# 900mbramRAG
