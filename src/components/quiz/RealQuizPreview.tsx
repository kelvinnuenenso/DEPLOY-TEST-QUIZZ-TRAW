import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Quiz, QuizStep, Component, QuizTheme } from '@/types/quiz';
import { FakeProgressBar } from './FakeProgressBar';
import { Star, ArrowRight, Play, PartyPopper } from 'lucide-react';

interface RealQuizPreviewProps {
  quiz: Quiz;
  activeStepId?: string;
  className?: string;
}

export function RealQuizPreview({ quiz, activeStepId, className = '' }: RealQuizPreviewProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  const currentStep = quiz.steps?.find(step => step.id === activeStepId) || quiz.steps?.[0];
  const stepIndex = quiz.steps?.findIndex(step => step.id === activeStepId) ?? 0;
  const progress = quiz.steps ? ((stepIndex + 1) / quiz.steps.length) * 100 : 0;

  if (!currentStep) {
    return (
      <div className={`min-h-[600px] flex items-center justify-center ${className}`}>
        <Card className="p-8 text-center">
          <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma etapa selecionada</h3>
          <p className="text-muted-foreground">Selecione uma etapa na barra lateral para ver o preview.</p>
        </Card>
      </div>
    );
  }

  // Aplicar tema exatamente como no QuizRunner
  const getThemeStyles = () => ({
    backgroundColor: quiz.theme?.background || '#FAFAFA',
    color: quiz.theme?.text || '#1F2937',
    fontFamily: quiz.theme?.fontFamily || 'Inter, sans-serif',
    minHeight: '100vh'
  });

  const getCardStyles = () => ({
    backgroundColor: quiz.theme?.cardBackground || '#FFFFFF',
    borderRadius: quiz.theme?.borderRadius || '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  });

  const getButtonStyles = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const baseStyles = {
      borderRadius: quiz.theme?.buttonStyle === 'pill' ? '999px' : quiz.theme?.borderRadius || '12px',
      transition: 'all 0.2s ease-in-out'
    };

    if (variant === 'primary') {
      return {
        ...baseStyles,
        background: quiz.theme?.gradient 
          ? `linear-gradient(135deg, ${quiz.theme.primary}, ${quiz.theme.accent})`
          : quiz.theme?.primary || '#2563EB',
        color: quiz.theme?.cardBackground || '#FFFFFF',
        border: 'none'
      };
    }

    if (variant === 'outline') {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderColor: quiz.theme?.primary || '#2563EB',
        color: quiz.theme?.text || '#1F2937',
        borderWidth: '2px'
      };
    }

    return baseStyles;
  };

  const getMaxWidth = () => {
    switch (quiz.theme?.maxWidth) {
      case 'small': return 'max-w-xl';
      case 'medium': return 'max-w-2xl';
      case 'large': return 'max-w-4xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-2xl';
    }
  };

  const renderComponent = (component: Component, index: number) => {
    const { type, content } = component;

    switch (type) {
      case 'title':
        const level = content?.level || 'h1';
        const TitleTag = level as keyof JSX.IntrinsicElements;
        const titleStyles = {
          color: quiz.theme?.text || '#1F2937',
          fontFamily: quiz.theme?.fontFamily || 'Inter, sans-serif',
          textAlign: quiz.theme?.centerAlign ? 'center' as const : 'left' as const
        };

        return (
          <TitleTag 
            key={component.id}
            style={titleStyles}
            className={`font-bold mb-4 ${
              level === 'h1' ? 'text-3xl md:text-4xl' :
              level === 'h2' ? 'text-2xl md:text-3xl' :
              level === 'h3' ? 'text-xl md:text-2xl' : 'text-lg'
            }`}
          >
            {content?.text || 'Título'}
          </TitleTag>
        );

      case 'text':
        return (
          <p 
            key={component.id}
            style={{
              color: quiz.theme?.text || '#1F2937',
              fontFamily: quiz.theme?.fontFamily || 'Inter, sans-serif',
              textAlign: quiz.theme?.centerAlign ? 'center' : 'left'
            }}
            className={`mb-6 ${
              content?.style === 'subtitle' ? 'text-lg text-muted-foreground' :
              content?.style === 'small' ? 'text-sm' : 'text-base'
            }`}
          >
            {content?.text || 'Texto do parágrafo...'}
          </p>
        );

      case 'button':
        return (
          <div key={component.id} className={`mb-6 ${quiz.theme?.centerAlign ? 'text-center' : ''}`}>
            <Button
              style={getButtonStyles(content?.variant || 'primary')}
              size="lg"
              className="min-w-[200px] font-semibold hover:scale-105 transition-transform"
            >
              {content?.text || 'Clique aqui'}
              {content?.action === 'next' && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        );

      case 'input':
        const inputId = `input-${component.id}`;
        const inputType = content?.type || 'text';
        
        return (
          <div key={component.id} className="mb-6 space-y-3">
            {content?.label && (
              <label 
                htmlFor={inputId}
                style={{ color: quiz.theme?.text || '#1F2937' }}
                className="block text-sm font-medium"
              >
                {content.label}
                {content?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            
            {inputType === 'textarea' ? (
              <Textarea
                id={inputId}
                placeholder={content?.placeholder || 'Digite sua resposta...'}
                value={inputValues[component.id] || ''}
                onChange={(e) => setInputValues(prev => ({ ...prev, [component.id]: e.target.value }))}
                className="text-lg py-3"
                style={{
                  borderRadius: quiz.theme?.borderRadius || '8px',
                  borderColor: quiz.theme?.primary || '#E5E7EB'
                }}
                rows={4}
              />
            ) : (
              <Input
                id={inputId}
                type={inputType}
                placeholder={content?.placeholder || 'Digite sua resposta...'}
                value={inputValues[component.id] || ''}
                onChange={(e) => setInputValues(prev => ({ ...prev, [component.id]: e.target.value }))}
                className="text-lg py-3"
                style={{
                  borderRadius: quiz.theme?.borderRadius || '8px',
                  borderColor: quiz.theme?.primary || '#E5E7EB'
                }}
              />
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div key={component.id} className="mb-8 space-y-4">
            {content?.question && (
              <h3 
                style={{ color: quiz.theme?.text || '#1F2937' }}
                className="text-xl font-semibold mb-4"
              >
                {content.question}
              </h3>
            )}
            
            {content?.description && (
              <p 
                style={{ color: quiz.theme?.text + '80' || '#6B7280' }}
                className="text-base mb-6"
              >
                {content.description}
              </p>
            )}

            <div className="space-y-3">
              {(content?.options || []).map((option: any, optIndex: number) => {
                const isSelected = selectedOptions.includes(option.id);
                return (
                  <Button
                    key={option.id || optIndex}
                    variant="outline"
                    className="w-full p-4 h-auto text-left justify-start transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      ...getButtonStyles(isSelected ? 'primary' : 'outline'),
                      backgroundColor: isSelected 
                        ? (quiz.theme?.gradient 
                            ? `linear-gradient(135deg, ${quiz.theme.primary}, ${quiz.theme.accent})`
                            : quiz.theme?.primary || '#2563EB')
                        : 'transparent',
                      color: isSelected 
                        ? quiz.theme?.cardBackground || '#FFFFFF'
                        : quiz.theme?.text || '#1F2937'
                    }}
                    onClick={() => {
                      if (content?.allowMultiple) {
                        const newSelection = isSelected
                          ? selectedOptions.filter(id => id !== option.id)
                          : [...selectedOptions, option.id];
                        setSelectedOptions(newSelection);
                      } else {
                        setSelectedOptions([option.id]);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base font-medium">{option.label}</span>
                      {option.score && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 text-xs"
                          style={{ 
                            backgroundColor: quiz.theme?.accent + '20' || '#F3F4F6',
                            color: quiz.theme?.text || '#1F2937'
                          }}
                        >
                          {option.score} pts
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            {content?.allowMultiple && selectedOptions.length > 0 && (
              <Button
                style={getButtonStyles('primary')}
                size="lg"
                className="w-full mt-4 font-semibold"
              >
                Continuar ({selectedOptions.length} selecionadas)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        );

      case 'level_slider':
        const sliderId = component.id;
        const min = content?.min || 1;
        const max = content?.max || 10;
        const step = content?.step || 1;
        const currentValue = sliderValues[sliderId] || content?.defaultValue || Math.floor((min + max) / 2);

        return (
          <div key={component.id} className="mb-8 space-y-4">
            {(content?.question || content?.label) && (
              <h3 
                style={{ color: quiz.theme?.text || '#1F2937' }}
                className="text-xl font-semibold mb-4"
              >
                {content.question || content.label}
              </h3>
            )}
            
            {content?.description && (
              <p 
                style={{ color: quiz.theme?.text + '80' || '#6B7280' }}
                className="text-base mb-6"
              >
                {content.description}
              </p>
            )}

            <div className="px-2 space-y-4">
              <div className="relative">
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={currentValue}
                  onChange={(e) => setSliderValues(prev => ({ 
                    ...prev, 
                    [sliderId]: parseInt(e.target.value) 
                  }))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${quiz.theme?.primary || '#2563EB'} 0%, ${quiz.theme?.primary || '#2563EB'} ${((currentValue - min) / (max - min)) * 100}%, #E5E7EB ${((currentValue - min) / (max - min)) * 100}%, #E5E7EB 100%)`,
                    WebkitAppearance: 'none',
                    height: '12px',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: quiz.theme?.text + '80' || '#6B7280' }}>{min}</span>
                <div 
                  className="px-4 py-2 rounded-full font-semibold text-lg"
                  style={{
                    backgroundColor: quiz.theme?.primary || '#2563EB',
                    color: quiz.theme?.cardBackground || '#FFFFFF'
                  }}
                >
                  {currentValue}
                </div>
                <span style={{ color: quiz.theme?.text + '80' || '#6B7280' }}>{max}</span>
              </div>
            </div>
          </div>
        );

      case 'confetti':
        return (
          <div key={component.id} className="mb-6 text-center">
            <PartyPopper 
              className="w-16 h-16 mx-auto animate-bounce"
              style={{ color: quiz.theme?.primary || '#2563EB' }}
            />
            <p 
              style={{ color: quiz.theme?.text || '#1F2937' }}
              className="mt-2 text-lg font-medium"
            >
              🎉 Parabéns! 🎉
            </p>
          </div>
        );

      case 'image':
        return (
          <div key={component.id} className="mb-6">
            {content?.src ? (
              <img
                src={content.src}
                alt={content.alt || 'Imagem'}
                className="w-full h-auto rounded-lg shadow-md"
                style={{ borderRadius: quiz.theme?.borderRadius || '8px' }}
              />
            ) : (
              <div 
                className="w-full h-48 flex items-center justify-center border-2 border-dashed rounded-lg"
                style={{ 
                  borderColor: quiz.theme?.primary + '40' || '#E5E7EB',
                  borderRadius: quiz.theme?.borderRadius || '8px'
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p style={{ color: quiz.theme?.text + '60' || '#9CA3AF' }}>
                    Imagem será exibida aqui
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div 
            key={component.id} 
            className="mb-4 p-4 border-2 border-dashed rounded-lg text-center"
            style={{ 
              borderColor: quiz.theme?.primary + '40' || '#E5E7EB',
              color: quiz.theme?.text + '60' || '#9CA3AF'
            }}
          >
            <p>Componente {type} será renderizado aqui</p>
          </div>
        );
    }
  };

  return (
    <div 
      className={`min-h-[600px] ${className}`}
      style={getThemeStyles()}
    >
      {/* Barra de Progresso */}
      {quiz.theme?.showProgress && quiz.steps && quiz.steps.length > 1 && (
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b p-4">
          <div className={`mx-auto ${getMaxWidth()}`}>
            {quiz.theme?.fakeProgress ? (
              <FakeProgressBar 
                theme={quiz.theme}
                currentStep={stepIndex}
                totalSteps={quiz.steps.length}
                isActive={true}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: quiz.theme?.text || '#1F2937' }}>
                    Etapa {stepIndex + 1} de {quiz.steps.length}
                  </span>
                  <span style={{ color: quiz.theme?.text || '#1F2937' }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2"
                  style={{ 
                    backgroundColor: quiz.theme?.accent + '20' || '#E5E7EB'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6">
        <div className={`mx-auto ${getMaxWidth()}`}>
          <Card 
            className="p-8 md:p-12 shadow-xl border-0"
            style={getCardStyles()}
          >
            {/* Título da Etapa */}
            {currentStep.title && (
              <div className="mb-8 text-center">
                <h2 
                  style={{ 
                    color: quiz.theme?.text || '#1F2937',
                    fontFamily: quiz.theme?.fontFamily || 'Inter, sans-serif'
                  }}
                  className="text-2xl md:text-3xl font-bold"
                >
                  {currentStep.title}
                </h2>
                {quiz.steps && quiz.steps.length > 1 && (
                  <p 
                    style={{ color: quiz.theme?.text + '60' || '#9CA3AF' }}
                    className="text-sm mt-2"
                  >
                    {stepIndex + 1} de {quiz.steps.length}
                  </p>
                )}
              </div>
            )}

            {/* Componentes da Etapa */}
            <div className="space-y-6">
              {currentStep.components.map((component, index) => 
                renderComponent(component, index)
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}