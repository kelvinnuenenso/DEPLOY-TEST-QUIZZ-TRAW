#!/bin/bash

# Script de backup automatizado para QuizLiftOff
# Este script faz backup dos dados do Redis e logs da aplicação

set -e  # Parar execução em caso de erro

# Configurações
BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30
REDIS_HOST="redis"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password_here"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_success() {
    log "${GREEN}✅ $1${NC}"
}

log_warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    log "${RED}❌ $1${NC}"
}

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Função para backup do Redis
backup_redis() {
    log "Iniciando backup do Redis..."
    
    local redis_backup_dir="$BACKUP_DIR/redis_$DATE"
    mkdir -p "$redis_backup_dir"
    
    # Fazer backup usando redis-cli
    if command -v redis-cli >/dev/null 2>&1; then
        # Backup RDB
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --rdb "$redis_backup_dir/dump.rdb" >/dev/null 2>&1
        
        # Backup de todas as chaves (formato JSON)
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --scan | while read key; do
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" dump "$key" | base64 > "$redis_backup_dir/${key}.dump"
        done
        
        # Informações do Redis
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" info > "$redis_backup_dir/redis_info.txt"
        
        log_success "Backup do Redis concluído: $redis_backup_dir"
    else
        log_error "redis-cli não encontrado. Instalando..."
        apk add --no-cache redis
        backup_redis  # Tentar novamente
    fi
}

# Função para backup dos logs
backup_logs() {
    log "Iniciando backup dos logs..."
    
    local logs_backup_dir="$BACKUP_DIR/logs_$DATE"
    mkdir -p "$logs_backup_dir"
    
    # Backup dos logs do Nginx
    if [ -d "/var/log/nginx" ]; then
        cp -r /var/log/nginx "$logs_backup_dir/"
        log_success "Logs do Nginx copiados"
    fi
    
    # Backup dos logs do Redis
    if [ -d "/var/log/redis" ]; then
        cp -r /var/log/redis "$logs_backup_dir/"
        log_success "Logs do Redis copiados"
    fi
    
    # Backup de logs da aplicação (se existirem)
    if [ -d "/app/logs" ]; then
        cp -r /app/logs "$logs_backup_dir/"
        log_success "Logs da aplicação copiados"
    fi
    
    log_success "Backup dos logs concluído: $logs_backup_dir"
}

# Função para compactar backups
compress_backups() {
    log "Compactando backups..."
    
    cd "$BACKUP_DIR"
    
    # Compactar backup do Redis
    if [ -d "redis_$DATE" ]; then
        tar -czf "redis_backup_$DATE.tar.gz" "redis_$DATE"
        rm -rf "redis_$DATE"
        log_success "Backup do Redis compactado: redis_backup_$DATE.tar.gz"
    fi
    
    # Compactar backup dos logs
    if [ -d "logs_$DATE" ]; then
        tar -czf "logs_backup_$DATE.tar.gz" "logs_$DATE"
        rm -rf "logs_$DATE"
        log_success "Backup dos logs compactado: logs_backup_$DATE.tar.gz"
    fi
}

# Função para limpar backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos (mais de $RETENTION_DAYS dias)..."
    
    cd "$BACKUP_DIR"
    
    # Remover backups do Redis antigos
    find . -name "redis_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Remover backups de logs antigos
    find . -name "logs_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    log_success "Limpeza de backups antigos concluída"
}

# Função para verificar espaço em disco
check_disk_space() {
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local required_space=1048576  # 1GB em KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        log_warning "Pouco espaço em disco disponível: $(($available_space/1024))MB"
        return 1
    fi
    
    log "Espaço em disco suficiente: $(($available_space/1024))MB disponível"
    return 0
}

# Função para enviar notificação (webhook)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Webhook URL (configurar conforme necessário)
    local webhook_url="${BACKUP_WEBHOOK_URL:-}"
    
    if [ -n "$webhook_url" ]; then
        curl -X POST "$webhook_url" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"Backup QuizLiftOff - $status\",
                \"attachments\": [{
                    \"color\": \"$([ \"$status\" = \"SUCCESS\" ] && echo \"good\" || echo \"danger\")\",
                    \"text\": \"$message\"
                }]
            }" >/dev/null 2>&1
    fi
}

# Função para criar relatório de backup
create_backup_report() {
    local report_file="$BACKUP_DIR/backup_report_$DATE.txt"
    
    cat > "$report_file" << EOF
=== RELATÓRIO DE BACKUP - QuizLiftOff ===
Data: $(date)
Versão do Script: 1.0.0

=== ARQUIVOS CRIADOS ===
$(ls -la "$BACKUP_DIR"/*_$DATE.tar.gz 2>/dev/null || echo "Nenhum arquivo de backup encontrado")

=== ESPAÇO EM DISCO ===
$(df -h "$BACKUP_DIR")

=== INFORMAÇÕES DO SISTEMA ===
Uptime: $(uptime)
Memória: $(free -h)

=== STATUS DOS SERVIÇOS ===
Redis: $(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping 2>/dev/null || echo "OFFLINE")

=== LOGS RECENTES ===
$(tail -n 20 /var/log/backup.log 2>/dev/null || echo "Nenhum log encontrado")
EOF

    log_success "Relatório de backup criado: $report_file"
}

# Função principal
main() {
    log "🚀 Iniciando processo de backup do QuizLiftOff..."
    
    # Verificar espaço em disco
    if ! check_disk_space; then
        log_error "Espaço em disco insuficiente para backup"
        send_notification "FAILED" "Backup falhou: espaço em disco insuficiente"
        exit 1
    fi
    
    # Executar backups
    backup_redis
    backup_logs
    
    # Compactar
    compress_backups
    
    # Limpar backups antigos
    cleanup_old_backups
    
    # Criar relatório
    create_backup_report
    
    # Atualizar timestamp do último backup bem-sucedido
    echo "$(date +%s)" > "$BACKUP_DIR/last_backup_success"
    
    log_success "✅ Processo de backup concluído com sucesso!"
    
    # Enviar notificação de sucesso
    send_notification "SUCCESS" "Backup concluído com sucesso em $(date)"
}

# Tratamento de erros
trap 'log_error "Backup falhou com erro na linha $LINENO"; send_notification "FAILED" "Backup falhou com erro na linha $LINENO"; exit 1' ERR

# Executar função principal
main "$@"