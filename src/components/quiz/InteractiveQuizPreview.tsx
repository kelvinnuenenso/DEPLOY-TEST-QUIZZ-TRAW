import { useState } from 'react';
import { Quiz, QuizStep, Component } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Edit3, Play, Palette, Eye } from 'lucide-react';

interface InteractiveQuizPreviewProps {
  quiz: Quiz;
  onEditMode: () => void;
  onSave: () => void;
  onPreview: () => void;
}

export function InteractiveQuizPreview({
  quiz,
  onEditMode,
  onSave,
  onPreview
}: InteractiveQuizPreviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});

  const steps = quiz.steps || [];
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleAnswerSelect = (componentId: string, value: any) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [componentId]: value
    }));
  };

  const renderComponent = (component: Component) => {
    const theme = quiz.theme;
    
    switch (component.type) {
      case 'title':
        return (
          <h2 
            className="text-2xl font-bold text-center mb-4 animate-fade-in"
            style={{ 
              color: theme?.text || '#0B0B0B',
              fontFamily: theme?.fontFamily || 'Inter, sans-serif',
              fontSize: component.style?.fontSize || '24px'
            }}
          >
            {component.content}
          </h2>
        );

      case 'text':
        return (
          <p 
            className="text-center mb-6 opacity-80 animate-fade-in"
            style={{ 
              color: theme?.text || '#0B0B0B',
              fontFamily: theme?.fontFamily || 'Inter, sans-serif',
              fontSize: component.style?.fontSize || '16px'
            }}
          >
            {component.content}
          </p>
        );

      case 'multiple_choice':
        const content = component.content || {};
        const options = content.options || [];

        return (
          <div className="space-y-4 animate-fade-in">
            <h3 
              className="text-xl font-semibold text-center mb-6"
              style={{ 
                color: theme?.text || '#0B0B0B',
                fontFamily: theme?.fontFamily || 'Inter, sans-serif'
              }}
            >
              {content.question || 'Pergunta não configurada'}
            </h3>
            
            {content.description && (
              <p 
                className="text-center mb-6 opacity-70"
                style={{ color: theme?.text || '#0B0B0B' }}
              >
                {content.description}
              </p>
            )}
            
            <div className="grid gap-3">
              {options.map((option: any, index: number) => (
                <Button
                  key={option.id || index}
                  variant="outline"
                  className="p-4 h-auto text-left hover-scale transition-all duration-200"
                  onClick={() => handleAnswerSelect(component.id, option)}
                  style={{
                    backgroundColor: selectedAnswers[component.id] === option 
                      ? theme?.primary : theme?.cardBackground || '#FFFFFF',
                    color: selectedAnswers[component.id] === option 
                      ? '#FFFFFF' : theme?.text || '#0B0B0B',
                    borderRadius: theme?.borderRadius || '12px',
                    borderColor: theme?.accent || '#E5E7EB'
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label || option.value || 'Opção'}</span>
                    {option.score && (
                      <Badge 
                        variant="secondary"
                        className="ml-2 text-xs"
                        style={{ 
                          backgroundColor: theme?.accent + '20',
                          color: theme?.text
                        }}
                      >
                        {option.score} pts
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'level_slider':
        const sliderContent = component.content || {};

        return (
          <div className="space-y-6 animate-fade-in">
            <h3 
              className="text-xl font-semibold text-center"
              style={{ 
                color: theme?.text || '#0B0B0B',
                fontFamily: theme?.fontFamily || 'Inter, sans-serif'
              }}
            >
              {sliderContent.question || sliderContent.label || 'Avalie de 1 a 10'}
            </h3>
            
            {sliderContent.description && (
              <p 
                className="text-center mb-6 opacity-70"
                style={{ color: theme?.text || '#0B0B0B' }}
              >
                {sliderContent.description}
              </p>
            )}
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm" style={{ color: theme?.text }}>
                <span>{sliderContent.min || 1}</span>
                <span>{sliderContent.max || 10}</span>
              </div>
              <input
                type="range"
                min={sliderContent.min || 1}
                max={sliderContent.max || 10}
                step={sliderContent.step || 1}
                value={selectedAnswers[component.id] || sliderContent.defaultValue || 5}
                onChange={(e) => handleAnswerSelect(component.id, e.target.value)}
                className="w-full"
                style={{ accentColor: theme?.primary }}
              />
              <div className="text-center">
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: theme?.primary + '20',
                    color: theme?.primary
                  }}
                >
                  Valor: {selectedAnswers[component.id] || sliderContent.defaultValue || 5}
                </Badge>
              </div>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="text-center">
            <Button
              onClick={nextStep}
              className="hover-scale transition-all duration-200"
              style={{
                backgroundColor: theme?.primary || '#2563EB',
                borderRadius: theme?.borderRadius || '12px',
                background: theme?.gradient 
                  ? `linear-gradient(135deg, ${theme?.primary}, ${theme?.accent})`
                  : theme?.primary
              }}
            >
              {component.content || 'Continuar'}
            </Button>
          </div>
        );

      default:
        return (
          <div 
            className="p-4 border rounded-lg bg-muted/50"
            style={{ borderRadius: theme?.borderRadius }}
          >
            <p className="text-sm text-muted-foreground">
              Componente: {component.type}
            </p>
          </div>
        );
    }
  };

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Nenhuma etapa configurada</h3>
          <p className="text-muted-foreground">
            Configure perguntas e gere o fluxo automático no modo simples.
          </p>
          <Button onClick={onEditMode} className="gap-2">
            <Edit3 className="w-4 h-4" />
            Editar Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header com controles */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Preview Interativo</h3>
            <p className="text-sm text-green-600">
              Quiz pronto com tema aplicado
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Palette className="w-3 h-3" />
            Tema aplicado
          </Badge>
          <Button variant="outline" onClick={onPreview} className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={onEditMode} className="gap-2">
            <Edit3 className="w-4 h-4" />
            Editar
          </Button>
          <Button onClick={onSave} className="gap-2">
            Salvar
          </Button>
        </div>
      </div>

      {/* Barra de progresso */}
      {totalSteps > 1 && (
        <div className="p-4 border-b">
          <div className="flex justify-between text-sm mb-2" style={{ color: quiz.theme?.text }}>
            <span>Progresso</span>
            <span>{currentStepIndex + 1} de {totalSteps}</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
            style={{ backgroundColor: quiz.theme?.accent + '20' }}
          />
        </div>
      )}

      {/* Conteúdo da etapa */}
      <div 
        className="flex-1 p-8 overflow-y-auto"
        style={{ 
          backgroundColor: quiz.theme?.background || '#FFFFFF',
          fontFamily: quiz.theme?.fontFamily || 'Inter, sans-serif'
        }}
      >
        <Card 
          className="max-w-2xl mx-auto p-8 border-2 min-h-[400px] flex flex-col justify-center"
          style={{ 
            backgroundColor: quiz.theme?.cardBackground || '#FFFFFF',
            borderRadius: quiz.theme?.borderRadius || '12px',
            borderColor: quiz.theme?.accent || '#E5E7EB'
          }}
        >
          <div className="space-y-6">
            {currentStep.components.map((component) => (
              <div key={component.id}>
                {renderComponent(component)}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Navegação */}
      {totalSteps > 1 && (
        <div className="flex justify-between items-center p-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStepIndex(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === currentStepIndex 
                    ? "bg-primary" 
                    : "bg-muted-foreground/30"
                )}
                style={{ 
                  backgroundColor: index === currentStepIndex 
                    ? quiz.theme?.primary 
                    : undefined 
                }}
              />
            ))}
          </div>
          
          <Button
            onClick={nextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className="gap-2"
            style={{ backgroundColor: quiz.theme?.primary }}
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}