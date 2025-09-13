import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quiz, QuizAnswer } from '@/types/quiz';
import { ArrowRight, ArrowLeft, Star, Smartphone, Monitor } from 'lucide-react';

interface QuizPreviewProps {
  quiz: Quiz;
  onClose: () => void;
}

const QuizPreview = ({ quiz, onClose }: QuizPreviewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  // Reset selected options when step changes
  const resetSelection = () => setSelectedOptions([]);

  const currentQuestion = quiz.questions[currentStep];
  const progress = ((currentStep + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentStep === quiz.questions.length - 1;

  const handleAnswer = (value: any) => {
    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, value }
    ];
    setAnswers(newAnswers);

    if (!isLastQuestion) {
      setCurrentStep(currentStep + 1);
      resetSelection();
    } else {
      // Show result preview
      alert('Quiz completo! Em um quiz real, o usuário seria direcionado para a página de resultado.');
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Remove the last answer
      setAnswers(answers.slice(0, -1));
      resetSelection();
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'single':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <Button
                key={option.id}
                variant="outline" 
                className="w-full p-4 h-auto text-left justify-start hover:bg-blue-50 hover:border-blue-300"
                onClick={() => handleAnswer(option.id)}
                style={{
                  borderRadius: quiz.theme?.borderRadius || '8px',
                  borderColor: quiz.theme?.primary,
                  color: quiz.theme?.text
                }}
              >
                <div className="text-base">{option.label}</div>
              </Button>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedOptions.includes(option.id) ? "default" : "outline"}
                  className="w-full p-4 h-auto text-left justify-start"
                  onClick={() => {
                    const newSelection = selectedOptions.includes(option.id)
                      ? selectedOptions.filter(id => id !== option.id)
                      : [...selectedOptions, option.id];
                    setSelectedOptions(newSelection);
                  }}
                  style={{
                    borderRadius: quiz.theme?.borderRadius || '8px',
                    backgroundColor: selectedOptions.includes(option.id) ? quiz.theme?.primary : 'transparent',
                    borderColor: quiz.theme?.primary,
                    color: selectedOptions.includes(option.id) ? quiz.theme?.background : quiz.theme?.text
                  }}
                >
                  <div className="text-base">{option.label}</div>
                </Button>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={selectedOptions.length === 0}
              onClick={() => handleAnswer(selectedOptions)}
              style={{
                backgroundColor: quiz.theme?.primary,
                color: quiz.theme?.background
              }}
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 'nps':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-11 gap-2">
              {[0,1,2,3,4,5,6,7,8,9,10].map((score) => (
                <Button
                  key={score}
                  variant="outline"
                  className="aspect-square text-sm hover:bg-blue-100"
                  onClick={() => handleAnswer(score)}
                  style={{
                    borderColor: quiz.theme?.primary,
                    color: quiz.theme?.text
                  }}
                >
                  {score}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Não recomendaria</span>
              <span>Recomendaria totalmente</span>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="outline"
                  size="lg"
                  className="w-12 h-12 hover:bg-yellow-100 hover:border-yellow-400"
                  onClick={() => handleAnswer(rating)}
                >
                  <Star className="w-6 h-6 text-yellow-400" />
                </Button>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Clique nas estrelas para avaliar
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={currentQuestion.settings?.min || 0}
              max={currentQuestion.settings?.max || 10}
              step={currentQuestion.settings?.step || 1}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => handleAnswer(parseInt(e.target.value))}
              style={{
                accentColor: quiz.theme?.primary
              }}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentQuestion.settings?.min || 0}</span>
              <span>{currentQuestion.settings?.max || 10}</span>
            </div>
          </div>
        );

      case 'email':
      case 'phone':
      case 'short_text':
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const value = formData.get('input') as string;
              if (value) handleAnswer(value);
            }}
            className="space-y-4"
          >
            <Input
              name="input"
              type={currentQuestion.type === 'email' ? 'email' : 
                    currentQuestion.type === 'phone' ? 'tel' : 'text'}
              placeholder={currentQuestion.settings?.placeholder || 
                          (currentQuestion.type === 'email' ? 'seu@email.com' :
                           currentQuestion.type === 'phone' ? '(11) 99999-9999' :
                           'Digite sua resposta...')}
              required={currentQuestion.required}
              className="text-center text-lg py-3"
              style={{
                borderColor: quiz.theme?.primary,
                color: quiz.theme?.text
              }}
            />
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              style={{
                backgroundColor: quiz.theme?.primary,
                color: quiz.theme?.background
              }}
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        );

      default:
        return (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Prévia não disponível para este tipo de pergunta.</p>
            <Button 
              onClick={() => handleAnswer('preview')}
              style={{
                backgroundColor: quiz.theme?.primary,
                color: quiz.theme?.background
              }}
            >
              Continuar
            </Button>
          </div>
        );
    }
  };

  const containerClass = deviceView === 'mobile' 
    ? 'max-w-sm mx-auto' 
    : 'max-w-2xl mx-auto';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Preview Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Preview do Quiz</h2>
            <p className="text-sm text-muted-foreground">{quiz.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceView('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceView('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        {/* Quiz Preview */}
        <div 
          className="p-6"
          style={{ 
            backgroundColor: quiz.theme?.background || '#FFFFFF',
            color: quiz.theme?.text || '#0B0B0B'
          }}
        >
          <div className={containerClass}>
            {/* Progress Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">EQ</span>
                  </div>
                  <span className="font-semibold text-primary text-sm">Preview Mode</span>
                </div>
                <Badge variant="secondary">
                  {currentStep + 1} de {quiz.questions.length}
                </Badge>
              </div>
              {quiz.settings?.progressBar !== false && (
                <Progress 
                  value={progress} 
                  className="h-2"
                  style={{
                    backgroundColor: quiz.theme?.primary ? `${quiz.theme.primary}20` : undefined
                  }}
                />
              )}
            </div>

            {/* Question Card */}
            <Card 
              className="p-6 shadow-lg border-0"
              style={{
                backgroundColor: quiz.theme?.cardBackground || quiz.theme?.background || '#FFFFFF',
                borderRadius: quiz.theme?.borderRadius || '12px'
              }}
            >
              <div className="mb-6">
                <h1 className={`text-2xl font-bold mb-4 ${deviceView === 'mobile' ? 'text-xl' : 'md:text-3xl'} text-center`}>
                  {currentQuestion?.title}
                </h1>
                {currentQuestion?.description && (
                  <p className="text-muted-foreground text-center text-lg">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {renderQuestion()}

              {/* Navigation */}
              {currentStep > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={goBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;