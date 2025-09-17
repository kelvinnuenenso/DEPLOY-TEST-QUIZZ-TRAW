import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ExpandedTemplates from '@/components/quiz/ExpandedTemplates';
import { Quiz, Question } from '@/types/quiz';
import { saveQuiz } from '@/lib/quizzes';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<Record<string, unknown>>;
  questions: Omit<Question, 'id'>[];
  outcomes: Record<string, unknown>;
  theme: Record<string, unknown>;
  tags: string[];
}

const Templates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectTemplate = async (template: QuizTemplate) => {
    setIsCreating(true);
    
    try {
      const newQuiz: Quiz = {
        id: crypto.randomUUID(),
        publicId: Math.random().toString(36).slice(2, 8),
        name: template.name,
        description: template.description,
        status: 'draft',
        theme: template.theme,
        settings: {
          progressBar: true,
          requireEmail: false
        },
        questions: template.questions.map((q, index) => ({
          ...q,
          id: crypto.randomUUID(),
          idx: index + 1,
          options: q.options?.map(opt => ({
            ...opt,
            id: crypto.randomUUID()
          }))
        })),
        outcomes: template.outcomes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveQuiz(newQuiz);
      
      toast({
        title: "Template aplicado!",
        description: "Quiz criado com sucesso a partir do template."
      });

      navigate(`/app/edit/${newQuiz.id}`);
    } catch (error) {
      console.error('Error creating quiz from template:', error);
      toast({
        title: "Erro ao criar quiz",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground">Templates de Quiz</h1>
              <p className="text-muted-foreground mt-1">
                Comece rapidamente com templates profissionais
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ExpandedTemplates 
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Criando quiz a partir do template...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;