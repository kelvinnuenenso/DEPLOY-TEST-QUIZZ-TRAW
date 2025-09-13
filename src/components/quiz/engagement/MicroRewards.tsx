import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { QuizTheme } from '@/types/quiz';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimationStylePreview } from './AnimationStylePreview';
import { 
  Gift, 
  Sparkles, 
  Star, 
  CheckCircle,
  Volume2,
  Play,
  Trophy,
  Zap
} from 'lucide-react';

interface MicroRewardsProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  quizId: string;
}

export function MicroRewards({ theme, onUpdate, quizId }: MicroRewardsProps) {
  const isMobile = useIsMobile();
  
  const getRewardsConfig = () => ({
    enabled: theme.microRewardsEnabled || false,
    visualFeedback: {
      confetti: theme.microRewardsConfetti || true,
      icons: theme.microRewardsIcons || true,
      animations: theme.microRewardsAnimations || true,
    },
    soundFeedback: {
      enabled: theme.microRewardsSounds || false,
      volume: theme.microRewardsSoundVolume || 50,
      achievement: theme.microRewardsAchievementSound || 'chime',
    },
    finalScore: {
      enabled: theme.microRewardsFinalScore || true,
      showProfile: theme.microRewardsShowProfile || true,
      customProfiles: theme.microRewardsCustomProfiles || [],
    }
  });

  const config = getRewardsConfig();

  const handleUpdate = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const updateVisualFeedback = (key: string, value: boolean) => {
    handleUpdate({ [`microRewards${key.charAt(0).toUpperCase() + key.slice(1)}`]: value });
  };

  const updateSoundFeedback = (key: string, value: any) => {
    handleUpdate({ [`microRewardsSound${key.charAt(0).toUpperCase() + key.slice(1)}`]: value });
  };

  const updateFinalScore = (key: string, value: any) => {
    handleUpdate({ [`microRewards${key.charAt(0).toUpperCase() + key.slice(1)}`]: value });
  };

  const availableIcons = [
    { name: 'checkmark', icon: CheckCircle, label: '✔️ Check' },
    { name: 'star', icon: Star, label: '⭐ Estrela' },
    { name: 'trophy', icon: Trophy, label: '🏆 Troféu' },
    { name: 'lightning', icon: Zap, label: '💡 Raio' },
  ];

  const soundOptions = [
    { value: 'chime', label: '🔔 Sino' },
    { value: 'ding', label: '✨ Ding' },
    { value: 'success', label: '🎯 Sucesso' },
    { value: 'coin', label: '🪙 Moeda' },
  ];

  const defaultProfiles = [
    {
      id: '1',
      name: 'Criador Estratégico',
      description: 'Você tem uma mente analítica e sempre busca otimizar resultados.',
      scoreRange: { min: 80, max: 100 },
      icon: '🎯',
      cta: 'Descubra como potencializar seus resultados'
    },
    {
      id: '2', 
      name: 'Inovador Criativo',
      description: 'Sua criatividade é seu maior diferencial competitivo.',
      scoreRange: { min: 60, max: 79 },
      icon: '💡',
      cta: 'Veja como expandir sua criatividade'
    },
    {
      id: '3',
      name: 'Executor Prático',
      description: 'Você transforma ideias em resultados concretos.',
      scoreRange: { min: 40, max: 59 },
      icon: '⚡',
      cta: 'Aprenda a ser ainda mais eficiente'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Feedback Imediato com Micro-Recompensas</h3>
              <p className="text-sm text-muted-foreground">
                Recompensas visuais e sonoras para manter o engajamento
              </p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => handleUpdate({ microRewardsEnabled: enabled })}
          />
        </div>
      </Card>

      {config.enabled && (
        <>
          {/* Visual Feedback */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Feedback Visual
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Confetes Animados</Label>
                  <p className="text-xs text-muted-foreground">🎉 Explosão de confetes ao responder</p>
                </div>
                <Switch
                  checked={config.visualFeedback.confetti}
                  onCheckedChange={(enabled) => updateVisualFeedback('confetti', enabled)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Ícones Animados</Label>
                  <p className="text-xs text-muted-foreground">Ícones de conquista com animação</p>
                </div>
                <Switch
                  checked={config.visualFeedback.icons}
                  onCheckedChange={(enabled) => updateVisualFeedback('icons', enabled)}
                />
              </div>

              {config.visualFeedback.icons && (
                <div className="ml-4 space-y-2">
                  <Label className="text-xs text-muted-foreground">Ícones Disponíveis</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableIcons.map((icon) => {
                      const Icon = icon.icon;
                      return (
                        <Button
                          key={icon.name}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {icon.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Animações de Transição</Label>
                  <p className="text-xs text-muted-foreground">Efeitos suaves entre perguntas</p>
                </div>
                <Switch
                  checked={config.visualFeedback.animations}
                  onCheckedChange={(enabled) => updateVisualFeedback('animations', enabled)}
                />
              </div>
            </div>
          </Card>

          {/* Sound Feedback */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Feedback Sonoro
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Sons de Conquista</Label>
                  <p className="text-xs text-muted-foreground">🔔 Áudio ao responder perguntas</p>
                </div>
                <Switch
                  checked={config.soundFeedback.enabled}
                  onCheckedChange={(enabled) => updateSoundFeedback('s', enabled)}
                />
              </div>

              {config.soundFeedback.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Volume: {config.soundFeedback.volume}%
                    </Label>
                    <Slider
                      value={[config.soundFeedback.volume]}
                      onValueChange={([volume]) => updateSoundFeedback('Volume', volume)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Tipo de Som</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {soundOptions.map((sound) => (
                        <Button
                          key={sound.value}
                          variant={config.soundFeedback.achievement === sound.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateSoundFeedback('Achievement', sound.value)}
                          className="justify-start"
                        >
                          {sound.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Testar Som
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Final Score & Profiles */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Pontuação Final e Perfis
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Exibir Pontuação Final</Label>
                  <p className="text-xs text-muted-foreground">Mostrar score no final do quiz</p>
                </div>
                <Switch
                  checked={config.finalScore.enabled}
                  onCheckedChange={(enabled) => updateFinalScore('FinalScore', enabled)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Perfil Personalizado</Label>
                  <p className="text-xs text-muted-foreground">
                    "Seu perfil é Criador Estratégico – veja como melhorar"
                  </p>
                </div>
                <Switch
                  checked={config.finalScore.showProfile}
                  onCheckedChange={(enabled) => updateFinalScore('ShowProfile', enabled)}
                />
              </div>

              {config.finalScore.showProfile && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Perfis Padrão</Label>
                    <Button variant="outline" size="sm">
                      Editar Perfis
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {defaultProfiles.map((profile, index) => (
                      <div key={profile.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{profile.icon}</span>
                              <h5 className="font-medium text-sm">{profile.name}</h5>
                              <span className="text-xs text-muted-foreground">
                                ({profile.scoreRange.min}-{profile.scoreRange.max} pts)
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {profile.description}
                            </p>
                            <p className="text-xs font-medium text-primary">
                              {profile.cta}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      💡 <strong>Dica:</strong> Você pode editar esses perfis na aba "Resultados" 
                      para personalizar completamente a experiência final do usuário.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Preview das Animações */}
          <AnimationStylePreview
            animationStyle={theme.defaultAnimation || 'bounce'}
            completionEffect={theme.completionEffect || 'confetti'}
            effectIntensity={theme.effectIntensity || 'medium'}
            animationSpeed={theme.animationSpeed || 'normal'}
          />
        </>
      )}
    </div>
  );
}