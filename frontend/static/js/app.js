/**
 * =========================================
 * 💬 RAG System - Chat com Documentos
 * =========================================
 * 
 * Sistema profissional de chat com documentos usando
 * RAG (Retrieval-Augmented Generation)
 * 
 * @author RAG Team
 * @version 2.0
 */

class ChatApp {
    constructor() {
        // Configurações
        this.API_BASE_URL = '';
        this.MAX_FILES = 2;
        this.MAX_SIZE = 800 * 1024 * 1024; // 800MB
        this.SUPPORTED_FORMATS = ['.pdf', '.docx', '.txt', '.md'];
        
        // Estado da aplicação
        this.files = [];
        this.isLoading = false;
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicializa a aplicação
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.setupDragAndDrop();
    }
    
    /**
     * Cache de elementos DOM para melhor performance
     */
    cacheElements() {
        this.elements = {
            // Screens
            startScreen: document.getElementById('startScreen'),
            chatScreen: document.getElementById('chatScreen'),
            
            // Buttons
            startBtn: document.getElementById('startBtn'),
            clearBtn: document.getElementById('clearBtn'),
            sendBtn: document.getElementById('sendBtn'),
            
            // Upload
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            filesList: document.getElementById('filesList'),
            fileCount: document.getElementById('fileCount'),
            
            // Chat
            messageForm: document.getElementById('messageForm'),
            messageInput: document.getElementById('messageInput'),
            messagesContainer: document.getElementById('messagesContainer'),
            
            // Overlay & Toast
            loadingOverlay: document.getElementById('loadingOverlay'),
            toastContainer: document.getElementById('toastContainer')
        };
    }
    
