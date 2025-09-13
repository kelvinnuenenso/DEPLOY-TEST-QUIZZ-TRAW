import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Play, 
  Pause, 
  RotateCcw,
  Download,
  Plus,
  Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ABVariant {
  id: string;
  name: string;
  description: string;
  traffic: number;
  visitors: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  isWinner?: boolean;
  changes: ABTestChange[];
}

interface ABTestChange {
  id: string;
  type: 'text' | 'color' | 'layout' | 'button' | 'image';
  element: string;
  originalValue: string;
  newValue: string;
}

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  hypothesis: string;
  successMetric: string;
  variants: ABVariant[];
  significance: number;
  winner?: string;
  totalTraffic: number;
  duration: number; // in days
}

interface ABTestingManagerProps {
  quizId: string;
}

export const ABTestingManager = ({ quizId }: ABTestingManagerProps) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [activeTest, setActiveTest] = useState<ABTest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTest, setNewTest] = useState<Partial<ABTest>>({
    name: '',
    hypothesis: '',
    successMetric: 'conversion_rate',
    variants: []
  });

  useEffect(() => {
    loadABTests();
  }, [quizId]);

  const loadABTests = () => {
    // Simulate loading AB tests from localStorage
    const mockTests: ABTest[] = [
      {
        id: 'test_1',
        name: 'Teste de Botão Principal',
        status: 'running',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        hypothesis: 'Mudando a cor do botão para verde aumentará a conversão',
        successMetric: 'conversion_rate',
        totalTraffic: 1250,
        duration: 14,
        significance: 95,
        variants: [
          {
            id: 'variant_a',
            name: 'Original (Azul)',
            description: 'Botão azul original',
            traffic: 50,
            visitors: 625,
            conversions: 98,
            conversionRate: 15.68,
            confidence: 95,
            changes: [
              {
                id: 'change_1',
                type: 'color',
                element: 'primary-button',
                originalValue: '#3B82F6',
                newValue: '#3B82F6'
              }
            ]
          },
          {
            id: 'variant_b',
            name: 'Variação (Verde)',
            description: 'Botão verde para teste',
            traffic: 50,
            visitors: 625,
            conversions: 112,
            conversionRate: 17.92,
            confidence: 95,
            isWinner: true,
            changes: [
              {
                id: 'change_1',
                type: 'color',
                element: 'primary-button',
                originalValue: '#3B82F6',
                newValue: '#10B981'
              }
            ]
          }
        ]
      },
      {
        id: 'test_2',
        name: 'Teste de Título da Pergunta',
        status: 'completed',
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        hypothesis: 'Título mais direto melhorará o engajamento',
        successMetric: 'engagement_rate',
        totalTraffic: 2840,
        duration: 14,
        significance: 98,
        winner: 'variant_b',
        variants: [
          {
            id: 'variant_a',
            name: 'Original',
            description: 'Título original',
            traffic: 50,
            visitors: 1420,
            conversions: 1065,
            conversionRate: 75.0,
            confidence: 98,
            changes: []
          },
          {
            id: 'variant_b',
            name: 'Título Direto',
            description: 'Título mais direto e objetivo',
            traffic: 50,
            visitors: 1420,
            conversions: 1207,
            conversionRate: 85.0,
            confidence: 98,
            isWinner: true,
            changes: [
              {
                id: 'change_1',
                type: 'text',
                element: 'question-title',
                originalValue: 'Qual das opções abaixo melhor descreve sua situação atual?',
                newValue: 'Qual sua situação atual?'
              }
            ]
          }
        ]
      }
    ];

    setTests(mockTests);
    setActiveTest(mockTests.find(t => t.status === 'running') || null);
  };

  const createNewTest = () => {
    const test: ABTest = {
      id: `test_${Date.now()}`,
      name: newTest.name || 'Novo Teste A/B',
      status: 'draft',
      startDate: new Date().toISOString(),
      hypothesis: newTest.hypothesis || '',
      successMetric: newTest.successMetric || 'conversion_rate',
      totalTraffic: 0,
      duration: 14,
      significance: 95,
      variants: [
        {
          id: 'variant_a',
          name: 'Original',
          description: 'Versão atual do quiz',
          traffic: 50,
          visitors: 0,
          conversions: 0,
          conversionRate: 0,
          confidence: 0,
          changes: []
        },
        {
          id: 'variant_b',
          name: 'Variação',
          description: 'Nova versão para teste',
          traffic: 50,
          visitors: 0,
          conversions: 0,
          conversionRate: 0,
          confidence: 0,
          changes: []
        }
      ]
    };

    setTests([test, ...tests]);
    setIsCreating(false);
    setNewTest({});
  };

  const startTest = (testId: string) => {
    setTests(tests.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' as const, startDate: new Date().toISOString() }
        : test
    ));
  };

  const pauseTest = (testId: string) => {
    setTests(tests.map(test => 
      test.id === testId 
        ? { ...test, status: 'paused' as const }
        : test
    ));
  };

  const completeTest = (testId: string, winnerId: string) => {
    setTests(tests.map(test => 
      test.id === testId 
        ? { 
            ...test, 
            status: 'completed' as const, 
            endDate: new Date().toISOString(),
            winner: winnerId,
            variants: test.variants.map(v => ({ 
              ...v, 
              isWinner: v.id === winnerId 
            }))
          }
        : test
    ));
  };

  const calculateSignificance = (variantA: ABVariant, variantB: ABVariant): number => {
    // Simplified statistical significance calculation
    const n1 = variantA.visitors;
    const n2 = variantB.visitors;
    const p1 = variantA.conversionRate / 100;
    const p2 = variantB.conversionRate / 100;
    
    if (n1 === 0 || n2 === 0) return 0;
    
    const pooled = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
    const se = Math.sqrt(pooled * (1 - pooled) * ((1 / n1) + (1 / n2)));
    const z = Math.abs(p1 - p2) / se;
    
    // Convert z-score to confidence percentage (simplified)
    return Math.min(99, Math.max(0, (1 - Math.exp(-z)) * 100));
  };

  const exportTestResults = (test: ABTest) => {
    const exportData = {
      test: {
        name: test.name,
        hypothesis: test.hypothesis,
        status: test.status,
        startDate: test.startDate,
        endDate: test.endDate,
        duration: test.duration,
        significance: test.significance,
        winner: test.winner
      },
      variants: test.variants.map(v => ({
        name: v.name,
        description: v.description,
        traffic: v.traffic,
        visitors: v.visitors,
        conversions: v.conversions,
        conversionRate: v.conversionRate,
        confidence: v.confidence,
        isWinner: v.isWinner
      })),
      insights: {
        improvement: test.variants.length === 2 
          ? ((test.variants[1].conversionRate - test.variants[0].conversionRate) / test.variants[0].conversionRate * 100).toFixed(2) + '%'
          : 'N/A',
        recommendedAction: test.winner ? `Implementar variante ${test.variants.find(v => v.id === test.winner)?.name}` : 'Continuar teste',
        statisticalSignificance: test.significance >= 95 ? 'Significativo' : 'Não significativo'
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-${test.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Testes A/B</h3>
          <p className="text-muted-foreground">
            Otimize seu quiz testando diferentes variações
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Teste
        </Button>
      </div>

      {/* Active Test Summary */}
      {activeTest && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {activeTest.name}
                  <Badge variant="secondary">Em Execução</Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-1">{activeTest.hypothesis}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => pauseTest(activeTest.id)}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportTestResults(activeTest)}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {activeTest.variants.map((variant) => (
                <div key={variant.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{variant.name}</h4>
                    {variant.isWinner && <Badge>Vencedor</Badge>}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Visitantes</span>
                      <div className="text-lg font-bold">{variant.visitors.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conversões</span>
                      <div className="text-lg font-bold">{variant.conversions.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Taxa</span>
                      <div className="text-lg font-bold text-primary">
                        {variant.conversionRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Confiança</span>
                      <span>{variant.confidence}%</span>
                    </div>
                    <Progress value={variant.confidence} className="h-2" />
                  </div>
                </div>
              ))}
            </div>

            {activeTest.variants.length === 2 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-800">Resultado Atual</h4>
                    <p className="text-sm text-blue-700">
                      {activeTest.variants[1].conversionRate > activeTest.variants[0].conversionRate 
                        ? `Variação está ${((activeTest.variants[1].conversionRate - activeTest.variants[0].conversionRate) / activeTest.variants[0].conversionRate * 100).toFixed(1)}% melhor`
                        : `Original está ${((activeTest.variants[0].conversionRate - activeTest.variants[1].conversionRate) / activeTest.variants[1].conversionRate * 100).toFixed(1)}% melhor`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Significância</div>
                    <div className={`text-lg font-bold ${activeTest.significance >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {activeTest.significance}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Todos os Testes</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {test.name}
                        <Badge 
                          variant={
                            test.status === 'running' ? 'default' :
                            test.status === 'completed' ? 'secondary' :
                            test.status === 'paused' ? 'destructive' : 'outline'
                          }
                        >
                          {test.status === 'running' ? 'Executando' :
                           test.status === 'completed' ? 'Concluído' :
                           test.status === 'paused' ? 'Pausado' : 'Rascunho'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{test.hypothesis}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.status === 'draft' && (
                        <Button size="sm" onClick={() => startTest(test.id)}>
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar
                        </Button>
                      )}
                      {test.status === 'running' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => pauseTest(test.id)}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </Button>
                          <Button size="sm" onClick={() => completeTest(test.id, test.variants[1].id)}>
                            Concluir
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => exportTestResults(test)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{test.totalTraffic.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total de Visitantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{test.duration} dias</div>
                      <div className="text-sm text-muted-foreground">Duração</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${test.significance >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {test.significance}%
                      </div>
                      <div className="text-sm text-muted-foreground">Significância</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Insights de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">✅ Melhores Práticas</h4>
                  <p className="text-sm text-green-700">
                    Botões verdes mostraram 14% mais conversões que azuis.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">📊 Estatística</h4>
                  <p className="text-sm text-blue-700">
                    Títulos mais diretos aumentaram engajamento em 13%.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800">🎯 Recomendação</h4>
                  <p className="text-sm text-purple-700">
                    Teste próximo: posição dos elementos na tela.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Melhorias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { month: 'Jan', improvement: 0 },
                    { month: 'Fev', improvement: 8 },
                    { month: 'Mar', improvement: 14 },
                    { month: 'Abr', improvement: 22 },
                    { month: 'Mai', improvement: 28 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Melhoria']} />
                    <Line type="monotone" dataKey="improvement" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Teste A/B</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="significance">Nível de Significância</Label>
                  <Select defaultValue="95">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                      <SelectItem value="99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração Padrão (dias)</Label>
                  <Input id="duration" type="number" defaultValue={14} />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="auto-stop" />
                <Label htmlFor="auto-stop">Parar automaticamente quando significativo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="auto-implement" />
                <Label htmlFor="auto-implement">Implementar vencedor automaticamente</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create New Test Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Criar Novo Teste A/B</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-name">Nome do Teste</Label>
                <Input 
                  id="test-name" 
                  placeholder="Ex: Teste de Botão CTA"
                  value={newTest.name || ''}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hypothesis">Hipótese</Label>
                <Textarea 
                  id="hypothesis" 
                  placeholder="Descreva o que você espera que aconteça..."
                  value={newTest.hypothesis || ''}
                  onChange={(e) => setNewTest({ ...newTest, hypothesis: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metric">Métrica de Sucesso</Label>
                <Select 
                  value={newTest.successMetric} 
                  onValueChange={(value) => setNewTest({ ...newTest, successMetric: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversion_rate">Taxa de Conversão</SelectItem>
                    <SelectItem value="completion_rate">Taxa de Conclusão</SelectItem>
                    <SelectItem value="engagement_rate">Taxa de Engajamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={createNewTest}>
                  Criar Teste
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};