-- Criação das tabelas para o sistema de quizzes
-- Migration: 001_quiz_schema.sql

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de perfis de usuário (estende auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela principal de quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  public_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'base64url'),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  theme JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  outcomes JSONB DEFAULT '{}',
  flow JSONB DEFAULT '{}',
  game_settings JSONB DEFAULT '{}',
  pixel_settings JSONB DEFAULT '{}',
  custom_domain JSONB DEFAULT '{}',
  redirect_settings JSONB DEFAULT '{}',
  seo JSONB DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  starts_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de perguntas
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  idx INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'rating', 'nps', 'slider', 'short_text', 'long_text', 'email', 'phone', 'date', 'file', 'consent', 'cta')),
  title TEXT NOT NULL,
  description TEXT,
  options JSONB DEFAULT '[]',
  required BOOLEAN DEFAULT false,
  logic JSONB DEFAULT '{}',
  score_weight NUMERIC DEFAULT 1.0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, idx)
);

-- Tabela de resultados de quiz
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score NUMERIC,
  outcome_key TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de respostas
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  value JSONB NOT NULL,
  score NUMERIC DEFAULT 0,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de leads capturados
CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  consent_marketing BOOLEAN DEFAULT false,
  consent_data_processing BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'quiz',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de analytics agregados (para performance)
CREATE TABLE IF NOT EXISTS public.quiz_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  average_score NUMERIC DEFAULT 0,
  average_time_spent INTEGER DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON public.quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_public_id ON public.quizzes(public_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_idx ON public.quiz_questions(quiz_id, idx);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON public.quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_session_id ON public.quiz_results(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON public.quiz_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_result_id ON public.quiz_answers(result_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_quiz_id ON public.quiz_leads(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON public.quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_analytics_quiz_id_date ON public.quiz_analytics(quiz_id, date);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_analytics_updated_at BEFORE UPDATE ON public.quiz_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar contadores de quiz
CREATE OR REPLACE FUNCTION update_quiz_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador baseado no tipo de evento
        IF TG_TABLE_NAME = 'quiz_results' THEN
            IF NEW.completed_at IS NULL THEN
                -- Quiz iniciado
                UPDATE public.quizzes 
                SET starts_count = starts_count + 1 
                WHERE id = NEW.quiz_id;
            ELSE
                -- Quiz completado
                UPDATE public.quizzes 
                SET completions_count = completions_count + 1 
                WHERE id = NEW.quiz_id;
            END IF;
        ELSIF TG_TABLE_NAME = 'quiz_leads' THEN
            -- Lead capturado
            UPDATE public.quizzes 
            SET leads_count = leads_count + 1 
            WHERE id = NEW.quiz_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'quiz_results' THEN
        -- Quiz foi completado (completed_at foi preenchido)
        IF OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL THEN
            UPDATE public.quizzes 
            SET completions_count = completions_count + 1 
            WHERE id = NEW.quiz_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers para contadores
CREATE TRIGGER quiz_results_counter_trigger 
    AFTER INSERT OR UPDATE ON public.quiz_results 
    FOR EACH ROW EXECUTE FUNCTION update_quiz_counters();

CREATE TRIGGER quiz_leads_counter_trigger 
    AFTER INSERT ON public.quiz_leads 
    FOR EACH ROW EXECUTE FUNCTION update_quiz_counters();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para quizzes
CREATE POLICY "Users can view own quizzes" ON public.quizzes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quizzes" ON public.quizzes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON public.quizzes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes" ON public.quizzes
    FOR DELETE USING (auth.uid() = user_id);

-- Política para visualização pública de quizzes publicados
CREATE POLICY "Public can view published quizzes" ON public.quizzes
    FOR SELECT USING (status = 'published');

-- Políticas RLS para quiz_questions
CREATE POLICY "Users can manage questions of own quizzes" ON public.quiz_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = quiz_questions.quiz_id 
            AND quizzes.user_id = auth.uid()
        )
    );

-- Política para visualização pública de perguntas de quizzes publicados
CREATE POLICY "Public can view questions of published quizzes" ON public.quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = quiz_questions.quiz_id 
            AND quizzes.status = 'published'
        )
    );

-- Políticas RLS para quiz_results
CREATE POLICY "Users can view results of own quizzes" ON public.quiz_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = quiz_results.quiz_id 
            AND quizzes.user_id = auth.uid()
        )
    );

-- Política para inserção pública de resultados
CREATE POLICY "Anyone can create quiz results" ON public.quiz_results
    FOR INSERT WITH CHECK (true);

-- Políticas RLS para quiz_answers
CREATE POLICY "Users can view answers of own quiz results" ON public.quiz_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quiz_results 
            JOIN public.quizzes ON quizzes.id = quiz_results.quiz_id
            WHERE quiz_results.id = quiz_answers.result_id 
            AND quizzes.user_id = auth.uid()
        )
    );

-- Política para inserção pública de respostas
CREATE POLICY "Anyone can create quiz answers" ON public.quiz_answers
    FOR INSERT WITH CHECK (true);

-- Políticas RLS para quiz_leads
CREATE POLICY "Users can view leads of own quizzes" ON public.quiz_leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = quiz_leads.quiz_id 
            AND quizzes.user_id = auth.uid()
        )
    );

-- Política para inserção pública de leads
CREATE POLICY "Anyone can create quiz leads" ON public.quiz_leads
    FOR INSERT WITH CHECK (true);

-- Políticas RLS para quiz_analytics
CREATE POLICY "Users can view analytics of own quizzes" ON public.quiz_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = quiz_analytics.quiz_id 
            AND quizzes.user_id = auth.uid()
        )
    );

-- Função para buscar quiz por public_id
CREATE OR REPLACE FUNCTION get_quiz_by_public_id(public_id_param TEXT)
RETURNS TABLE (
    id UUID,
    public_id TEXT,
    name TEXT,
    description TEXT,
    theme JSONB,
    settings JSONB,
    outcomes JSONB,
    questions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.public_id,
        q.name,
        q.description,
        q.theme,
        q.settings,
        q.outcomes,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', qq.id,
                    'idx', qq.idx,
                    'type', qq.type,
                    'title', qq.title,
                    'description', qq.description,
                    'options', qq.options,
                    'required', qq.required,
                    'logic', qq.logic,
                    'score_weight', qq.score_weight,
                    'settings', qq.settings
                ) ORDER BY qq.idx
            ), '[]'::json
        )::jsonb as questions
    FROM public.quizzes q
    LEFT JOIN public.quiz_questions qq ON q.id = qq.quiz_id
    WHERE q.public_id = public_id_param AND q.status = 'published'
    GROUP BY q.id, q.public_id, q.name, q.description, q.theme, q.settings, q.outcomes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE public.user_profiles IS 'Perfis de usuário estendidos';
COMMENT ON TABLE public.quizzes IS 'Tabela principal de quizzes';
COMMENT ON TABLE public.quiz_questions IS 'Perguntas dos quizzes';
COMMENT ON TABLE public.quiz_results IS 'Resultados/sessões de quiz';
COMMENT ON TABLE public.quiz_answers IS 'Respostas individuais';
COMMENT ON TABLE public.quiz_leads IS 'Leads capturados através dos quizzes';
COMMENT ON TABLE public.quiz_analytics IS 'Analytics agregados por data';