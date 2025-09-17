-- Script de configuração para produção
-- Execute este script após o deploy inicial

-- Configurar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configurar parâmetros de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Configurar timeouts
ALTER SYSTEM SET statement_timeout = '30s';
ALTER SYSTEM SET idle_in_transaction_session_timeout = '60s';
ALTER SYSTEM SET lock_timeout = '10s';

-- Configurar logging para produção
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;

-- Criar índices adicionais para performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_created_at ON public.quizzes(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_results_created_at ON public.quiz_results(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_leads_created_at ON public.quiz_leads(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_plan_type ON public.user_profiles(plan_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_subscription_status ON public.user_profiles(subscription_status);

-- Configurar autovacuum para tabelas críticas
ALTER TABLE public.quizzes SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.quiz_results SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.quiz_analytics SET (autovacuum_vacuum_scale_factor = 0.05);

-- Criar função para limpeza de dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Remover resultados de quiz incompletos com mais de 7 dias
    DELETE FROM public.quiz_results 
    WHERE completed_at IS NULL 
    AND created_at < NOW() - INTERVAL '7 days';
    
    -- Remover analytics com mais de 2 anos
    DELETE FROM public.quiz_analytics 
    WHERE date < CURRENT_DATE - INTERVAL '2 years';
    
    -- Log da limpeza
    RAISE NOTICE 'Limpeza de dados antigos executada em %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza automática (executar manualmente ou via cron)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');

-- Criar função para monitoramento de performance
CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS TABLE (
    table_name text,
    total_size text,
    index_size text,
    row_count bigint,
    seq_scan bigint,
    idx_scan bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        seq_scan,
        idx_scan
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Comentário final
COMMENT ON FUNCTION cleanup_old_data() IS 'Função para limpeza automática de dados antigos';
COMMENT ON FUNCTION get_performance_stats() IS 'Função para monitoramento de performance das tabelas';

-- Recarregar configuração (requer reinicialização do PostgreSQL)
-- SELECT pg_reload_conf();