    /**
     * Anexa event listeners
     */
    attachEventListeners() {
        // Start button
        this.elements.startBtn?.addEventListener('click', () => this.showChat());
        
        // Upload
        this.elements.uploadArea?.addEventListener('click', () => {
            this.elements.fileInput?.click();
        });
        this.elements.fileInput?.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        // Clear button
        this.elements.clearBtn?.addEventListener('click', () => this.clearAll());
        
        // Message form
        this.elements.messageForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSend();
        });
        
        // Enter to send
        this.elements.messageInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
    }
    
    /**
     * Configura drag and drop
     */
    setupDragAndDrop() {
        const uploadArea = this.elements.uploadArea;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea?.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea?.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea?.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            });
        });
        
        uploadArea?.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });
    }
    
    /**
     * Processa arquivos selecionados
     */
    async handleFiles(fileList) {
        const newFiles = Array.from(fileList);
        
        // Verificar limite de arquivos
        if (this.files.length + newFiles.length > this.MAX_FILES) {
            this.showToast(`Máximo de ${this.MAX_FILES} documentos permitidos`, 'error');
            return;
        }
        
        // Processar cada arquivo
        for (const file of newFiles) {
            // Validar tamanho
            if (file.size > this.MAX_SIZE) {
                this.showToast(`${file.name} excede 800MB`, 'error');
                continue;
            }
            
            // Validar formato
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (!this.SUPPORTED_FORMATS.includes(ext)) {
                this.showToast(`Formato inválido: ${file.name}`, 'error');
                continue;
            }
            
            // Upload
            await this.uploadFile(file);
        }
    }
    
    /**
     * Faz upload de um arquivo
     */
    async uploadFile(file) {
        this.showLoading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch(`${this.API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                this.files.push(file);
                this.renderFiles();
                this.showToast(`${file.name} enviado com sucesso!`, 'success');
            } else {
                const error = await response.text();
                this.showToast(`Erro ao enviar ${file.name}: ${error}`, 'error');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            this.showToast(`Erro ao enviar ${file.name}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * Renderiza lista de arquivos
     */
    renderFiles() {
        if (!this.elements.filesList) return;
        
        this.elements.filesList.innerHTML = this.files.map((file, index) => `
            <div class="file-item">
                <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                    <path d="M14 2V8H20"/>
                </svg>
                <div class="file-info">
                    <div class="file-name">${this.escapeHtml(file.name)}</div>
                    <div class="file-size">${this.formatSize(file.size)}</div>
                </div>
                <svg class="file-remove" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="chatApp.removeFile(${index})">
                    <path d="M18 6L6 18M6 6L18 18"/>
                </svg>
            </div>
        `).join('');
        
        // Atualizar contador
        if (this.elements.fileCount) {
            this.elements.fileCount.textContent = this.files.length;
        }
    }
    
    /**
     * Remove um arquivo
     */
    removeFile(index) {
        const fileName = this.files[index].name;
        this.files.splice(index, 1);
        this.renderFiles();
        this.showToast(`${fileName} removido`, 'success');
    }
    
    /**
     * Limpa todos os arquivos
     */
    async clearAll() {
        if (!confirm('Deseja limpar todos os documentos e a conversa?')) {
            return;
        }
        
        this.files = [];
        this.renderFiles();
        
        // Limpar mensagens
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.innerHTML = '<div class="message-date">Hoje</div>';
        }
        
        this.showToast('Tudo limpo!', 'success');
    }
    
    /**
     * Mostra interface de chat
     */
    showChat() {
        this.elements.startScreen?.classList.add('hidden');
        this.elements.chatScreen?.classList.remove('hidden');
        this.elements.messageInput?.focus();
        
        // Mensagem de boas-vindas se não houver arquivos
        if (this.files.length === 0) {
            this.addMessage('👋 Bem-vindo! Por favor, faça upload de 1 ou 2 documentos para começar nossa conversa.', 'bot');
        }
    }
    
    /**
     * Envia mensagem
     */
    async handleSend() {
        const message = this.elements.messageInput?.value.trim();
        
        if (!message) return;
        
        if (this.files.length === 0) {
            this.showToast('Envie pelo menos 1 documento primeiro', 'error');
            return;
        }
        
        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        
        // Limpar input
        if (this.elements.messageInput) {
            this.elements.messageInput.value = '';
        }
        
        // Mostrar indicador de digitação
        this.showTyping();
        
        try {
            const response = await fetch(
                `${this.API_BASE_URL}/query?q=${encodeURIComponent(message)}`
            );
            
            if (!response.ok) {
                throw new Error('Erro ao processar pergunta');
            }
            
            const data = await response.json();
            
            // Remover indicador de digitação
            this.removeTyping();
            
            // Adicionar resposta
            this.addMessage(data.answer || 'Sem resposta disponível', 'bot');
            
        } catch (error) {
            console.error('Erro na consulta:', error);
            this.removeTyping();
            this.addMessage('Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.', 'bot');
        }
    }
    
    /**
     * Adiciona mensagem ao chat
     */
    addMessage(text, type) {
        const time = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const avatar = type === 'user' ? '👤' : '🤖';
        
        const messageHTML = `
            <div class="message ${type}">
                <div class="message-avatar">${avatar}</div>
                <div class="message-content">
                    <div class="message-bubble">${this.escapeHtml(text)}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        
        this.elements.messagesContainer?.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }
    
    /**
     * Mostra indicador de digitação
     */
    showTyping() {
        const typingHTML = `
            <div class="message bot typing-msg">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-bubble typing-indicator">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.messagesContainer?.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }
    
    /**
     * Remove indicador de digitação
     */
    removeTyping() {
        const typingMsg = this.elements.messagesContainer?.querySelector('.typing-msg');
        typingMsg?.remove();
    }
    
    /**
     * Rola para o final do chat
     */
    scrollToBottom() {
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.scrollTop = 
                this.elements.messagesContainer.scrollHeight;
        }
    }
    
    /**
     * Mostra/oculta loading overlay
     */
    showLoading(show) {
        if (this.elements.loadingOverlay) {
            if (show) {
                this.elements.loadingOverlay.classList.remove('hidden');
            } else {
                this.elements.loadingOverlay.classList.add('hidden');
            }
        }
    }
    
    /**
     * Mostra notificação toast
     */
    showToast(message, type = 'success') {
        const iconPath = type === 'success'
            ? '<path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>'
            : '<path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>';
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">${iconPath}</svg>
            <span>${this.escapeHtml(message)}</span>
        `;
        
        this.elements.toastContainer?.appendChild(toast);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    /**
     * Formata tamanho de arquivo
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar aplicação quando DOM estiver pronto
let chatApp;

document.addEventListener('DOMContentLoaded', () => {
    chatApp = new ChatApp();
});
