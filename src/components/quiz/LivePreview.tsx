import { useState } from 'react';
import { QuizTheme } from '@/types/quiz';
import { FakeProgressBar } from './FakeProgressBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
  theme: QuizTheme;
}

const sampleQuestions = [
  {
    id: 'q1',
    title: '🎨 Qual é a sua cor favorita?',
    description: 'Esta pergunta testa a aparência visual dos botões',
    options: ['Azul', 'Verde', 'Vermelho', 'Roxo']
  },
  {
    id: 'q2', 
    title: '⭐ Como você avalia este tema?',
    description: 'Teste a barra de progresso fake em ação',
    options: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']
  },
  {
    id: 'q3',
    title: '🚀 Funcionalidades testadas?',
    description: 'Observe como o progresso avança suavemente',
    options: ['Sim, muito bom!', 'Precisa ajustar', 'Perfeito assim']
  }
];

const LivePreview: React.FC<LivePreviewProps> = ({ theme }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isProgressing, setIsProgressing] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [answeredSteps, setAnsweredSteps] = useState(0); // Track answered questions
  const [answerTimes, setAnswerTimes] = useState<number[]>([]); // Track answer times
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  const totalSteps = 3;
  const currentQuestion = sampleQuestions[currentStep - 1];

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    
    // Track answer time for smart progress
    const answerTime = Date.now() - stepStartTime;
    const newAnswerTimes = [...answerTimes];
    newAnswerTimes[currentStep - 1] = answerTime;
    setAnswerTimes(newAnswerTimes);
    
    // Don't update answered steps here - wait for submission
    
    if (theme.fakeProgressAutoAdvance) {
      setTimeout(() => {
        handleNext();
      }, 1000);
    }
  };

  const handleNext = () => {
    // Update answered steps when submitting answer
    if (answeredSteps < currentStep) {
      setAnsweredSteps(currentStep);
    }
    
    if (currentStep < totalSteps) {
      setIsProgressing(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setSelectedAnswer(null);
        setIsProgressing(false);
        setStepStartTime(Date.now()); // Reset timer for next step
      }, 500);
    } else {
      // Quiz completo
      setShowCompletion(true);
      
      // Efeitos de conclusão
      if (theme.completionEffect === 'confetti') {
        // Simular confetti com CSS
        console.log('🎉 Confetti effect!');
      } else if (theme.completionEffect === 'fireworks') {
        console.log('🎆 Fireworks effect!');
      } else if (theme.completionEffect === 'stars') {
        console.log('✨ Stars effect!');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setSelectedAnswer(null);
      setShowCompletion(false);
      setStepStartTime(Date.now()); // Reset timer for previous step
      // Don't decrease answered steps - keep progress persistent
    }
  };

  const resetPreview = () => {
    setCurrentStep(1);
    setSelectedAnswer(null);
    setShowCompletion(false);
    setIsProgressing(false);
    setAnsweredSteps(0); // Reset answered steps
    setAnswerTimes([]); // Reset answer times
    setStepStartTime(Date.now()); // Reset timer
  };

  if (showCompletion) {
    return (
      <div className="p-4">
        <div 
          className="p-6 rounded-lg border min-h-[500px] transition-all duration-300 flex flex-col items-center justify-center text-center space-y-6"
          style={{ 
            backgroundColor: theme.background,
            fontFamily: theme.fontFamily,
            borderRadius: theme.borderRadius
          }}
        >
          {/* Efeito visual de conclusão */}
          <div className="text-6xl animate-bounce">
            {theme.completionEffect === 'confetti' ? '🎉' :
             theme.completionEffect === 'fireworks' ? '🎆' :
             theme.completionEffect === 'stars' ? '✨' : '🏆'}
          </div>
          
          <div className="space-y-4">
            <h2 
              className="text-2xl font-bold animate-fade-in"
              style={{ color: theme.text }}
            >
              🎯 Preview Concluído!
            </h2>
            
            <p 
              className="text-lg opacity-80 animate-fade-in"
              style={{ color: theme.text }}
            >
              Você testou todas as funcionalidades do tema!
            </p>
            
            {/* Indicadores visuais */}
            <div className="flex justify-center gap-2 mt-4">
              <div className="text-sm opacity-70" style={{ color: theme.text }}>
                ✅ Barra de progresso {
                  theme.intelligentProgress ? 'inteligente (3 fases)' : 
                  theme.smartProgress ? 'inteligente (IA)' : 
                  theme.fakeProgress ? 'fake' : 'normal'
                } <br />
                ✅ Modo: {theme.progressMode || 'simple'} <br />
                ✅ Estilo {theme.fakeProgressStyle || 'linear'} <br />
                ✅ Velocidade {theme.fakeProgressSpeed || 'normal'} <br />
                ✅ Efeito {theme.completionEffect || 'nenhum'}
              </div>
            </div>
            
            <Button
              onClick={resetPreview}
              className="mt-6 hover-scale animate-fade-in"
              style={{
                backgroundColor: theme.primary,
                borderRadius: theme.buttonStyle === 'pill' ? '999px' : 
                              theme.buttonStyle === 'square' ? '4px' : theme.borderRadius,
                background: theme.gradient 
                  ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
                  : theme.primary
              }}
            >
              🔄 Testar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div 
        className="p-6 rounded-lg border min-h-[500px] transition-all duration-300"
        style={{ 
          backgroundColor: theme.background,
          fontFamily: theme.fontFamily,
          borderRadius: theme.borderRadius
        }}
      >
        {/* Barra de Progresso */}
        {theme.showProgress !== false && (
          <div className="mb-6">
            {!theme.fakeProgress && (
              <div className="flex justify-between text-sm mb-3" style={{ color: theme.text, opacity: 0.7 }}>
                <span>Progresso do Teste</span>
                <span>{currentStep} de {totalSteps}</span>
              </div>
            )}
            
            {(theme.fakeProgress || theme.smartProgress || theme.intelligentProgress) ? (
              <FakeProgressBar
                theme={theme}
                currentStep={Math.max(1, answeredSteps)} // Always show at least initial progress
                totalSteps={totalSteps}
                isActive={!isProgressing}
                answeredSteps={answeredSteps}
              />
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500" 
                  style={{ 
                    backgroundColor: theme.accent, 
                    width: `${Math.max(5, (answeredSteps / totalSteps) * 100)}%`, // Minimum 5% progress
                    borderRadius: theme.borderRadius
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Card da Pergunta */}
        <div 
          className={cn(
            "p-6 rounded mb-6 shadow-sm transition-all duration-300",
            isProgressing && "animate-pulse"
          )}
          style={{ 
            backgroundColor: theme.cardBackground,
            borderRadius: theme.borderRadius
          }}
        >
          {/* Número da Pergunta */}
          {theme.showQuestionNumbers !== false && !theme.fakeProgress && (
            <div 
              className="text-sm font-medium mb-3 opacity-70"
              style={{ color: theme.text }}
            >
              Pergunta {currentStep} de {totalSteps}
            </div>
          )}

          <h3 
            className={cn(
              "text-xl font-bold mb-4 transition-all duration-300",
              theme.centerAlign && "text-center"
            )}
            style={{ 
              color: theme.text,
              fontSize: theme.fontSize === 'small' ? '18px' : 
                      theme.fontSize === 'large' ? '24px' : '20px'
            }}
          >
            {currentQuestion.title}
          </h3>
          
          <p 
            className={cn(
              "mb-6 transition-all duration-300",
              theme.centerAlign && "text-center"
            )}
            style={{ 
              color: theme.text, 
              opacity: 0.7,
              fontSize: theme.fontSize === 'small' ? '14px' : 
                      theme.fontSize === 'large' ? '18px' : '16px'
            }}
          >
            {currentQuestion.description}
          </p>

          {/* Opções de Resposta */}
          <div className={cn(
            "space-y-3",
            theme.centerAlign && "flex flex-col items-center"
          )}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={option}
                onClick={() => handleAnswerClick(option)}
                disabled={isProgressing}
                className={cn(
                  "px-6 py-3 font-medium text-center w-full transition-all duration-200 hover-scale",
                  selectedAnswer === option && "ring-2 ring-opacity-50",
                  isProgressing && "opacity-50 cursor-not-allowed"
                )}
                style={{ 
                  backgroundColor: selectedAnswer === option ? theme.accent : theme.primary,
                  color: 'white',
                  borderRadius: theme.buttonStyle === 'pill' ? '999px' : 
                            theme.buttonStyle === 'square' ? '4px' : theme.borderRadius,
                  background: theme.gradient 
                    ? `linear-gradient(135deg, ${selectedAnswer === option ? theme.accent : theme.primary}, ${theme.accent})`
                    : (selectedAnswer === option ? theme.accent : theme.primary),
                  maxWidth: theme.centerAlign ? '300px' : '100%'
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Dica de auto-advance */}
          {theme.fakeProgressAutoAdvance && selectedAnswer && (
            <div 
              className="text-xs text-center mt-4 opacity-60 animate-pulse"
              style={{ color: theme.text }}
            >
              Avançando automaticamente...
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        <div className={cn(
          "flex gap-3",
          theme.centerAlign ? "justify-center" : "justify-between"
        )}>
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1 || isProgressing}
            variant="outline"
            className="hover-scale"
            style={{
              borderColor: theme.primary,
              color: theme.primary,
              borderRadius: theme.buttonStyle === 'pill' ? '999px' : 
                        theme.buttonStyle === 'square' ? '4px' : theme.borderRadius
            }}
          >
            ← Voltar
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer || isProgressing}
            className="hover-scale"
            style={{
              backgroundColor: theme.accent,
              color: 'white',
              borderRadius: theme.buttonStyle === 'pill' ? '999px' : 
                        theme.buttonStyle === 'square' ? '4px' : theme.borderRadius,
              background: theme.gradient 
                ? `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`
                : theme.accent
            }}
          >
            {currentStep === totalSteps ? 'Finalizar 🏁' : 'Próximo →'}
          </Button>
        </div>

        {/* Status do teste */}
        <div className="mt-6 pt-4 border-t border-opacity-20" style={{ borderColor: theme.text }}>
          <div className="text-xs text-center space-y-1" style={{ color: theme.text, opacity: 0.6 }}>
            <div>🎨 Testando: {
              theme.intelligentProgress ? 'Progresso Inteligente (3 Fases)' :
              theme.smartProgress ? 'Progresso Inteligente (IA)' : 
              theme.fakeProgress ? 'Progresso Fake' : 'Progresso Normal'
            }</div>
            <div>📊 Modo: {theme.progressMode || 'Simple'}</div>
            <div>⚡ Velocidade: {theme.fakeProgressSpeed || 'Normal'}</div>
            <div>🎯 Comportamento: {theme.fakeProgressBehavior || 'Smooth'}</div>
            {answerTimes.length > 0 && (
              <div>⏱️ Tempo médio de resposta: {Math.round(answerTimes.reduce((sum, time) => sum + time, 0) / answerTimes.length / 1000)}s</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { LivePreview };