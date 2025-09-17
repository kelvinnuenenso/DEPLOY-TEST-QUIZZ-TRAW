import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { listQuizzes, saveQuiz } from '@/lib/quizzes';
import { localDB } from '@/lib/localStorage';
import { useAuth } from '@/hooks/useAuth';
import { Quiz } from '@/types/quiz';
import {
  Plus,
  BarChart3,
  Users,
  Eye,
  Copy,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
  LogOut,
  Settings as SettingsIcon,
  Download,
  MousePointer,
  Trophy,
  Target,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuizImporter from '@/components/quiz/QuizImporter';
import { HeatmapAnalytics } from '@/components/analytics/HeatmapAnalytics';
import { ABTestingManager } from '@/components/analytics/ABTestingManager';
import { CohortAnalysis } from '@/components/analytics/CohortAnalysis';
import { AchievementSystem } from '@/components/gamification/AchievementSystem';
import LeadsManager from '@/components/quiz/LeadsManager';
import { WebhookManager } from '@/components/integrations/WebhookManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const loadedQuizzes = await listQuizzes();
      setQuizzes(loadedQuizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async () => {
    setIsCreating(true);
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        throw new Error('Você precisa estar autenticado para criar um quiz');
      }

      const newQuiz: Quiz = {
        id: crypto.randomUUID(),
        publicId: Math.random().toString(36).slice(2, 8),
        name: 'Novo Quiz',
        description: 'Descreva seu quiz aqui...',
        status: 'draft',
        theme: {
          primary: '#2563EB',
          background: '#FFFFFF',
          text: '#0B0B0B'
        },
        settings: {
          progressBar: true,
          requireEmail: false
        },
        questions: [
          {
            id: crypto.randomUUID(),
            idx: 1,
            type: 'single',
            title: 'Qual é sua primeira pergunta?',
            description: 'Edite esta pergunta para começar',
            options: [
              { id: '1', label: 'Opção A', score: 10 },
              { id: '2', label: 'Opção B', score: 5 }
            ],
            required: true
          }
        ],
        outcomes: {
          default: {
            title: 'Obrigado pela participação!',
            description: 'Recebemos suas respostas e entraremos em contato em breve.',
            cta: {
              label: 'Falar no WhatsApp',
              href: '#'
            }
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id
      };

      const savedQuiz = await saveQuiz(newQuiz);
      await loadQuizzes();
      
      toast({
        title: "Quiz criado com sucesso!",
        description: "Você pode começar a editá-lo agora.",
        variant: "success"
      });

      navigate(`/app/edit/${savedQuiz.id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Erro ao criar quiz",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyPublicLink = (publicId: string) => {
    const url = `${window.location.origin}/q/${publicId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link do quiz foi copiado para sua área de transferência."
    });
  };

  const getQuizStats = (quizId: string) => {
    const results = localDB.getQuizResults(quizId);
    const leads = localDB.getQuizLeads(quizId);
    
    return {
      totalStarts: results.length,
      totalLeads: leads.length,
      conversionRate: results.length > 0 ? Math.round((leads.length / results.length) * 100) : 0
    };
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleImportQuiz = async (quiz: Quiz) => {
    try {
      await saveQuiz(quiz);
      await loadQuizzes();
      
      toast({
        title: "Quiz importado com sucesso!",
        description: "O quiz foi adicionado ao seu dashboard."
      });

      navigate(`/app/edit/${quiz.id}`);
    } catch (error) {
      console.error('Error saving imported quiz:', error);
      toast({
        title: "Erro ao importar quiz",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <LoadingState message="Carregando seus quizzes..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus quizzes e monitore performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                Olá, {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button 
                onClick={() => navigate('/app/settings')} 
                variant="outline" 
                className="gap-2"
              >
                <SettingsIcon className="w-4 h-4" />
                Configurações
              </Button>
              <Button onClick={handleSignOut} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Quizzes</p>
                <p className="text-2xl font-bold">{quizzes.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Respostas</p>
                <p className="text-2xl font-bold">
                  {quizzes.reduce((total, quiz) => total + getQuizStats(quiz.id).totalStarts, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leads Capturados</p>
                <p className="text-2xl font-bold">
                  {quizzes.reduce((total, quiz) => total + getQuizStats(quiz.id).totalLeads, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Conversão</p>
                <p className="text-2xl font-bold">
                  {quizzes.length > 0 
                    ? Math.round(quizzes.reduce((total, quiz) => total + getQuizStats(quiz.id).conversionRate, 0) / quizzes.length)
                    : 0}%
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="gamification">Gamificação</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Seus Quizzes</h2>
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/app/templates')} 
                  variant="outline"
                >
                  Ver Templates
                </Button>
                <Button 
                  onClick={() => setShowImporter(true)} 
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Importar Quiz
                </Button>
                <Button onClick={createQuiz} disabled={isCreating} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  {isCreating ? 'Criando...' : 'Novo Quiz'}
                </Button>
              </div>
            </div>

            {quizzes.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum quiz criado ainda</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Crie seu primeiro quiz interativo e comece a converter visitantes em leads qualificados.
                </p>
                <Button onClick={createQuiz} disabled={isCreating} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro quiz
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{quiz.name}</h3>
                          <Badge 
                            variant={quiz.status === 'published' ? 'default' : 'secondary'}
                            className={quiz.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {quiz.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </Badge>
                        </div>
                        
                        {quiz.description && (
                          <p className="text-muted-foreground mb-4">{quiz.description}</p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>{quiz?.questions?.length || 0} perguntas</span>
                          <span>{getQuizStats(quiz.id).totalStarts} respostas</span>
                          <span>{getQuizStats(quiz.id).totalLeads} leads</span>
                          <span>{getQuizStats(quiz.id).conversionRate}% conversão</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/app/edit/${quiz.id}`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>

                        {quiz.status === 'published' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/q/${quiz.publicId}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyPublicLink(quiz.publicId)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copiar link
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Tabs defaultValue="heatmap" className="space-y-4">
              <TabsList>
                <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
                <TabsTrigger value="abtest">Testes A/B</TabsTrigger>
                <TabsTrigger value="cohort">Análise de Coorte</TabsTrigger>
              </TabsList>
              
              <TabsContent value="heatmap">
                <HeatmapAnalytics quizId={quizzes[0]?.id || 'demo'} />
              </TabsContent>
              
              <TabsContent value="abtest">
                <ABTestingManager quizId={quizzes[0]?.id || 'demo'} />
              </TabsContent>
              
              <TabsContent value="cohort">
                <CohortAnalysis quizId={quizzes[0]?.id || 'demo'} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <LeadsManager quizId={quizzes[0]?.id || 'demo'} />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <WebhookManager 
              quizId={quizzes[0]?.id || 'demo'}
            />
          </TabsContent>

          <TabsContent value="gamification" className="space-y-6">
            <AchievementSystem 
              userId={user?.id || 'demo-user'} 
              onAchievementUnlocked={(achievement) => {
                toast({
                  title: "🎉 Nova Conquista!",
                  description: `Você desbloqueou: ${achievement.title}`
                });
              }}
            />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Gerenciar Quizzes</h2>
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/app/templates')} 
                  variant="outline"
                >
                  Ver Templates
                </Button>
                <Button 
                  onClick={() => setShowImporter(true)} 
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Importar Quiz
                </Button>
                <Button onClick={createQuiz} disabled={isCreating} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  {isCreating ? 'Criando...' : 'Novo Quiz'}
                </Button>
              </div>
            </div>

            {quizzes.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum quiz criado ainda</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Crie seu primeiro quiz interativo e comece a converter visitantes em leads qualificados.
                </p>
                <Button onClick={createQuiz} disabled={isCreating} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro quiz
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{quiz.name}</h3>
                          <Badge 
                            variant={quiz.status === 'published' ? 'default' : 'secondary'}
                            className={quiz.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {quiz.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </Badge>
                        </div>
                        
                        {quiz.description && (
                          <p className="text-muted-foreground mb-4">{quiz.description}</p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>{quiz?.questions?.length || 0} perguntas</span>
                          <span>{getQuizStats(quiz.id).totalStarts} respostas</span>
                          <span>{getQuizStats(quiz.id).totalLeads} leads</span>
                          <span>{getQuizStats(quiz.id).conversionRate}% conversão</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/app/edit/${quiz.id}`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>

                        {quiz.status === 'published' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/q/${quiz.publicId}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyPublicLink(quiz.publicId)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copiar link
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <QuizImporter
          open={showImporter}
          onOpenChange={setShowImporter}
          onImport={handleImportQuiz}
        />
      </div>
    </div>
  );
};

export default Dashboard;