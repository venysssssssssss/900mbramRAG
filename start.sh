#!/bin/bash

# RAG Application - Quick Start Script

set -e

echo "🚀 Iniciando RAG Application com Docker Compose..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir do .env.example..."
    cp .env.example .env
    echo "⚠️  Por favor, edite o arquivo .env e adicione suas chaves de API:"
    echo "    - GEMINI_API_KEY"
    echo "    - JINA_API_KEY"
    echo ""
    read -p "Pressione Enter depois de configurar o arquivo .env..."
fi

# Verificar se as chaves de API estão configuradas
source .env
if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo "❌ GEMINI_API_KEY não está configurada no arquivo .env"
    exit 1
fi

if [ -z "$JINA_API_KEY" ] || [ "$JINA_API_KEY" = "your_jina_api_key_here" ]; then
    echo "❌ JINA_API_KEY não está configurada no arquivo .env"
    exit 1
fi

# Criar diretório de dados se não existir
mkdir -p data

echo "📦 Construindo containers..."
docker-compose build

echo "🔄 Iniciando serviços..."
docker-compose up -d

echo ""
echo "✅ Aplicação iniciada com sucesso!"
echo ""
echo "📊 Status dos containers:"
docker-compose ps
echo ""
echo "🌐 Acesse a aplicação em:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Health Check: http://localhost/health"
echo ""
echo "📝 Para ver os logs:"
echo "   docker-compose logs -f"
echo ""
echo "📈 Para monitorar recursos:"
echo "   docker stats"
echo ""
echo "🛑 Para parar a aplicação:"
echo "   docker-compose down"
echo ""
