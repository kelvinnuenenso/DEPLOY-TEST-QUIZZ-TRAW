import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Quiz, UserPersona, SimulationResult } from '@/types/quiz';
import { Play, RotateCcw, User, Target, Clock, Square } from 'lucide-react';

interface FlowSimulatorProps {
  quiz: Quiz;
  isActive: boolean;
  onClose: () => void;
}

export function FlowSimulator({ quiz, isActive, onClose }: FlowSimulatorProps) {
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const defaultPersonas: UserPersona[] = [
    {
      name: 'João - Cliente Potencial',
      age: 32,
      interests: ['tecnologia', 'negócios'],
      behavior: 'careful',
      responses: {}
    },
    {
      name: 'Maria - Lead Qualificado',
      age: 28,
      interests: ['marketing', 'vendas'],
      behavior: 'thorough',
      responses: {}
    },
    {
      name: 'Pedro - Navegador Rápido',
      age: 24,
      interests: ['inovação'],
      behavior: 'quick',
      responses: {}
    },
    {
      name: 'Ana - Usuário Aleatório',
      age: 35,
      interests: ['diversos'],
      behavior: 'random',
      responses: {}
    }
  ];

  const startSimulation = async () => {
    if (!selectedPersona) return;
    
    setIsSimulating(true);
    setSimulationResults([]);
    setCurrentStep(0);
    setProgress(0);

    // Simular navegação pelo fluxo
    const totalSteps = quiz.steps?.length || 1;
    
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      const result: SimulationResult = {
        stepId: quiz.steps?.[i]?.id || `step-${i}`,
        response: generatePersonaResponse(selectedPersona, i),
        score: Math.floor(Math.random() * 10) + 1,
        path: [`step-${i}`],
        timestamp: Date.now()
      };
      
      setSimulationResults(prev => [...prev, result]);
      setCurrentStep(i + 1);
      setProgress(((i + 1) / totalSteps) * 100);
    }
    
    setIsSimulating(false);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setSimulationResults([]);
    setCurrentStep(0);
    setProgress(0);
    setSelectedPersona(null);
  };

  const generatePersonaResponse = (persona: UserPersona, stepIndex: number) => {
    switch (persona.behavior) {
      case 'careful':
        return stepIndex % 2 === 0 ? 'Resposta detalhada e cuidadosa' : 'Preciso pensar mais sobre isso';
      case 'quick':
        return 'Resposta rápida';
      case 'thorough':
        return `Resposta muito detalhada para a etapa ${stepIndex + 1} considerando todos os aspectos`;
      case 'random':
        return ['Sim', 'Não', 'Talvez', 'Interessante', 'Não sei'][Math.floor(Math.random() * 5)];
      default:
        return 'Resposta padrão';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Play className="w-5 h-5" />
          Simulador de Fluxo
        </h2>
        
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Selecionar Persona</Label>
              <Select 
                value={selectedPersona?.name || ''} 
                onValueChange={(value) => {
                  const persona = defaultPersonas.find(p => p.name === value);
                  setSelectedPersona(persona || null);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Escolha uma persona para simular" />
                </SelectTrigger>
                <SelectContent>
                  {defaultPersonas.map((persona) => (
                    <SelectItem key={persona.name} value={persona.name}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{persona.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {persona.age} anos • {persona.behavior}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPersona && (
              <Card className="p-3 bg-muted/50">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium text-sm">{selectedPersona.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedPersona.age} anos • Comportamento: {selectedPersona.behavior}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Interesses: {selectedPersona.interests.join(', ')}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={startSimulation} 
                disabled={!selectedPersona || isSimulating}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {isSimulating ? 'Simulando...' : 'Iniciar Simulação'}
              </Button>
              
              {isSimulating && (
                <Button variant="outline" onClick={stopSimulation}>
                  <Square className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              )}
              
              <Button variant="outline" onClick={resetSimulation}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {isSimulating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso da Simulação</span>
                  <span>{currentStep} / {quiz.steps?.length || 0}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </Card>
      </div>

      {simulationResults.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Resultados da Simulação
          </h3>
          
          <div className="space-y-3">
            {simulationResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    Etapa {index + 1}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                <p className="text-sm">{result.response}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Score: {result.score}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ID: {result.stepId.slice(0, 8)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}