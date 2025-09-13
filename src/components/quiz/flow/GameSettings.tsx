import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Quiz, GameSettings as GameSettingsType, GameLevel, ScoringRule } from '@/types/quiz';
import { 
  Gamepad2, Trophy, Star, Plus, Trash2, 
  Target, Zap, Award, Settings 
} from 'lucide-react';

interface GameSettingsProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
}

export function GameSettings({ quiz, onUpdate }: GameSettingsProps) {
  const [gameSettings, setGameSettings] = useState<GameSettingsType>(
    quiz.gameSettings || {
      enabled: false,
      showProgress: true,
      showScore: true,
      levels: [
        {
          id: 'beginner',
          name: 'Iniciante',
          description: 'Você está começando sua jornada!',
          minScore: 0,
          maxScore: 25,
          color: '#94a3b8',
          icon: 'star',
          rewards: ['Badge Iniciante']
        },
        {
          id: 'intermediate',
          name: 'Intermediário',
          description: 'Você está progredindo bem!',
          minScore: 26,
          maxScore: 50,
          color: '#3b82f6',
          icon: 'star',
          rewards: ['Badge Intermediário', '10% desconto']
        },
        {
          id: 'advanced',
          name: 'Avançado',
          description: 'Você domina o assunto!',
          minScore: 51,
          maxScore: 75,
          color: '#10b981',
          icon: 'trophy',
          rewards: ['Badge Avançado', '20% desconto', 'Consultoria grátis']
        },
        {
          id: 'expert',
          name: 'Especialista',
          description: 'Você é um verdadeiro expert!',
          minScore: 76,
          maxScore: 100,
          color: '#f59e0b',
          icon: 'award',
          rewards: ['Badge Expert', '30% desconto', 'Consultoria premium', 'Material exclusivo']
        }
      ],
      scoringRules: [
        {
          id: 'correct-answer',
          trigger: 'answer',
          points: 10,
          multiplier: 1
        },
        {
          id: 'step-complete',
          trigger: 'step_complete',
          points: 5,
          multiplier: 1
        },
        {
          id: 'quiz-complete',
          trigger: 'quiz_complete',
          points: 50,
          multiplier: 1
        }
      ]
    }
  );

  const updateGameSettings = (updates: Partial<GameSettingsType>) => {
    const newSettings = { ...gameSettings, ...updates };
    setGameSettings(newSettings);
    onUpdate({ ...quiz, gameSettings: newSettings });
  };

  const addLevel = () => {
    const newLevel: GameLevel = {
      id: `level-${Date.now()}`,
      name: 'Novo Nível',
      description: 'Descrição do novo nível',
      minScore: 0,
      maxScore: 100,
      color: '#6366f1',
      icon: 'star',
      rewards: []
    };
    
    updateGameSettings({
      levels: [...gameSettings.levels, newLevel]
    });
  };

  const updateLevel = (levelId: string, updates: Partial<GameLevel>) => {
    updateGameSettings({
      levels: gameSettings.levels.map(level =>
        level.id === levelId ? { ...level, ...updates } : level
      )
    });
  };

  const removeLevel = (levelId: string) => {
    updateGameSettings({
      levels: gameSettings.levels.filter(level => level.id !== levelId)
    });
  };

  const addScoringRule = () => {
    const newRule: ScoringRule = {
      id: `rule-${Date.now()}`,
      trigger: 'answer',
      points: 10,
      multiplier: 1
    };
    
    updateGameSettings({
      scoringRules: [...gameSettings.scoringRules, newRule]
    });
  };

  const updateScoringRule = (ruleId: string, updates: Partial<ScoringRule>) => {
    updateGameSettings({
      scoringRules: gameSettings.scoringRules.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    });
  };

  const removeScoringRule = (ruleId: string) => {
    updateGameSettings({
      scoringRules: gameSettings.scoringRules.filter(rule => rule.id !== ruleId)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          Configurações de Gamificação
        </h2>
        
        {/* Configurações Gerais */}
        <Card className="p-4 mb-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações Gerais
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Ativar Gamificação</Label>
                <p className="text-xs text-muted-foreground">
                  Habilita pontuação, níveis e recompensas no quiz
                </p>
              </div>
              <Switch
                checked={gameSettings.enabled}
                onCheckedChange={(enabled) => updateGameSettings({ enabled })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Mostrar Progresso</Label>
                <p className="text-xs text-muted-foreground">
                  Exibe barra de progresso durante o quiz
                </p>
              </div>
              <Switch
                checked={gameSettings.showProgress}
                onCheckedChange={(showProgress) => updateGameSettings({ showProgress })}
                disabled={!gameSettings.enabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Mostrar Pontuação</Label>
                <p className="text-xs text-muted-foreground">
                  Exibe pontuação atual do usuário
                </p>
              </div>
              <Switch
                checked={gameSettings.showScore}
                onCheckedChange={(showScore) => updateGameSettings({ showScore })}
                disabled={!gameSettings.enabled}
              />
            </div>
          </div>
        </Card>

        {/* Níveis de Progresso */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Níveis de Progresso
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addLevel}
              disabled={!gameSettings.enabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Nível
            </Button>
          </div>
          
          <div className="space-y-3">
            {gameSettings.levels.map((level, index) => (
              <Card key={level.id} className="p-3 bg-muted/50">
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: level.color }}
                  >
                    <Star className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`level-name-${level.id}`} className="text-xs">Nome</Label>
                        <Input
                          id={`level-name-${level.id}`}
                          value={level.name}
                          onChange={(e) => updateLevel(level.id, { name: e.target.value })}
                          className="text-sm"
                          disabled={!gameSettings.enabled}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`level-color-${level.id}`} className="text-xs">Cor</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id={`level-color-${level.id}`}
                            value={level.color}
                            onChange={(e) => updateLevel(level.id, { color: e.target.value })}
                            className="w-8 h-8 rounded border"
                            disabled={!gameSettings.enabled}
                          />
                          <Input
                            value={level.color}
                            onChange={(e) => updateLevel(level.id, { color: e.target.value })}
                            className="text-sm font-mono"
                            disabled={!gameSettings.enabled}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`level-description-${level.id}`} className="text-xs">Descrição</Label>
                      <Input
                        id={`level-description-${level.id}`}
                        value={level.description}
                        onChange={(e) => updateLevel(level.id, { description: e.target.value })}
                        className="text-sm"
                        disabled={!gameSettings.enabled}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`level-min-${level.id}`} className="text-xs">Score Mínimo</Label>
                        <Input
                          id={`level-min-${level.id}`}
                          type="number"
                          value={level.minScore}
                          onChange={(e) => updateLevel(level.id, { minScore: parseInt(e.target.value) })}
                          className="text-sm"
                          disabled={!gameSettings.enabled}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`level-max-${level.id}`} className="text-xs">Score Máximo</Label>
                        <Input
                          id={`level-max-${level.id}`}
                          type="number"
                          value={level.maxScore}
                          onChange={(e) => updateLevel(level.id, { maxScore: parseInt(e.target.value) })}
                          className="text-sm"
                          disabled={!gameSettings.enabled}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLevel(level.id)}
                    disabled={!gameSettings.enabled}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Regras de Pontuação */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Regras de Pontuação
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addScoringRule}
              disabled={!gameSettings.enabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Regra
            </Button>
          </div>
          
          <div className="space-y-3">
            {gameSettings.scoringRules.map((rule, index) => (
              <Card key={rule.id} className="p-3 bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`rule-trigger-${rule.id}`} className="text-xs">Gatilho</Label>
                      <select
                        id={`rule-trigger-${rule.id}`}
                        value={rule.trigger}
                        onChange={(e) => updateScoringRule(rule.id, { trigger: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                        disabled={!gameSettings.enabled}
                      >
                        <option value="answer">Resposta</option>
                        <option value="step_complete">Etapa Completa</option>
                        <option value="quiz_complete">Quiz Completo</option>
                        <option value="condition_met">Condição Atendida</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`rule-points-${rule.id}`} className="text-xs">Pontos</Label>
                      <Input
                        id={`rule-points-${rule.id}`}
                        type="number"
                        value={rule.points}
                        onChange={(e) => updateScoringRule(rule.id, { points: parseInt(e.target.value) })}
                        className="text-sm"
                        disabled={!gameSettings.enabled}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`rule-multiplier-${rule.id}`} className="text-xs">Multiplicador</Label>
                      <Input
                        id={`rule-multiplier-${rule.id}`}
                        type="number"
                        step="0.1"
                        value={rule.multiplier}
                        onChange={(e) => updateScoringRule(rule.id, { multiplier: parseFloat(e.target.value) })}
                        className="text-sm"
                        disabled={!gameSettings.enabled}
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScoringRule(rule.id)}
                    disabled={!gameSettings.enabled}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}