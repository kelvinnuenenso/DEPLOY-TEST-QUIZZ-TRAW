import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quiz, QuizAnswer, Result, Lead } from '@/types/quiz';
import { loadQuizByPublicId, saveResult, saveLead } from '@/lib/quizzes';
import { FakeProgressBar } from '@/components/quiz/FakeProgressBar';
import { Star, ArrowRight, Trophy, Zap, Target } from 'lucide-react';
import { EnhancedErrorBoundary } from '@/components/EnhancedErrorBoundary';
import { AchievementSystem } from '@/components/gamification/AchievementSystem';
import { MobileLoadingSpinner } from '@/components/MobileLoadingSpinner';
import { MobileSplashScreen } from '@/components/MobileSplashScreen';
import { MobileQuizNavigation } from '@/components/MobileQuizNavigation';
import { MobileGestureHint } from '@/components/MobileGestureHint';
import { useMobileGestures } from '@/hooks/useMobileGestures';
import { useIsMobile } from '@/hooks/use-mobile';

const QuizRunner = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [userAnswerTimes, setUserAnswerTimes] = useState<number[]>([]);
  const [answeredStepsCount, setAnsweredStepsCount] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(isMobile);
  const [dataReady, setDataReady] = useState(false);
  const [showGestureHint, setShowGestureHint] = useState(isMobile && !localStorage.getItem('gesture-hint-shown'));


  // Mobile gestures for navigation
  const gesturesRef = useMobileGestures({
    onSwipeLeft: () => {
      // Next question on swipe left
      if (currentStep < (quiz?.questions?.length || 0) - 1) {
        setCurrentStep(currentStep + 1);
      }
    },
    onSwipeRight: () => {
      // Previous question on swipe right
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    },
    enableTouch: isMobile && quiz?.questions && quiz.questions.length > 1
  });

  // Reset selected options when step changes
  useEffect(() => {
    setSelectedOptions([]);
    setStepStartTime(Date.now());
  }, [currentStep]);

  // Collect UTM parameters
  const utmParams = Object.fromEntries(searchParams.entries());

  useEffect(() => {
    const loadQuiz = async () => {
      if (!publicId) return;
      
      try {
        const loadedQuiz = await loadQuizByPublicId(publicId);
        setQuiz(loadedQuiz);
        // Initialize step start time when quiz loads
        setStepStartTime(Date.now());
        
        // For mobile, show splash screen before marking as ready
        if (isMobile) {
          setTimeout(() => setDataReady(true), 100);
        } else {
          setDataReady(true);
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
        setDataReady(true);
      } finally {
        if (!isMobile) {
          setLoading(false);
        }
      }
    };

    loadQuiz();
  }, [publicId]);

  // Mobile splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
    setLoading(false);
  };

  // Show splash screen for mobile
  if (isMobile && showSplash && dataReady) {
    return (
      <MobileSplashScreen 
        onComplete={handleSplashComplete}
        quizName={quiz?.name}
        duration={2000}
      />
    );
  }

  if (loading || !dataReady) {
    return (
      <MobileLoadingSpinner 
        message="Carregando quiz..." 
        fullScreen={true}
      />
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Quiz não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O quiz que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz?.questions?.[currentStep];
  const progress = quiz?.questions?.length ? (answeredStepsCount / quiz.questions.length) * 100 : 0;

  const handleAnswer = async (value: any) => {
    if (!currentQuestion) return;
    
    // Calculate time spent on this step
    const answerTime = Date.now() - stepStartTime;
    const newUserAnswerTimes = [...userAnswerTimes, answerTime];
    const newAnsweredStepsCount = answeredStepsCount + 1;
    
    // Update timing states
    setUserAnswerTimes(newUserAnswerTimes);
    setAnsweredStepsCount(newAnsweredStepsCount);
    
    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, value }
    ];
    setAnswers(newAnswers);

    if (currentStep < (quiz?.questions?.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Quiz completed, save result
      setIsSubmitting(true);
      
      try {
        const resultId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        // Calculate score (simple scoring)
        let totalScore = 0;
        if (quiz?.questions && Array.isArray(quiz.questions)) {
          newAnswers.forEach(answer => {
            try {
              const question = quiz.questions.find(q => q?.id === answer?.questionId);
              if (!question) return;
              
              if (question?.type === 'single' || question?.type === 'multiple') {
                const selectedOptions = Array.isArray(answer.value) ? answer.value : [answer.value];
                selectedOptions.forEach((optionId: string) => {
                  if (question.options && Array.isArray(question.options)) {
                    const option = question.options.find(opt => opt?.id === optionId);
                    if (option?.score && typeof option.score === 'number') {
                      totalScore += option.score;
                    }
                  }
                });
              }
              if (question?.type === 'rating' && typeof answer.value === 'number') {
                totalScore += answer.value * (question.score_weight || 1);
              }
            } catch (error) {
              console.warn('Error calculating score for answer:', answer, error);
            }
          });
        }

        const result: Result = {
          id: resultId,
          quizId: quiz.id,
          startedAt: now,
          completedAt: now,
          score: totalScore,
          answers: newAnswers,
          utm: utmParams,
          meta: {
            userAgent: navigator.userAgent,
            referrer: document.referrer
          }
        };

        await saveResult(result);

        // Check if we captured email to create lead
        const emailAnswer = newAnswers.find(answer => {
          const question = quiz?.questions?.find(q => q.id === answer.questionId);
          return question?.type === 'email';
        });

        if (emailAnswer?.value) {
          const lead: Lead = {
            id: crypto.randomUUID(),
            quizId: quiz.id,
            resultId,
            email: emailAnswer.value,
            createdAt: now
          };
          await saveLead(lead);
        }

        // Check for achievements
        checkAchievements(totalScore, newAnswers, newUserAnswerTimes);
        
        // Redirect to result page
        navigate(`/r/${resultId}`);
      } catch (error) {
        console.error('Error saving result:', error);
        setIsSubmitting(false);
      }
    }
  };

  const checkAchievements = (score: number, answers: QuizAnswer[], answerTimes: number[]) => {
    const totalTime = answerTimes.reduce((sum, time) => sum + time, 0);
    const avgTimePerQuestion = totalTime / answerTimes.length;
    
    const newAchievements: any[] = [];
    
    // Perfect Score Achievement
    if (score >= 100) {
      newAchievements.push({
        id: 'perfect_score',
        title: '⭐ Pontuação Perfeita!',
        description: 'Você acertou tudo!',
        points: 500
      });
    }
    
    // Speed Achievement
    if (totalTime < 60000) { // Less than 1 minute
      newAchievements.push({
        id: 'speed_demon',
        title: '⚡ Demônio da Velocidade!',
        description: 'Completou em menos de 1 minuto!',
        points: 250
      });
    }
    
    // First Quiz Achievement
    const existingResults = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    if (existingResults.length === 0) {
      newAchievements.push({
        id: 'first_quiz',
        title: '🎯 Primeiro Quiz!',
        description: 'Parabéns por completar seu primeiro quiz!',
        points: 100
      });
    }
    
    if (newAchievements.length > 0) {
      setAchievements(newAchievements);
      // Show first achievement as popup
      setShowAchievement(newAchievements[0]);
      setTimeout(() => setShowAchievement(null), 3000);
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
                className="w-full p-4 h-auto text-left justify-start transition-all duration-200"
                onClick={() => handleAnswer(option.id)}
                style={{
                  borderRadius: quiz.theme?.buttonStyle === 'pill' ? '999px' : quiz.theme?.borderRadius || '12px',
                  borderColor: quiz.theme?.primary || '#2563EB',
                  backgroundColor: 'transparent',
                  color: quiz.theme?.text || '#0B0B0B'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = quiz.theme?.primary ? `${quiz.theme.primary}20` : '#EBF8FF';
                  e.currentTarget.style.borderColor = quiz.theme?.primary || '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = quiz.theme?.primary || '#2563EB';
                }}
              >
                <div className="text-base">{option.label}</div>
              </Button>
            ))}
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
            />
          </div>
        );

      case 'phone':
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const phone = formData.get('phone') as string;
              if (phone) handleAnswer(phone);
            }}
            className="space-y-4"
          >
            <Input
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder={currentQuestion.settings?.placeholder || "(11) 99999-9999"}
              required={currentQuestion.required}
              className="text-center text-lg py-3"
              autoComplete="tel"
            />
            <Button 
              type="submit" 
              className="w-full transition-all duration-200" 
              size="lg"
              style={{
                borderRadius: quiz.theme?.buttonStyle === 'pill' ? '999px' : quiz.theme?.borderRadius || '12px',
                background: quiz.theme?.gradient 
                  ? `linear-gradient(135deg, ${quiz.theme?.primary}, ${quiz.theme?.accent})`
                  : quiz.theme?.primary || '#2563EB',
                color: quiz.theme?.cardBackground || '#FFFFFF'
              }}
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        );

      case 'multiple':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedOptions.includes(option.id) ? "default" : "outline"}
                  className="w-full p-4 h-auto text-left justify-start transition-all duration-200"
                  onClick={() => {
                    const newSelection = selectedOptions.includes(option.id)
                      ? selectedOptions.filter(id => id !== option.id)
                      : [...selectedOptions, option.id];
                    setSelectedOptions(newSelection);
                  }}
                  style={{
                    borderRadius: quiz.theme?.buttonStyle === 'pill' ? '999px' : quiz.theme?.borderRadius || '12px',
                    backgroundColor: selectedOptions.includes(option.id) 
                      ? quiz.theme?.gradient 
                        ? `linear-gradient(135deg, ${quiz.theme?.primary}, ${quiz.theme?.accent})`
                        : quiz.theme?.primary || '#2563EB'
                      : 'transparent',
                    borderColor: quiz.theme?.primary || '#2563EB',
                    color: selectedOptions.includes(option.id) 
                      ? quiz.theme?.cardBackground || '#FFFFFF'
                      : quiz.theme?.text || '#0B0B0B'
                  }}
                >
                  <div className="text-base">{option.label}</div>
                </Button>
              ))}
            </div>
            <Button
              className="w-full transition-all duration-200"
              disabled={selectedOptions.length === 0}
              onClick={() => handleAnswer(selectedOptions)}
              style={{
                borderRadius: quiz.theme?.buttonStyle === 'pill' ? '999px' : quiz.theme?.borderRadius || '12px',
                background: quiz.theme?.gradient 
                  ? `linear-gradient(135deg, ${quiz.theme?.primary}, ${quiz.theme?.accent})`
                  : quiz.theme?.primary || '#2563EB',
                color: quiz.theme?.cardBackground || '#FFFFFF'
              }}
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
                  <Star className={`w-6 h-6 ${rating <= 3 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </Button>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Clique nas estrelas para avaliar
            </div>
          </div>
        );

      case 'email':
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('email') as string;
              if (email) {
                handleAnswer(email);
              }
            }}
            className="space-y-4"
          >
            <Input
              name="email"
              type="email"
              inputMode="email"
              placeholder={currentQuestion.settings?.placeholder || "seu@email.com"}
              required={currentQuestion.required}
              className="text-center text-lg py-3"
              autoComplete="email"
            />
            <Button 
              type="submit" 
              className="w-full transition-all duration-200" 
              size="lg"
              style={{
                borderRadius: quiz.theme?.buttonStyle === 'pill' ? '999px' : quiz.theme?.borderRadius || '12px',
                background: quiz.theme?.gradient 
                  ? `linear-gradient(135deg, ${quiz.theme?.primary}, ${quiz.theme?.accent})`
                  : quiz.theme?.primary || '#2563EB',
                color: quiz.theme?.cardBackground || '#FFFFFF'
              }}
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        );

      case 'short_text':
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const text = formData.get('text') as string;
              if (text) {
                handleAnswer(text);
              }
            }}
            className="space-y-4"
          >
            <Input
              name="text"
              type="text"
              placeholder={currentQuestion.settings?.placeholder || "Digite sua resposta..."}
              required={currentQuestion.required}
              className="text-center text-lg py-3"
            />
            <Button 
              type="submit" 
              className="w-full transition-all duration-200" 
              size="lg"
              style={{
                borderRadius: quiz.theme?.buttonStyle === 'pill' ? '999px' : quiz.theme?.borderRadius || '12px',
                background: quiz.theme?.gradient 
                  ? `linear-gradient(135deg, ${quiz.theme?.primary}, ${quiz.theme?.accent})`
                  : quiz.theme?.primary || '#2563EB',
                color: quiz.theme?.cardBackground || '#FFFFFF'
              }}
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-muted-foreground">Tipo de pergunta não suportado ainda.</p>
            <Button onClick={() => handleAnswer('skipped')} className="mt-4">
              Pular
            </Button>
          </div>
        );
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Card className="p-8 text-center max-w-md">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processando suas respostas...</h2>
          <p className="text-muted-foreground">Em instantes você verá seu resultado personalizado!</p>
        </Card>
      </div>
    );
  }

  const getMaxWidth = () => {
    switch (quiz.theme?.maxWidth) {
      case 'small': return 'max-w-xl';
      case 'medium': return 'max-w-2xl';
      case 'large': return 'max-w-4xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-2xl';
    }
  };

  const getFontSize = () => {
    switch (quiz.theme?.fontSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  return (
    <EnhancedErrorBoundary 
      componentName="QuizRunner"
      maxRetries={3}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
    <div 
      ref={gesturesRef}
      className="min-h-screen"
      style={{ 
        backgroundColor: quiz.theme?.background || '#F8FAFC',
        color: quiz.theme?.text || '#0B0B0B',
        fontFamily: quiz.theme?.fontFamily || 'Inter, sans-serif'
      }}
    >
      {/* Header with progress */}
      {quiz.theme?.showProgress !== false && (
        <div 
          className="backdrop-blur-sm border-b sticky top-0 z-50"
          style={{ 
            backgroundColor: quiz.theme?.cardBackground ? `${quiz.theme.cardBackground}E6` : '#FFFFFFCC'
          }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: quiz.theme?.primary || '#2563EB' }}
                >
                  <span className="text-primary-foreground font-bold text-xs">EQ</span>
                </div>
                <span 
                  className="font-semibold text-sm"
                  style={{ color: quiz.theme?.primary || '#2563EB' }}
                >
                  Elevado Quizz
                </span>
              </div>
              {quiz?.theme?.showQuestionNumbers !== false && quiz?.questions?.length && (
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: quiz.theme?.accent ? `${quiz.theme.accent}20` : undefined,
                    color: quiz.theme?.accent
                  }}
                >
                  {currentStep + 1} de {quiz.questions.length}
                </Badge>
              )}
            </div>
            {quiz.theme?.fakeProgress || quiz.theme?.intelligentProgress || quiz.theme?.smartProgress || quiz.theme?.progressMode === 'smart' ? (
              <FakeProgressBar
                theme={quiz.theme}
                currentStep={currentStep}
                totalSteps={quiz?.questions?.length || 0}
                isActive={true}
                className="h-2"
                answeredSteps={answeredStepsCount}
                userAnswerTimes={userAnswerTimes}
              />
            ) : (
              <Progress 
                value={progress} 
                className="h-2"
                style={{
                  backgroundColor: quiz.theme?.primary ? `${quiz.theme.primary}20` : undefined
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Question content */}
      <div className={`container mx-auto px-4 py-8 ${getFontSize()}`}>
        <div className={`mx-auto ${getMaxWidth()}`}>
          <Card 
            className="p-8 shadow-lg border-0"
            style={{
              backgroundColor: quiz.theme?.cardBackground || '#FFFFFF',
              borderRadius: quiz.theme?.borderRadius || '12px'
            }}
          >
            <div className={`mb-8 ${quiz.theme?.centerAlign ? 'text-center' : ''}`}>
              <h1 
                className="text-2xl md:text-3xl font-bold mb-4"
                 style={{ color: quiz.theme?.text || '#0B0B0B' }}
               >
                 {currentQuestion?.title || 'Carregando pergunta...'}
               </h1>
               {currentQuestion?.description && (
                <p 
                  className="text-lg opacity-70"
                  style={{ color: quiz.theme?.text || '#6B7280' }}
                >
                  {currentQuestion.description}
                </p>
              )}
            </div>

            {renderQuestion()}
          </Card>
        </div>
      </div>

      {/* Mobile Navigation - Only show on mobile and if there are multiple questions */}
      {isMobile && quiz?.questions && quiz.questions.length > 1 && (
        <MobileQuizNavigation
          currentStep={currentStep}
          totalSteps={quiz.questions.length}
          progress={progress}
          canGoBack={currentStep > 0}
          canGoNext={currentStep < quiz.questions.length - 1}
          onBack={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          onNext={() => setCurrentStep(prev => Math.min(quiz.questions.length - 1, prev + 1))}
          onHome={() => window.location.href = '/'}
          showProgress={quiz.theme?.showProgress !== false}
        />
      )}

      {/* Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <h3 className="font-bold">{showAchievement.title}</h3>
          <p className="text-sm">{showAchievement.description}</p>
        </div>
      )}

      {/* Mobile Gesture Hint */}
      {isMobile && showGestureHint && (
        <MobileGestureHint
          show={showGestureHint}
          onDismiss={() => {
            setShowGestureHint(false);
            localStorage.setItem('gesture-hint-shown', 'true');
          }}
        />
      )}
    </div>
    </EnhancedErrorBoundary>
  );
};

export default QuizRunner;