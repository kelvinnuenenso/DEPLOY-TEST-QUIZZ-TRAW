import { useState, useEffect } from 'react';
import { Quiz, Question, Answer } from '@/types/quiz';
import { BranchingLogic, BranchingRule } from '@/lib/branchingLogic';
import useAuth from '@/hooks/useAuth';
import { PlanManager } from '@/lib/planManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, Trash2 } from 'lucide-react';

interface BranchingEditorProps {
  quiz: Quiz;
  onQuizChange: (quiz: Quiz) => void;
}

export function BranchingEditor({ quiz, onQuizChange }: BranchingEditorProps) {
  const { user } = useAuth();
  const [canUseBranching, setCanUseBranching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [branchingErrors, setBranchingErrors] = useState<string[]>([]);

  useEffect(() => {
    async function checkAccess() {
      if (!user) return;
      
      try {
        const canUse = await PlanManager.canUseBranching(user);
        setCanUseBranching(canUse);
      } catch (error) {
        console.error('Error checking branching access:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAccess();
  }, [user]);

  useEffect(() => {
    // Selecionar a primeira pergunta por padrão
    if (quiz.questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(quiz.questions[0].id);
    }

    // Validar as regras de branching
    const validation = BranchingLogic.validateBranching(quiz);
    if (!validation.valid) {
      setBranchingErrors(validation.errors);
    } else {
      setBranchingErrors([]);
    }
  }, [quiz, selectedQuestionId]);

  const handleAddBranchingRule = (questionId: string, answerId: string, targetQuestionId: string) => {
    const updatedQuiz = BranchingLogic.addBranchingRule(quiz, questionId, answerId, targetQuestionId);
    onQuizChange(updatedQuiz);
  };

  const handleRemoveBranchingRule = (questionId: string, answerId: string) => {
    const updatedQuiz = BranchingLogic.removeBranchingRule(quiz, questionId, answerId);
    onQuizChange(updatedQuiz);
  };

  // Encontrar a pergunta selecionada
  const selectedQuestion = quiz.questions.find(q => q.id === selectedQuestionId);

  // Encontrar as regras de branching para a pergunta selecionada
  const questionBranching = quiz.branching?.find(b => b.questionId === selectedQuestionId);

  // Renderização condicional para usuários sem acesso a branching
  if (!canUseBranching) {
    return (
      <Alert variant="warning" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Recurso não disponível</AlertTitle>
        <AlertDescription>
          A lógica condicional (branching) está disponível apenas nos planos Pro e Premium. 
          <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/plans'}>
            Faça upgrade do seu plano
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Lógica Condicional (Branching)</h3>
        <p className="text-sm text-muted-foreground">
          Configure para onde o usuário será direcionado com base nas respostas selecionadas.
        </p>
      </div>

      {branchingErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erros na lógica condicional</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {branchingErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {quiz.questions.length < 2 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Não é possível configurar branching</AlertTitle>
          <AlertDescription>
            Você precisa ter pelo menos duas perguntas no quiz para configurar a lógica condicional.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          <div>
            <label htmlFor="question-select" className="block text-sm font-medium mb-2">
              Selecione a pergunta para configurar
            </label>
            <Select
              value={selectedQuestionId || ''}
              onValueChange={(value) => setSelectedQuestionId(value)}
            >
              <SelectTrigger id="question-select">
                <SelectValue placeholder="Selecione uma pergunta" />
              </SelectTrigger>
              <SelectContent>
                {quiz.questions.map((question) => (
                  <SelectItem key={question.id} value={question.id}>
                    {question.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedQuestion && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedQuestion.text}</CardTitle>
                <CardDescription>
                  Configure para onde o usuário será direcionado ao selecionar cada resposta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedQuestion.answers.map((answer) => {
                    // Encontrar a regra para esta resposta
                    const rule = questionBranching?.rules.find(r => r.answerId === answer.id);
                    const targetQuestion = rule ? quiz.questions.find(q => q.id === rule.targetQuestionId) : null;

                    return (
                      <div key={answer.id} className="flex items-center space-x-2">
                        <div className="flex-grow">
                          <Badge variant="outline" className="mr-2">{answer.text}</Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-grow">
                          <Select
                            value={rule?.targetQuestionId || ''}
                            onValueChange={(value) => {
                              if (value) {
                                handleAddBranchingRule(selectedQuestion.id, answer.id, value);
                              } else if (rule) {
                                handleRemoveBranchingRule(selectedQuestion.id, answer.id);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Fluxo padrão (próxima pergunta)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Fluxo padrão (próxima pergunta)</SelectItem>
                              {quiz.questions
                                .filter(q => q.id !== selectedQuestion.id) // Não permitir selecionar a mesma pergunta
                                .map((question) => (
                                  <SelectItem key={question.id} value={question.id}>
                                    {question.text}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {rule && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveBranchingRule(selectedQuestion.id, answer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Deixe em branco para seguir o fluxo padrão (próxima pergunta na sequência).
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}