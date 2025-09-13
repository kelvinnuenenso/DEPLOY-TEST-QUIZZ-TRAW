import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getResult } from '@/lib/quizzes';
import { loadQuiz } from '@/lib/quizzes';
import { Result, Quiz, QuizOutcome } from '@/types/quiz';
import { Trophy, Star, Target, Zap, Heart, Award, ExternalLink, Share2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const outcomeIcons = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  heart: Heart,
  award: Award
};

const ResultPage = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<Result | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      if (!resultId) return;
      
      try {
        const loadedResult = await getResult(resultId);
        if (!loadedResult) {
          throw new Error('Result not found');
        }
        
        setResult(loadedResult);
        
        // Load the quiz to get outcome information
        const loadedQuiz = await loadQuiz(loadedResult.quizId);
        if (loadedQuiz) {
          setQuiz(loadedQuiz);
          
          // Determine the outcome based on score
          if (loadedQuiz.outcomes) {
            const outcomes = Object.entries(loadedQuiz.outcomes);
            
            if (outcomes.length === 1) {
              // Single outcome
              setOutcome(outcomes[0][1]);
            } else {
              // Dynamic outcomes based on score
              const score = loadedResult.score || 0;
              const matchingOutcome = outcomes.find(([key, outcome]) => {
                if (outcome.scoreRange) {
                  return score >= outcome.scoreRange.min && score <= outcome.scoreRange.max;
                }
                return false;
              });
              
              if (matchingOutcome) {
                setOutcome(matchingOutcome[1]);
              } else {
                // Fallback to first outcome
                setOutcome(outcomes[0][1]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [resultId]);

  const shareResult = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: outcome?.title || 'Meu resultado do quiz',
        text: outcome?.description || 'Veja meu resultado neste quiz interessante!',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link do resultado foi copiado para sua área de transferência."
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  if (!result || !quiz || !outcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Resultado não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O resultado que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </Card>
      </div>
    );
  }

  const IconComponent = outcome.icon ? outcomeIcons[outcome.icon as keyof typeof outcomeIcons] || Star : Star;
  const completionTime = result.completedAt && result.startedAt 
    ? Math.round((new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000 / 60)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">EQ</span>
              </div>
              <span className="font-semibold text-primary text-sm">Elevado Quizz</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={shareResult}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Result content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-xl border-0 mb-8">
            <div className="text-center mb-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${outcome.color || '#3B82F6'}20` }}
              >
                <IconComponent 
                  className="w-10 h-10" 
                  style={{ color: outcome.color || '#3B82F6' }}
                />
              </div>
              
              <h1 className="text-3xl font-bold mb-4">
                {outcome.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {outcome.description}
              </p>

              {result.score !== undefined && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Sua pontuação</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {result.score} pontos
                    </Badge>
                  </div>
                  <Progress 
                    value={(result.score / 100) * 100} 
                    className="h-3"
                  />
                </div>
              )}

              {/* CTA Button */}
              {outcome.cta && outcome.cta.href && outcome.cta.href !== '#' && (
                <Button 
                  size="lg" 
                  className="w-full mb-6"
                  asChild
                  style={{ 
                    backgroundColor: outcome.color || '#3B82F6',
                    borderColor: outcome.color || '#3B82F6'
                  }}
                >
                  <a 
                    href={outcome.cta.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    {outcome.cta.label}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(`/q/${quiz.publicId}`, '_blank')}
                >
                  Fazer novamente
                </Button>
                <Button variant="outline" className="flex-1" onClick={shareResult}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar resultado
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;